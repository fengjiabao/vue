<template>
    <!-- <div>{{ $route.params.id }}</div> -->
    <!--//匹配到一个路由时，参数值会被设置到 this.$route.params，可以在每个组件内使用-->
    <div class="monitor-root">
      <monitor-header></monitor-header>
      <monitor-general v-on:showDetail="showDetail"></monitor-general>
      <monitor-detail v-if="showSumDetail"></monitor-detail>
      <div v-bind:id='MAP_CONTAINER_NAME' class="whfill"></div>
      <div class="switch-tools" @click="showTool"><img src='static/img/tools.png'/></div>
      <switch-tools v-if="showTools"></switch-tools>
    </div>
</template>
    
<script>
import monitorHeader from './header'
import monitorGeneral from './general'
import monitorDetail from './detail'
import switchTools from './tools'
import { DEFAULT_MAP_ID } from '../../def/map_def.js'
import OlMapService from '../../service/OlMapService.js'
import {mapState} from 'vuex'
export default {
  name: 'Monitor',
  data () {
    return {
      // MAP_CONTAINER_NAME: 'monitormap',
      mapService: null,
      mapid: xdata.metaStore.getDefaultMapID(),
      showSumDetail: false,
      showTools: false
    }
  },
  created () {
    this.MAP_CONTAINER_NAME = 'monitormap'//Hook Function,make sure have ele before loadMap
  },
  components: {
    monitorHeader,
    monitorGeneral,
    monitorDetail,
    switchTools
  },
  mounted () {
    this.mapService = new OlMapService(this.mapType)
    this.mapService.loadMap(this.MAP_CONTAINER_NAME, this.mapid, this.map, this.mapRow)
  },
  computed: mapState({
    map: state => state.storeMap.map,
    mapRow: state => state.storeMap.mapRow
  }),
  methods: {
    showDetail: function (msg) { // send by child component, we can also put it to store
      this.showSumDetail = true
    },
    showTool: function (params) {
      this.showTools = true
    }
  }
}
</script>
    
<style scoped lang="less">
.monitor-root {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 90%;
  position: relative;
  background: url(../../../static/img/mapBg.png) center center;
  .switch-tools{
    position: absolute;
    bottom: 5%;
    left: 5%;
    img{
      width: .35rem;
    }
  }
}
</style>
