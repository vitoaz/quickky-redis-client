import Vue from 'vue'
import VueElectron from 'vue-electron'
import App from './App'
import router from './router'
import store from './store'
import AppUtil from '@/utils/AppUtil'
// element-ui
import ElementUI from 'element-ui'
import '@/scss/element.scss'
// css & scss
import 'normalize.css/normalize.css'
import '@/scss/common.scss'
// lang
import {i18n} from '@/lang'

Vue.config.productionTip = false
if (!process.env.IS_WEB) {
  Vue.use(VueElectron)
}
Vue.use(ElementUI, {
  size: 'medium',
  i18n: (key, value) => i18n.t(key, value)
})

const vue = new Vue({
  components: {App},
  router,
  store,
  i18n,
  template: '<App/>'
})

AppUtil.init(vue)
vue.$mount('#app')
