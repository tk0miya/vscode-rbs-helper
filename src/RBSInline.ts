import * as vscode from 'vscode';
import { exec } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export function invoke(uri: vscode.Uri) {
    if (!isEnabled()) {
        return
    }

    const relativePath = uri.fsPath ? vscode.workspace.asRelativePath(uri.fsPath) : '';
    if (isTargetFile(relativePath)) {
        const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '/';
        exec(`bundle exec rbs-inline ${options()} ${relativePath}`, { cwd });
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
