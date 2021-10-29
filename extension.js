const vscode = require('vscode');
var deviceAuthCommand;

/**
 * @param {vscode.ExtensionContext} context
*/
function activate(context) {
    let disposable = vscode.commands.registerCommand('sfdx-codespaces-auth.deviceCodeFlow', function () {
        sfdxCodespacesAuth();
    });

    context.subscriptions.push(disposable);
}

async function sfdxCodespacesAuth() {
    await environmentUrlPrompt();
    await setDefaultUsernamePrompt();
    await setAlias();
    sendCommandToTerminal();
}

async function environmentUrlPrompt() {
    deviceAuthCommand = 'sfdx auth:device:login --instanceurl ';
    const selectedEnv = await vscode.window.showQuickPick([
        { label: 'Production', description: "https://login.salesforce.com" },
        { label: 'Sandbox', description: "https://test.salesforce.com" },
        { label: 'Custom', description: "Enter a custom login URL" }
    ]);

    let loginUrl;
    if (selectedEnv.label == 'Custom') {
        const customLoginUrl = await userPrompt('Enter a custom login URL');
        if (customLoginUrl.startsWith('https://') == false) {
            loginUrl = 'https://' + customLoginUrl;
        } else {
            loginUrl = customLoginUrl;
        }
    } else {
        loginUrl = selectedEnv.description;
    }
    deviceAuthCommand = deviceAuthCommand + loginUrl;
}

async function setDefaultUsernamePrompt() {
    const setDefaultUsername = await vscode.window.showQuickPick([
        { label: 'Set as Default Username' },
        { label: 'Don\'t Set as Default Username' }
    ])
    if (setDefaultUsername.label == 'Set as Default Username') {
        deviceAuthCommand = deviceAuthCommand + ' --setdefaultusername'
    }
}

async function setAlias() {
    const setAlias = await vscode.window.showQuickPick([
        { label: 'Set Alias For Login' },
        { label: 'Don\'t Set Alias For Login' }
    ])
    if (setAlias.label == 'Set Alias For Login') {
        const aliasForLogin = await userPrompt('Enter an Alias For The Login');
        deviceAuthCommand = deviceAuthCommand + ' --setalias \"' + aliasForLogin + "\"";
    }
}

function sendCommandToTerminal() {
    let terminal = vscode.window.activeTerminal;
    if (terminal == undefined) {
        terminal = vscode.window.createTerminal({ name: "SFDX Codespaces" });
    }
    terminal.show();
    terminal.sendText(deviceAuthCommand);
    vscode.window.showInformationMessage('Follow the prompt in the VS Code Integrated Terminal.');
}

function userPrompt(prompt) {
    return vscode.window.showInputBox({ prompt: prompt });
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
