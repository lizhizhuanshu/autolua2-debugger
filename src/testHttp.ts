import axios from "axios"

async function request () {
  const data = JSON.stringify({name: "test"})
  return await axios.post("http://192.168.1.2:6655/test",data,{
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    }
  })
}

export default async function testHttp() {
  try {
    console.log("testHttp")
    const res = await request()
    console.log(res.data)
  }catch (e){
    console.error(e)
  }
}