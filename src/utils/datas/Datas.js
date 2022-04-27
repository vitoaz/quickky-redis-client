import BasicSetting from './BasicSetting'
import Redis from './Redis'

class Datas {
  constructor() {
    this.basicSetting = BasicSetting
    this.redis = Redis
  }

  sortObjects(objs) {
    return objs.sort((a, b) => {
      const asort = a.sort ? a.sort : -1
      const asortTime = a.sortUpdateTime ? a.sortUpdateTime : -1
      const bsort = b.sort ? b.sort : -1
      const bsortTime = b.sortUpdateTime ? b.sortUpdateTime : -1
      if (asort !== bsort) {
        return asort > bsort ? -1 : 1
      } else {
        return asortTime > bsortTime ? 1 : -1
      }
    })
  }
}

export default new Datas()
