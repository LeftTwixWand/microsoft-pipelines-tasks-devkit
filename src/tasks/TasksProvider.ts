import { join } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';

import vscode from 'vscode';

import { TaskItem } from './TaskItem';

class CategoryItem extends vscode.TreeItem {
    constructor(
        public readonly category: string,
        public readonly childrenItems: TaskItem[]
    ) {
        super(category, vscode.TreeItemCollapsibleState.Collapsed);
        this.contextValue = 'categoryItem';
    }
}

export class TasksProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private workspaceRoot: string = '';

  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

  private tasks: TaskItem[] = [];

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

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!element) {
      const groups = Array.from(new Set(this.tasks.map(task => task.object.name)));
      const nameItems = groups.map(name =>
        new CategoryItem(name, this.tasks.filter(task => task.object.name === name))
      );
      return Promise.resolve(nameItems);
    }

    if (element instanceof CategoryItem) {
      return Promise.resolve(element.childrenItems);
    }

    return Promise.resolve([]);
  }

  toggleTaskSelection(taskItem: TaskItem): void {
    taskItem.toggle();
    this._onDidChangeTreeData.fire(taskItem);
  }

  getSelectedTasks(): TaskItem[] {
    return this.tasks.filter(taskItem => taskItem.checked);
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

    this.tasks = tasks.map(x => new TaskItem(x, join(tasksDir, x)));
  }
}