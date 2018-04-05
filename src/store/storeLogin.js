export default {
  state: {
    showTips: false,
    user: '',
    pwd: '',
  },
  mutations: {
    hide (state) { // 可传参，第二个为可传参数
      state.showTips = false
    },
    show (state) {
      state.showTips = true
    },
    saveLoginData(state,msg){
      state.user = msg.name
      state.pwd = msg.pwd
    }
  }
}
