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
  data() {
    return {
      MAP_CONTAINER_NAME: 'monitormap',
      mapService: null,
      mapid: xdata.metaStore.getDefaultMapID()
    }
  },
  mounted() {
      this.mapService = new OlMapService(this.mapType)
      this.mapService.loadMap(this.MAP_CONTAINER_NAME, this.mapid, this.map, this.mapRow)
  },
  computed:
    mapState({
        map: state => state.storeMap.map, 
        mapRow : state => state.storeMap.mapRow
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
