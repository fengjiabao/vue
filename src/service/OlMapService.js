import ol from 'openlayers'
// import OlMapWorkspace from '../map/OlMapWorkspace.js'
import { DEAFULT_MAP_MATRIXID } from '../def/map_def.js'
// const areas = [28, 29]
const maxZoom = 18
const ROLEID = 1
const spliceLevel = 9
export default class OlMapService {
  /**
   * 初始化
   * @param {*} containerName 地图容器 element 的 id
   * @param {*} mapType 地图类型：MONITOR or HISTORY
   */
  constructor (mapType) {
    this.mapType = mapType

    this.mapID = -1
    this.map = null
    this.view = null
    this.workspace = null
  }

  loadMap (containerName, mapID, map, row) {
    let ret = null

    if (mapID === this.mapID && this.map) {
      console.log('Same mapID, NO need to load map again. mapID=', mapID)
      return ret
    }

    let container = document.querySelector('#' + containerName)
    if (!container) {
      console.warn('NO map container element in current document: ', containerName)
      return ret
    }
    // let mapDef = maps.get(mapID)
    let mapDef = map
    // let mapDef = xdata.mapStore.maps.get(mapID)
    if (!mapDef) {
      console.warn('NO map definition of the mapID : ', mapID)
      return ret
    }

    let chooseMap = xdata.mapStore.gisMap && xdata.mapStore.gisMap.get(mapID)
    let projExtent = ol.proj.get('EPSG:3857').getExtent()
    let startResolution = ol.extent.getWidth(projExtent) / 256
    let resolutions = new Array(22)

    for (var i = 0, len = resolutions.length; i < len; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i)
    }

    let extent = [2000, -1500, 12000, 4000] // 地图范围 默认高河地图范围
    if (row) {
      extent = [parseInt(row.minX), parseInt(row.minY), parseInt(row.maxX), parseInt(row.maxY)]
    } else if (chooseMap) {
      extent = [parseInt(chooseMap.minX), parseInt(chooseMap.minY), parseInt(chooseMap.maxX), parseInt(chooseMap.maxY)]
    }

    let tileGrid = new ol.tilegrid.TileGrid({
      extent: extent,
      resolutions: resolutions,
      tileSize: [512, 256]
    })

    let tileWmsOpts = mapDef.tileWmsOpts, wmsLayer
    tileWmsOpts.tileGrid = tileGrid
    let mapType = mapDef.type
    if(!mapDef.type){
      let str = mapDef.tileWmsOpts.url 
      mapType = mapDef.tileWmsOpts.url.includes('wms')
      mapType = mapType ? 'wms' : 'wmts'
    }
  
    chooseMap = { map_type: mapType }
    if (mapType === 'wmts') {
      chooseMap.url = tileWmsOpts.url
      chooseMap.layers = tileWmsOpts.params.LAYERS
      chooseMap.matrixId = DEAFULT_MAP_MATRIXID
    }
    
    if (chooseMap.map_type === 'wms') {
      wmsLayer = new ol.layer.Tile({
        source: new ol.source.TileWMS(tileWmsOpts)
      })
    } else if (chooseMap.map_type === 'wmts') {
      let matrixIds = [], resolution = []
      let startResolutions = ol.extent.getHeight(extent) / 256
      for (let i = 0; i <= spliceLevel; i++) {
        matrixIds[i] = chooseMap.matrixId + i
        resolution[i] = startResolutions / Math.pow(2, i)
      }
      let matrixSet = chooseMap.matrixId && chooseMap.matrixId.slice(0, chooseMap.matrixId.indexOf(':'))
      wmsLayer = new ol.layer.Tile({
        source: new ol.source.WMTS({
          url: chooseMap.url,
          layer: chooseMap.layers,
          tileGrid: new ol.tilegrid.WMTS({
            extent: extent,
            resolutions: resolution,
            matrixIds: matrixIds,
            tileSize: [256, 256]
          }),
          matrixSet: matrixSet,
          format: 'image/png',
          projection: 'EPSG:3857'
        })
      })
    } else {
      console.warn('unknow map type!')
    }

    if (containerName === 'monitormap') {
      window.wmsLayer = wmsLayer
    }

    let view = new ol.View(mapDef.viewOpts)
 
    let m = {
      layers: [wmsLayer],
      overlays: [], // overlays: [tooltips],
      target: containerName,
      view: view,
      controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
          collapsible: false
        })
      })
    }
    if (xdata.roleID === ROLEID) { // 设置拖拽权限 interactions无法set进去
      m.interactions = ol.interaction.defaults().extend([new app.Drag()])
    }
    let olmap = new ol.Map(m)

    let zoomslider = new ol.control.ZoomSlider()
    let ele = document.createElement('div')
    let img = document.createElement('img')
    img.src = '../img/north.png'
    ele.innerHTML = img
    document.querySelector('.ol-compass').innerText = ''
    let resetNorth = new ol.control.Rotate({
      autoHide: false,
      label: img
    })
    olmap.addControl(zoomslider)
    olmap.addControl(resetNorth)
    // save the default parameters of map
    this.initViewConfig = {
      zoom: view.getZoom(),
      center: view.getCenter(),
      rotation: view.getRotation()
    }

    // 设置鼠标在特定 feature 上的形状
    olmap.on('pointermove', function (e) {
      let pixel = olmap.getEventPixel(e.originalEvent)
      let hit = olmap.hasFeatureAtPixel(pixel)
      olmap.getTargetElement().style.cursor = hit ? 'pointer' : ''
    })

    this.workspace && this.workspace.destroy()
    this.workspace = new OlMapWorkspace(olmap, mapID, this.mapType)
    console.log(this.workspace)

    // save the object for later use
    this.mapID = mapID
    this.map = olmap
    this.view = view

    ret = olmap
    return ret
  }

  // 重新设置 Map
  reset () {
    this.resetOverlays()
    this.resetView()
  }

  resetWorkspace () {
    this.workspace = null
  }

  resetCardLayers () {
    if (this.workspace && this.workspace.cardLayer) {
      this.workspace.cardLayer.vehicleLayerSource && this.workspace.cardLayer.vehicleLayerSource.clear()
      this.workspace.cardLayer.staffLayerSource && this.workspace.cardLayer.staffLayerSource.clear()
    }
  }

  resetTrackLayers () {
    if (this.workspace && this.workspace.trackLayer) {
      this.workspace.trackLayer.layerSource && this.workspace.trackLayer.layerSource.clear()
    }
  }

  resetOverlays () {
    this.resetCardLayers()
    this.resetTrackLayers()

    this.map && this.map.getOverlays() && this.map.getOverlays().clear()
  }

  // reset view
  resetView () {
    if (this.view && this.initViewConfig) {
      this.view.setCenter(this.initViewConfig.center)
      this.view.setRotation(this.initViewConfig.rotation)
      this.view.setZoom(this.initViewConfig.zoom)
    }
  }
}
