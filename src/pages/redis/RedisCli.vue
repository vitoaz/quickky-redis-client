<!-- redis cli -->
<template>
  <div style="height: 100%; position: relative">
    <div class="redis-term">
      <div ref="redisTerm" style="width: 100%; height: 100%; display: block"></div>
    </div>
    <div>
      <el-select class="cmd-history" :placeholder="$t('title.historyCmd')" value="" @change="selHistory">
        <el-option v-for="(item,i) in historyReverse"
                   :key="i"
                   :label="item"
                   :value="i">
        </el-option>
      </el-select>
      <el-input v-model="cmd"
                class="cmd-input"
                type="textarea"
                :placeholder="$t('tip.redisCmd')">
      </el-input>
      <el-button
          class="send-btn"
          type="primary"
          @click="enter">
        {{ $t('opt.send') }}
      </el-button>
    </div>
  </div>
</template>
<script>

import RedisUtil from '@/utils/RedisUtil'
import Datas from '@/utils/datas/Datas'
import {Terminal} from 'xterm'
import {FitAddon} from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

export default {
  name: 'RedisCli',
  components: {},

  props: {
    redis: {
      type: Object,
      default() {
        return null
      }
    },
    showed: {
      type: Boolean,
      default: false
    }
  },

  watch: {
    showed(val) {
      if (val && !this.term) {
        this.initTerm()
      } else if (this.term) {
        this.term.focus()
      }
    }
  },

  data() {
    return {
      sending: false,
      shellContent: '',
      shellCmd: '',
      cmd: '',
      historyIndex: 0,
      history: [],
      term: null,
      fitaddon: null,
      historyReverse: []
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    initTerm() {
      this.term = new Terminal({
        fontSize: 14,
        cursorBlink: true,
        disableStdin: false,
        logLevel: 'debug',
        scrollback: 9999,
        scrollOnUserInput: true,
        rows: 1,
        cols: 1,
        convertEol: true,
        theme: {
          foreground: '#ddd',
          background: '#333',
          lineHeight: 16
        }
      })
      this.term.open(this.$refs.redisTerm)
      this.fitAddon = new FitAddon()
      this.term.loadAddon(this.fitAddon)
      this.term.onKey(this.termKey)
      this.term.onData(this.termData)
      this.termPrompt()
      setTimeout(() => {
        this.fitAddon.fit()
        this.term.focus()
      }, 30)
    },

    /**
     * load data
     */
    loadData() {
      const historyObj = Datas.redis.getHistory(this.redis.option.id)
      if (historyObj.cmds) {
        this.history = historyObj.cmds
        this.historyReverse = this.history.reverse()
        this.historyIndex = this.history.length - 1
      }
    },

    termWrite(text) {
      this.term.write(text)
    },

    termWriteLine(text) {
      this.termWrite(text + '\r\n')
    },

    termPrompt() {
      this.termWrite('#')
    },

    addHis(cmd) {
      let needAddHistory = true
      if (this.history.length > 0) {
        if (cmd === this.history[this.history.length - 1]) {
          needAddHistory = false
        }
      }
      if (needAddHistory) {
        this.history.push(cmd)
        if (this.history.length > 100) {
          this.history = this.history.splice(0, 1)
        }
        this.historyIndex = this.history.length - 1
        Datas.redis.updateHistory({id: this.redis.option.id, cmds: this.history})
        this.historyReverse = this.history.reverse()
      }
    },

    async execCmd(cmd, needHis) {
      try {
        const res = await RedisUtil.exec(this.redis, cmd)
        this.termWriteLine(`${res}`)
        if (needHis) {
          this.addHis(cmd)
        }
      } catch (e) {
        this.termWriteLine(`${e.message}`)
      }
      this.termPrompt()
    },

    async sendCmd(cmd) {
      this.addHis(cmd)
      // multi lines
      const lines = cmd.trim().split('\n')
      for (const line of lines) {
        this.termWriteLine(line)
        await this.execCmd(line, false)
      }
    },

    async enter() {
      if (this.cmd.trim() !== '') {
        await this.sendCmd(this.cmd.trim())
      }
    },

    termData(data) {
      // ctrl symbol
      if (data.charCodeAt(0) < 32) {
        return
      }
      this.term.write(data)
    },

    termKey(e) {
      const y = this.term.buffer.active.baseY + this.term.buffer.active.cursorY
      const x = this.term.buffer.active.cursorX
      const code = e.domEvent.which
      console.log(e.key)
      if (code === 13) {
        // enter
        console.log(`y=${y}`)
        this.shellCmd = ''
        const cmd = this.term._core.buffer.lines.get(y).translateToString(true, 0, x).substring(0).substring(1)
        this.termWriteLine('')
        if (cmd.length > 0) {
          this.execCmd(cmd, true)
        } else {
          this.termPrompt()
        }
      } else if (code === 8) {
        // backspace
        if (x > 1) {
          this.term.write('\b \b')
        }
      } else if (code === 38) {
        // up
      } else if (code === 40) {
        // down
      } else if (code === 39) {
        // right
        if (this.term._core.buffer.lines.get(y).hasContent(x)) {
          this.term.write(e.key)
        }
      } else if (code === 37) {
        // left
        if (x > 1) {
          this.term.write(e.key)
        }
      }
    },

    selHistory(i) {
      this.historyIndex = i
      this.cmd = this.history[i]
    }
  }
}
</script>

<style lang="scss">
.cmd-history {
  .el-input__inner {
    height: 54px;
  }
}
</style>

<style lang="scss" scoped>

.redis-term {
  border: 1px solid #eee;
  height: calc(100% - 50px);
  margin-bottom: 5px;
  overflow: hidden;
}

.cmd-history {
  width: 120px;
  float: left;
}

.cmd-input {
  float: left;
  width: calc(100% - 240px);
  border-left: none;

  .el-input__inner {
    border-left: none !important;
  }
}

.send-btn {
  font-size: 16px;
  width: 120px;
  height: 54px;
}

</style>
