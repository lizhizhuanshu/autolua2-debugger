// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { activeAutolua2Debug } from './activeAutolua2Debug';
import {packageProject, pushProject} from './pushProject';
import { window } from 'vscode';
import testHttp from './testHttp';
import requestScreenShot from './requestScreenShot';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "autolua2-debugger" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	activeAutolua2Debug(context);

	const disposable = vscode.commands.registerCommand('autolua2-debugger.packageProject', () => {
		packageProject();
		window.showInformationMessage('Package Project Success! In Dir :dev/build/');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.commands.registerCommand(
		'autolua2-debugger.pushProject', () => {
		pushProject();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("autolua2-debugger.screenShot", ()=>{
		requestScreenShot();
	}) )

}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log("autolua2-debuger deactivate");
}
