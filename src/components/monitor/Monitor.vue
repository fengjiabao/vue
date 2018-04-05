<template>
    <!-- <div>{{ $route.params.id }}</div> -->
    <!--//匹配到一个路由时，参数值会被设置到 this.$route.params，可以在每个组件内使用-->
    <div class="monitor-root">
      <monitor-header></monitor-header>
      <monitor-general v-on:showDetail="showDetail"></monitor-general>
      <monitor-detail v-if="showSumDetail"></monitor-detail>
      <div v-bind:id='MAP_CONTAINER_NAME' class="whfill"></div>
    </div>
</template>
    
<script>
import monitorHeader from './header'
import monitorGeneral from './general'
import monitorDetail from './detail'
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
      showSumDetail: false
    }
  },
  created () {
    this.MAP_CONTAINER_NAME = 'monitormap'// 钩子函数，确保加载地图时有元素
  },
  components: {
    monitorHeader,
    monitorGeneral,
    monitorDetail
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
    showDetail: function (msg) { // 子组件向父组件传递过来的
      this.showSumDetail = true
      console.log('msg-----------', msg)
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
  background: url(../../../static/img/mapBg.png) center center
}
</style>
