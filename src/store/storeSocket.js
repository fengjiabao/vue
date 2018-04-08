export default {
  state: {
    sock: {}
  },
  mutations: {
    saveSocket (state, val) { 
      console.log('val-------------',val)
      // state.sock = eval(val)
      state.sock = val
    }
  },
  actions: {
    saveSocketAsync({ commit, state }, val) {
      commit('saveSocket',val)
    }
  }
}
