import { expect, test } from 'claude-code/testing'

import { fixBidi, isRtl, RLM } from './bidi'

test('leaves a line alone when its first letter already gives its direction', async () => {
  const lines = [
    'فایل `page.tsx` رو باز کن.',
    '## عنوان',
    '- مورد اول با یک screenshot',
    '**چیزهایی که باید چک کنی:**',
    'Run the tests first.',
  ]
  for (const line of lines) expect(fixBidi(line)).toBe(line)
})

test('marks a line with Persian that opens with an English word', async () => {
  expect(fixBidi('Claude یه فایل جدید ساخت.')).toBe(`${RLM}Claude یه فایل جدید ساخت.`)
  expect(fixBidi('`moi_download.py` چهار لایه را ذخیره می‌کند')).toBe(
    `${RLM}\`moi_download.py\` چهار لایه را ذخیره می‌کند`,
  )
})

test('a line that opens in Persian stays right to left, even when mostly English', async () => {
  const line = 'فایل‌ها, run the tests and then check the output carefully.'
  expect(fixBidi(line)).toBe(line)
})

test('a message opening with a lowercase English word is marked', async () => {
  expect(fixBidi('claude اینو درست کن')).toBe(`${RLM}claude اینو درست کن`)
})

test('one Persian word turns an English-led line right to left', async () => {
  expect(fixBidi('Open the فایل now and run it')).toBe(`${RLM}Open the فایل now and run it`)
  expect(fixBidi('Please open فایل تنظیمات پروژه and check it')).toBe(
    `${RLM}Please open فایل تنظیمات پروژه and check it`,
  )
})

test('keeps markdown syntax before the mark', async () => {
  expect(fixBidi('## OSM و مرزهای رسمی')).toBe(`## ${RLM}OSM و مرزهای رسمی`)
  expect(fixBidi('- OSM مرز ندارد')).toBe(`- ${RLM}OSM مرز ندارد`)
  expect(fixBidi('2. RMTO کد جدا دارد')).toBe(`2. ${RLM}RMTO کد جدا دارد`)
  expect(fixBidi('> Claude گفت درسته')).toBe(`> ${RLM}Claude گفت درسته`)
  expect(fixBidi('**OSM بهتر است**')).toBe(`**${RLM}OSM بهتر است**`)
})

test('a link target does not decide the direction', async () => {
  const line = '[فایل](https://example.com/a) را ببین'
  expect(fixBidi(line)).toBe(line)
})

test('marks table cells, not the rule, and leaves code fences alone', async () => {
  const text = [
    '| OSM کامل‌تر است | value |',
    '| --- | --- |',
    '```',
    'Claude یه فایل',
    '```',
  ].join('\n')
  expect(fixBidi(text).split('\n')).toEqual([
    `| ${RLM}OSM کامل‌تر است | value |`,
    '| --- | --- |',
    '```',
    'Claude یه فایل',
    '```',
  ])
})

test('is idempotent and leaves English-only text untouched', async () => {
  const once = fixBidi('API یک ابزار است')
  expect(fixBidi(once)).toBe(once)
  expect(fixBidi('Plain English, no marks.')).toBe('Plain English, no marks.')
})

test('the desktop draws the reply as usual, with the marks; the terminal gets it as written', async ($, on) => {
  on('ui.render', { component: 'AssistantMessage' }, ($, e) => {
    const { Markdown } = $.ui.resolve(e)
    return Markdown({ text: e.props.text })
  })

  const text = 'Claude یه جدول ساخت\n\n| الف | ب |\n| --- | --- |\n| ۱ | ۲ |'
  for (const surface of ['desktop', 'terminal'] as const) {
    const ui = await $.ui.mount({
      plugin: 'persian-rtl',
      surface,
      component: 'AssistantMessage',
      props: { text, isFirstOfReply: true },
    })
    const drawn = JSON.stringify(await ui.drawn())
    if (surface === 'desktop') {
      expect(drawn).toContain(RLM)
      // One Markdown, as the engine draws it: no rows, gaps or mirrored table.
      expect(drawn).not.toContain('alignItems')
      expect(drawn).toContain('| الف | ب |')
    } else {
      expect(drawn).not.toContain(RLM)
    }
    await ui.unmount()
  }
})

test('Persian inside inline code or a link target does not count', async () => {
  expect(isRtl('اول `git status` را اجرا کن')).toBe(true)
  expect(isRtl('Run `پیکربندی` now please')).toBe(false)
  expect(isRtl('See [the docs](https://fa.wikipedia.org/wiki/فارسی) first')).toBe(false)
  expect(fixBidi('Run `پیکربندی` now please')).toBe('Run `پیکربندی` now please')
})
