export default {
    state: {
      overview : {vehicle: 0, staff: 0}
    },
    mutations: {
      updateOverViewV (state, val) {
        state.overview.vehicle = val.vehicleSum
      },
      updateOverViewS(state, val) { 
        state.overview.staff = val.staffSum
      }
    }
  }
  