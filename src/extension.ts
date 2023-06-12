import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('open-rbs-file.openRbsFile', openRBSFile));
}

export function deactivate() { }


function openRBSFile(): void {
	const currentFile = vscode.window.activeTextEditor?.document.uri;
	if (currentFile) {
		if (currentFile.path.endsWith('.rb')) {
			const rbsFileUri = getRBSFileUri(currentFile);
			ensureFile(rbsFileUri).then(() => {
				vscode.commands.executeCommand('vscode.open', rbsFileUri)
			});
		}
	}
}

async function ensureFile(uri: vscode.Uri): Promise<void> {
	const baseDirectory = vscode.Uri.joinPath(uri, '..');
	await vscode.workspace.fs.createDirectory(baseDirectory);
	try {
		await vscode.workspace.fs.stat(uri)
	} catch {
		const workspaceEdit = new vscode.WorkspaceEdit();
		workspaceEdit.createFile(uri);
		vscode.workspace.applyEdit(workspaceEdit);
	};
}

function getRBSFileUri(rubyFileUri: vscode.Uri): vscode.Uri {
	const workspaceFolder = vscode.workspace.workspaceFolders?.find((workspaceFolder) => rubyFileUri.path.startsWith(workspaceFolder.uri.path));
	if (workspaceFolder) {
		const relativeRubyFilePath = rubyFileUri.path.replace(workspaceFolder.uri.path, '');
		return vscode.Uri.file(`${workspaceFolder.uri.path}/sig/handwritten/${relativeRubyFilePath}s`);
	} else {
		return rubyFileUri;
	}
}
