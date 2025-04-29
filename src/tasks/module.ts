import vscode from 'vscode';

import { TasksProvider } from './TasksProvider';
import { TaskItem } from './TaskItem';
import { existsSync, lstatSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

export class TasksModule {
  readonly tasksProvider: TasksProvider;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.tasksProvider = new TasksProvider();
    vscode.window.registerTreeDataProvider('tasksDevKit.tasks', this.tasksProvider);
  }

  registerCommands(): vscode.Disposable[] {
    return [
      vscode.commands.registerCommand('tasksDevKit.toggleTask', (taskItem: TaskItem) => {
        this.tasksProvider.toggleTaskSelection(taskItem);
      }),

      vscode.commands.registerCommand('tasksDevKit.build', () => {
        this.executeTasks('build', this.tasksProvider.getSelectedTasks());
      }),

      vscode.commands.registerCommand('tasksDevKit.test', () => {
        this.executeTasks('test', this.tasksProvider.getSelectedTasks());
      }),

      vscode.commands.registerCommand('tasksDevKit.deploy', () => {
        this.executeTasks('deploy', this.tasksProvider.getSelectedTasks());
      }),

      vscode.commands.registerCommand('tasksDevKit.openTheTaskInFolderStructure', async (task: TaskItem) => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const taskFolder = vscode.Uri.file(join(workspaceFolders![0].uri.fsPath, "Tasks", task.getFormattedName()));
        await vscode.commands.executeCommand('revealInExplorer', taskFolder);
      })
    ];
  }

  private async executeTasks(action: 'build' | 'test' | 'deploy', selectedTasks: TaskItem[]) {
    if (this.context.storageUri && !existsSync(this.context.storageUri.toString())) {
      await vscode.workspace.fs.createDirectory(this.context.storageUri);
    }

    if (selectedTasks.length === 0) {
      vscode.window.showInformationMessage('No tasks selected.');
      return;
    }

    const terminal = vscode.window.activeTerminal ?? vscode.window.createTerminal('Azure Pipelines');

    switch (action) {
      case 'build':
        terminal.sendText(`node make.js build --task "@(${selectedTasks.map(x => x.label).join("|")})" --include-sourcemap`);

        const workspaceFolders = vscode.workspace.workspaceFolders;
        const agentTasksFolder = join(this.context.storageUri!.fsPath, "agent/_work/_tasks");

        if (!existsSync(agentTasksFolder)) {
          vscode.window.showErrorMessage(`Agent tasks folder does not exist: ${agentTasksFolder}`);
          return;
        }

        selectedTasks.forEach(task => {
          const path = join(agentTasksFolder, task.getWorkName());
          if (existsSync(path)) {
            if (lstatSync(path).isSymbolicLink()) {
              return;
            }

            rmSync(path, { recursive: true, force: true });
          }

          symlinkSync(vscode.Uri.file(join(workspaceFolders![0].uri.fsPath, "Tasks", task.getFormattedName())).fsPath, path);
        });
        break;
      case 'test':
        terminal.sendText(`node make.js test --task "@(${selectedTasks.join("|")})"`);
        break;
      case 'deploy':
        vscode.window.showInformationMessage('Deploying tasks is not implemented yet.');
        break;
      default:
        vscode.window.showErrorMessage(`Unknown action: ${action}`);
    }

    terminal.show();
  }
}
