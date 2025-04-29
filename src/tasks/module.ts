import * as vscode from 'vscode';

import { TasksProvider } from './TasksProvider';
import { TaskItem } from './TaskItem';

export class TasksModule {
  readonly tasksProvider: TasksProvider;

  constructor() {
    this.tasksProvider = new TasksProvider();
    vscode.window.registerTreeDataProvider('tasksDevKit.tasks', this.tasksProvider);
  }

  registerToggleTaskCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('tasksDevKit.toggleTask', (taskItem: TaskItem) => {
      this.tasksProvider.toggleTaskSelection(taskItem);
    });
  }

  registerBuildCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('tasksDevKit.build', () => {
      this.executeTasks('build', this.tasksProvider.getSelectedTasks());
    });
  }

  registerTestCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('tasksDevKit.test', () => {
      this.executeTasks('test', this.tasksProvider.getSelectedTasks());
    });
  }

  registerDeployCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('tasksDevKit.deploy', () => {
      this.executeTasks('deploy', this.tasksProvider.getSelectedTasks());
    });
  }

  private executeTasks(action: 'build' | 'test' | 'deploy', selectedTasks: string[]): void {
    if (selectedTasks.length === 0) {
      vscode.window.showInformationMessage('No tasks selected.');
      return;
    }

    const terminal = vscode.window.activeTerminal ?? vscode.window.createTerminal('Azure Pipelines');

    selectedTasks.forEach((task) => {
      switch (action) {
        case 'build':
          terminal.sendText(`node make.js build --task ${task}`);
          break;
        case 'test':
          terminal.sendText(`node make.js test --task ${task}`);
          break;
        case 'deploy':
          terminal.sendText(`tfx build tasks delete --task-id 7B5A6198-ADF8-4B16-9939-7ADDF85708B2`);
          terminal.sendText(`tfx build tasks upload --task-path ./_build/Tasks/${task}`);
          break;
      }
    });

    terminal.show();
  }
}
