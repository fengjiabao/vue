<template>
    <!-- <div>{{ $route.params.id }}</div> -->
    <!--//匹配到一个路由时，参数值会被设置到 this.$route.params，可以在每个组件内使用-->
    <div v-bind:id='MAP_CONTAINER_NAME' class="monitor-root"></div>
</template>
    
<script>
import { DEFAULT_MAP_ID } from '../../def/map_def.js'
import OlMapService from '../../service/OlMapService.js'
import {mapState} from 'vuex'
export default {
  name: 'Monitor',
  data () {
    return {
      // MAP_CONTAINER_NAME: 'monitormap',
      mapService: null,
      mapid: xdata.metaStore.getDefaultMapID()
    }
  },
  created () {
    this.MAP_CONTAINER_NAME = 'monitormap'// 钩子函数，确保加载地图时有元素
      // this.mapid = xdata.metaStore.getDefaultMapID()
    console.log('store', this.$store)
    console.log('xdata', xdata)
    console.log('xdata------', window.xdata)
  },
  mounted () {
    this.mapService = new OlMapService(this.mapType)
    this.mapService.loadMap(this.MAP_CONTAINER_NAME, this.mapid, this.map, this.mapRow)
  },
  computed:
    mapState({
      map: state => state.storeMap.map,
      mapRow: state => state.storeMap.mapRow
    })
}
</script>
    
<style scoped lang="less">
.monitor-root {
  width: 100%;
  height: 90%;
  background: url(../../../static/img/mapBg.png) center center
}
</style>
