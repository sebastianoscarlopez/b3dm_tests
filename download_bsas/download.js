import axios from 'axios'
import path from 'node:path'
import * as fs from 'node:fs'
import * as stream from 'stream';
import { promisify } from 'util';

const finished = promisify(stream.finished);

const data = fs.readFileSync("files.txt")

const files = JSON.parse(data)//.slice(0, 2)

const total = files.length

console.log(total)

const baseUrl = 'http://10.10.8.208/wfs/webfiles/cesium/'
const limit = 100;

const downloadFile = async (fileUrl, outputLocationPath) => {
  const { dir } = path.parse(path.resolve(outputLocationPath));
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
  const writer = fs.createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}

(async () => {
  let page = 0
  while(page * limit < total) {
    const from = page * limit
    const to = from + limit
    const pageFiles = files.slice(from, to)
    console.log(`${files[from]} - ${files[to]}`)
    const filesPath = pageFiles.map(file => file.replace(/(\\)\\*/g, '/'))
    const processed = await Promise.all(filesPath.map(filePath => downloadFile(`${baseUrl}${filePath}`, `tiles/${filePath}`)))
    page++
  }
})()
// (async () => {
 
// }
// )()
