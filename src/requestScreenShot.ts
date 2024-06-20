

import DevelopSession from './DevelopSession';


import { window, workspace } from 'vscode';
import findHost from './RemoteHostFinder';
import {getWorkspaceFolder, writeFile, getConfigure } from './util';
import moment from 'moment';

import * as fs from 'fs';
import * as path from 'path';
import { SessionType } from './generated/Authorization';
import { MessageType, decodeMessageType, decodeScreenShotResponse, encodeMessageType } from './generated/interaction';

export default async function requestScreenShot(){
  const port = getConfigure<number>("autolua2.debugger","targetPort") || 8176;
  const hosts = await findHost(port);
  if(hosts.length==0){
    return window.showErrorMessage("can not find autolua engine");
  }
  let host:string|undefined;
  if(hosts.length>1){
    host = await window.showQuickPick(hosts,{placeHolder:"select a host"})
  }else{
    host = hosts[0]
  }
  if(!host){
    return window.showErrorMessage("no host selected");
  }
  const token = getConfigure<string>("autolua2.debugger","token")
  if(!token){
    return window.showErrorMessage("please set token on autolua2.debugger.token in settings");
  }
  const session = new DevelopSession(token,port,host,SessionType.KIT_AUTO_LUA_DEBUG);
  session.onAuthResult((result)=>{
    console.log("on authresult ",result)
    if(result){
      console.log(encodeMessageType[MessageType.kScreenShotRequest])
      session.send(encodeMessageType[MessageType.kScreenShotRequest],Buffer.alloc(0));
    }else{
      session.close();
      window.showErrorMessage("screen shot auth failed");
    }
  })

  session.onData(async (code,data)=>{
    const type = decodeMessageType[code];
    if(type == MessageType.kScreenShotResponse){
      const response = decodeScreenShotResponse(data);
      if(response.data){
        const name = `${moment().format("YYYY_MM_DD_HH_mm_ss")}.png`;
        const fileDir = path.join(getWorkspaceFolder(),"dev","screenshots")
        if(!fs.existsSync(fileDir)){
          fs.mkdirSync(fileDir,{recursive:true})
        }
        const filePath = path.join(fileDir,name);
        await writeFile(filePath,response.data);
        window.showInformationMessage(`screenshot saved to ${filePath}`);
      }else{
        window.showErrorMessage("screenshot failed");
      }
      session.close();
    }
  })
  session.start();
  
  //等待session关闭
  await new Promise<void>((resolve)=>{
    session.onClose(()=>{
      resolve();
    })
  })

}