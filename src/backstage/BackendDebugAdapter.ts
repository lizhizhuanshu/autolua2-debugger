import { CommonDebugAdapter } from "../CommonDebugAdapter";

import { CodeProvider,CodeInfo, SimpleCodeProvider } from "./CodeProvider";

import { State} from "../DebugAdapter"

import { MessageType,CodeFromType, CodeType, 
  RpcResponse, decodeGetCodeRequest, decodeGetResourceRequest, 
  decodeNotifyState, decodeResponseResult, decodeRpcRequest, 
    encodeGetCodeResponse, encodeGetResourceResponse, 
  encodeRpcResponse, encodeMessageType, decodeMessageType,
    encodeExecuteCode,LogCommand, 
    decodeLogCommand} from "../generated/interaction"
import { SessionType } from "../generated/Authorization";

export default class BackendDebugAdapter extends CommonDebugAdapter{
  protected sessionType: SessionType=SessionType.KIT_AUTO_LUA_DEBUG;
  private _codeProvider:CodeProvider;
  constructor(){
    super()
    this._codeProvider = new SimpleCodeProvider("src");
  }

  override setEntryFile(entryFile: string): void {
    this._entryFile = this._codeProvider.workspace2SrcPath(entryFile);
  }

  private async onGetCode(data:Buffer){
    let getCodeRequest = decodeGetCodeRequest(data);
    console.log(getCodeRequest)
    let path = getCodeRequest.path;
    let code;
    if(path){

      if(getCodeRequest.from_type == CodeFromType.kModule){
        code = await this._codeProvider!!.getModule(path)
      }else{
        code = await this._codeProvider!!.getFile(path)
      }
    }
    if(!code){
      code = {
        codeType:CodeType.kTextOrBinary,
        code:CommonDebugAdapter.NULL_BUFFER
      } as CodeInfo;
    }
    this._send(MessageType.kGetCodeResponse,encodeGetCodeResponse({
      id:getCodeRequest.id,
      data:code.code,
      code_type:code.codeType
    }));
  }

  private _send(type:MessageType,data:Uint8Array){
    this.send(encodeMessageType[type],data);
  }

  private async onGetResource(data:Buffer){
    let request = decodeGetResourceRequest(data)
    let resource;
    if(request.path){
      resource = await this._resourceProvider!!.getResource(request.path);
    }
    if(!resource){
      resource = CommonDebugAdapter.NULL_BUFFER;
    }
    this._send(MessageType.kGetResourceResponse,encodeGetResourceResponse ({
      id:request.id,
      data:resource
    }));
  }

  private onRpc(data:Buffer){
    let request = decodeRpcRequest(data);
    let response
    if(request.method == "log"){
      if(request.data){
        let message = JSON.parse(request.data.toString());
        const path = this._codeProvider!!.src2WorkspacePath(message.source)
        this._logListener?.(path,message.line,message.message)
      }else{
        console.error("Invalid log request, no data field");
      }
      response = {
        id:request.id,
        result:CommonDebugAdapter.NULL_BUFFER
      } as RpcResponse
    }
    if(!response){
      response = {
        id:request.id,
        result:CommonDebugAdapter.NULL_BUFFER
      } as RpcResponse
    }
    this._send(MessageType.kRpcResponse,encodeRpcResponse(response));
  }

  private onNotifyState(data:Buffer){
    let request = decodeNotifyState(data);
    console.log("onNotifyState",request.state)
    if(request.state == 0 || request.state == undefined){
      this.changeState(State.IDLE);
    }else if(request.state== 2){
      this.changeState(State.RUNNING);
    }else {
      console.error("Unknown state: "+request.state);
    }
  }

  private encoder = new TextEncoder();
  protected onAuthSuccess(): void {
    const script = `
    loadfile("init.lua")()
    loadfile("${this._entryFile}")()
    `
    let command = encodeExecuteCode({
      code:this.encoder.encode(script),
      code_type:CodeType.kTextOrBinary
    })

    this._send(MessageType.kExecuteCode,command);
  }

  private async onMessage(type:MessageType,data:Buffer){
    console.debug("onMessage",type)
    switch(type){
      case MessageType.kGetCode:
        await this.onGetCode(data);
        break;
      case MessageType.kGetResource:
        await this.onGetResource(data);
        break;
      case MessageType.kRpc:
        this.onRpc(data);
        break;
      case MessageType.kNotifyState:
        this.onNotifyState(data);
        break;
      case MessageType.kLog:
        const message = decodeLogCommand(data);
        const path = this._codeProvider!!.src2WorkspacePath(message.source as string)
        console.log("onLog",path,message.line || 0,message.message || "","stdout")
        this._logListener?.(path,message.line || 0,message.message || "","stdout")
        break;
      default:
        console.error("Unknown message type: "+type);
    }
  }

  override interrupt(): void {
    this._send(MessageType.kInterrupt,CommonDebugAdapter.NULL_BUFFER);
  }

  protected onCustomMessage(type: number, message: Buffer): void {
    this.onMessage(decodeMessageType[type],message);
  }
  protected onStart(): void {
  }
  protected onDestroy(): void {
    
  }

}