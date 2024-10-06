import * as vscode from 'vscode';
import { exec } from 'node:child_process';

export function invoke(uri: vscode.Uri) {
    if (!isEnabled()) {
        return
    }

    const relativePath = uri.fsPath ? vscode.workspace.asRelativePath(uri.fsPath) : '';
    if (relativePath.endsWith('.rb') && !fnmatch(relativePath, excludePaths())) {
        const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '/';
        exec(`bundle exec rbs-inline ${options()} ${relativePath}`, { cwd });
    }
}

function isEnabled(): boolean {
    return vscode.workspace.getConfiguration('rbs-helper').get('rbs-inline-on-save') as boolean;
}

function excludePaths(): string[] {
    const excludePaths = vscode.workspace.getConfiguration('rbs-helper').get('rbs-inline-exclude-paths') as string;
    return excludePaths ? excludePaths.trim().split(/\s*,\s*/) : [];
}

function getSignatureDirectory(): string {
    return vscode.workspace.getConfiguration('rbs-helper').get('rbs-inline-signature-directory') as string;
}

function options(): string {
    const options = vscode.workspace.getConfiguration('rbs-helper').get('rbs-inline-options') as string;
    return `--output=${getSignatureDirectory()} ${options}`
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
