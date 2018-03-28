export default {
    state : {
        showTips: false
    },
    mutations: {
        hide (state) {
            state.showTips = false
        },
        show (state) {
            state.showTips = true
        }
    }
}