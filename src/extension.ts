import * as vscode from 'vscode';

import { AuthenticationModule } from './authentication/module';
import { TasksModule } from './tasks/module';

export function activate(context: vscode.ExtensionContext) {
  const authenticationModule = new AuthenticationModule(context);
  const tasksModule = new TasksModule();

  context.subscriptions.push(
    authenticationModule.registerAuthenticationProvider(),
    authenticationModule.registerLoginCommand(),
    authenticationModule.registerLogoutCommand(),
    tasksModule.registerToggleTaskCommand(),
    tasksModule.registerBuildCommand(),
    tasksModule.registerTestCommand(),
    tasksModule.registerDeployCommand(),
  );

  console.log('Congratulations, your extension "microsoft-pipelines-tasks-devkit" is now active!');
}

export function deactivate() {}
