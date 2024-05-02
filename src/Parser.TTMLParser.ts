import {
  LineArgs,
  Lyric,
  LyricArgs,
  ParagraphArgs,
  WordTimeline,
} from '@ioris/core';

const isElementNode = (n: Node) => Node.ELEMENT_NODE === n.nodeType;

const confirmTag = (t: Element['tagName']) => {
  const tagName = t.toLowerCase();
  return (n: Element) => {
    return n.nodeName.toLowerCase() === tagName;
  };
};

function parseTime(t: string): number {
  if (t === '') {
    return 0;
  }
  if (t.endsWith('s')) {
    return Number(t.slice(0, -1));
  }
  return Number(t.split(':').reduce((acc, time) => 60 * acc + Number(time), 0));
}

const getTime = (e: Element): { begin: number; end: number } => {
  return {
    begin: parseTime(e.getAttribute('begin') || ''),
    end: parseTime(e.getAttribute('end') || ''),
  };
};

const TIMING_TYPE = {
  Line: 'Line',
  Word: 'Word',
} as const;

export class TTMLParser {
  tokenizer?: LyricArgs['tokenizer'];
  offsetSec?: number;

  constructor(props?: {
    tokenizer?: LyricArgs['tokenizer'];
    offsetSec?: number;
  }) {
    this.tokenizer = props ? props.tokenizer : undefined;
    this.offsetSec = props ? props.offsetSec : undefined;
  }

  public async parse(ttml: XMLDocument, resourceID: string) {
    const duration = parseTime(
      ttml.querySelector('body')?.getAttribute('dur') || ''
    );
    const timelines: LyricArgs['timelines'] = [];
    const paragraphs = ttml.querySelectorAll('div');

    paragraphs.forEach((paragraphElm) => {
      const { lineTimelines } = this.parseParagraphTimelines(paragraphElm);
      timelines.push(lineTimelines);
    });

    const lyric = await new Lyric({
      resourceID,
      duration,
      timelines,
      tokenizer: this.tokenizer,
      offsetSec: this.offsetSec,
    }).init();

    return lyric;
  }

  private parseParagraphTimelines(paragraphElm: HTMLDivElement): {
    lineTimelines: ParagraphArgs['timelines'];
  } {
    if (!isElementNode(paragraphElm) || !confirmTag('div')(paragraphElm)) {
      throw new Error('Invalid TTML format');
    }
    const lines = paragraphElm.querySelectorAll('p');
    const lineTimelines: ParagraphArgs['timelines'] = [];

    lines.forEach((lineElm) => {
      const { wordTimelines } = this.parseLineTimelines(lineElm);
      lineTimelines.push(wordTimelines);
    });

    return {
      lineTimelines,
    };
  }

  private parseLineTimelines(lineElm: HTMLParagraphElement): {
    wordTimelines: LineArgs['timelines'];
  } {
    if (!isElementNode(lineElm) || !confirmTag('p')(lineElm)) {
      throw new Error('Invalid TTML format');
    }

    const wordTimelines: LineArgs['timelines'] = [];
    const { begin, end } = getTime(lineElm);

    const timingType =
      Array.from(lineElm.children)
        .filter(isElementNode)
        .filter(confirmTag('span')).length > 0
        ? TIMING_TYPE.Word
        : TIMING_TYPE.Line;

    if (timingType === TIMING_TYPE.Line) {
      if (lineElm.textContent === null) {
        return {
          wordTimelines,
        };
      }

      wordTimelines.push({
        begin,
        end,
        text: lineElm.textContent,
      });

      return {
        wordTimelines,
      };
    }

    const spans = Array.from(lineElm.querySelectorAll('span'));

    return spans.reduce<{
      wordTimelines: LineArgs['timelines'];
    }>(
      (acc, spanElm, wordIndex) => {
        const last = acc.wordTimelines[acc.wordTimelines.length - 1];
        const { begin, end } = getTime(spanElm);
        const beforeElm = spans[wordIndex - 1];
        const { end: beforeEnd } = beforeElm
          ? getTime(beforeElm)
          : { end: begin };
        const hasWhitespace =
          beforeEnd - begin > 0.1 ||
          (spanElm.nextSibling !== null && spanElm.nextSibling.nodeType === 3);
        const wordTimeline: WordTimeline = {
          begin: last?.begin || begin,
          end,
          text: `${last?.text || ''}${spanElm.textContent}${
            hasWhitespace ? ' ' : ''
          }`,
        };
        acc.wordTimelines[0] = wordTimeline;
        return acc;
      },
      { wordTimelines }
    );
  }
}

export default TTMLParser;
