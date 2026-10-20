# Persian RTL for Claude Code

Fixes mixed Persian/English text in the Claude Code desktop app. Replies look exactly as Claude Code draws them; only the lines whose direction comes out wrong are fixed.

**English** · [فارسی](#fa)

## Install

Run in any terminal:

```bash
claude plugin marketplace add amirmvahed/claude-code-persian-rtl
```

```bash
claude plugin install persian-rtl@persian-rtl --scope user
```

Then open a new session. Don't type `/plugin install` in the desktop chat box: it does nothing there.

## Auto-update

Off by default for community plugins. Turn it on once: run `claude` in a terminal, type `/plugin`, open **Marketplaces**, pick **persian-rtl**, choose **Enable auto-update**.

To update by hand instead:

```bash
claude plugin update persian-rtl@persian-rtl
```

## What it does

The desktop app puts each paragraph on the right or left by its first letter. A Persian line that starts with an English word, a file name or `code` jumps left and its words scramble. The plugin adds an invisible direction mark (RLM/LRM) to just those lines. Code blocks are never touched.

## Limits

- The input box isn't fixed; your message looks right once sent.
- No effect in the terminal: Claude Code strips direction marks there.
- Claude Code only, not claude.ai.

## Develop

```bash
claude --plugin-dir /path/to/claude-code-persian-rtl
```

Logic in [`hooks/bidi.ts`](hooks/bidi.ts), tests in [`hooks/bidi.test.ts`](hooks/bidi.test.ts) (`claude plugin test .`). A screenshot of broken text helps most in an issue.

MIT license.

---

<a id="fa"></a>

<div dir="rtl">

# راست‌چین فارسی برای Claude Code

متن فارسی و انگلیسیِ قاطی رو تو اپ دسکتاپ Claude Code درست می‌کنه. جواب‌ها همون شکلی می‌مونن که خود Claude Code نشون می‌ده؛ فقط خط‌هایی که جهتشون اشتباه درمیاد درست می‌شن.

[English](#persian-rtl-for-claude-code) · **فارسی**

## نصب

این دو دستور رو تو ترمینال بزن:

<div dir="ltr">

```bash
claude plugin marketplace add amirmvahed/claude-code-persian-rtl
```

```bash
claude plugin install persian-rtl@persian-rtl --scope user
```

</div>

بعد یه session جدید باز کن. `/plugin install` رو تو کادر چت دسکتاپ نزن، اون‌جا کار نمی‌کنه.

## آپدیت خودکار

برای پلاگین‌های غیررسمی پیش‌فرض خاموشه. یه بار روشنش کن: تو ترمینال `claude` رو اجرا کن، `/plugin` رو بزن، برو تو **Marketplaces**، **persian-rtl** رو انتخاب کن و **Enable auto-update** رو بزن.

یا دستی آپدیت کن:

<div dir="ltr">

```bash
claude plugin update persian-rtl@persian-rtl
```

</div>

## چی کار می‌کنه

اپ دسکتاپ جهت هر پاراگراف رو از حرف اولش می‌فهمه. خط فارسی‌ای که با کلمه‌ی انگلیسی، اسم فایل یا کد شروع بشه می‌پره سمت چپ و کلمه‌هاش به هم می‌ریزن. پلاگین فقط جلوی همین خط‌ها یه علامت نامرئی جهت (RLM/LRM) می‌ذاره. به بلوک کد دست نمی‌زنه.

## محدودیت‌ها

- کادر تایپ درست نمی‌شه؛ پیامت بعد از ارسال درست نشون داده می‌شه.
- تو ترمینال اثری نداره، چون Claude Code اون‌جا علامت‌های جهت رو حذف می‌کنه.
- فقط برای Claude Code‌ه، نه claude.ai.

لایسنس MIT.

</div>
