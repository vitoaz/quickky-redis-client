<template>
  <el-container style="height: 100%;background: #eee">
    <el-header class="header">
      <div class="title">
        <span style="cursor: pointer" @click="jumpGithub">QuickkyRedisClient</span>
      </div>
    </el-header>
    <el-container>
      <!--left menu-->
      <el-aside class="left-menu" width="120px">
        <el-menu router
                 :default-active="leftActiveMenu"
                 @open="leftOpen"
        >
          <el-menu-item v-for="m in leftMenus" :key="m.path" :index="m.path">
            <i style="vertical-align: top; margin-top: 22px" :class="m.icon"></i>
            <span>{{ m.name }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main class="main">
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>

export default {
  name: 'Layout',

  data() {
    return {
      leftActive: '',
      leftMenus: [
        {
          name: 'Redis',
          path: '/redis',
          icon: 'el-icon-postcard'
        },
        {
          name: this.$t('title.setting'),
          path: '/setting',
          icon: 'el-icon-setting'
        }
      ]
    }
  },

  computed: {
    leftActiveMenu() {
      console.log(this.$route.path)
      return this.$route.path
    }
  },
  methods: {
    leftOpen(key, path) {
      console.log(key)
      if (path) {
        this.$router.push(path)
      }
    },

    jumpGithub() {
      const {shell} = require('electron')
      shell.openExternal('https://github.com/vitoaz/quickky-redis-client')
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  height: 40px !important;
  background: #fff;
  margin-bottom: 1px;

  .title {
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
    height: 40px;
    vertical-align: center;
    line-height: 40px;
  }
}

.left-menu {
  border: none;
  background: #fff;

  .el-menu {
    border: none;
  }
}

.main {
  margin-left: 1px;
  background: #eee;
  padding: 0px 0px;
}
</style>
