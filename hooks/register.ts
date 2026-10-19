import type { Register } from 'claude-code'

import { fixBidi, isolate, isProse, splitBlocks, wrapLines } from './bidi'

// The desktop reports its width in cells of its code font; a prose character
// takes about 0.7 of one. Lines are cut at a little under what fits, and the
// width is capped since the transcript column can be narrower than the pane.
const PROSE_PER_CELL = 1.2
const MAX_CELLS = 95

export const register: Register = on => {
  // Desktop only: draws the reply itself, pushing mostly-Persian
  // paragraphs and list items to the right edge. No surface takes a text
  // alignment, so a long Persian paragraph is broken into lines here, each
  // its own row pushed right, which reads as right-aligned text.
  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    const blocks = splitBlocks(e.props.text)
    if (e.surface !== 'desktop' || !blocks.some(b => b.isRtl)) {
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

    return Box({
      flexDirection: 'column',
      rowGap: 1,
      children: blocks.map(block => {
        if (block.items) {
          return Box({
            flexDirection: 'column',
            children: block.items.map(item =>
              item.isRtl ? rtlLines(item.raw) : row(item.text, false),
            ),
          })
        }
        if (block.isRtl && isProse(block.text)) return rtlLines(block.text)
        return row(fixBidi(block.text), block.isRtl)
      }),
    })
  })

  on('ui.render', { component: 'UserMessage' }, ($, e, next) =>
    next({ ...e, props: { ...e.props, text: fixBidi(e.props.text) } }),
  )
}
