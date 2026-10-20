import { expect, test } from 'claude-code/testing'

import { fixBidi, isRtl, PDI, RLI, splitBlocks, splitGroups, wrapLines } from './bidi'

test('wraps a Persian line with English words in an RTL isolate', async () => {
  expect(fixBidi('فایل `page.tsx` رو باز کن.')).toBe(
    `${RLI}فایل \`page.tsx\` رو باز کن.${PDI}`,
  )
})

test('keeps markdown prefixes outside the isolate', async () => {
  expect(fixBidi('## عنوان')).toBe(`## ${RLI}عنوان${PDI}`)
  expect(fixBidi('- مورد اول')).toBe(`- ${RLI}مورد اول${PDI}`)
  expect(fixBidi('1. قدم اول')).toBe(`1. ${RLI}قدم اول${PDI}`)
  expect(fixBidi('> نقل قول')).toBe(`> ${RLI}نقل قول${PDI}`)
})

test('keeps whole-line bold markers outside the isolate', async () => {
  expect(fixBidi('**چیزهایی که باید چک کنی:**')).toBe(
    `**${RLI}چیزهایی که باید چک کنی:${PDI}**`,
  )
  expect(fixBidi('- **مهم:** متن')).toBe(`- **${RLI}مهم:** متن${PDI}`)
})

test('keeps a hard line break after the isolate', async () => {
  expect(fixBidi('سلام  \nدنیا')).toBe(`${RLI}سلام${PDI}  \n${RLI}دنیا${PDI}`)
})

test('leaves English lines, code fences and table rules alone', async () => {
  const text = [
    'Run the tests first.',
    '```ts',
    "const s = 'سلام'",
    '```',
    '| نام | value |',
    '| --- | --- |',
  ].join('\n')
  expect(fixBidi(text).split('\n')).toEqual([
    'Run the tests first.',
    '```ts',
    "const s = 'سلام'",
    '```',
    `| ${RLI}نام${PDI} | value |`,
    '| --- | --- |',
  ])
})

test('is idempotent', async () => {
  const once = fixBidi('این یک test است')
  expect(fixBidi(once)).toBe(once)
})

test('the rewritten message reaches the desktop, not the terminal', async ($, on) => {
  // Stands in for the engine: draws whatever text the plugin hands down as
  // Markdown, so the surface's validation sees the isolate marks.
  on('ui.render', { component: 'AssistantMessage' }, ($, e) => {
    const { Markdown } = $.ui.resolve(e)
    return Markdown({ text: e.props.text })
  })

  for (const surface of ['desktop', 'terminal'] as const) {
    const ui = await $.ui.mount({
      plugin: 'persian-rtl',
      surface,
      component: 'AssistantMessage',
      props: { text: 'مشکل `rtl` حل شد', isFirstOfReply: true },
    })
    const drawn = JSON.stringify(await ui.drawn())
    if (surface === 'desktop') expect(drawn).toContain(RLI)
    else expect(drawn).not.toContain(RLI)
    await ui.unmount()
  }
})

test('splits paragraphs and keeps a code fence with blank lines whole', async () => {
  const text = 'سلام دنیا\n\nEnglish here\n\n```\na\n\nb\n```'
  expect(splitBlocks(text)).toEqual([
    { text: 'سلام دنیا', isRtl: true },
    { text: 'English here', isRtl: false },
    { text: '```\na\n\nb\n```', isRtl: false },
  ])
})

const MIXED = { text: 'یک پاراگراف فارسی\n\nAn English one', isFirstOfReply: true }

test('pushes Persian paragraphs right on the desktop', async ($, on) => {
  on('ui.render', { component: 'AssistantMessage' }, ($, e) => {
    const { Markdown } = $.ui.resolve(e)
    return Markdown({ text: 'engine' })
  })

  const ui = await $.ui.mount({
    plugin: 'persian-rtl',
    surface: 'desktop',
    component: 'AssistantMessage',
    props: MIXED,
  })
  const drawn = JSON.stringify(await ui.drawn())
  expect(drawn).toContain('"alignItems":"flex-end"')
  expect(drawn).toContain('"alignItems":"flex-start"')
  expect(drawn).not.toContain('engine')
  expect(drawn).toContain('"rowGap":1')
  await ui.unmount()

  const term = await $.ui.mount({
    plugin: 'persian-rtl',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: MIXED,
  })
  expect(JSON.stringify(await term.drawn())).toContain('engine')
  await term.unmount()
})

test('inline code does not count toward a line\'s direction', async () => {
  expect(isRtl('اول `git status` را اجرا کن')).toBe(true)
  expect(isRtl('Run `پیکربندی` now please')).toBe(false)
})

test('one long English word does not outweigh a Persian sentence', async () => {
  expect(isRtl('یک screenshot بفرست.')).toBe(true)
  expect(isRtl('Next.js یک فریمورک')).toBe(true)
  expect(isRtl('Open the فایل now')).toBe(false)
})

test('splits a list holding Persian into items, markers inside the isolate', async () => {
  const text = [
    '1. اول `git status` را اجرا کن.',
    '2. **مهم:** بعد فایل را باز کن',
    '3. Run the tests with `pnpm test`.',
  ].join('\n')
  expect(splitBlocks(text)[0].items).toEqual([
    { text: `${RLI}1\\. اول \`git status\` را اجرا کن.${PDI}`, raw: '1\\. اول `git status` را اجرا کن.', isRtl: true },
    { text: `${RLI}2\\. **مهم:** بعد فایل را باز کن${PDI}`, raw: '2\\. **مهم:** بعد فایل را باز کن', isRtl: true },
    { text: '3\\. Run the tests with `pnpm test`.', raw: '3\\. Run the tests with `pnpm test`.', isRtl: false },
  ])
  expect(splitBlocks('- one\n- two')[0].items).toBeUndefined()
  expect(splitBlocks('- یک\n  ادامه\n- دو')[0].items?.[0].text).toBe(
    `${RLI}• یک ادامه${PDI}`,
  )
})

test('mirrors a Persian table and right-aligns its Persian columns', async () => {
  const text = [
    '| مرحله | Command | توضیح |',
    '| --- | --- | --- |',
    '| نصب | `pnpm install` | پکیج‌ها را نصب می‌کند |',
  ].join('\n')
  expect(splitBlocks(text)[0]).toEqual({
    text: [
      '| توضیح | Command | مرحله |',
      '| ---: | --- | ---: |',
      '| پکیج‌ها را نصب می‌کند | `pnpm install` | نصب |',
    ].join('\n'),
    isRtl: true,
  })
  expect(splitBlocks('| a | b |\n| --- | --- |')[0].text).toBe('| a | b |\n| --- | --- |')
})

test('a reply with a Persian list and table draws on the desktop', async $ => {
  const text = [
    'یک لیست:',
    '',
    '1. اول `git status` را اجرا کن.',
    '2. Run the tests.',
    '',
    '| مرحله | توضیح |',
    '| --- | --- |',
    '| نصب | پکیج‌ها را نصب می‌کند |',
  ].join('\n')
  const ui = await $.ui.mount({
    plugin: 'persian-rtl',
    surface: 'desktop',
    component: 'AssistantMessage',
    props: { text, isFirstOfReply: true },
  })
  const drawn = JSON.stringify(await ui.drawn())
  expect(drawn).toContain('1\\\\. اول')
  expect(drawn).toContain('---:')
  await ui.unmount()
})

test('wraps a long paragraph without breaking code spans', async () => {
  expect(wrapLines('یک دو سه چهار پنج', 8)).toEqual(['یک دو سه', 'چهار پنج'])
  expect(wrapLines('الف `a b c` ب', 13)).toEqual(['الف', '`a b c` ب'])
})

test('carries bold across a break and escapes list-like line starts', async () => {
  expect(wrapLines('**یک دو سه چهار** پنج', 8)).toEqual([
    '**یک دو سه**',
    '**چهار** پنج',
  ])
  expect(wrapLines('عدد اول 1. دوم', 7)).toEqual(['عدد اول', '\\1. دوم'])
})

test('a bold title straight above a list stays its own block', async () => {
  const text = [
    '**برای کدهای راهداری کمک نمی‌کند**',
    '- لایه‌ی شهر و آبادی نقطه‌ی راهداری ندارد.',
    '- کدهای وزارت کشور با کدهای راهداری فرق دارند.',
    '',
    '**پیشنهاد**',
    '1. مرز وزارت کشور را فقط برای ۲۲۰ واحد بگذارم.',
    '2. ستون‌های کد را اضافه کنم.',
  ].join('\n')
  const groups = splitGroups(text)
  expect(groups.map(group => group.length)).toEqual([2, 2])
  expect(groups[0][0]).toEqual({ text: '**برای کدهای راهداری کمک نمی‌کند**', isRtl: true })
  expect(groups[0][1].items?.map(item => item.raw)).toEqual([
    '• لایه‌ی شهر و آبادی نقطه‌ی راهداری ندارد.',
    '• کدهای وزارت کشور با کدهای راهداری فرق دارند.',
  ])
  expect(groups[1][1].items).toHaveLength(2)
})

test('headings, fences and tables split off the prose around them', async () => {
  const text = ['## عنوان', 'متن زیر عنوان', '```', 'code', '```', '| الف | ب |', '| --- | --- |'].join('\n')
  expect(splitBlocks(text).map(block => block.text.split('\n')[0])).toEqual([
    '## عنوان',
    'متن زیر عنوان',
    '```',
    '| ب | الف |',
  ])
})

test('a prose line under a list item continues the item', async () => {
  const items = splitBlocks('- یک\nادامه‌ی یک\n- دو')[0].items
  expect(items?.map(item => item.raw)).toEqual(['• یک ادامه‌ی یک', '• دو'])
})

test('list items that wrap get a row between them on the desktop', async $ => {
  const gaps = async (text: string) => {
    const ui = await $.ui.mount({
      plugin: 'persian-rtl',
      surface: 'desktop',
      component: 'AssistantMessage',
      props: { text, isFirstOfReply: true },
    })
    const drawn = JSON.stringify(await ui.drawn())
    await ui.unmount()
    return drawn.split('"rowGap":1').length - 1
  }
  const long = 'این یک مورد خیلی بلند است که '.repeat(8)
  expect(await gaps('- یک\n- دو')).toBe(1)
  expect(await gaps(`- ${long}\n- ${long}`)).toBe(2)
})
