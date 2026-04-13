import * as vscode from 'vscode';
import { marked } from 'marked';

export class MarkLensPanel {
  public static currentPanel: MarkLensPanel | undefined;
  public static readonly viewType = 'marklensPreview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _currentDocumentUri: vscode.Uri | undefined;

  public static createOrShow(extensionUri: vscode.Uri) {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor && activeEditor.document.languageId === 'markdown' ? activeEditor.document : undefined;

    const column = activeEditor ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;

    // If we already have a panel, show it.
    if (MarkLensPanel.currentPanel) {
      MarkLensPanel.currentPanel._panel.reveal(column, true); // preserve focus
      MarkLensPanel.currentPanel.update(document);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      MarkLensPanel.viewType,
      'Markdown Preview',
      { viewColumn: column, preserveFocus: true },
      {
        enableScripts: true,
        localResourceRoots: [extensionUri]
      }
    );

    MarkLensPanel.currentPanel = new MarkLensPanel(panel, extensionUri, document);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    MarkLensPanel.currentPanel = new MarkLensPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, document?: vscode.TextDocument) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this.update(document);

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view state changes
    this._panel.onDidChangeViewState(
      () => {
        if (this._panel.visible) {
          this.update();
        }
      },
      null,
      this._disposables
    );

    // Listen to document changes
    vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (
          e.document.languageId === 'markdown' &&
          this._panel.visible &&
          (!this._currentDocumentUri || e.document.uri.toString() === this._currentDocumentUri.toString())
        ) {
          this.update(e.document);
        }
      },
      null,
      this._disposables
    );

    // Listen to active editor changes
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor && editor.document.languageId === 'markdown') {
          this._currentDocumentUri = editor.document.uri;
          if (this._panel.visible) {
            this.update(editor.document);
          }
        }
      },
      null,
      this._disposables
    );
  }

  public async update(document?: vscode.TextDocument) {
    if (!document) {
      if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'markdown') {
        document = vscode.window.activeTextEditor.document;
      }
    }

    if (document && document.languageId === 'markdown') {
      this._currentDocumentUri = document.uri;
      const markdownContent = document.getText();
      const htmlContent = await marked.parse(markdownContent);
      this._panel.title = `Preview ${this.getFilename(document.uri.path)}`;
      this._panel.webview.html = this._getHtmlForWebview(htmlContent);
    } else {
      this._panel.webview.html = this._getHtmlForWebview('<i>No active Markdown document.</i>');
    }
  }

  private getFilename(path: string): string {
    const segments = path.split('/');
    return segments[segments.length - 1] || 'Markdown';
  }

  private _getHtmlForWebview(content: string) {
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <!-- Use GitHub Markdown Style -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
    <style>
      body {
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        padding: 20px;
      }
      .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
      }
      @media (prefers-color-scheme: dark) {
        .markdown-body {
          color-scheme: dark;
          --color-canvas-default: transparent;
          /* Tweak colors as necessary for dark mode */
        }
      }
      
      /* VS Code theme matching adjustments */
      body.vscode-dark .markdown-body {
         --color-canvas-default: var(--vscode-editor-background);
         --color-fg-default: var(--vscode-editor-foreground);
      }
      body.vscode-light .markdown-body {
         --color-canvas-default: var(--vscode-editor-background);
         --color-fg-default: var(--vscode-editor-foreground);
      }
    </style>
</head>
<body class="vscode-body">
    <div class="markdown-body">
      ${content}
    </div>
    <script nonce="${nonce}">
      // Communication with the extension can be added here if needed
      const vscode = acquireVsCodeApi();
      
      // Basic auto-scroll functionality can go here if we want to sync with editor
      window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
          case 'update':
            // we could do granular dom updates
            break;
        }
      });
    </script>
</body>
</html>`;
  }

  public dispose() {
    MarkLensPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
