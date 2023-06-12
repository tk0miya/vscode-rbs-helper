import * as vscode from 'vscode';
import { Uri } from 'vscode';

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
		} else if (currentFile.path.endsWith('.rbs')) {
			const rubyFileUri = getRubyFileUri(currentFile);
			vscode.commands.executeCommand('vscode.open', rubyFileUri);
		}
	}
}

async function ensureFile(uri: Uri): Promise<void> {
	const baseDirectory = Uri.joinPath(uri, '..');
	await vscode.workspace.fs.createDirectory(baseDirectory);
	try {
		await vscode.workspace.fs.stat(uri)
	} catch {
		const workspaceEdit = new vscode.WorkspaceEdit();
		workspaceEdit.createFile(uri);
		vscode.workspace.applyEdit(workspaceEdit);
	};
}

function getRBSFileUri(rubyFileUri: Uri): Uri {
	const workspaceFolder = vscode.workspace.workspaceFolders?.find((workspaceFolder) => rubyFileUri.path.startsWith(workspaceFolder.uri.path));
	if (workspaceFolder) {
		const relativeRubyFilePath = rubyFileUri.path.replace(workspaceFolder.uri.path, '');
		return Uri.file(`${workspaceFolder.uri.path}${getSignatureDirectory()}${relativeRubyFilePath}s`);
	} else {
		return rubyFileUri;
	}
}

function getRubyFileUri(rbsFileUri: Uri): Uri {
	const workspaceFolder = vscode.workspace.workspaceFolders?.find((workspaceFolder) => rbsFileUri.path.startsWith(workspaceFolder.uri.path));
	if (workspaceFolder) {
		const signatureUri = Uri.joinPath(workspaceFolder.uri, getSignatureDirectory());
		const relativeRubyFilePath = rbsFileUri.path.replace(/\.rbs/, '.rb').replace(signatureUri.path, '');
		return vscode.Uri.file(`${workspaceFolder.uri.path}${relativeRubyFilePath}`);
	} else {
		return rbsFileUri;
	}
}

function getSignatureDirectory(): string {
	const directory = vscode.workspace.getConfiguration('open-rbs-file').get('signature-directory') as string;
	if (directory.startsWith('/')) {
		return directory;
	} else {
		return `/${directory}`;
	}
}
