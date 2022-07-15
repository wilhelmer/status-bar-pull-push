import * as vscode from 'vscode';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

let pushItem: vscode.StatusBarItem;
let pullItem: vscode.StatusBarItem;
let workspaceDir = "";
let fsWait = false;

export function activate({ subscriptions }: vscode.ExtensionContext) {
    if (!vscode.workspace.workspaceFolders) return;
    
    // Get workspace directory
    // We use substring(1) to cut the leading slash for Windows compatibility
    workspaceDir = vscode.workspace.workspaceFolders[0].uri.path.substring(1);

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

    // Update buttons every 5 seconds
    const o = (): vscode.Disposable => {
        const id = setInterval(() => {
            updateStatusBarItems();
        }, 5000);
        return {
            dispose() {
                clearInterval(id);
            },
        };
    };
    subscriptions.push(o());

    // Update buttons on commit
    try {
        const gitCommit = path.join(workspaceDir, ".git", "COMMIT_EDITMSG");
        fs.watch(gitCommit, function (evt, filename) {
            if (filename) {
                if (debounceFsWatch()) return;
                updateStatusBarItems();
            }
        });
    } catch (error) {
        console.log(error);
    }

    // Update on load
    updateStatusBarItems();
}

function updateStatusBarItems(): void {
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

function getGitCommitsCount(pull: boolean) {
    try {
        // Count commits not yet pulled from or pushed to the remote repository
        const command = pull ? `git rev-list --count HEAD..@{u}` : `git rev-list --count @{u}..HEAD`;
        return execSync(command, {
            cwd: workspaceDir,
        }).toString().trim();
    } catch (error) {
        console.log(error);
    }
}

function debounceFsWatch() {
    if (fsWait) return true;
    setTimeout(() => {
        fsWait = false;
    }, 100);
}