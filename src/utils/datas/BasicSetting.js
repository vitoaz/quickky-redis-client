import AppUtil from '@/utils/AppUtil'
import StorageUtil from '@/utils/StorageUtil'
import Path from 'path'

class BasicSetting {
  constructor() {
    this.configPath = ''
    this.basicSetting = {}
    this.load()
  }

  load() {
    const basicSetting = StorageUtil.load(AppUtil.getUserDataPath(), 'setting')
    // set default configPath
    if (!basicSetting.configPath) {
      basicSetting.configPath = Path.join(AppUtil.getUserDataPath(), '/config').toString()
    }
    this.basicSetting = basicSetting
  }

  save() {
    StorageUtil.save(AppUtil.getUserDataPath(), 'setting', this.basicSetting)
  }

  getConfigPath() {
    return this.basicSetting.configPath
  }

  updateConfigPath(configPath) {
    this.basicSetting.configPath = configPath
    this.save()
  }
}

export default new BasicSetting()
