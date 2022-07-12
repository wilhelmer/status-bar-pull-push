import * as vscode from 'vscode';
import { execSync } from 'child_process';

let pushItem: vscode.StatusBarItem;
let pullItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext) {

    // Create status bar items
    pullItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    pullItem.command = "git.pull";
    pullItem.tooltip = "Pull changes";

    pushItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    pushItem.command = "git.push";
    pushItem.tooltip = "Push changes";

    // Add buttons to start bar
    subscriptions.push(pullItem);
    subscriptions.push(pushItem);

    // Update buttons every X seconds
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
    
    // Update on load
    updateStatusBarItem();
}

function updateStatusBarItem(): void {
    const countPull = getGitCommitsCount(true);
    const countPush = getGitCommitsCount(false);

    // Hide buttons if no workspace folder opened or on error
    if (countPull === undefined || countPush === undefined) {
        pullItem.hide();
        pushItem.hide();
    }
    // Update buttons
    else {
        pullItem.text = `${countPull}\u2009$(arrow-down)`;
        pushItem.text = `${countPush}\u2009$(arrow-up)`;
    
        pullItem.show();
        pushItem.show();
    }
}

function getGitCommitsCount(pull = true) {
    if (!vscode.workspace.workspaceFolders) return;

    try {
        // Count commits not yet pulled from or pushed to the remote repository
        const command = pull ? `git rev-list --count HEAD..@{u}` : `git rev-list --count @{u}..HEAD`;
        return execSync(command, {
            cwd: vscode.workspace.workspaceFolders[0].uri.path,
        }).toString().trim();
    } catch (error) {
        console.log(error);
    }
}