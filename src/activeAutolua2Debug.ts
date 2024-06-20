'use strict';
import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { Autolua2DebugSession } from './AutoLuaDebugSession';
export function activeAutolua2Debug(context:vscode.ExtensionContext)
{
	context.subscriptions.push(
		vscode.debug.registerDebugAdapterDescriptorFactory(
			"autolua2-debugger",
			new InlineDebugAdapterFactory()));
	
}


class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

	createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
		return new vscode.DebugAdapterInlineImplementation(new Autolua2DebugSession());
	}
}
