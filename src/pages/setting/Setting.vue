<template>
  <div style="height: 100%; background: #fff; padding: 5px">
    <el-form label-position="left">
      <el-form-item :label="$t('title.configPath') + ':'">
        <span style="margin-right: 20px">{{ configPath }}</span>
        <el-button @click="changeConfigPath">{{ $t('opt.change') }}</el-button>
      </el-form-item>
      <el-form-item :label="$t('title.language') + ':'">
        <el-select v-model="lang" @change="setLang">
          <el-option v-for="(item,i) in langOptions"
                     :key="i"
                     :label="item.name"
                     :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

import Datas from '@/utils/datas/Datas'
import ViewUtil from '@/utils/ViewUtil'
import {i18n, setLang} from '@/lang'

export default {
  name: 'Setting',

  data() {
    return {
      configPath: '',
      lang: i18n.locale,
      langOptions: [
        {
          name: '中文简体',
          value: 'zh-CN'
        },
        {
          name: 'English',
          value: 'en-US'
        }
      ]
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    loadData() {
      this.configPath = Datas.basicSetting.getConfigPath()
    },

    async changeConfigPath() {
      try {
        const files = await ViewUtil.selectFile({type: 'dir'})
        const path = files[0].path
        this.configPath = path
        Datas.basicSetting.updateConfigPath(path)
      } catch (ignored) {
        console.log('cancel')
      }
    },

    setLang(value) {
      setLang(value)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
