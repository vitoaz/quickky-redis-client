/**
 * utils for ui view
 */
class ObjectUtil {
  constructor() {
    this.selectFileInputElement = null
  }

  /**
   * toggle element class
   */
  toggleClass(element, className) {
    if (!element || !className) {
      return
    }
    let classString = element.className
    const nameIndex = classString.indexOf(className)
    if (nameIndex === -1) {
      classString += '' + className
    } else {
      classString =
        classString.substr(0, nameIndex) +
        classString.substr(nameIndex + className.length)
    }
    element.className = classString
  }

  /**
   * check the element if has the class
   */
  hasClass(element, cls) {
    return !!element.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
  }

  /**
   * add class to the element
   */
  addClass(element, cls) {
    if (!this.hasClass(element, cls)) element.className += ' ' + cls
  }

  /**
   * remove class from the element
   */
  removeClass(ele, cls) {
    if (this.hasClass(ele, cls)) {
      const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
      ele.className = ele.className.replace(reg, ' ')
    }
  }

  /**
   * copy the text to clipboard
   */
  async copyToClipboard(text, event) {
    const Clipboard = require('clipboard')

    return new Promise((resolve, reject) => {
      const clipboard = new Clipboard(event.target, {
        text: () => text
      })
      clipboard.on('success', () => {
        resolve()
        clipboard.destroy()
      })
      clipboard.on('error', () => {
        reject()
        clipboard.destroy()
      })
      clipboard.onClick(event)
    })
  }

  /**
   * show select file dialog
   * @param options
   */
  selectFile(options) {
    return new Promise((resolve, reject) => {
      if (!options) {
        options = {}
      }
      const inputElement = document.createElement('input')
      inputElement.setAttribute('id', '_ef')
      inputElement.setAttribute('type', 'file')
      inputElement.setAttribute('style', 'display:none')
      if (options.accept) {
        inputElement.setAttribute('accept', options.accept)
      }
      if (options.type && options.type === 'dir') {
        inputElement.setAttribute('webkitdirectory', '')
        inputElement.setAttribute('directory', '')
      }
      document.body.appendChild(inputElement)
      window.addEventListener('focus', () => {
        let loopCnt = 0
        const loop = () => {
          if (inputElement.value !== '') {
            resolve(inputElement.files)
          } else if (loopCnt++ > 20) {
            reject(new Error('cancel'))
          } else {
            setTimeout(loop, 10)
          }
        }
        loop()
      }, {once: true})
      inputElement.click()
    })
  }

  pageX(element) {
    return element.offsetParent ? element.offsetLeft + this.pageX(element.offsetParent) : element.offsetLeft
  }

  pageY(element) {
    return element.offsetParent ? element.offsetTop + this.pageY(element.offsetParent) : element.offsetTop
  }
}

export default new ObjectUtil()

