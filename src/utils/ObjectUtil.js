/**
 * utils for object
 */
class ObjectUtil {
  constructor() {

  }

  /**
   * deep clone object
   */
  cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj))
  }
}

export default new ObjectUtil()

