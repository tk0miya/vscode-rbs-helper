import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';

let lspClient: RbsRailsLspClient | undefined;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext): void {
    // Initialize and dispose the output channel
    outputChannel = vscode.window.createOutputChannel('RBS Rails LSP');

    context.subscriptions.push({
        dispose: () => { outputChannel?.dispose(); }
    });

    // Invoke the rbs_rails LSP server
    lspClient = new RbsRailsLspClient();
    lspClient.start();

    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('rbs-helper.startRbsRailsLsp', async () => {
        await lspClient!.start();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('rbs-helper.stopRbsRailsLsp', async () => {
        await lspClient!.stop();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('rbs-helper.restartRbsRailsLsp', async () => {
        await lspClient!.restart();
    }));

    // Restart LSP server on configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (event) => {
            if (event.affectsConfiguration('rbs-helper.rbs-rails-lsp-enabled') ||
                event.affectsConfiguration('rbs-helper.rbs-rails-lsp-command')) {
                await lspClient?.restart();
            }
        })
    );
}

export function deactivate(): Thenable<void> | undefined {
    const result = lspClient?.stop();
    lspClient = undefined;
    outputChannel?.dispose();
    return result;
}

function log(message: string): void {
    outputChannel.appendLine(message);
}

export class RbsRailsLspClient {
    private client: LanguageClient | undefined;

    private isEnabled(): boolean {
        const config = vscode.workspace.getConfiguration('rbs-helper');
        return config.get('rbs-rails-lsp-enabled', false);
    }

    private isDisabled(): boolean {
        return !this.isEnabled();
    }

    private getCommand(): { command: string; args: string[] } {
        const config = vscode.workspace.getConfiguration('rbs-helper');
        const commandLine = config.get('rbs-rails-lsp-command', 'bundle exec rbs_rails server');
        const commandParts = commandLine.split(' ');
        return {
            command: commandParts[0],
            args: commandParts.slice(1)
        };
    }

    public async start(): Promise<void> {
        if (this.isDisabled() || this.client) {
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            log('No workspace folder found');
            return;
        }

        const { command, args } = this.getCommand();
        const serverOptions: ServerOptions = {
            command: command,
            args: args,
            options: { cwd: workspaceFolder.uri.fsPath }
        };

        const clientOptions: LanguageClientOptions = {
            documentSelector: [{ scheme: 'file', language: 'ruby' }],
            synchronize: {
                fileEvents: vscode.workspace.createFileSystemWatcher('**/*.rb')
            },
            outputChannel
        };

        this.client = new LanguageClient(
            'rbsRailsLsp',
            'RBS Rails LSP',
            serverOptions,
            clientOptions
        );

        try {
            log('Starting RBS Rails LSP...');
            await this.client.start();
            log('RBS Rails LSP started successfully');
        } catch (error) {
            const errorMessage = String(error);
            log(`Failed to start RBS Rails LSP: ${errorMessage}`);
            vscode.window.showErrorMessage(`Failed to start RBS Rails LSP: ${errorMessage}`);
        }
    }

    public async stop(): Promise<void> {
        if (this.client) {
            log('Stopping RBS Rails LSP...');
            await this.client.stop();
            this.client = undefined;
            log('RBS Rails LSP stopped');
        } else {
            log('RBS Rails LSP is not running');
        }
    }

    public async restart(): Promise<void> {
        await this.stop();
        await this.start();
    }
}
