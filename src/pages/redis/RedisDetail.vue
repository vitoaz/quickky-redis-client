<!-- redis detail -->
<template>
  <div style="height: 100%; position: relative">
    <!-- connecting -->
    <div v-if="state==='connecting'"
         v-loading="true"
         style="height: 100%"
         :element-loading-text="$t('tip.connecting') + '...'"
    />
    <!-- fail -->
    <div v-else-if="state==='fail'">
      <el-result icon="warning" :title="$t('tip.connectFail')" sub-title="">
        <template slot="extra">
          <el-button type="primary" size="medium" @click="connect">{{ $t('opt.retry') }}</el-button>
        </template>
      </el-result>
    </div>
    <!-- connected -->
    <div v-else style="height: 100%">
      <el-container style="height: 100%">
        <el-aside width="100px" class="menu">
          <el-menu style="height: 100%" :default-active="menuIndex" @select="menuOpen">
            <el-menu-item index="overview">{{ $t('title.overview') }}</el-menu-item>
            <el-menu-item index="browse">{{ $t('title.browse') }}</el-menu-item>
            <el-menu-item index="cli">{{ $t('title.cli') }}</el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <transition name="fade">
            <redis-cli :showed="menuIndex==='cli'" v-show="menuIndex==='cli'" :redis="redis" :reconnect="connect"/>
          </transition>
          <transition name="fade">
            <redis-brwose v-show="menuIndex==='browse'" :redis="redis" :reconnect="connect"/>
          </transition>
          <transition name="fade">
            <redis-overview v-show="menuIndex==='overview'" :redis="redis" :reconnect="connect"/>
          </transition>
        </el-main>
      </el-container>
    </div>

  </div>
</template>
<script>

import RedisUtil from '@/utils/RedisUtil'
import RedisCli from '@/pages/redis/RedisCli'
import RedisOverview from '@/pages/redis/RedisOverview'
import RedisBrwose from '@/pages/redis/RedisBrowse'

let g_redis_flag = 0

export default {
  name: 'RedisDetail',
  components: {RedisBrwose, RedisOverview, RedisCli},

  props: {
    option: {
      type: Object,
      default() {
        return null
      }
    }
  },

  data() {
    return {
      menuIndex: 'browse',
      redis: null,
      state: 'connecting'
    }
  },

  watch: {
    option() {
      this.connect()
    }
  },

  created() {
    this.connect()
  },

  methods: {
    /**
     * connect redis
     */
    async connect() {
      if (this.redis) {
        await RedisUtil.disconnect(this.redis)
        this.redis = null
      }
      g_redis_flag++
      const redisFlag = g_redis_flag
      try {
        this.state = 'connecting'
        const redis = await RedisUtil.connect(this.option)
        if (redisFlag !== g_redis_flag) {
          await RedisUtil.disconnect(redis)
          return
        }
        this.redis = redis
        this.state = 'connected'
      } catch (e) {
        if (redisFlag !== g_redis_flag) {
          return
        }
        this.$message.error(e.message)
        this.state = 'fail'
      }
    },

    menuOpen(index) {
      this.menuIndex = index
    }
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .1s
}

.fade-enter, .fade-leave-to {
  opacity: 0
}
</style>
