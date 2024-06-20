
import path from "path";
import { readFile } from "./util";


export interface CodeProvider {
  getCode(path: string): Promise<Uint8Array | undefined>;
}

export class SimpleCodeProvider implements CodeProvider {
  private root: string;
  constructor(root: string = "src") {
    this.root = root;
  }

  async getCode(p: string): Promise<Uint8Array | undefined> {
    return readFile(path.join(this.root, p));
  }
}