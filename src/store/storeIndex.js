import Vue from 'vue'
import Vuex from 'vuex'
import storeLogin from './storeLogin'
import storeSocket from './storeSocket'
import storeMap from './storeMap'
import storeMeta from './storeMeta'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production', // 在非生产环境下，使用严格模式
  modules: {
    storeLogin,
    storeSocket,
    storeMap,
    storeMeta
  }
})
