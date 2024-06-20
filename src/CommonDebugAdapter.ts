
import { Socket } from "net";
import { DEFAULT_PORT, DebugAdapter, LogListener, MessageListener, State, StateListener } from "./DebugAdapter";
import { ResourceProvider, SimpleResourceProvider } from "./ResourceProvider";
import {encodeAuthorizationRequest,decodeAuthorizationResponse, SessionType} from "./generated/Authorization"
import {  GetResourceResponse, ResourceType, decodeGetResourceRequest, encodeGetResourceResponse } from "./generated/RequestResource";
import { CodeProvider, SimpleCodeProvider } from "./CodeProvider";

const LENGTH_FIELD_SIZE = 4;
const TYPE_FIELD_SIZE = 1;
const HEADER_SIZE = LENGTH_FIELD_SIZE + TYPE_FIELD_SIZE;
const TYPE_OFFSET = LENGTH_FIELD_SIZE;
const LENGTH_OFFSET = 0;
const DATA_OFFSET = HEADER_SIZE;

const NULL_BUFFER = Buffer.alloc(0);

export abstract class CommonDebugAdapter implements DebugAdapter {
  protected static readonly NULL_BUFFER = NULL_BUFFER;
  protected _logListener?:LogListener;
  protected _messageListener?:MessageListener;
  private _stateListener?:StateListener;
  private _token:string = "";
  protected _port:number = DEFAULT_PORT;
  private _host?:string;

  private _socket :Socket;
  private _state = State.IDLE;
  private _beforeBuffer = NULL_BUFFER;

  protected _resourceProvider:ResourceProvider;
  private _uiCodeProvider:CodeProvider;
  protected _entryFile?:string;

  constructor(){
    const socket = new Socket();
    this._socket = socket;
    this._resourceProvider = new SimpleResourceProvider();
    this._uiCodeProvider = new SimpleCodeProvider("ui");

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

  setLogListener(listener: LogListener): void {
    this._logListener = listener;
  }

  setMessageListener(listener: MessageListener): void {
    this._messageListener = listener;
  }

  setStateListener(listener: StateListener): void {
    this._stateListener = listener;
  }

  setToken(token: string): void {
    this._token = token;
  }

  setPort(port: number): void {
    this._port = port;
  }

  setHost(host: string): void {
    this._host = host;
  }


  setEntryFile(entryFile: string): void {
    this._entryFile = entryFile;
  }


  protected changeState(state:State){
    if(this._state == state) return
    this._state = state;
    this._stateListener?.(state);
  }

  private onData = async (data:Buffer)=>{
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
    console.log(`type = ${type}  length = ${length}`)
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
    if(!this.onCommonMessage(type,message)){
      this.onCustomMessage(type,message);
    }
    if(other){
      this.onData(other);
    }
  }

  protected abstract onAuthSuccess():void;

  private async onAuthResponse(data:Buffer){
    let response = decodeAuthorizationResponse(data);
    if(response.code && response.code != 0){
      console.log(response.code)
      this._messageListener?.("error",response.message || "认证失败，无法调试");
      this.changeState(State.IDLE);
      this._socket.end();
      return
    }
    this.changeState(State.RUNNING)
    this._socket.setTimeout(0);
    this.onAuthSuccess();
  }

  private async onRequestResource(data:Buffer){
    let request = decodeGetResourceRequest(data);
    let path = request.path;
    let response = {
      id:request.id
    } as GetResourceResponse
    if(path){
      request.type = request.type || ResourceType.UNKNOWN
      switch(request.type){
        case ResourceType.UNKNOWN:
          if(path.endsWith(".lua")){
            response.data = await this._uiCodeProvider.getCode(path) || NULL_BUFFER
          }else{

            response.data = await this._resourceProvider.getResource(path) || NULL_BUFFER
          }
          break;
        case ResourceType.RESOURCE:
          response.data = await this._resourceProvider.getResource(path) || NULL_BUFFER
          break
        case ResourceType.BACKEND_CODE:
          response.data = NULL_BUFFER
          break
        case ResourceType.UI_CODE:
          response.data = await this._uiCodeProvider.getCode(path) || NULL_BUFFER
          break
      }
    }else{
      response.data = NULL_BUFFER
    }
    this.send(103,encodeGetResourceResponse(response))
  }



  private onCommonMessage(type:number,message:Buffer){
    if(type == 101){
      this.onAuthResponse(message);
      return true
    }
    if(type == 102){
      this.onRequestResource(message);
      return true
    }
    return false
  }

  protected abstract onCustomMessage(type:number,message:Buffer):void;

  send(type:number,data:Uint8Array){
    console.log(`send type = ${type} length = ${data.byteLength}`)
    let length = data.byteLength;
    let buffer = Buffer.alloc(HEADER_SIZE);
    buffer.writeUInt32BE(length+HEADER_SIZE,LENGTH_OFFSET);
    buffer.writeUInt8(type,TYPE_OFFSET);
    this._socket.write(buffer);
    this._socket.write(data);
  }

  protected abstract onStart():void;

  protected abstract sessionType:SessionType;

  private sendAuthMessage(){
    let data = encodeAuthorizationRequest({
      auth:this._token,
      sessionType:this.sessionType
    });
    this.send(100,data);
  }

  start(): void {
    if(this._state != State.IDLE)
      return
    this.changeState(State.STARTING);
    this.onStart();
    const port = this._port || DEFAULT_PORT;
    const host = this._host || "localhost";
    this._socket.connect(port,host,()=>{
      this.sendAuthMessage()
    })
  }

  interrupt(): void {
    this._socket.end()
  }

  protected abstract onDestroy():void
  destroy(): void {
    this._socket.destroy()
  }

}