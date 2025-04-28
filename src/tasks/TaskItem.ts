import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import vscode from 'vscode';

type TaskJson = {
  prejobexecution?: Record<string, unknown>;
  execution?: Record<string, unknown>;
  postjobexecution?: Record<string, unknown>;
};

export class TaskItem extends vscode.TreeItem {
  public checked: boolean = false;
  private task: TaskJson;
  public isDisabled: boolean = false;

  constructor(public readonly label: string, private readonly path: string) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.task = JSON.parse(readFileSync(join(path, "task.json"), 'utf-8'));
    this.contextValue = 'taskItem';

    this.isDisabled = this.isTaskDisabled();
    this.tooltip = this.path;

    if (this.isDisabled) {
      this.command = undefined;
      this.tooltip = 'This item is disabled';
      this.description = 'Not the NodeJS task';
    } else {
      this.command = {
        command: 'tasksDevKit.toggleTask',
        title: 'Toggle Task Selection',
        arguments: [this],
      };
    }

    this.updateIcon();
  }

  toggle() {
    this.checked = !this.checked;
    this.updateIcon();
  }

  updateIcon(): void {
    if (this.isDisabled) {
      this.iconPath = new vscode.ThemeIcon('circle-slash');
    } else if (this.checked) {
      this.iconPath = new vscode.ThemeIcon('check');
    } else {
      this.iconPath = new vscode.ThemeIcon('circle-large-outline');
    }
  }

  private isTaskDisabled(): boolean {
    const { prejobexecution, execution, postjobexecution } = this.task;
    const executors = [Object.keys(prejobexecution ?? {}), Object.keys(execution ?? {}), Object.keys(postjobexecution ?? {})].flat();
    return executors.find(x => x.startsWith('Node')) === undefined;
  }
}
