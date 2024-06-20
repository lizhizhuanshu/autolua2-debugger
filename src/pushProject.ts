
import { window, workspace } from 'vscode';
import findHost from './RemoteHostFinder';
import { readFile,getWorkspaceFolder, writeFile, getConfigure } from './util';
import { TextEncoder,TextDecoder } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import axios from 'axios';

function sendPostRequest(host: string, port: number, project: string, data: Uint8Array, auth: string): Promise<void> {
  const url = `http://${host}:${port}/${project}`;

  const headers = new Headers();
  headers.append('Content-Type', 'application/octet-stream');
  headers.append('Authorization', auth);

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: headers,
    body: data
  };

  return fetch(url, requestOptions)
    .then(response => {
      if (response.ok) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
      }
    })
    .catch(error => {
      return Promise.reject(error);
    });
}


async function sendPostRequest2(host: string, port: number, project: string, data: Uint8Array, auth: string) {
  const url = `http://${host}:${port}/${project}`;
  const res = await axios.post(url,data,{
    headers:{
      "Authorization":auth,
      "Content-Type":"application/octet-stream"
    }
  })
  return res
}



interface Configure {
  name?:string;
  version?:string;
  description?:string;
}


async function loadConfig() {
  const data = await readFile("package.json");
  let config = {} as Configure;
  if(data){
    const decoder = new TextDecoder();
    const str = decoder.decode(data);
    config = JSON.parse(str) as Configure;
  }
  return config;
}

function checkConfig(config:Configure){
  let changed = false
  if(!config.name){
    changed = true
    config.name = workspace.name
  }
  if(!config.version){
    changed = true
    config.version = "v0.1"
  }
  if(!config.description){
    changed = true
    config.description = "no description"
  }
  return changed
}


async function rawPackageProject(outPath:string){
  const output = fs.createWriteStream(outPath);
  const archive = archiver.create("zip",{zlib:{level:5}});
  archive.pipe(output);
  const excludePatterns = ['.git/**','dev/**','.vscode/**'];
  archive.glob('**/*',{
    cwd:getWorkspaceFolder(),
    ignore:excludePatterns
  })
  archive.finalize();
}

async function ensureConfigure(){
  const config = await loadConfig();
  if(checkConfig(config)){
    const encoder = new TextEncoder();
    const str = JSON.stringify(config,null,2);
    const data = encoder.encode(str);
    await writeFile("package.json",data);
  }
  return config
}

function ensureBuildDir(){
  const buildDir = path.join(getWorkspaceFolder(),"dev","build")
  if(!fs.existsSync(buildDir)){
    fs.mkdirSync(buildDir,{recursive:true})
  }
  return buildDir
}

function outName(config:Configure){
  return `${config.name}-${config.version}.zip`
}

function ensureOutPath(config:Configure){
  const buildDir = ensureBuildDir()
  return path.join(buildDir,outName(config))
}

export async function packageProject() {
  const  config =await ensureConfigure()
  await rawPackageProject(ensureOutPath(config));
}
  


async function rawPushProject(){
  const  config =await ensureConfigure()
  const outPath = ensureOutPath(config);
  await rawPackageProject(outPath);

  const port = getConfigure<number>("autolua2.debugger","targetPort") || 8176;
  const hosts = await findHost(port);
  if(hosts.length==0){
    return "can not find autolua engine";
  }
  let host:string|undefined;
  if(hosts.length>1){
    host = await window.showQuickPick(hosts,{placeHolder:"select a host"})
  }else{
    host = hosts[0]
  }
  if(!host){
    return "no host selected";
  }
  const token = getConfigure<string>("autolua2.debugger","token")
  if(!token){
    return "please set token on autolua2.debugger.token in settings";
  }
  const data = await readFile(outPath);
  if(!data){
    return "read file error";
  }
  try{
    console.log(host,port)
    await sendPostRequest(host,port,config.name!,data,token);
  }catch(e){
    const ee = e as Error;
    return ee.message;
  }
}

export async function pushProject(){
  const msg = await rawPushProject();
  if(msg){
    window.showErrorMessage(msg);
  }else{
    window.showInformationMessage("Push Project Success!");
  }
}

