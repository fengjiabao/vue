<template>
    <section class="monitor-general">
        <div>
           <span><img class="vehicle-img" src='static/img/vehicle.png'/></span>
           <span @click="showDetail" data-type="VEHICLE">{{vehicleSum}}</span>
        </div>
        <div>
           <span><img src='static/img/staff.png'/></span>
           <span @click="showDetail" data-type="STAFF">{{staffSum}}</span>
        </div>
    </section>
</template>

<script>
import {mapState} from 'vuex'
export default {
  data () {
    return {
    }
  },
  computed: mapState({
    vehicleSum: state => state.storeCard.overview.vehicle,
    staffSum: state => state.storeCard.overview.staff
  }),
  methods: {
    showDetail: function (event) {
      let type = event.target.getAttribute('data-type')
      this.$emit('showDetail', type)// 向父组件通信
    }
  }
}
</script>

<style scoped lang="less">
    .monitor-general{
        position: absolute;
        height: 0.4rem;
        width: 90%;
        top: 10%;
        z-index: 9;
        display: flex;
        justify-content: space-between;
        div{
            width: 45%;
            height: 100%;
            background: #fff;
            position: relative;
            display: flex;
            justify-content: flex-end;
            span:nth-child(1){
                display: inline-block;
                width: 60px;
                height: 0;
                border-top: .4rem #09F solid;
                border-bottom: none;
                border-left: none;
                border-right: transparent 30px solid;
                border-top-left-radius: 5px;
                position: absolute;
                left: 0;
                img{
                    width: 70%;
                    top: -0.38rem;
                    left: .1rem;
                    position: absolute;
                    &.vehicle-img{
                        width: 90%;
                        top: -0.43rem;
                    }
                }
            }
            span:nth-child(2){
                width: .5rem;
                line-height: .4rem;
                font-size: .3rem;
                color: #09F;
            }
        }
    }
</style>