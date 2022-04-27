import Vue from 'vue'
import Vuex from 'vuex'
import Test from '@/store/module/test'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    test: Test
  }
})

export default store
