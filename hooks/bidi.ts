// Wraps every mostly-Persian line of markdown in RLI ... PDI (U+2067, U+2069),
// so the surface lays it out right to left inside its left-to-right page:
// English words, numbers and punctuation inside a Persian sentence stay put.
// Markdown syntax at the start of a line (lists, headings, quotes) stays
// outside the isolate; fenced code blocks are left alone.

export const RLI = '⁧'
export const PDI = '⁩'

const HAS_RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/
const HAS_LTR = /[A-Za-zÀ-ɏ]/
const CODE_SPAN = /`[^`\n]*`/g
const LINK_TARGET = /\]\([^)\s]*\)/g
const FENCE = /^\s*(```|~~~)/
const PREFIX =
  /^(\s*(?:>\s*)*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)?)([\s\S]*?)(\s*)$/
const EMPHASIS = /^([*_~]*)([\s\S]*?)([*_~]*)$/
const LIST_ITEM = /^\s*([-*+]|\d+[.)])\s+(.*)$/
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
  const first = /[֐-ࣿיִ-﷿ﹰ-﻿A-Za-zÀ-ɏ]/.exec(prose)
  return first !== null && HAS_RTL.test(first[0])
}

// `force` isolates a line of a Persian paragraph even where the line itself
// is mostly English, so it keeps the paragraph's right-to-left order.
export function isolate(text: string, force = false): string {
  const [, prefix, body, trailing] = PREFIX.exec(text) ?? ['', '', text, '']
  if (!force && !isRtl(body)) return text
  // Emphasis markers wrapping the whole line stay outside the isolate: a
  // closing `**` after punctuation and before PDI is not a closer to markdown.
  const [, open, inner, close] = EMPHASIS.exec(body) ?? ['', '', body, '']
  return `${prefix}${open}${RLI}${inner}${PDI}${close}${trailing}`
}

function cellsOf(row: string): string[] {
  return row.trim().split(CELL_SEPARATOR).slice(1, -1)
}

function isolateCells(row: string): string {
  return `|${cellsOf(row).map(cell => isolate(cell)).join('|')}|`
}

// `raw` is the item before its isolate, what `wrapLines` breaks.
export type Item = { text: string; raw: string; isRtl: boolean }

export type Block = {
  text: string
  isRtl: boolean
  // A list holding a Persian item, drawn one item per row so each item takes
  // its own side; its markers are plain text inside the item's isolate, so a
  // Persian item's number or bullet sits on its right.
  items?: Item[]
}

function listItems(lines: string[]): Item[] | undefined {
  if (!LIST_ITEM.test(lines[0])) return undefined
  const raw: { marker: string; body: string }[] = []
  for (const line of lines) {
    const match = LIST_ITEM.exec(line)
    if (match) raw.push({ marker: match[1], body: match[2] })
    else raw[raw.length - 1].body += ` ${line.trim()}`
  }
  if (!raw.some(item => isRtl(item.body))) return undefined

  return raw.map(({ marker, body }) => {
    const shown = /\d/.test(marker) ? marker.replace(/([.)])$/, '\\$1') : '•'
    const text = `${shown} ${body}`
    return isRtl(body)
      ? { text: isolate(text), raw: text, isRtl: true }
      : { text, raw: text, isRtl: false }
  })
}

// A Persian table, mirrored: its first column on the right, each mostly
// Persian column's cells right-aligned (`---:`).
function mirrorTable(lines: string[]): string | undefined {
  const isTable =
    lines.length >= 2 &&
    lines.every(line => TABLE_ROW.test(line)) &&
    TABLE_RULE.test(lines[1])
  if (!isTable || !isRtl(lines.filter((_, i) => i !== 1).join('\n'))) {
    return undefined
  }

  const rows = lines.map(cellsOf)
  const columnIsRtl = rows[1].map((_, c) =>
    isRtl(rows.filter((_, i) => i !== 1).map(row => row[c] ?? '').join(' ')),
  )
  rows[1] = rows[1].map((rule, c) => (columnIsRtl[c] ? ' ---: ' : rule))
  return rows.map(row => `|${[...row].reverse().join('|')}|`).join('\n')
}

type Kind = 'fence' | 'heading' | 'list' | 'table' | 'quote' | 'prose'

function kindOf(line: string): Kind {
  if (FENCE.test(line)) return 'fence'
  if (/^\s*#{1,6}\s/.test(line)) return 'heading'
  if (LIST_ITEM.test(line)) return 'list'
  if (TABLE_ROW.test(line)) return 'table'
  if (/^\s*>/.test(line)) return 'quote'
  return 'prose'
}

// Cuts a run of lines with no blank line between them where markdown starts
// a new block: a bold title straight above a list is two blocks, not one
// paragraph. A prose line after a list item or a quote continues it, as
// markdown reads it; a heading is a block of its own.
function segments(lines: string[]): string[][] {
  const out: string[][] = []
  let kind: Kind | undefined
  let inFence = false
  for (const line of lines) {
    if (inFence) {
      out[out.length - 1].push(line)
      if (FENCE.test(line)) inFence = false
      continue
    }
    const next = kindOf(line)
    const continues =
      kind !== undefined &&
      kind !== 'heading' &&
      kind !== 'fence' &&
      next !== 'heading' &&
      next !== 'fence' &&
      (next === kind || (next === 'prose' && (kind === 'list' || kind === 'quote')))
    if (continues) out[out.length - 1].push(line)
    else {
      out.push([line])
      kind = next
    }
    if (next === 'fence') inFence = true
  }
  return out
}

function toBlock(lines: string[]): Block {
  const block = lines.join('\n')
  if (FENCE.test(block)) return { text: block, isRtl: false }
  const items = listItems(lines)
  if (items) return { text: block, isRtl: true, items }
  const table = mirrorTable(lines)
  if (table) return { text: table, isRtl: true }
  return { text: block, isRtl: isRtl(block) }
}

// Splits markdown into groups at blank lines outside code fences, and each
// group into its blocks, each marked RTL when its prose (code fences left
// out) is mostly Persian.
export function splitGroups(text: string): Block[][] {
  const groups: string[][] = [[]]
  let inFence = false
  for (const line of text.split('\n')) {
    if (FENCE.test(line)) inFence = !inFence
    if (!inFence && line.trim() === '') {
      if (groups[groups.length - 1].length > 0) groups.push([])
      continue
    }
    groups[groups.length - 1].push(line)
  }
  return groups
    .filter(lines => lines.length > 0)
    .map(lines => segments(lines).map(toBlock))
}

export function splitBlocks(text: string): Block[] {
  return splitGroups(text).flat()
}

// A paragraph of prose: no heading, quote, table, list or fence syntax.
export function isProse(block: string): boolean {
  return !/^\s*(#{1,6}\s|>|\||[-*+]\s|\d+[.)]\s|```|~~~)/.test(block)
}

const WORD = /`[^`\n]*`|[^\s`]+/g
// A code span is drawn in the code font, wider than prose: about one cell
// a character, where a prose character takes about 0.7 of one.
const CODE_WIDTH = 1.45

function widthOf(word: string): number {
  return word.startsWith('`')
    ? word.length * CODE_WIDTH
    : word.replace(/\*\*/g, '').length
}

// Breaks a paragraph into lines of at most `budget` prose characters, never
// inside a code span, so each line can be drawn on its own row and pushed
// right. A `**` left open at a break is closed there and opened again on the
// next line, so bold survives the break.
export function wrapLines(text: string, budget: number): string[] {
  const words = text.match(WORD) ?? []
  const lines: string[] = []
  let line: string[] = []
  let width = 0
  for (const word of words) {
    const w = widthOf(word)
    if (line.length > 0 && width + 1 + w > budget) {
      lines.push(line.join(' '))
      line = []
      width = 0
    }
    line.push(word)
    width += (line.length > 1 ? 1 : 0) + w
  }
  if (line.length > 0) lines.push(line.join(' '))

  let isBold = false
  return lines.map((l, i) => {
    // A broken line that now opens with list, heading or quote syntax is
    // escaped, so it stays prose.
    const safe = i > 0 && /^(\d+[.)]|[-*+>]|#{1,6})(\s|$)/.test(l) ? `\\${l}` : l
    const opened = isBold ? `**${safe}` : safe
    const count = (l.replace(CODE_SPAN, '').match(/\*\*/g) ?? []).length
    if (count % 2 === 1) isBold = !isBold
    return isBold ? `${opened}**` : opened
  })
}

export function fixBidi(text: string): string {
  if (!HAS_RTL.test(text) || text.includes(RLI)) return text

  let inFence = false
  return text
    .split('\n')
    .map(line => {
      if (FENCE.test(line)) {
        inFence = !inFence
        return line
      }
      if (inFence || TABLE_RULE.test(line)) return line
      return TABLE_ROW.test(line) ? isolateCells(line) : isolate(line)
    })
    .join('\n')
}
