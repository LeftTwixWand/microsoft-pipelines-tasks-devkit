import { join } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';

import vscode from 'vscode';

import { TaskItem } from './TaskItem';

export class TasksProvider implements vscode.TreeDataProvider<TaskItem> {
  private workspaceRoot: string = '';

  private _onDidChangeTreeData = new vscode.EventEmitter<TaskItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TaskItem | undefined> = this._onDidChangeTreeData.event;

  private items: TaskItem[] = [];

  constructor() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showInformationMessage('No workspace folder open.',
        'Open Folder'
      ).then(selection => {
        if (selection === 'Open Folder') {
          vscode.commands.executeCommand('vscode.openFolder');
        }
      });
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    this.workspaceRoot = rootPath;
    this.initTasks();
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TaskItem): vscode.TreeItem {
    return element;
  }

  getChildren() {
    return Promise.resolve(this.items);
  }

  toggleTaskSelection(taskItem: TaskItem): void {
    taskItem.toggle();
    this._onDidChangeTreeData.fire(taskItem);
  }

  getSelectedTasks(): TaskItem[] {
    return this.items.filter(taskItem => taskItem.checked);
  }

  private initTasks() {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('There is not workspace folder open.');
      return;
    }

    const tasksDir = join(this.workspaceRoot, 'Tasks');

    if (!existsSync(tasksDir)) {
      vscode.window.showErrorMessage(
        'It seems you are not at the root of [the Tasks repository](https://github.com/microsoft/azure-pipelines-tasks).\nCould you please open the folder?',
        'Open Folder'
      ).then(selection => {
        if (selection === 'Open Folder') {
          vscode.commands.executeCommand('vscode.openFolder');
        }
      });

      return;
    }

    const tasks = readdirSync(tasksDir)
      .filter(task => existsSync(join(tasksDir, task, 'task.json')));

    this.items = tasks.map(x => new TaskItem(x, join(tasksDir, x)));
  }
}