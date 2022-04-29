import StorageUtil from '@/utils/StorageUtil'
import Log from 'electron-log'
import pack from '@/../package.json'
import {app} from '@electron/remote'

/**
 * wrapper the log to log with console and log file both
 */
class LogWrapper {
  info(tag, text) {
    Log.info(tag + ': ', text)
  }

  error(tag, text) {
    Log.error(tag + ': ', text)
  }
}

class AppUtil {
  constructor() {
    this.log = new LogWrapper()
    this.vue = null
    // log
    Log.transports.file.file = this.getUserDataPath() + '/log.txt'
    Log.transports.file.maxSize = 10 * 1024 * 1024
  }

  /**
   * init, should be called first
   */
  init(vue) {
    this.vue = vue
    document.title = pack.build.productName + '-v' + pack.version
  }

  /**
   * get userData path
   */
  getUserDataPath() {
    console.log(app)
    return app.getPath('userData')
  }

  /**
   * save the value
   */
  saveValue(key, value) {
    let app = StorageUtil.load(this.getUserDataPath(), 'app')
    if (!app) {
      app = {}
    }
    if (value) {
      app[key] = value
    } else {
      app[key] = undefined
    }
    StorageUtil.save(this.getUserDataPath(), 'app', app)
  }

  /**
   * load the value
   */
  loadValue(key) {
    let app = StorageUtil.load(this.getUserDataPath(), 'app')
    if (!app) {
      app = {}
    }
    return app[key]
  }

  /**
   * get vue object
   */
  getVue() {
    return this.vue
  }
}

export default new AppUtil()
