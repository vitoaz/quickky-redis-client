import Fs from 'fs'
import AppUtil from '@/utils/AppUtil'

const LOG_TAG = 'StorageUtil'

class StorageUtil {
  constructor() {

  }

  getFileNames(basePath) {
    if (!Fs.existsSync(basePath)) {
      Fs.mkdirSync(basePath)
    }
    const outNames = []
    const fileNames = Fs.readdirSync(basePath)
    fileNames.forEach(n => {
      if (n.endsWith('.json')) {
        outNames.push(n.substr(0, n.length - 5))
      }
    })
    return outNames
  }

  delete(basePath, fileName) {
    const path = basePath + '/' + fileName + '.json'
    AppUtil.log.info(LOG_TAG, `delete ${path}`)
    Fs.unlinkSync(path)
  }

  save(basePath, fileName, obj) {
    if (!Fs.existsSync(basePath)) {
      Fs.mkdirSync(basePath)
    }
    const path = basePath + '/' + fileName + '.json'
    const jsonStr = JSON.stringify(obj)
    Fs.writeFileSync(path, jsonStr, 'utf8')
  }

  load(basePath, fileName) {
    const path = basePath + '/' + fileName + '.json'
    try {
      const jsonStr = Fs.readFileSync(path, 'utf8')
      return JSON.parse(jsonStr)
    } catch (e) {
      AppUtil.log.error(LOG_TAG, `load fail, path=${path} e=${e}`)
      return {}
    }
  }
}

export default new StorageUtil()
