import type { Register } from 'claude-code'

import { type Block, fixBidi, isolate, isProse, splitGroups, wrapLines } from './bidi'

// The desktop reports its width in cells of its code font; a prose character
// takes about 0.7 of one. Lines are cut at a little under what fits, and the
// width is capped since the transcript column can be narrower than the pane.
const PROSE_PER_CELL = 1.2
const MAX_CELLS = 95

// The terminal draws no bidi marks: it drops RLM and LRM and draws every
// other one (RLI, PDI, RLE, ALM) as U+FFFD. A terminal that lays out
// right-to-left text itself, as macOS Terminal does, gets the text as written.
const withMarks = (e: { surface: string }) => e.surface !== 'terminal'

export const register: Register = on => {
  // Desktop only: draws the reply itself, pushing mostly-Persian
  // paragraphs and list items to the right edge. No surface takes a text
  // alignment, so a long Persian paragraph is broken into lines here, each
  // its own row pushed right, which reads as right-aligned text.
  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    if (!withMarks(e)) return next(e)
    const groups = splitGroups(e.props.text)
    if (e.surface !== 'desktop' || !groups.flat().some(b => b.isRtl)) {
      return next({ ...e, props: { ...e.props, text: fixBidi(e.props.text) } })
    }

    const cells = Math.min(e.viewport?.columns ?? MAX_CELLS, MAX_CELLS)
    const budget = Math.max(20, Math.floor(cells * PROSE_PER_CELL))

    const { Box, Markdown } = $.ui.resolve(e)
    const side = (isRtl: boolean) => (isRtl ? 'flex-end' : 'flex-start')
    const row = (text: string, isRtl: boolean) =>
      Box({
        flexDirection: 'column',
        alignItems: side(isRtl),
        children: Markdown({ text }),
      })
    const rtlLines = (raw: string) =>
      Box({
        flexDirection: 'column',
        children: wrapLines(raw, budget).map(line => row(isolate(line, true), true)),
      })

    const draw = (block: Block) => {
      if (block.items) {
        // Items that run over several lines get a row between them, so it
        // shows where one ends and the next begins.
        const wraps = block.items.some(
          item => item.isRtl && wrapLines(item.raw, budget).length > 1,
        )
        return Box({
          flexDirection: 'column',
          rowGap: wraps ? 1 : 0,
          children: block.items.map(item =>
            item.isRtl ? rtlLines(item.raw) : row(item.text, false),
          ),
        })
      }
      if (block.isRtl && isProse(block.text)) return rtlLines(block.text)
      return row(fixBidi(block.text), block.isRtl)
    }

    // A blank line in the reply puts a gap between blocks; blocks with no
    // blank line between them, such as a bold title and its list, stay close.
    return Box({
      flexDirection: 'column',
      rowGap: 1,
      children: groups.map(group =>
        group.length === 1
          ? draw(group[0])
          : Box({ flexDirection: 'column', children: group.map(draw) }),
      ),
    })
  })

  on('ui.render', { component: 'UserMessage' }, ($, e, next) =>
    withMarks(e) ? next({ ...e, props: { ...e.props, text: fixBidi(e.props.text) } }) : next(e),
  )
}
