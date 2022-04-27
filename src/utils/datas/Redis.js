import StorageUtil from '@/utils/StorageUtil'
import Datas from '@/utils/datas/Datas'
import {v4 as uuidv4} from 'uuid'

class Redis {
  constructor() {
  }

  delHistory(id) {
    StorageUtil.delete(Datas.basicSetting.getConfigPath() + '/redis-cmd-history', id)
  }

  updateHistory(obj) {
    StorageUtil.save(Datas.basicSetting.getConfigPath() + '/redis-cmd-history', obj.id, obj)
  }

  getHistory(id) {
    return StorageUtil.load(Datas.basicSetting.getConfigPath() + '/redis-cmd-history', id)
  }

  addRedis(obj) {
    obj = {...obj}
    obj.id = uuidv4()
    StorageUtil.save(Datas.basicSetting.getConfigPath() + '/redis', obj.id, obj)
  }

  updateRedis(obj) {
    StorageUtil.save(Datas.basicSetting.getConfigPath() + '/redis', obj.id, obj)
  }

  delRedis(id) {
    StorageUtil.delete(Datas.basicSetting.getConfigPath() + '/redis', id)
  }

  listRedis() {
    const ids = StorageUtil.getFileNames(Datas.basicSetting.getConfigPath() + '/redis')
    const objs = []
    ids.forEach(id => {
      objs.push(StorageUtil.load(Datas.basicSetting.getConfigPath() + '/redis', id))
    })
    return Datas.sortObjects(objs)
  }
}

export default new Redis()
