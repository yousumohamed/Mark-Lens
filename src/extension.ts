import * as vscode from 'vscode';
import { MarkLensPanel } from './preview';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('marklens.showPreview', () => {
    MarkLensPanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(disposable);

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in case of restore
    vscode.window.registerWebviewPanelSerializer(MarkLensPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        MarkLensPanel.revive(webviewPanel, context.extensionUri);
      }
    });
  }
}

export function deactivate() {}
