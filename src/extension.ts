import * as vscode from 'vscode';

import { AuthenticationModule } from './authentication/module';
import { TasksModule } from './tasks/module';

export function activate(context: vscode.ExtensionContext) {
  const authenticationModule = new AuthenticationModule(context);
  const tasksModule = new TasksModule(context);

  context.subscriptions.push(
    ...authenticationModule.registerAuthenticationProvider(),
    authenticationModule.registerLoginCommand(),
    authenticationModule.registerLogoutCommand(),
    ...tasksModule.registerCommands(),
  );

  console.log('Congratulations, your extension "microsoft-pipelines-tasks-devkit" is now active!');
}

export function deactivate() {}