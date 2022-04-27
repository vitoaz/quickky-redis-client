<!-- redis browse -->
<template>
  <div style="height: 100%; position: relative">
    <el-input maxlength="100" v-model="pattern" class="cmd-input" placeholder="pattern">
      <el-button slot="append"
                 style="margin-top: -8px;font-size: 14px"
                 type="primary"
                 @click="loadData()">
        {{ $t('opt.search') }}
      </el-button>
    </el-input>
    <el-container style="height: calc(100% - 50px); margin-top: 10px">
      <el-aside width="200px" class="keys" v-loading="loading">
        <ul>
          <li v-for="k in keys"
              :key="k"
              class="g-text-overflow"
              @click="switchKey(k)">{{ k }}
          </li>
        </ul>
      </el-aside>
      <el-main class="key-box" v-loading="loadingKey">
        <el-descriptions :title="curKey" v-if="curKey">
          <el-descriptions-item label="Type">{{ curKeyInfo.type }}</el-descriptions-item>
          <el-descriptions-item label="Size">{{ curKeyInfo.size }}</el-descriptions-item>
          <el-descriptions-item label="TTL">{{ curKeyInfo.ttl }}</el-descriptions-item>
          <el-descriptions-item label="Value">
            <pre>{{ curKeyInfo.value }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </el-main>
    </el-container>
  </div>
</template>
<script>

import RedisUtil from '@/utils/RedisUtil'

export default {
  name: 'RedisBrwose',
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
      loading: false,
      loadingKey: false,
      keys: [],
      pattern: '*',
      curKey: null,
      curKeyInfo: {}
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    /**
     * load the view data
     */
    async loadData() {
      if (this.loading) {
        return
      }

      let pattern = this.pattern.trim()
      if (pattern.length === 0) {
        pattern = '*'
      }
      try {
        this.loading = true
        this.keys = []
        this.keys = await RedisUtil.keys(this.redis, pattern, 200)
      } catch (e) {
        this.$message.error(e.message())
      }
      this.loading = false
    },

    parseArr(arr, len) {
      const orilen = arr.length
      arr = arr.slice(0, len)
      const arr2 = []
      arr.forEach(a => {
        arr2.push(`"${a}"`)
      })

      let value = '[\n    ' + arr2.join(',\n    ')
      if (orilen > len) {
        value += ',\n    ...'
      }
      value += '\n]'
      return value
    },

    async switchKey(key) {
      if (this.loadingKey) {
        return
      }

      try {
        const type = await RedisUtil.exec(this.redis, 'type ' + key)
        const ttl = await RedisUtil.exec(this.redis, 'ttl ' + key)
        const size = await RedisUtil.exec(this.redis, 'memory usage ' + key)
        let value = ''

        switch (type) {
          case 'string': {
            value = await RedisUtil.exec(this.redis, 'get ' + key)
            break
          }

          case 'hash': {
            value = await RedisUtil.exec(this.redis, 'hgetall ' + key)
            break
          }

          case 'list': {
            const arr = await RedisUtil.exec(this.redis, `lrange ${key} 0 999`)
            value = this.parseArr(arr, 999)
            break
          }

          case 'set': {
            const arr = await RedisUtil.exec(this.redis, `smembers ${key}`)
            value = this.parseArr(arr, 999)
            break
          }

          case 'zset': {
            const arr = await RedisUtil.exec(this.redis, `zrevrange ${key} 0 999`)
            value = this.parseArr(arr, 999)
            break
          }

          default: {
            value = 'unsupport type'
          }
        }

        this.curKey = key
        this.curKeyInfo = {
          type: type,
          ttl: ttl,
          size: size,
          value: value
        }
      } catch (e) {
        this.$message.error(e.message)
      }
      this.loadingKey = false
    }
  }
}
</script>

<style lang="scss" scoped>

.keys {
  border: 1px solid #eee;

  li {
    width: 100%;
    cursor: pointer;
    padding: 5px;

    &:hover {
      background: #cdeec9;
    }
  }
}

.key-box {
  margin-left: 5px;
  border: 1px solid #eee;
  padding: 5px;
}

</style>
