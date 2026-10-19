# Persian RTL for Claude Code

A Claude Code plugin that makes mixed Persian/English text readable.

Without it, a Persian sentence with English words, file names or numbers in it comes out scrambled, and everything is left-aligned. With it:

- **Word order is fixed** everywhere Claude Code draws messages (desktop app and terminal): English words, `code`, numbers and punctuation stay where they belong inside a Persian sentence.
- **Persian is right-aligned** in the Claude Code desktop app: Persian paragraphs, list items (number or bullet on the right) and tables (first column on the right, cells right-aligned). English paragraphs and code blocks stay on the left.

## Install

At the prompt of a Claude Code session:

```
/plugin install persian-rtl --marketplace amirmvahed/claude-code-persian-rtl
```

Answer `y` to add the marketplace, then pick a scope (user scope applies it to every session).

To turn right alignment off and keep only the word-order fix, set the plugin's `rightAlign` option to `false` (in `/plugin`, under the plugin's options).

## How it works

- Each mostly-Persian line is wrapped in Unicode bidi isolate marks (U+2067 … U+2069), so the line is laid out right to left inside the app's left-to-right page. A line counts as Persian when most of its words are Persian; inline code and link targets don't count.
- On the desktop app, the plugin draws Claude's replies itself: each Persian paragraph is broken into lines and each line is pushed to the right edge, since the app offers plugins no text-align setting. Persian tables are mirrored and their Persian columns right-aligned.

## Limits

- Line length on the desktop is estimated from the window width; a line may sometimes be shorter than it could be.
- The text box you type in can't be changed by a plugin; your message is fixed once sent.
- Right alignment applies to Claude's replies on the desktop app only. Your own messages and the terminal get the word-order fix.
- This plugin does not affect the Chat tab or claude.ai, only Claude Code.

---

# راست‌چین فارسی برای Claude Code

این پلاگین متن‌های فارسی و انگلیسیِ قاطی را در Claude Code خوانا می‌کند:

- **ترتیب کلمه‌ها درست می‌شود:** کلمه‌های انگلیسی، کد، عددها و علامت‌ها وسط جمله‌ی فارسی جابه‌جا نمی‌شوند.
- **فارسی راست‌چین می‌شود** (در اپ دسکتاپ): پاراگراف‌ها، آیتم‌های لیست با شماره‌ی سمت راست، و جدول‌ها با ستون اول سمت راست. پاراگراف انگلیسی و بلوک کد سمت چپ می‌مانند.

## نصب

در یک سشن Claude Code این را بزن:

```
/plugin install persian-rtl --marketplace amirmvahed/claude-code-persian-rtl
```

برای اضافه شدن marketplace جواب `y` بده و scope را انتخاب کن.

برای خاموش کردن راست‌چین، گزینه‌ی `rightAlign` را `false` کن. درست شدن ترتیب کلمه‌ها روشن می‌ماند.

## محدودیت‌ها

- کادر تایپ را پلاگین نمی‌تواند تغییر دهد؛ پیامت بعد از ارسال درست نمایش داده می‌شود.
- راست‌چین فقط روی جواب‌های Claude در اپ دسکتاپ اعمال می‌شود.
- روی بخش Chat و سایت claude.ai اثری ندارد.

## License

MIT
