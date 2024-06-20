
import {getWorkspaceFolder, readFile,stringReplace} from "../util"
import { sep as SEP}  from 'path';
import {FileSystemWatcher, workspace} from 'vscode';

export interface ResourceProvider {
  getCode(path:string):Promise<Uint8Array|undefined>;
  getResource(path:string):Promise<Uint8Array|undefined>;
  workspace2SrcPath(path:string):string;
  onChanged(listener?:(path:string)=>void):void;
  asRelativePath(path:string):string;

}


export class SimpleResourceProvider implements ResourceProvider {

  private sourceDir: string;
  private resourceDir :string;
  private listener?: (path: string) => void;
  private watcher?:FileSystemWatcher;
  constructor(codeRoot:string,resourceDir:string){
    this.sourceDir = this.asRelativePath(codeRoot)
    this.resourceDir = this.asRelativePath(resourceDir)
  }
  workspace2SrcPath(path: string): string {
    if(path[0] != SEP){
      path = `${getWorkspaceFolder()}${SEP}${path}`
    }
    const relativePath = workspace.asRelativePath(path);
    if(relativePath.startsWith(this.sourceDir)){
      return relativePath.substring(this.sourceDir.length+1)
    }else{
      return relativePath
    }
  }



  addSep(dir:string):string{
    if(dir == "")
      return `.${SEP}`
    else
      return `${dir}${SEP}`
  }

  getResource(path: string): Promise<Uint8Array | undefined> {
    return readFile(`${this.addSep(this.resourceDir)}${path}`);
  }
  asRelativePath(path: string): string {
    return workspace.asRelativePath(getWorkspaceFolder()+SEP+path)
  }

  getCode(path: string): Promise<Uint8Array | undefined> {
    return readFile(`${this.addSep(this.sourceDir)}${path}`);
  }


  onChanged(listener?: ((path: string) => void) | undefined): void {
    this.listener = listener
    if(this.listener && !this.watcher){
      let pattern
      if(this.sourceDir == ""){
        pattern = "**/*.lua"
      }else{
        pattern = `${getWorkspaceFolder()}/${this.sourceDir}/**/*.lua`
      }
      console.log("pattern " ,pattern)
      this.watcher = workspace.createFileSystemWatcher(pattern);
      this.watcher.onDidChange((uri)=>{
        let path = workspace.asRelativePath(uri)
        console.debug("source dir on didchange",path)
        this.listener && this.listener(path.substring(this.sourceDir.length+1));
      })
      this.watcher.onDidDelete((uri)=>{
        this.listener && this.listener(uri.fsPath.substring(this.sourceDir.length+1));
      })
    }else if(!this.listener && this.watcher){
      this.watcher.dispose();
      this.watcher = undefined;
    }
  }

}
