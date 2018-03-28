export default {
  state: {
    metaData: ''
  },
  mutations: {
    setMetaData (state, val) { // 可传参，第二个为可传参数
      state.metaData = val
    }
  }
}
