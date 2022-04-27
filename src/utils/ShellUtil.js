import AppUtil from '@/utils/AppUtil'

const LOG_TAG = 'ShellUtil'

/**
 * utils for shell exec
 */
class ShellUtil {
  constructor() {

  }

  exec(cmd, dir) {
    return new Promise((resolve) => {
      const exec = require('child_process').exec
      let stdout = ''
      let ret = ''
      let execError = false
      let errorMsg = ''
      AppUtil.log.info(LOG_TAG, `exec ${cmd}`)

      let execRet
      try {
        // noinspection JSCheckFunctionSignatures
        execRet = exec('CALL ' + cmd, {cwd: dir})
      } catch (e) {
        errorMsg = `exec ${cmd} fail, error=${e.message}`
        execError = true
        AppUtil.log.error(LOG_TAG, errorMsg)
      }
      execRet.stdout.on('data', data => {
        stdout += data
      })
      execRet.on('close', (code) => {
        ret = code
        resolve({
          ret: ret,
          stdout: stdout,
          execError: execError,
          execErrorMsg: errorMsg
        })
      })
    })
  }
}

export default new ShellUtil()

