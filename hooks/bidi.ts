// The desktop sets each paragraph, list item, heading and table cell's
// direction from its first strong letter, as Unicode and HTML do: a line that
// opens in Persian runs right to left on the right edge, however much English
// follows. It misses a mostly-Persian line that opens with an English word, a
// file name or inline code ("Claude یه فایل..."). Such a line gets an RLM
// (U+200F) as its first letter; every other line is left exactly as written.
// Markdown syntax at the start of a line (lists, headings, quotes, wrapping
// emphasis) stays before the mark; fenced code blocks are left alone.

export const RLM = '‏'
const LRM = '‎'

const RTL_LETTER = '֐-ࣿיִ-﷿ﹰ-﻿'
const LTR_LETTER = 'A-Za-zÀ-ɏ'
const HAS_RTL = new RegExp(`[${RTL_LETTER}]`)
const HAS_LTR = new RegExp(`[${LTR_LETTER}]`)
// Marks count as letters: a line already marked is not marked again.
const FIRST_STRONG = new RegExp(`[${RTL_LETTER}${LTR_LETTER}${RLM}${LRM}]`)
const CODE_SPAN = /`[^`\n]*`/g
const LINK_TARGET = /\]\([^)\s]*\)/g
const FENCE = /^\s*(```|~~~)/
const PREFIX =
  /^(\s*(?:>\s*)*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)?)([\s\S]*?)(\s*)$/
const EMPHASIS = /^([*_~]*)([\s\S]*?)([*_~]*)$/
const TABLE_ROW = /^\s*\|.*\|\s*$/
const TABLE_RULE = /^\s*\|?\s*:?-{2,}/
const CELL_SEPARATOR = /(?<!\\)\|/

// Mostly Persian by words, judged on the prose alone: inline code and link
// targets (`git status`, a URL) do not count toward either direction. A tie
// goes to whichever script comes first. Words, not letters: one long English
// word ("screenshot") does not outweigh the Persian sentence around it.
export function isRtl(text: string): boolean {
  const prose = text.replace(CODE_SPAN, '').replace(LINK_TARGET, ']')
  let rtl = 0
  let ltr = 0
  for (const word of prose.split(/\s+/)) {
    if (HAS_RTL.test(word)) rtl += 1
    else if (HAS_LTR.test(word)) ltr += 1
  }
  if (rtl !== ltr) return rtl > ltr
  const first = new RegExp(`[${RTL_LETTER}${LTR_LETTER}]`).exec(prose)
  return first !== null && HAS_RTL.test(first[0])
}

// What the desktop sees first, inline code included (it is drawn text) and
// link targets left out (they are not).
function opensRtl(text: string): boolean | undefined {
  const first = FIRST_STRONG.exec(text.replace(LINK_TARGET, ']'))
  if (first === null) return undefined
  return first[0] === RLM || HAS_RTL.test(first[0])
}

export function mark(text: string): string {
  const [, prefix, body, trailing] = PREFIX.exec(text) ?? ['', '', text, '']
  if (opensRtl(body) !== false || !isRtl(body)) return text
  // After an opening `**`, not before it: a `**` right before a mark and
  // punctuation would no longer open bold.
  const [, open, inner, close] = EMPHASIS.exec(body) ?? ['', '', body, '']
  return `${prefix}${open}${RLM}${inner}${close}${trailing}`
}

function markCells(row: string): string {
  const cells = row.trim().split(CELL_SEPARATOR).slice(1, -1)
  return `|${cells.map(mark).join('|')}|`
}

export function fixBidi(text: string): string {
  if (!HAS_RTL.test(text)) return text

  let inFence = false
  return text
    .split('\n')
    .map(line => {
      if (FENCE.test(line)) {
        inFence = !inFence
        return line
      }
      if (inFence || TABLE_RULE.test(line)) return line
      return TABLE_ROW.test(line) ? markCells(line) : mark(line)
    })
    .join('\n')
}
