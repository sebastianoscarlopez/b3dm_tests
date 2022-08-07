import axios from 'axios'
import path from 'node:path'
import * as fs from 'node:fs'

const baseUrl = 'http://10.10.8.208/wfs/webfiles/cesium/'

const files = []

const process = async (children, parentUrl) => {
  // console.log(children)
  const levels = children?.map(({ content: { uri } }) => {
    const urlPath = path.normalize(path.join(path.parse(parentUrl.replace(baseUrl, '')).dir, uri)).replace()
    files.push(urlPath)
    if(urlPath.indexOf('63721_61720_-3_lv3_group_0_1') > 0) {
      console.log(urlPath)
    }
    if (uri.endsWith('json')) {
      return axios.get(`${baseUrl}${urlPath}`)
    } else {
       //console.log('b3dm:', urlPath)
      return null
    }
  })
    .filter(d => d)



  // console.log(levels)
  const levelsJson = await Promise.all(levels)
  // console.log(levelsJson)
  const processLevels = levelsJson.map(({ config: { url }, data: { root: { children } } }) => {
    return process(children, url)
  }
  )

  const processGrandChildren = children?.map(({ children: grandChildren }) => {
    return process(grandChildren || [], parentUrl)
  }
  ) || []

  const processed = await Promise.all([processGrandChildren, processLevels].flat())


    //.catch((e) => console.log('error'))
  // await Promise.allSettled(processLevels)
}

(async () => {

  const root = await axios.get(`${baseUrl}tileset.json`)
  const { config: { url }, data: { root: { children } } } = root
  await process(children, url)
  
  console.log(`total: ${files.length}`)
  fs.writeFileSync('files.txt', JSON.stringify(files))
}
)()