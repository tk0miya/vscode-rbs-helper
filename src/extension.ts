import * as vscode from 'vscode';
import { Uri } from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('open-rbs-file.openRbsFile', openRBSFile));
}

export function deactivate() { }


function openRBSFile(): void {
	const currentFile = vscode.window.activeTextEditor?.document.uri;
	if (currentFile) {
		if (currentFile.path.endsWith('.rb')) {
			const rbsFileUri = getSignatureFileUri(currentFile);
			const signaturePrototypeFileUri = getSignaturePrototypeFileUri(currentFile);
			ensureFile(rbsFileUri, signaturePrototypeFileUri).then(() => {
				vscode.commands.executeCommand('vscode.open', rbsFileUri)
			});
		} else if (currentFile.path.endsWith('.rbs')) {
			const rubyFileUri = getRubyFileUri(currentFile);
			vscode.commands.executeCommand('vscode.open', rubyFileUri);
		}
	}
}

async function ensureFile(targetUri: Uri, templateUri: Uri): Promise<void> {
	const baseDirectory = Uri.joinPath(targetUri, '..');
	await vscode.workspace.fs.createDirectory(baseDirectory);
	if (!fs.existsSync(targetUri.path)) {
		if (isCopySignaturePrototypeOnCreate() && fs.existsSync(templateUri.path)) {
			await vscode.workspace.fs.copy(templateUri, targetUri);
		} else {
			const workspaceEdit = new vscode.WorkspaceEdit();
			workspaceEdit.createFile(targetUri);
			vscode.workspace.applyEdit(workspaceEdit);
		}
	}
}

function getSignatureFileUri(rubyFileUri: Uri): Uri {
	const workspaceFolder = vscode.workspace.workspaceFolders?.find((workspaceFolder) => rubyFileUri.path.startsWith(workspaceFolder.uri.path));
	if (workspaceFolder) {
		const relativeRubyFilePath = rubyFileUri.path.replace(workspaceFolder.uri.path, '');
		return Uri.file(`${workspaceFolder.uri.path}${getSignatureDirectory()}${relativeRubyFilePath}s`);
	} else {
		return rubyFileUri;
	}
}

function getSignaturePrototypeFileUri(rubyFileUri: Uri): Uri {
	const workspaceFolder = vscode.workspace.workspaceFolders?.find((workspaceFolder) => rubyFileUri.path.startsWith(workspaceFolder.uri.path));
	if (workspaceFolder) {
		const relativeRubyFilePath = rubyFileUri.path.replace(workspaceFolder.uri.path, '');
		return Uri.file(`${workspaceFolder.uri.path}${getSignaturePrototypeDirectory()}${relativeRubyFilePath}s`);
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

function getSignaturePrototypeDirectory(): string {
	const directory = vscode.workspace.getConfiguration('open-rbs-file').get('signature-prototype-directory') as string;
	if (directory.startsWith('/')) {
		return directory;
	} else {
		return `/${directory}`;
	}
}

function isCopySignaturePrototypeOnCreate(): boolean {
	return vscode.workspace.getConfiguration('open-rbs-file').get('copy-signature-prototype-on-create') as boolean;
}
