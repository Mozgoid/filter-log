import * as vscode from 'vscode';
import { FilterPanel } from './panel';
import { LogFilterDataProvider } from './logFilterDataProvider';



export function activate(context: vscode.ExtensionContext) {

	const logFilterProvider = new LogFilterDataProvider();
	vscode.window.registerTreeDataProvider('logFilter.filterPanel', logFilterProvider);


	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			FilterPanel.viewType,
			new FilterPanel(context.extensionUri)
		)
	);

	let disposable = vscode.commands.registerCommand('extension.filterLogs', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		const filterPhrase = await vscode.window.showInputBox({
			prompt: 'Enter the phrase to filter logs by',
			placeHolder: 'ERROR'
		});

		if (!filterPhrase) {
			vscode.window.showErrorMessage('No filter phrase provided');
			return;
		}

		const document = editor.document;
		const text = document.getText();
		const filteredText = filterLogs(text, filterPhrase);

		const newDocument = await vscode.workspace.openTextDocument({
			content: filteredText,
			language: 'log'
		});
		vscode.window.showTextDocument(newDocument);
	});

	context.subscriptions.push(disposable);
}

function filterLogs(text: string, phrase: string): string {
	const lines = text.split('\n');
	const filteredLines = lines.filter(line => line.includes(phrase));
	return filteredLines.join('\n');
}

export function deactivate() { }