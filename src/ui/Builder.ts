import { Socket } from "net";
import { DebugAdapter,Builder,LogListener,
  MessageListener,StateListener, DebugTarget,State, 
  DEFAULT_PORT} from "../DebugAdapter"

import { decodepb_get_resource_request } from '../generated/PBGetResourceRequest';
import { encodepb_get_resource_response, pb_get_resource_response } from '../generated/PBGetResourceResponse';
import { decodepblogcommand } from '../generated/PBLogCommand';
import { decodepberrorcommand } from '../generated/PBErrorCommand';
import { encodepbentryfilecommand,pbentryfilecommand } from '../generated/PBEntryFileCommand';
import { encodepbreloadcommand,pbreloadcommand } from '../generated/PBReloadCommand';
import {encodeAuthorizationRequest,decodeAuthorizationResponse, SessionType} from "../generated/Authorization"
import { encodepbupdatecommand, pbupdatecommand } from '../generated/PBUpdateCommand';
import { decodepbdevicecommand } from '../generated/PBDeviceCommand';
import { InstructionType } from "../generated/PBBaseCommand";

import { ResourceProvider,SimpleResourceProvider } from "./ResourceProvider";
import { decodeGetResourceRequest,encodeGetResourceResponse } from "../generated/RequestResource";

const LENGTH_FIELD_SIZE = 4;
const TYPE_FIELD_SIZE = 1;
const HEADER_SIZE = LENGTH_FIELD_SIZE + TYPE_FIELD_SIZE;
const TYPE_OFFSET = LENGTH_FIELD_SIZE;
const LENGTH_OFFSET = 0;
const DATA_OFFSET = HEADER_SIZE;

const NULL_BUFFER = Buffer.alloc(0);

class UIDebugAdapter implements DebugAdapter {
  private _logListener?: LogListener;
  private _messageListener?: MessageListener;
  private _stateListener?: StateListener;
  private _token?: string;
  private _port ?: number = DEFAULT_PORT;
  private _host ?: string;

  private _socket: Socket;

  private _state: State = State.IDLE;
  private _beforeBuffer:Buffer = NULL_BUFFER;
  private _resourceProvider?:ResourceProvider;

  private _entryFile?: string;
  
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

  private changeState(state:State){
    this._state = state;
    this._stateListener?.(state);
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
    this.onMessage(type,message);
    if(other){
      this.onData(other);
    }
  }

  private async onGetResourceRequest(message:Buffer){
    let request = decodepb_get_resource_request(message);
    let response = {} as pb_get_resource_response;
    const path = request.path;
    if(path){
      console.log("get resource path = ",path)
      if(path.endsWith(".lua")){
        response.data = await this._resourceProvider!!.getCode(path);
      }else{
        response.data = await this._resourceProvider!!.getResource(path);
      }
    }
    response.id = request.id;
    let buffer = encodepb_get_resource_response(response);
    this.send(InstructionType.GET_RESOURCE_RESPONSE,buffer);
  }

  onMessage(type:InstructionType,message:Buffer){
    switch(type){
      case 101 as InstructionType:{
        this.onAuthResponse(message);
        break;
      }
      case 102 as InstructionType:{

        break;
      }
      case InstructionType.GET_RESOURCE_REQUEST:{
        this.onGetResourceRequest(message)
        break
      }
      case InstructionType.LOG:{
        let command = decodepblogcommand(message);
        this._logListener?.("",0,command.log ||"","stdout");
        break;
      }
      case InstructionType.ERROR:{
        let command = decodepberrorcommand(message);
        this._logListener?.("",0,command.error||"","stderr");
        break;
      }
      case InstructionType.DEVICE:{
        let command = decodepbdevicecommand(message);
        console.log(`Device name: ${command.name} model : ${command.model}`)
        break;
      }
      default:{
        console.log(`Unknown message type ${type}`)
      }
    }
  }

  private sendAuthMessage(){
    let data = encodeAuthorizationRequest({
      auth:this._token,
      sessionType:SessionType.UI_DEBUG
    });
    this.send(100 as InstructionType,data);
  }



  send(type:InstructionType,data:Uint8Array){
    console.log(`send type = ${type} length = ${data.byteLength}`)
    let length = data.byteLength;
    let buffer = Buffer.alloc(HEADER_SIZE);
    buffer.writeUInt32BE(length+HEADER_SIZE,LENGTH_OFFSET);
    buffer.writeUInt8(type,TYPE_OFFSET);
    this._socket.write(buffer);
    this._socket.write(data);
  }

  private reload(updateEntryFile:boolean = false){
    if(updateEntryFile){
      this.updateEntryFile()
    }
    this.sendEntryFile()
    this.sendReload()
  }

  start(): void {
    if(this._state != State.IDLE)
      return
    this.changeState(State.STARTING);

    this._resourceProvider?.onChanged((path)=>{
      this.reload(path == this._entryFile)
    })

    const port = this._port || DEFAULT_PORT;
    const host = this._host || "localhost";
    this._socket.connect(port,host,()=>{
      this.sendAuthMessage()
    })
  }

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
    this.sendEntryFile()
    await this.updateEntryFile()
    this.sendReload()
  }

  
  private sendEntryFile(){
    let command = {} as pbentryfilecommand;
    command.entryFilePath = `http://127.0.0.1:${this._port}/${this._entryFile}`;
    command.relativeEntryFilePath = this._entryFile;
    command.params = `projectRootDir=http://127.0.0.1:${this._port}/`
    let buffer = encodepbentryfilecommand(command);
    this.send(InstructionType.ENTRY_FILE, buffer);
  }

  private async updateEntryFile(){
    let command = {} as pbupdatecommand;
    const data = await this._resourceProvider!!.getCode(this._entryFile!!);
    command.fileData = data;
    command.relativeFilePath = this._entryFile;
    command.filePath = `http://127.0.0.1:${this._port}/${this._entryFile}`;
    let buffer = encodepbupdatecommand(command)
    this.send(InstructionType.UPDATE, buffer);
  }

  private sendReload(){
    let command = {} as pbreloadcommand;
    command.serialNum = "0"
    let buffer = encodepbreloadcommand(command);
    this.send( InstructionType.RELOAD, buffer);
  }

  interrupt(): void {
    this._socket.end()
  }

  destroy(): void {
    this._socket.destroy()
    this._resourceProvider?.onChanged()
  }


  static UIDebugBuilder  = class implements Builder{
    private _target:UIDebugAdapter = new UIDebugAdapter()
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
      this._target._entryFile = "main.lua";
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
      return this
    }
    build(): DebugAdapter {
      this._target._resourceProvider = new SimpleResourceProvider("ui","res");
      return this._target;
    }
  }
}

export default UIDebugAdapter.UIDebugBuilder