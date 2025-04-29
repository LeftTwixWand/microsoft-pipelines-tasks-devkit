import * as vscode from 'vscode';

import { AzureDevOpsAuthenticationProvider } from './AzureDevOps/AzureDevOpsAuthenticationProvider';
import { AzureDevOpsOAuthProvider } from './AzureDevOps/AzureDevOpsOAuthProvider';

export class AuthenticationModule {
  readonly oauthAuthProvider: AzureDevOpsOAuthProvider;

  constructor(context: vscode.ExtensionContext) {
    this.oauthAuthProvider = new AzureDevOpsOAuthProvider(context.secrets);
  }

  registerAuthenticationProvider(): vscode.Disposable[] {
    return [
      vscode.authentication.registerAuthenticationProvider(
        AzureDevOpsOAuthProvider.id,
        'Azure DevOps',
        this.oauthAuthProvider,
        { supportsMultipleAccounts: false },
      ),
    ];
  }

  registerLoginCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('tasksDevKit.login', async () => {
      try {
        await vscode.authentication.getSession(AzureDevOpsOAuthProvider.id, [], { createIfNone: true });
        vscode.window.showInformationMessage('Successfully logged in to Azure DevOps.');
      } catch (e: any) {
        vscode.window.showErrorMessage(`OAuth login failed: ${e.message}. Falling back to PAT login.`);
      }
    });
  }

  registerLogoutCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('tasksDevKit.logout', async () => {
      // Try to get OAuth session first
      let session = await vscode.authentication.getSession(AzureDevOpsOAuthProvider.id, [], {
        createIfNone: false,
      });

      if (session) {
        // Logout from OAuth
        await this.oauthAuthProvider.removeSession(session.id);
        vscode.window.showInformationMessage('Successfully logged out of Azure DevOps.');
        return;
      }
    });
  }
}