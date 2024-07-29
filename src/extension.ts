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
		const filterPhrases = logFilterProvider.getFilterPhrases();
		const whitelist = filterPhrases.whitelist;
		const blacklist = filterPhrases.blacklist;

		if (!whitelist) {
			vscode.window.showErrorMessage('No filter phrase provided');
			return;
		}

		const document = editor.document;
		const text = document.getText();
		const filteredText = filterLogs(text, whitelist, blacklist);

		const newDocument = await vscode.workspace.openTextDocument({
			content: filteredText,
			language: 'log'
		});
		vscode.window.showTextDocument(newDocument);
	});

	context.subscriptions.push(disposable);
}


function filterLogs(text: string, whitelist: string[], blacklist: string[]): string {
	const lines = text.split('\n');
	const filteredLines = lines.filter(line => {
		// Check if the line contains any of the whitelist phrases
		const containsWhitelist = whitelist.some(phrase => line.includes(phrase));
		// Check if the line contains any of the blacklist phrases
		const containsBlacklist = blacklist.some(phrase => line.includes(phrase));
		// Include the line if it passes the whitelist and does not pass the blacklist
		return containsWhitelist && !containsBlacklist;
	});
	return filteredLines.join('\n');
}

// function filterLogs(text: string, phrase: string): string {
// 	const lines = text.split('\n');
// 	const filteredLines = lines.filter(line => line.includes(phrase));
// 	return filteredLines.join('\n');
// }

export function deactivate() { }