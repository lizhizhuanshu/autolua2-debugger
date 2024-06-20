import { Socket } from "net";
import { decodeAuthorizationResponse, encodeAuthorizationRequest,SessionType } from "./generated/Authorization";


const LENGTH_FIELD_SIZE = 4;
const TYPE_FIELD_SIZE = 1;
const HEADER_SIZE = LENGTH_FIELD_SIZE + TYPE_FIELD_SIZE;
const TYPE_OFFSET = LENGTH_FIELD_SIZE;
const LENGTH_OFFSET = 0;
const DATA_OFFSET = HEADER_SIZE;

const NULL_BUFFER = Buffer.alloc(0);

enum State{
  IDLE,
  CONNECTING,
  AUTHORIZING,
  AUTHORIZED,
  RUNNING,
  STOPPING,
  STOPPED
}

export default class DevelopSession{
  private _token:string = "";
  private _port:number;
  private _host:string;
  private _socket:Socket;
  private _beforeBuffer = NULL_BUFFER;
  private _sessionType:SessionType;
  private _state = State.IDLE;
  constructor(token:string,port:number,host:string,sessionType:SessionType){
    this._token = token;
    this._port = port;
    this._host = host;
    this._sessionType = sessionType;
    this._socket = new Socket();
    this._socket.on("data",this.onDataHandler);
    this._socket.on("error",(err)=>{
      this._errorListener?.(err);
    })
    this._socket.on("close",()=>{
      this._closeListener?.();
    })
  }
  start(){
    if(this._state != State.IDLE){
      return;
    }
    this._state = State.CONNECTING;
    this._socket.setTimeout(5000);
    this._socket.connect(this._port,this._host,()=>{
      this._state = State.AUTHORIZING;
      let data = encodeAuthorizationRequest({
        auth:this._token,
        sessionType:this._sessionType
      });
      this.send(100,data);
    })
  }
  private _resultListener?:(result:boolean)=>void;
  onAuthResult(listener: (result:boolean)=>void){
    this._resultListener = listener;
  }
  private _dataListener?:(code:number,data:Uint8Array)=>void;
  onData(listener:(code:number,data:Uint8Array)=>void){
    this._dataListener = listener;
  }

  private _errorListener?:(err:Error)=>void;
  onError(listener:(err:Error)=>void){
    this._errorListener = listener;
  }

  private _closeListener?:()=>void;
  onClose(listener:()=>void){
    this._closeListener = listener;
  }

  send(type:number,data:Uint8Array){
    let length = data.byteLength;
    let buffer = Buffer.alloc(HEADER_SIZE);
    buffer.writeUInt32BE(length+HEADER_SIZE,LENGTH_OFFSET);
    buffer.writeUInt8(type,TYPE_OFFSET);
    this._socket.write(buffer);
    this._socket.write(data);
  }

  private async onAuthResponse(data:Buffer){
    let response = decodeAuthorizationResponse(data);
    if(response.code && response.code != 0){
      console.log(response.code)
      this._resultListener?.(false);
      this._socket.end();
      return
    }
    this._socket.setTimeout(0);
    this._resultListener?.(true);
  }


  private onDataHandler = async (data:Buffer)=>{
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
    if(type == 101){
      this.onAuthResponse(message);
    }else{
      this._dataListener?.(type,message);
    }

    if(other){
      this.onDataHandler(other);
    }
  }

  close(){
    this._socket.end();
  }
}