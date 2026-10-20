# Persian RTL for Claude Code

Fixes Persian/English text direction issues in the Claude Code desktop app. It preserves Claude Code's original rendering and fixes only the lines whose text direction is incorrect.

## Install

Run these commands in a **terminal**:

```bash
claude plugin marketplace add amirmvahed/claude-code-persian-rtl

claude plugin install persian-rtl@persian-rtl --scope user
```

Then start a new session or run `/reload-plugins`.

## Auto-update

Auto-updates are disabled by default for community plugins. To enable them, run `claude` in a terminal, enter `/plugin`, open **Marketplaces**, select **persian-rtl**, and choose **Enable auto-update**.

To update manually:

```bash
claude plugin update persian-rtl@persian-rtl
```

## What it does

The desktop app determines paragraph direction based on the first character, following Unicode bidirectional text behavior. When a line contains Persian but starts with an English word, a filename, or code, it may be displayed in the wrong direction, making the text difficult to read.

The plugin adds an invisible right-to-left mark (RLM) to affected lines, helping Persian text flow from right to left while keeping embedded English text left to right. Lines without Persian text and code blocks are left untouched.

## Limitations

- The input box is not affected; your message is displayed correctly after you send it.
- The plugin has no effect in the terminal because Claude Code strips direction marks there.
- Works with Claude Code only, not claude.ai.

MIT license.
