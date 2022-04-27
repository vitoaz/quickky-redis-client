/**
 * utils for value caculate
 */
class ValueUtil {
  constructor() {

  }

  padZero(str, n) {
    str += ''
    const diff = n - str.length
    if (diff <= 0) {
      return str
    }
    for (let i = 0; i < diff; i++) {
      str = '0' + str
    }
    return str
  }

  tsToString(ts) {
    const d = new Date(Number.parseInt(ts))
    return `${d.getFullYear()}` +
      `-${this.padZero(d.getMonth() + 1, 2)}` +
      `-${this.padZero(d.getDate(), 2)} ` +
      `${this.padZero(d.getHours(), 2)}` +
      `:${this.padZero(d.getMinutes(), 2)}` +
      `:${this.padZero(d.getSeconds(), 2)}`
  }
}

export default new ValueUtil()

