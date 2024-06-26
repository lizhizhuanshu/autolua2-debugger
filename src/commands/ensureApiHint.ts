
import path from 'path';
import *  as vscode from 'vscode';
import {getConfigure} from "../util"

function findIndexStartingWith(arr: string[], prefix: string): number {
  return arr.findIndex(str => str.startsWith(prefix));
}

export default function ensureApiHint(extensionPath:string){
  const version = getConfigure<string>("autolua2-debugger","api_version") || "0.0.1"
  let apiDir = path.join(extensionPath,"resources","api")
  const targetPath = path.join(apiDir,version)
  const nowPaths = getConfigure<string[]>(`Lua.workspace`,"library") || []
  if(!nowPaths.includes(targetPath)){
    const index = findIndexStartingWith(nowPaths,apiDir)
    if(index !== -1){
      nowPaths.splice(index,1)
    }
    nowPaths.push(targetPath)
    vscode.workspace.getConfiguration(`Lua.workspace`).update("library",nowPaths,vscode.ConfigurationTarget.Workspace)
  }
}
