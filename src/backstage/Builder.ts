import { Socket } from "net";
import { DebugAdapter,Builder,LogListener,
  MessageListener,StateListener, DebugTarget,State, 
  DEFAULT_PORT} from "../DebugAdapter"

import { MessageType,CodeFromType, CodeType, 
  RpcResponse, decodeGetCodeRequest, decodeGetResourceRequest, 
  decodeNotifyState, decodeResponseResult, decodeRpcRequest, 
    encodeGetCodeResponse, encodeGetResourceResponse, 
  encodeRpcResponse, encodeMessageType, decodeMessageType,
    encodeExecuteCode,LogCommand, 
    decodeLogCommand} from "../generated/interaction"

import {encodeAuthorizationRequest,decodeAuthorizationResponse, SessionType} from "../generated/Authorization"

import { CodeProvider,CodeInfo, SimpleCodeProvider } from "./CodeProvider";
import { ResourceProvider ,SimpleResourceProvider} from "../ResourceProvider";

const LENGTH_FIELD_SIZE = 4;
const TYPE_FIELD_SIZE = 1;
const HEADER_SIZE = LENGTH_FIELD_SIZE + TYPE_FIELD_SIZE;
const TYPE_OFFSET = LENGTH_FIELD_SIZE;
const LENGTH_OFFSET = 0;
const DATA_OFFSET = HEADER_SIZE;

const NULL_BUFFER = Buffer.alloc(0);
  

class BackStageDebugAdapter implements DebugAdapter{
  private _logListener?: LogListener;
  private _messageListener?: MessageListener;
  private _stateListener?: StateListener;
  private _token?: string;
  private _entryFile?: string;
  private _port?: number;
  private _host?: string;
  private _socket:Socket;
  private _state = State.IDLE;
  private _beforeBuffer:Buffer = NULL_BUFFER;

  private _codeProvider?:CodeProvider;
  private _resourceProvider?:ResourceProvider;

  constructor(){
    const socket = new Socket();
    this._socket = socket;
    socket.setTimeout(5000);

    socket.on("timeout",()=>{
      console.log("socket timeout")
      this._messageListener?.("warning","无法连接到手机")
      socket.end()
    })

    socket.on("error",(err)=>{
      console.error("socket error",err)
      this._messageListener?.("error","连接出错: "+err.message);
    })

    socket.on("close",(err)=>{
      console.log("socket close",err)
      this.changeState(State.IDLE);
    })

    socket.on("data",this.onData);
  }

  destroy(): void {
    this._socket.destroy()
    this._codeProvider = undefined;
    this._resourceProvider = undefined;
    this._logListener = undefined;
    this._messageListener = undefined;
    this._stateListener = undefined;
  }
  
  private changeState(state:State){
    this._state = state;
    this._stateListener?.(state);
  }

  private async onGetCode(data:Buffer){
    let getCodeRequest = decodeGetCodeRequest(data);
    let path = getCodeRequest.path;
    let code;
    if(path){
      if(getCodeRequest.from_type = CodeFromType.kFile){
        code = await this._codeProvider!!.getFile(path)
      }else{
        code = await this._codeProvider!!.getModule(path)
      }
    }
    if(!code){
      code = {
        codeType:CodeType.kTextOrBinary,
        code:NULL_BUFFER
      } as CodeInfo;
    }
    this.send(MessageType.kGetCodeResponse,encodeGetCodeResponse({
      id:getCodeRequest.id,
      data:code.code,
      code_type:code.codeType
    }));
  }

  private async onGetResource(data:Buffer){
    let request = decodeGetResourceRequest(data)
    let resource;
    if(request.path){
      resource = await this._resourceProvider!!.getResource(request.path);
    }
    if(!resource){
      resource = NULL_BUFFER;
    }
    this.send(MessageType.kGetResourceResponse,encodeGetResourceResponse ({
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
        result:NULL_BUFFER
      } as RpcResponse
    }
    if(!response){
      response = {
        id:request.id,
        result:NULL_BUFFER
      } as RpcResponse
    }
    this.send(MessageType.kRpcResponse,encodeRpcResponse(response));
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
  private onAuthResponse(data:Buffer){
    let response = decodeAuthorizationResponse(data);
    if(response.code && response.code != 0){
      console.log(response.code)
      this._messageListener?.("error",response.message || "认证失败，无法调试");
      this.changeState(State.IDLE);
      this._socket.end();
      return
    }
    this._socket.setTimeout(0);
    const script = `
    loadfile("init.lua")()
    loadfile("${this._entryFile}")()
    `
    let command = encodeExecuteCode({
      code:this.encoder.encode(script),
      code_type:CodeType.kTextOrBinary
    })

    this.send(MessageType.kExecuteCode,command);
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
      case MessageType.kAuthResponse:
        this.onAuthResponse(data);
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

  private onData = (data:Buffer)=>{
    let totalBuffer
    if(this._beforeBuffer.length > 0){
      totalBuffer = Buffer.concat([this._beforeBuffer,data]);
      this._beforeBuffer = NULL_BUFFER;
    }else{
      totalBuffer = data;
    }
    if(totalBuffer.byteLength <HEADER_SIZE){
      this._beforeBuffer = totalBuffer;
      return;
    }
    let type = totalBuffer.readUInt8(TYPE_OFFSET);
    let length = totalBuffer.readUInt32BE(LENGTH_OFFSET);
    console.log(`type = ${decodeMessageType[type]}  length = ${length}`)
    if(totalBuffer.byteLength < length){
      this._beforeBuffer = totalBuffer;
      return;
    }
    let message = totalBuffer.slice(DATA_OFFSET,length);
    let other
    if(totalBuffer.byteLength > length){
      other = Buffer.copyBytesFrom(totalBuffer,length)
    }
    this._beforeBuffer = NULL_BUFFER;
    this.onMessage(decodeMessageType[type],message);
    if(other){
      this.onData(other);
    }
  }

  private sendAuthMessage(){
    let data = encodeAuthorizationRequest({
      auth:this._token,
      sessionType:SessionType.KIT_AUTO_LUA_DEBUG
    });
    this.send(MessageType.kAuthRequest,data);
  }

  start(): void {
    if(this._state != State.IDLE)
      return
    this.changeState(State.STARTING);
    const port = this._port || DEFAULT_PORT;
    const host = this._host || "localhost";
    this._socket.connect(port,host,()=>{
      this.sendAuthMessage()
    })
  }

  interrupt(): void {
    console.debug("start interrupt")
    if(this._state == State.RUNNING){
      this.send(MessageType.kInterrupt,NULL_BUFFER);
    }
  }

  private send(type:MessageType, data:Uint8Array){
    let nType = encodeMessageType[type];
    console.log(`send message type: ${type} data length: ${data.byteLength}`)
    let header = Buffer.alloc(HEADER_SIZE);
    header.writeUInt32BE(data.byteLength+HEADER_SIZE,LENGTH_OFFSET); 
    header.writeUInt8(nType,TYPE_OFFSET);
    // console.log(Buffer.from(data).toString('hex'));
    // console.log("send message size",header.byteLength+data.byteLength)
    this._socket.write(header);
    this._socket.write(data);
  }

  static  BackstageDebugBuilder = class implements Builder {
    private _target:BackStageDebugAdapter = new BackStageDebugAdapter();
    onLog(callback: LogListener): Builder {
      this._target._logListener = callback;
      return this;
    }
    onMessage(callback:MessageListener): Builder {
      this._target._messageListener = callback;
      return this;
    }
    onStateChange(callback:StateListener): Builder {
      this._target._stateListener = callback;
      return this;
    }
    setToken(token: string): Builder {
      this._target._token = token;
      return this;
    }
    setEntryFile(file: string): Builder {
      this._target._entryFile = file;
      return this;
    }
    setPort(port: number): Builder {
      this._target._port = port;
      return this;
    }
    setHost(host: string): Builder {
      this._target._host = host;
      return this;
    }
    setDebugTarget(target: DebugTarget): Builder {
      return this;
    }
    build(): DebugAdapter {
      const codeProvider = new SimpleCodeProvider("src")
      let entryFile = this._target._entryFile;
      if(entryFile){
        entryFile = codeProvider.workspace2SrcPath(entryFile)
      }else{
        entryFile = "main.lua";
      }
      this._target._entryFile = entryFile;

      this._target._codeProvider = codeProvider;
      this._target._resourceProvider = new SimpleResourceProvider("res")
      return this._target;
    }
  }
}


export default BackStageDebugAdapter.BackstageDebugBuilder;

