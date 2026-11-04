import type { Register } from 'claude-code'

import { fixBidi, markAll } from './bidi'

// The terminal draws no bidi marks: it drops RLM and LRM and draws every
// other one (RLI, PDI, RLE, ALM) as U+FFFD. A terminal that lays out
// right-to-left text itself, as macOS Terminal does, gets the text as written.
const withMarks = (e: { surface: string }) => e.surface !== 'terminal'

// The desktop's closing card (recap, question, answer): its tool is
// `mcp__ccd_turn__wrap_up`, under whatever server name the host gives it.
const isWrapUp = (tool: string) => /(^|__)wrap_up$/.test(tool)

// The desktop draws the message as it always does, Persian on the right; the
// text only gains a direction mark on lines whose first letter misleads it.
export const register: Register = on => {
  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) =>
    withMarks(e) ? next({ ...e, props: { ...e.props, text: fixBidi(e.props.text) } }) : next(e),
  )
  on('ui.render', { component: 'UserMessage' }, ($, e, next) =>
    withMarks(e) ? next({ ...e, props: { ...e.props, text: fixBidi(e.props.text) } }) : next(e),
  )
  on('ui.render', { component: 'AskUserQuestion' }, ($, e, next) =>
    withMarks(e)
      ? next({ ...e, props: { ...e.props, questions: markAll(e.props.questions) as unknown[] } })
      : next(e),
  )
  on('ui.render', { component: 'ToolUse' }, ($, e, next) =>
    withMarks(e) && isWrapUp(e.props.tool)
      ? next({ ...e, props: { ...e.props, input: markAll(e.props.input) } })
      : next(e),
  )
}
