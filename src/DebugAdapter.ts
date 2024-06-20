
export const DEFAULT_PORT = 8176;

export interface DebugAdapter{
  start():void;
  interrupt():void;
  destroy():void
}

export enum State{
  IDLE="IDLE",
  STARTING = "STARTINg",
  RUNNING="RUNNING",
  STOPPING="STOPPING"
}

export enum DebugTarget{
  UI = "UI",
  BACKSTAGE = "BACKSTAGE"
}

export type LogListener = (path:string,line:number,message:string,type?:string)=>void;
export type MessageListener = (type:string, ...args:string[])=>void;
export type StateListener = (state:State)=>void;

export interface Builder {
  onLog(callback:LogListener):Builder;
  onMessage(callback:MessageListener):Builder;
  onStateChange(callback:StateListener):Builder;
  setToken(token:string):Builder;
  setEntryFile(file:string):Builder;
  setPort(port:number):Builder;
  setHost(host:string):Builder;
  setDebugTarget(target:DebugTarget):Builder;
  build():DebugAdapter;
}

