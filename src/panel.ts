import * as vscode from 'vscode';

export class FilterPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'logFilter.filterPanel';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'filter':
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
          }

          const document = editor.document;
          const text = document.getText();
          const filteredText = this.filterLogs(text, message.text);

          const newDocument = await vscode.workspace.openTextDocument({
            content: filteredText,
            language: 'log'
          });
          vscode.window.showTextDocument(newDocument);
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Filter Logs</title>
      </head>
      <body>
        <input type="text" id="filterInput" placeholder="Enter filter phrase" />
        <button id="filterButton">Filter</button>
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          document.getElementById('filterButton').addEventListener('click', () => {
            const filterText = document.getElementById('filterInput').value;
            vscode.postMessage({ command: 'filter', text: filterText });
          });
        </script>
      </body>
      </html>`;
  }

  private filterLogs(text: string, phrase: string): string {
    const lines = text.split('\n');
    const filteredLines = lines.filter(line => line.includes(phrase));
    return filteredLines.join('\n');
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