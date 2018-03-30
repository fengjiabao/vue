import { DEFAULT_MAP_ID,ZOOM_LEVEL } from '../def/map_def.js'

export default class MapStore {
  constructor (gstore) {
    this.gisMap = new Map()
    this.maps = new Map() // 默认地图
    this.mapData = []
    this.defaultMapData = null
    this.registerGlobalEventHandlers()
  }
  registerGlobalEventHandlers () {
    eventBus.$on('SAVE-GIS-MAP', (rows) => {
      if (!rows) return
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i]
        this.gisMap.set(row.map_id, row)
        this.defaultMap(row) 
        if(row.default_map === '是'){
          this.defaultMapData = row
        }
      }
      // this.defaultMapData = this.getDefaultMap(rows)
      if (!this.defaultMapData) {//没有默认字段填写时，为第一张地图
        this.defaultMapData = rows[0]
      }
      this.defaultMapData && this.storeDefaultMap(this.defaultMapData)
    })
  }

  defaultMap (row) {
    let tiled = Number(row.judge_id) === 0 ? 'false' : true
    let params = {
      'LAYERS': row.layers,
      'TILED': tiled
    }
    let center = [Number(row.x), Number(row.y)]
    let size = [Number(row.width), Number(row.height)]
    let defaultMap = {
      id: row.map_id,
      type: row.map_type,
      tileWmsOpts: {
        url: row.url,
        params: params,
        serverType: 'geoserver'
      },
      viewOpts: {
        center: center,
        size: size,
        zoom: ZOOM_LEVEL.SMALL,  // default zoom
        maxZoom: ZOOM_LEVEL.MAX,
        minZoom: ZOOM_LEVEL.MIN
      }
    }
    this.maps.set(defaultMap.id, defaultMap)
    this.mapData.push(defaultMap)
  }

  storeDefaultMap (defaultMapData) {
    let localMap = window.localStorage.getItem('map')
    let localMapRow = window.localStorage.getItem('maprow')
    let mapData = this.maps.get(defaultMapData.map_id)
    let map = this.maps.values() ? mapData : null
    if (!localMap && !localMapRow) {//若第一次没local缓存，待数据存储成功再次加载map
      eventBus.$emit('MAP-OPEN-MONITOR', {
        id: xdata.metaStore.getDefaultMapID(),
        map: map,
        row: defaultMapData
      })
    }
    let storeMap = JSON.stringify(mapData)
    let storeMapRow = JSON.stringify(defaultMapData)
    window.localStorage.setItem('map', storeMap)
    window.localStorage.setItem('maprow', storeMapRow)
  }
}
