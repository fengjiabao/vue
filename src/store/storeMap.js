export default {
    state: {
      mapStore: '',
      mapRow: '',
      map: '',
    },
    mutations: {
      saveMapData (state, val) { // 可传参，第二个为可传参数
        state.map = val.map
        state.mapRow = val.mapRow
      }
    }
  }
  