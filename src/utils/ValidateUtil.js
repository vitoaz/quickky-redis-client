import {i18n} from '@/lang'

class ValidateUtil {
  static that

  constructor() {
    ValidateUtil.that = this
  }

  isValidInteger(value, min, max) {
    const n = parseInt(value)
    if (!n) {
      return false
    }
    if (min && n < min) {
      return false
    } else if (max && n > max) {
      return false
    }
    return true
  }

  isValidPort(port) {
    return this.isValidInteger(port, 1, 65535)
  }

  isValidPortValidator(rule, value, callback) {
    if (!ValidateUtil.that.isValidPort(value)) {
      callback(i18n.t('tip.inputCorrectPort'))
    } else {
      callback()
    }
  }
}

export default new ValidateUtil()
