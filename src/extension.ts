import * as vscode from 'vscode';
import { Uri } from 'vscode';
import * as RBSInline from './RBSInline';
import * as fs from 'node:fs';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('rbs-helper.openRbsFile', openRBSFile));

	vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
		console.log(`onDidSaveTextDocument: ${document.uri.fsPath}`);
		RBSInline.invoke(document.uri);
	});

	vscode.workspace.onDidDeleteFiles(async (event: vscode.FileDeleteEvent) => {
		RBSInline.onDidDeleteFiles(event);
	});
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
		let relativeRubyFilePath = rubyFileUri.path.replace(workspaceFolder.uri.path, '');
		if (shouldStripLibDirectoryFromFilename() && relativeRubyFilePath.startsWith('/lib')) {
			relativeRubyFilePath = relativeRubyFilePath.replace('/lib', '');
		}
		return Uri.file(`${workspaceFolder.uri.path}${getSignatureDirectory()}${relativeRubyFilePath}s`);
	}

	return rubyFileUri;
}

function getSignaturePrototypeFileUri(rubyFileUri: Uri): Uri {
	const workspaceFolder = vscode.workspace.workspaceFolders?.find((workspaceFolder) => rubyFileUri.path.startsWith(workspaceFolder.uri.path));
	if (workspaceFolder) {
		let relativeRubyFilePath = rubyFileUri.path.replace(workspaceFolder.uri.path, '');
		if (shouldStripLibDirectoryFromFilename() && relativeRubyFilePath.startsWith('/lib')) {
			relativeRubyFilePath = relativeRubyFilePath.replace('/lib', '');
		}
		return Uri.file(`${workspaceFolder.uri.path}${getSignaturePrototypeDirectory()}${relativeRubyFilePath}s`);
	}

	return rubyFileUri;
}

function getRubyFileUri(rbsFileUri: Uri): Uri {
	const workspaceFolder = vscode.workspace.workspaceFolders?.find((workspaceFolder) => rbsFileUri.path.startsWith(workspaceFolder.uri.path));
	if (workspaceFolder) {
		const signatureUri = Uri.joinPath(workspaceFolder.uri, getSignatureDirectory());
		const relativeRubyFilePath = rbsFileUri.path.replace(/\.rbs/, '.rb').replace(signatureUri.path, '');
		const libRubyFilePath = `${workspaceFolder.uri.path}/lib${relativeRubyFilePath}`;
		if (shouldStripLibDirectoryFromFilename() && fs.existsSync(libRubyFilePath)) {
			return vscode.Uri.file(libRubyFilePath);
		}

		return vscode.Uri.file(`${workspaceFolder.uri.path}${relativeRubyFilePath}`);
	}

	return rbsFileUri;
}

function getSignatureDirectory(): string {
	const directory = vscode.workspace.getConfiguration('rbs-helper').get('signature-directory') as string;
	if (directory.startsWith('/')) {
		return directory;
	}

	return `/${directory}`;
}

function getSignaturePrototypeDirectory(): string {
	const directory = vscode.workspace.getConfiguration('rbs-helper').get('signature-prototype-directory') as string;
	if (directory.startsWith('/')) {
		return directory;
	}

	return `/${directory}`;
}

function isCopySignaturePrototypeOnCreate(): boolean {
	return vscode.workspace.getConfiguration('rbs-helper').get('copy-signature-prototype-on-create') as boolean;
}

function shouldStripLibDirectoryFromFilename(): boolean {
	return vscode.workspace.getConfiguration('rbs-helper').get('strip-lib-directory') as boolean;
}
