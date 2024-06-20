
import {
	LoggingDebugSession,
	InitializedEvent, TerminatedEvent, OutputEvent,
	Source
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { Subject } from 'await-notify';
import { basename } from 'path';
import { window, workspace } from 'vscode';
import {getConfigure, hasFile, toLocalPath} from "./util"

import { DebugAdapter,Builder,State } from './DebugAdapter';
import findHost from './RemoteHostFinder';
import { CommonDebugAdapter } from './CommonDebugAdapter';
import UIDebugAdapter from './ui/UIDebugAdapter';
import BackendDebugAdapter from './backstage/BackendDebugAdapter';

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
	startFile:string;
	targetHost?:string;
	targetPort?:number;
	token?:string;
}

export class Autolua2DebugSession extends LoggingDebugSession{
	private debugAdapter?:DebugAdapter;
	private _configurationDone = new Subject();
	public constructor(){
		super("autolua2-debug.txt");
	}

	private commonDebugAdapterConfig(debugAdapter:CommonDebugAdapter){
		debugAdapter.setStateListener((state)=>{
			if(state == State.IDLE){
				this.debugAdapter?.destroy()
				this.debugAdapter = undefined;
				this.sendEvent(new TerminatedEvent());
			}else if(state == State.RUNNING){
				this.sendEvent(new OutputEvent(`autolua 已启动\n`));
			}else{
				console.log("autolua changed state",state)
			}
		})

		debugAdapter.setLogListener((path,line,message,type)=>{
			const e: DebugProtocol.OutputEvent = new OutputEvent(`${message}\n`,type);
			e.body.source = this.createSource(path);
			e.body.line = line;
			this.sendEvent(e);
		})

		debugAdapter.setMessageListener((type,message)=>{
			if(type==="error"){
				window.showErrorMessage(message);
			}else{
				window.showWarningMessage(message);
			}
		})
	}

	/**
	 * The 'initialize' request is the first request called by the frontend
	 * to interrogate the features the debug adapter provides.
	 */
	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
		// build and return the capabilities of this debug adapter:
		response.body = response.body || {};

		// the adapter implements the configurationDoneRequest.
		response.body.supportsConfigurationDoneRequest = true;

		// make VS Code to use 'evaluate' when hovering over source
		response.body.supportsEvaluateForHovers = true;

		// make VS Code to show a 'step back' button
		response.body.supportsStepBack = true;

		// make VS Code to support data breakpoints
		response.body.supportsDataBreakpoints = true;

		// make VS Code to support completion in REPL
		response.body.supportsCompletionsRequest = true;
		response.body.completionTriggerCharacters = [ ".", "[" ];

		// make VS Code to send cancelRequests
		response.body.supportsCancelRequest = true;

		response.body.supportsTerminateRequest = true;

		// make VS Code send the breakpointLocations request
		response.body.supportsBreakpointLocationsRequest = true;

		// make VS Code provide "Step in Target" functionality
		response.body.supportsStepInTargetsRequest = true;
		
		this.sendResponse(response);

		// since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
		// we request them early by sending an 'initializeRequest' to the frontend.
		// The frontend will end the configuration sequence by calling 'configurationDone' request.
		this.sendEvent(new InitializedEvent());
	}

	/**
	 * Called at the end of the configuration sequence.
	 * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
	 */
	protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
		super.configurationDoneRequest(response, args);
		// notify the launchRequest that configuration has finished
		console.log("configure done")
		this._configurationDone.notify();
	}

	protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments) {
		await this._configurationDone.wait(1000);
		console.log("startFile",workspace.asRelativePath(args.startFile))
		let host=args.targetHost || getConfigure("autolua2.debugger","targetHost")
		let port=args.targetPort || getConfigure("autolua2.debugger","targetPort")
		if(!port){
			response.success=false;
			response.message="please set targetPort on launch.json or autolua2.debugger.targetPort in settings";
			return this.sendResponse(response);
		}

		if(!host || host=="auto" || host == ""){
			const hosts = await findHost(port)
			if(hosts.length==0){
				response.success=false;
				response.message="can not find autolua engine";
				return this.sendResponse(response);
			}
			if(hosts.length>1){
				host = await window.showQuickPick(hosts,{placeHolder:"select a host"})
				if(!host){
					response.success=false;
					response.message="no host selected";
					return this.sendResponse(response);
				}
			}else{
				host = hosts[0]
			}
		}

		const token = args.token || getConfigure<string>("autolua2.debugger","token")
		if(!token){
			response.success=false;
			response.message="please set token on autolua2.debugger.token in settings";
			return this.sendResponse(response);
		}
		const startFile = workspace.asRelativePath(args.startFile);
		if(!await hasFile(startFile)){
			response.success=false;
			response.message="startFile not exist";
			return this.sendResponse(response);
		}
		const target = getConfigure<string>("autolua2.debugger","target") || "auto"

		let commonDebugAdapter:CommonDebugAdapter
		if(target == "ui")
			commonDebugAdapter = new UIDebugAdapter()
		else if(target == "main")
			commonDebugAdapter = new BackendDebugAdapter()
		else if(target == "auto"){
			if(startFile.startsWith("src")){
				commonDebugAdapter = new BackendDebugAdapter()
			}else if(startFile.startsWith("ui")){
				commonDebugAdapter = new UIDebugAdapter()
			}else{
				response.success=false;
				response.message="can not determine target by startFile";
				return this.sendResponse(response);
			}
		}else{
			response.success=false;
			response.message="unknown target,please set target on autolua2.debugger.target in settings";
			return this.sendResponse(response);
		}
		console.log(commonDebugAdapter)
		this.commonDebugAdapterConfig(commonDebugAdapter)
		commonDebugAdapter.setToken(token)
		commonDebugAdapter.setPort(port)
		if(host) 
			commonDebugAdapter.setHost(host)

		commonDebugAdapter.setEntryFile(startFile)
		this.debugAdapter = commonDebugAdapter
		if(this.debugAdapter){
			this.debugAdapter.start()
		}else{
			response.success=false;
			response.message="Failed to build engine";
			return this.sendResponse(response);
		}
		this.sendResponse(response);
	}

	protected terminateRequest(response:DebugProtocol.TerminateResponse,args:DebugProtocol.TerminateArguments)
	{
		this.debugAdapter?.interrupt();
		this.sendResponse(response);
	}

	private createSource(filePath: string): Source {
		filePath = toLocalPath(filePath)
		console.log(this.convertDebuggerPathToClient(filePath))
		return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'autolua2-adapter-data');
	}
}