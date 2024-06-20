import { CodeType } from "../generated/interaction";
import {readFile,stringReplace,getWorkspaceFolder} from "../util"
import { sep as SEP,join as joinPath}  from 'path';
import { workspace} from 'vscode';

export interface CodeInfo{
  codeType:CodeType;
  code:Uint8Array;
}

export interface CodeProvider{
  getFile(path:string):Promise<CodeInfo|null>;
  getModule(path:string):Promise<CodeInfo|null>;
  src2WorkspacePath(path:string):string;
  workspace2SrcPath(path:string):string;
}

export class SimpleCodeProvider implements CodeProvider {
  private _rootDir:string
  constructor(rootDir:string){
    this._rootDir = workspace.asRelativePath(joinPath(getWorkspaceFolder(),rootDir))
  }
  src2WorkspacePath(path: string): string {
    return workspace.asRelativePath(joinPath(getWorkspaceFolder(),this._rootDir,path))
  }

  workspace2SrcPath(path:string):string{
    if(path[0] != SEP){
      path = joinPath(getWorkspaceFolder(),path)
    }
    const relativePath = workspace.asRelativePath(path);
    return relativePath.substring(this._rootDir.length+1)
  }

  getFile(path: string): Promise<CodeInfo | null> {
    path = `${this._rootDir}${SEP}${path}`
    console.log("getFile",path)
    return Promise.resolve(readFile(path).then((
      data: Uint8Array | undefined
    ) => {
      if (data) {
        return {
          codeType: CodeType.kTextOrBinary,
          code: data
        };
      } else {
        return null;
      }
    }
    ));
  }


  getModule(path: string): Promise<CodeInfo | null> {
    path = stringReplace(path,".",SEP);
    path += ".lua";
    path = `${this._rootDir}${SEP}${path}`
    console.log("get module",path)
    return Promise.resolve(readFile(path).then(( data: Uint8Array | undefined) => {
      if (data) {
        return {
          codeType: CodeType.kTextOrBinary,
          code: data
        };
      } else {
        return null;
      }
    }
    ));
  }
}

