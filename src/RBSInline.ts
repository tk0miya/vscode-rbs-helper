import * as vscode from 'vscode';
import { exec } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export function activate(context: vscode.ExtensionContext): void {
    // Register file save event handler
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
            console.log(`onDidSaveTextDocument: ${document.uri.fsPath}`);
            invoke(document.uri);
        })
    );

    // Register file delete event handler
    context.subscriptions.push(
        vscode.workspace.onDidDeleteFiles(async (event: vscode.FileDeleteEvent) => {
            onDidDeleteFiles(event);
        })
    );

    // Register file rename event handler
    context.subscriptions.push(
        vscode.workspace.onDidRenameFiles(async (event: vscode.FileRenameEvent) => {
            onDidRenameFiles(event);
        })
    );
}

function getConfiguration<T>(key: string): T {
    const config = vscode.workspace.getConfiguration('rbs-helper');
    return config.get<T>(key) as T;
}

export function invoke(uri: vscode.Uri) {
    if (!isEnabled()) {
        return
    }

    const relativePath = uri.fsPath ? vscode.workspace.asRelativePath(uri.fsPath) : '';
    if (isTargetFile(relativePath)) {
        const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '/';
        exec(`${command()} ${options()} ${relativePath}`, { cwd });
    }
}

export async function onDidDeleteFiles(event: vscode.FileDeleteEvent) {
    if (!isEnabled()) {
        return
    }

    for (const uri of event.files) {
        const relativePath = uri.fsPath ? vscode.workspace.asRelativePath(uri.fsPath) : '';
        if (isTargetFile(relativePath)) {
            deleteRBSFile(relativePath);
        }
    }
}

async function deleteRBSFile(rubyFilePath: string) {
    const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '/';
    const rbsPath = path.join(cwd, getSignatureDirectory(), rubyFilePath).replace(/\.rb/, '.rbs');
    try {
        await fs.access(rbsPath);
        await fs.unlink(rbsPath);
    } catch (error) {
        console.log(`Failed to delete ${rbsPath}: ${error}`);
    }
}

export async function onDidRenameFiles(event: vscode.FileRenameEvent) {
    if (!isEnabled()) {
        return
    }

    for (const { newUri, oldUri } of event.files) {
        const newPath = newUri.fsPath ? vscode.workspace.asRelativePath(newUri.fsPath) : '';
        const oldPath = oldUri.fsPath ? vscode.workspace.asRelativePath(oldUri.fsPath) : '';
        if (isTargetFile(oldPath)) {
            renameRBSFile(oldPath, newPath);
        }
    }
}

async function renameRBSFile(oldRubyFilePath: string, newRubyFilePath: string) {
    const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '/';
    const oldRbsPath = path.join(cwd, getSignatureDirectory(), oldRubyFilePath).replace(/\.rb/, '.rbs');
    const newRbsPath = path.join(cwd, getSignatureDirectory(), newRubyFilePath).replace(/\.rb/, '.rbs');
    try {
        await fs.access(oldRbsPath);
        await fs.rename(oldRbsPath, newRbsPath);
    } catch (error) {
        console.log(`Failed to rename ${oldRbsPath} to ${newRbsPath}: ${error}`);
    }
}

function isEnabled(): boolean {
    return getConfiguration<boolean>('rbs-inline-on-save');
}

function excludePaths(): string[] {
    const excludePaths = getConfiguration<string>('rbs-inline-exclude-paths');
    return excludePaths ? excludePaths.trim().split(/\s*,\s*/) : [];
}

function getSignatureDirectory(): string {
    return getConfiguration<string>('rbs-inline-signature-directory');
}

function command(): string {
    return getConfiguration<string>('rbs-inline-command');
}

function options(): string {
    const options = getConfiguration<string>('rbs-inline-options');
    return `--output=${getSignatureDirectory()} ${options}`
}

function isTargetFile(path: string): boolean {
    return path.endsWith('.rb') && !fnmatch(path, excludePaths())
}

function fnmatch(filename: string, patterns: string[]): boolean {
    if (patterns.length === 0) {
        return false;
    }

    for (const pattern of patterns) {
        if (filename.startsWith(pattern)) {
            return true;
        }
    }

    return false;
}
