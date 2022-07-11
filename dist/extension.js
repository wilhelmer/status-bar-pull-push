"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const child_process_1 = require("child_process");
const vscode = require("vscode");
let pushItem, pullItem;
function getGitCommitsCount(since = '', until = '') {
    if (!vscode.workspace.workspaceFolders)
        return;
    try {
        since = since ? `--since="${since}"` : '';
        until = until ? `--until="${until}"` : '';
        const author = '--author=$(git config user.email)';
        const command = `git rev-list --count HEAD ${since} ${until} ${author}`;
        return (0, child_process_1.execSync)(command, {
            cwd: vscode.workspace.workspaceFolders[0].uri.path,
        })
            .toString()
            .trim();
    }
    catch (error) {
        console.log(error);
    }
}
function activate({ subscriptions }) {
    // Create status bar items
    pullItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    pullItem.command = "git.pull";
    pullItem.text = ` $(arrow-down)`;
    pullItem.tooltip = "Pull changes";
    pushItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    pushItem.command = "git.push";
    pushItem.text = "$(arrow-up)";
    pushItem.tooltip = "Push changes";
    subscriptions.push(pullItem);
    subscriptions.push(pushItem);
    pullItem.show();
    pushItem.show();
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map