import * as vscode from 'vscode';
import { execSync } from 'child_process';

let pushItem : vscode.StatusBarItem;
let pullItem: vscode.StatusBarItem;

function getGitCommitsCount(pull = true) {
    if (!vscode.workspace.workspaceFolders) return;
  
    try {      
      let command;
      if (pull) {
        command = `git rev-list --count HEAD..@{u}`;
      }
      else {
        command = `git rev-list --count @{u}..HEAD`;
      }
      return execSync(command, {
        cwd: vscode.workspace.workspaceFolders[0].uri.path,
      })
        .toString()
        .trim();
    } catch (error) {
      console.log(error);
    }
  }


  
export function activate({ subscriptions }: vscode.ExtensionContext) {

    // Create status bar items
    pullItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    pullItem.command = "git.pull";
    pullItem.tooltip = "Pull changes";

    pushItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    pushItem.command = "git.push";
    pushItem.tooltip = "Push changes";

    subscriptions.push(pullItem);
    subscriptions.push(pushItem);

    const o = (): vscode.Disposable => {
      const id = setInterval(() => {
        updateStatusBarItem();
      }, 5000);
      return {
        dispose() {
          clearInterval(id);
        },
      };
    };
    
    subscriptions.push(o());
    updateStatusBarItem();
}

function updateStatusBarItem(): void {
  const countPull = getGitCommitsCount(true) || "0";
  const countPush = getGitCommitsCount(false) || "0";

  pullItem.text = `${countPull} $(arrow-down)`;
  pushItem.text = `${countPush} $(arrow-up)`;

  pullItem.show();
  pushItem.show(); 
}