import * as dgram from 'dgram';
import { Subject } from 'await-notify';

const REQUEST_MESSAGE = "AutoLuaEngine,Where are you?"
const RESPONSE_MESSAGE = "AutoLuaKit,I am here!"
const broadcastAddress = '255.255.255.255'; 

export default async function findHost(port:number) {
  const hosts:string[] = [];
  const server = dgram.createSocket('udp4');
  let error = false
  server.on('error', (err) => {
    console.log(`client error:\n${err.stack}`);
    error = true
    server.close();
  });

  server.on("listening",()=>{
    console.log("server listening")
    server.setBroadcast(true)
  })

  server.on('message', (msg, rinfo) => {
    console.log(`client got: ${msg.toString("utf8")} from ${rinfo.address}:${rinfo.port}`);
    if(msg.toString("utf8") == RESPONSE_MESSAGE && hosts.indexOf(rinfo.address) == -1){
      hosts.push(rinfo.address)
    }
  });

  const subject = new Subject()

  server.bind(port,async ()=>{
    for(let i=0;i<3;i++){
      if(error) break
      server.send(REQUEST_MESSAGE, port, broadcastAddress, (err, bytes) => {
        console.log("send message ", err, bytes);
      });
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    subject.notify()
  })
  await subject.wait(3000)
  server.close()
  return hosts
}