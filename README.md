# Persian RTL for Claude Code

If you write to Claude in Persian, you know the pain: drop one English word or a file name into a sentence and the whole line gets scrambled. And everything is stuck on the left.

This plugin fixes that:

- Word order comes out right, in the desktop app and in the terminal. English words, `code` and numbers stay where you put them.
- In the desktop app, Persian replies are right-aligned: paragraphs, lists (with the numbers on the right) and tables. English and code blocks stay on the left.

## Install

Open a terminal and run:

```bash
claude plugin marketplace add amirmvahed/claude-code-persian-rtl
```

```bash
claude plugin install persian-rtl@persian-rtl --scope user
```

Then open a new session (or type `/reload-plugins` in the one you have open). That's it.

**On the desktop app?** Don't type `/plugin install` in the chat box, it won't do anything there, and the plugin won't show up in the app's plugin list either. Just use the two commands above.

Already using `claude` in a terminal? You can also do it from there:

```
/plugin install persian-rtl --marketplace amirmvahed/claude-code-persian-rtl
```

Say `y` to add the marketplace and pick a scope.

Don't want the right-alignment, only the word-order fix? Run `/plugin configure persian-rtl@persian-rtl` in a terminal `claude` session and set `rightAlign` to `false`.

## How it works

- Every line that's mostly Persian gets wrapped in Unicode bidi isolate marks (U+2067 … U+2069), so it's laid out right to left. Inline code and link URLs don't count toward "mostly Persian".
- The desktop app doesn't let plugins set text alignment, so on the desktop the plugin draws Claude's replies itself: it breaks each Persian paragraph into lines and pushes each line to the right. Tables get mirrored.

## Known issues

- Line width on the desktop is a guess based on the window size, so some lines wrap a bit early.
- The box you type in can't be touched by a plugin. Your message looks right once it's sent.
- Right-alignment only applies to Claude's replies in the desktop app. Your own messages and the terminal only get the word-order fix.
- Only works in Claude Code. The Chat tab and claude.ai aren't affected.

---

# راست‌چین فارسی برای Claude Code

اگه با Claude فارسی حرف می‌زنی حتماً دیدی که تا یه کلمه‌ی انگلیسی یا اسم فایل وسط جمله میاد، کل خط به هم می‌ریزه. تازه همه‌چی هم چپ‌چینه.

این پلاگین درستش می‌کنه:

- ترتیب کلمه‌ها درست درمیاد، هم تو اپ دسکتاپ هم تو ترمینال. کلمه‌های انگلیسی، کد و عددها همون‌جایی می‌مونن که نوشتی.
- تو اپ دسکتاپ جواب‌های فارسی راست‌چین می‌شن: پاراگراف‌ها، لیست‌ها (با شماره سمت راست) و جدول‌ها. متن انگلیسی و بلوک کد سمت چپ می‌مونن.

## نصب

ترمینال رو باز کن و این دو تا رو بزن:

```bash
claude plugin marketplace add amirmvahed/claude-code-persian-rtl
```

```bash
claude plugin install persian-rtl@persian-rtl --scope user
```

بعد یه سشن جدید باز کن (یا تو همون سشنی که بازه `/reload-plugins` رو بزن). تمام.

**با اپ دسکتاپ کار می‌کنی؟** `/plugin install` رو تو کادر چت نزن، اون‌جا کاری نمی‌کنه و پلاگین تو لیست پلاگین‌های اپ هم نمیاد. همون دو تا دستور بالا رو بزن.

اگه `claude` رو تو ترمینال اجرا می‌کنی، از همون‌جا هم می‌شه:

```
/plugin install persian-rtl --marketplace amirmvahed/claude-code-persian-rtl
```

برای اضافه شدن marketplace بزن `y` و scope رو انتخاب کن.

راست‌چین رو نمی‌خوای و فقط درست شدن ترتیب کلمه‌ها برات کافیه؟ تو یه سشن `claude` توی ترمینال `/plugin configure persian-rtl@persian-rtl` رو بزن و `rightAlign` رو `false` کن.

## محدودیت‌ها

- کادری که توش تایپ می‌کنی دست پلاگین نیست. پیامت بعد از ارسال درست نشون داده می‌شه.
- راست‌چین فقط روی جواب‌های Claude تو اپ دسکتاپه.
- فقط تو Claude Code کار می‌کنه، روی بخش Chat و claude.ai اثری نداره.

## License

MIT
