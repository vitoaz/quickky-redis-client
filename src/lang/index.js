import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCN from './zh-cn'
import enUS from './en-us'
import eleZhCN from 'element-ui/lib/locale/lang/zh-CN'
import eleEnUS from 'element-ui/lib/locale/lang/en'
import AppUtil from '@/utils/AppUtil'
import {app} from '@electron/remote'

Vue.use(VueI18n)

let locale = AppUtil.loadValue('lang')
// fallback to system language
if (!locale) {
  if (app.getLocale() === 'zh-CN') {
    locale = 'zh-CN'
  } else {
    locale = 'en-US'
  }
}
AppUtil.log.info('LANG', 'locale=' + locale)

export const i18n = new VueI18n({
  locale: locale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {...zhCN, ...eleZhCN},
    'en-US': {...enUS, ...eleEnUS}
  },
  silentTranslationWarn: process.NODE_ENV === 'production'
})

export function setLang(lang) {
  AppUtil.saveValue('lang', lang)
  i18n.locale = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}
