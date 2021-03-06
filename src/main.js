// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/storeIndex'
import DataStore from './datastore/DataStore.js'


Vue.config.productionTip = false
window.eventBus = new Vue()
window.xdata = new DataStore(store)
eventBus.$emit('OPEN-LOCAL-DB')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})


