

import path from "path";
import { readFile } from "./util";


export interface ResourceProvider{
  getResource(path:string):Promise<Uint8Array|undefined>;
}

export class SimpleResourceProvider implements ResourceProvider {
  private root:string;
  constructor(root:string = "res"){
    this.root = root;
  }

  async getResource(p: string): Promise<Uint8Array | undefined> {
    console.log("get resource  ",path.join(this.root,p))
    return readFile(path.join(this.root,p))
  }
}


