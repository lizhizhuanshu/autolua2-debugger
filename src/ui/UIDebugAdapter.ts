
import { CommonDebugAdapter } from "../CommonDebugAdapter";

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

export default class UIDebugAdapter extends CommonDebugAdapter {
  protected sessionType: SessionType = SessionType.UI_DEBUG;
  private resourceProvider:ResourceProvider;
  constructor(){
    super();
    this.resourceProvider = new SimpleResourceProvider("ui","");
  }

  override setEntryFile(entryFile: string): void {
    this._entryFile = this.resourceProvider.workspace2SrcPath(entryFile);
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
    const data = await this.resourceProvider!!.getCode(this._entryFile!!);
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


  private async reload(updateEntryFile = true){
    if(updateEntryFile) await this.updateEntryFile()
    this.sendEntryFile()
    this.sendReload()
  }
  protected onAuthSuccess(): void {
    this.reload()
  }

  protected onCustomMessage(type: number, message: Buffer): void {
    switch(type){
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
  protected onStart(): void {
    this.resourceProvider?.onChanged((path)=>{
      this.reload(path == this._entryFile)
    })
  }

  protected onDestroy(): void {
    this.resourceProvider.onChanged()
  }

}