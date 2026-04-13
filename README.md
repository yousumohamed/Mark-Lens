# MarkLens Extension

<p align="center">
  <img src="https://raw.githubusercontent.com/yousumohamed/Mark-Lens/main/Mark_lens.png" width="200" alt="MarkLens Icon">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/yousumohamed/Mark-Lens/main/Mark%20lens.gif" alt="MarkLens Instructions">
</p>

Welcome to **MarkLens** ✨!
This is a VS Code extension that gives you a beautiful, GitHub-style Markdown preview.

## 1. How to Test It Locally
1. Inside VS Code, make sure this `MarkLens` folder is open.
2. Press **`F5`** on your keyboard.
3. A new "Extension Development Host" window will open.
4. In that new window, open any `.md` file (like this `README.md`).
5. Look at the **top-right** corner of the editor window. You should see an icon (a preview icon).
6. Click it! A webview panel will open beside your editor showing the GitHub-styled preview of your Markdown file.
7. Try editing this text—it will automatically update in the preview panel!

## 2. GitHub Markdown Features

MarkLens supports all standard GitHub Markdown features:

### Code Snippets

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}
greet("World");
```

### Tables

| Feature | Status |
|---|---|
| Split View | ✅ Working |
| GitHub Style | ✅ Working |
| Auto Update | ✅ Working |

### Lists and Tasks
* [x] Scaffold the extension
* [x] Add GitHub custom CSS
* [x] Package into a VSIX file for distribution

### Blockquotes
> This is a blockquote. It looks just like GitHub's!

---

## 3. How to Package (Create a file for Marketplace/Sharing)

To share this extension with your friends or install it normally on your machine:
1. Run `npx @vscode/vsce package` in your terminal.
2. This generates a `.vsix` file.
3. To install it, open the Extensions view in VS Code (`Ctrl+Shift+X`), click the `...` menu at the top right, and select **"Install from VSIX..."**.

Enjoy using MarkLens!
