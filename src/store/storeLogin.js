export default {
    state : {
        showTips: false
    },
    mutations: {
        hide (state) {//可传参，第二个为可传参数
            state.showTips = false
        },
        show (state) {
            state.showTips = true
        }
    }
}