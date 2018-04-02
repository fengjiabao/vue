export default {
    state: {
      metaStore : ''
    },
    mutations: {
      saveMetaData (state, val) { // 可传参，第二个为可传参数
        console.log('val-----------------',val)
        state.metaStore = val
      }
    }
  }
  