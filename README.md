# Persian RTL for Claude Code

**Right-to-left Persian that actually reads right, in the desktop app and the terminal.**

Drop one English word, a file name or a number into a Persian sentence and the whole line scrambles. Everything sits on the left. This plugin fixes both: word order comes out the way you wrote it, and on the desktop app Claude's Persian replies are right-aligned.

**English** · [فارسی](#fa)

```
   REPLY           DETECT          ISOLATE          ALIGN
 ┌───────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
 │ Mixed │ ───▶ │ Mostly  │ ───▶ │ RLI…PDI │ ───▶ │  Push   │
 │ fa/en │      │ Persian?│      │ per line│      │  right  │
 └───────┘      └─────────┘      └─────────┘      └─────────┘
               words, not        English and       desktop
                 letters          code stay put       only
```

---

## What You Get

| Where | Word order fixed | Right-aligned |
|-------|:----------------:|:-------------:|
| Claude's replies, desktop app | ✓ | ✓ paragraphs, lists, tables |
| Claude's replies, terminal | ✓ | — |
| Your own messages, anywhere | ✓ once sent | — |
| Code blocks and English text | left as is | stay on the left |

Lists keep their numbers and bullets on the right. Tables get mirrored. `Inline code`, numbers and English words stay exactly where you put them.

---

## Quick Start

**Two commands, any terminal:**

```bash
claude plugin marketplace add amirmvahed/claude-code-persian-rtl
```

```bash
claude plugin install persian-rtl@persian-rtl --scope user
```

Open a new session, or run `/reload-plugins` in the one you have open. Done.

<details>
<summary><b>Desktop app</b></summary>

Use the two commands above in a terminal. Don't type `/plugin install` in the desktop chat box: it does nothing there, and the plugin won't appear in the app's plugin list either. It's installed all the same.

</details>

<details>
<summary><b>Inside a terminal <code>claude</code> session</b></summary>

```
/plugin install persian-rtl --marketplace amirmvahed/claude-code-persian-rtl
```

Answer `y` to add the marketplace, then pick a scope.

</details>

<details>
<summary><b>Local / development</b></summary>

```bash
git clone https://github.com/amirmvahed/claude-code-persian-rtl.git
claude --plugin-dir /path/to/claude-code-persian-rtl
```

</details>

---

## How It Works

Two hooks on Claude Code's message rendering, nothing else.

1. **Detect.** Each line is judged mostly Persian or not, by counting words.
2. **Isolate.** Mostly-Persian lines are wrapped in Unicode bidi isolate marks (U+2067 … U+2069), so the line is laid out right to left inside the left-to-right page.
3. **Align (desktop only).** The desktop app gives plugins no text-alignment setting, so the plugin draws Claude's reply itself: it breaks each Persian paragraph into lines and pushes each line to the right edge.

**Key design choices:**

- **Isolate, don't reorder.** The plugin never moves your characters around. It marks direction and lets the renderer do the layout.
- **Words, not letters.** One long English word (`screenshot`) doesn't outweigh the Persian sentence around it. A tie goes to whichever script comes first.
- **Code is never touched.** Fenced code blocks are skipped, and inline code and link URLs don't count toward "mostly Persian".
- **Markdown stays markdown.** List markers, headings, quotes and wrapping `**bold**` stay outside the isolate, so formatting still renders.

---

## Known Issues

| Issue | Why |
|-------|-----|
| Some desktop lines wrap a little early | Line width is estimated from the window size |
| The input box isn't fixed | Plugins can't touch it. Your message looks right once sent |
| Right-alignment is replies-only, desktop-only | Your messages and the terminal get the word-order fix |
| No effect on the Chat tab or claude.ai | It's a Claude Code plugin |

---

## Why This Plugin?

Persian and English mix constantly in technical work: file names, commands, library names, error messages. The Unicode bidi algorithm handles a pure Persian line fine and a mixed one badly, because the page around it runs left to right. Claude Code renders everything left to right, so every mixed sentence comes out jumbled and every Persian paragraph hugs the wrong edge.

The fix isn't translation or a new font. It's telling the renderer which way each line runs and, on the desktop, which side it belongs on.

---

## Contributing

Issues and pull requests are welcome. The detection and isolate logic lives in [`hooks/bidi.ts`](hooks/bidi.ts) with its tests in [`hooks/bidi.test.ts`](hooks/bidi.test.ts); the render hooks are in [`hooks/register.ts`](hooks/register.ts). A screenshot of the broken text helps more than a description of it.

---

## License

MIT - use it, fork it, ship it.

---

<a id="fa"></a>

<div dir="rtl">

# راست‌چین فارسی برای Claude Code

**فارسیِ راست‌به‌چپ که درست خونده می‌شه، هم تو اپ دسکتاپ هم تو ترمینال.**

یه کلمه‌ی انگلیسی، اسم یه فایل یا یه عدد وسط جمله‌ی فارسی بیاد، کل خط به هم می‌ریزه. همه‌چی هم چپ‌چینه. این پلاگین هر دو رو درست می‌کنه: ترتیب کلمه‌ها همون‌طوری درمیاد که نوشتی، و تو اپ دسکتاپ جواب‌های فارسی Claude راست‌چین می‌شن.

[English](#persian-rtl-for-claude-code) · **فارسی**

---

## چی درست می‌شه

| کجا | ترتیب کلمه‌ها | راست‌چین |
|-----|:------------:|:--------:|
| جواب‌های Claude، اپ دسکتاپ | ✓ | ✓ پاراگراف، لیست، جدول |
| جواب‌های Claude، ترمینال | ✓ | — |
| پیام‌های خودت، همه‌جا | ✓ بعد از ارسال | — |
| بلوک کد و متن انگلیسی | دست‌نخورده | سمت چپ می‌مونن |

شماره و بولت لیست‌ها سمت راست می‌مونه، جدول‌ها آینه می‌شن. کد، عدد و کلمه‌ی انگلیسی دقیقاً همون‌جایی می‌مونن که نوشتی.

---

## نصب سریع

**دو تا دستور، تو هر ترمینالی:**

<div dir="ltr">

```bash
claude plugin marketplace add amirmvahed/claude-code-persian-rtl
```

```bash
claude plugin install persian-rtl@persian-rtl --scope user
```

</div>

یه سشن جدید باز کن، یا تو همون سشن بازت `/reload-plugins` رو بزن. تمام.

<details>
<summary><b>اپ دسکتاپ</b></summary>

همون دو تا دستور بالا رو تو ترمینال بزن. `/plugin install` رو تو کادر چت دسکتاپ نزن: اون‌جا کاری نمی‌کنه، و پلاگین تو لیست پلاگین‌های اپ هم دیده نمی‌شه. ولی نصب شده و کار می‌کنه.

</details>

<details>
<summary><b>از داخل سشن <code>claude</code> تو ترمینال</b></summary>

<div dir="ltr">

```
/plugin install persian-rtl --marketplace amirmvahed/claude-code-persian-rtl
```

</div>

برای اضافه شدن marketplace بزن `y` و بعد scope رو انتخاب کن.

</details>

---

## اصول طراحی

- **جداسازی، نه جابه‌جایی.** پلاگین هیچ حرفی رو جابه‌جا نمی‌کنه، فقط جهت هر خط رو با علامت‌های یونیکد مشخص می‌کنه و چیدمان رو می‌سپره به خود رندرر.
- **کلمه می‌شمره، نه حرف.** یه کلمه‌ی انگلیسیِ بلند جمله‌ی فارسیِ دورش رو چپ‌به‌راست نمی‌کنه.
- **به کد دست نمی‌زنه.** بلوک‌های کد کنار گذاشته می‌شن، و کد و آدرس لینک تو تشخیص «بیشترش فارسیه» حساب نمی‌شن.
- **مارک‌داون سالم می‌مونه.** علامت لیست، تیتر، نقل‌قول و بولد بیرون از ناحیه‌ی جداشده می‌مونن تا درست رندر بشن.

---

## محدودیت‌ها

| محدودیت | چرا |
|---------|-----|
| بعضی خط‌ها تو دسکتاپ یه کم زودتر می‌شکنن | عرض خط از روی اندازه‌ی پنجره تخمین زده می‌شه |
| کادر تایپ درست نمی‌شه | دست پلاگین نیست. پیامت بعد از ارسال درست نشون داده می‌شه |
| راست‌چین فقط روی جواب‌های Claude تو دسکتاپه | پیام‌های خودت و ترمینال فقط ترتیب کلمه‌ها رو می‌گیرن |
| روی بخش Chat و claude.ai اثری نداره | پلاگین مال Claude Code‌ه |

---

## مشارکت

ایشو و پول‌ریکوئست با کمال میل. یه اسکرین‌شات از متن به‌هم‌ریخته از هر توضیحی بیشتر کمک می‌کنه.

## لایسنس

MIT

</div>
