<!-- redis cli -->
<template>
  <div style="height: 100%; position: relative">
    <pre ref="logBox" class="log-box">{{ log }}</pre>
    <el-select class="cmd-history" :placeholder="$t('title.historyCmd')" value="" @change="selHistory">
      <el-option v-for="(item,i) in historyReverse"
                 :key="i"
                 :label="item"
                 :value="i">
      </el-option>
    </el-select>
    <el-input v-model="cmd"
              class="cmd-input"
              :placeholder="$t('tip.redisCmd')"
              @keyup.native.stop.up="up"
              @keyup.native.stop.down="down"
              @keyup.native.stop.enter="enter">
      <el-button slot="append"
                 style="margin-top: -10px;font-size: 18px"
                 type="primary"
                 @click="enter">
        {{ $t('opt.send') }}
      </el-button>
    </el-input>
  </div>
</template>
<script>

import RedisUtil from '@/utils/RedisUtil'
import Datas from '@/utils/datas/Datas'

export default {
  name: 'RedisCli',
  components: {},

  props: {
    redis: {
      type: Object,
      default() {
        return null
      }
    }
  },

  data() {
    return {
      sending: false,
      log: '',
      cmd: '',
      historyIndex: 0,
      history: [],
      historyReverse: []
    }
  },

  created() {
    this.loadData()
  },

  methods: {
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

    appendLog(text) {
      this.log += text + '\r\n'
      // scroll to bottom
      this.$nextTick(() => {
        this.$refs.logBox.scrollTop = this.$refs.logBox.scrollHeight
      })
    },

    async sendCmd(cmd) {
      if (this.sending) {
        return
      }
      try {
        this.sending = true

        this.appendLog(`>>  ${cmd}`)
        const res = await RedisUtil.exec(this.redis, cmd)
        this.appendLog(`<<  ${res}`)

        // add to history
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
      } catch (e) {
        this.appendLog(`<<  ${e.message}`)
      }
      this.sending = false
    },

    async enter() {
      if (this.cmd.trim() !== '') {
        await this.sendCmd(this.cmd.trim())
      }
    },

    up() {
      // if (this.historyIndex > 0) {
      //   this.historyIndex--
      //   this.cmd = this.history[this.historyIndex]
      // }
    },

    down() {
      // if (this.historyIndex < this.history.length - 1) {
      //   this.historyIndex++
      //   this.cmd = this.history[this.historyIndex]
      // }
    },

    selHistory(i) {
      this.historyIndex = i
      this.cmd = this.history[i]
    }
  }
}
</script>

<style lang="scss" scoped>

.log-box {
  border: 1px solid #eee;
  height: calc(100% - 50px);
  margin-bottom: 5px;
  overflow: auto;
}

.cmd-history {
  width: 120px;
  float: left;
}

.cmd-input {
  float: left;
  width: calc(100% - 120px);
  border-left: none;

  .el-input__inner {
    border-left: none !important;
  }
}

</style>
