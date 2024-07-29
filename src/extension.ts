import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.filterLogs', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}
		
		const { whitelist, blacklist } = getSettings();

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

// load settings from extension settings
function getSettings() {
	const config = vscode.workspace.getConfiguration('filterLogs');
	const whitelist = config.get('whitelist', ['Aim']);
	const blacklist = config.get('blacklist', []);
	return { whitelist, blacklist };
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


export function deactivate() { }