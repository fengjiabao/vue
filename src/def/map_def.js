// TODO: Store these config info in the database
// 地图基本信息配置
// 默认地图编号
const DEFAULT_MAP_ID = 5

// 地图缩放级别定义
const ZOOM_LEVEL = {
  MIN: 13,
  SMALL: 16,  // default zoom level
  MIDDLE: 18,
  STAFFLEAVE: 21,
  MAX: 22
}
// const ZOOM_LEVEL = {
//   MIN: 0,
//   SMALL: 16,  // default zoom level
//   MIDDLE: 18,
//   STAFFLEAVE: 21,
//   MAX: 20
// }

const DEAFULT_MAP_MATRIXID = 'gaohemap:'
// let maps = new Map()

// let map1 = {
//   id: 5,
//   tileWmsOpts: {
//     url: 'http://local.beijingyongan.com:8091/geoserver/GeoHe/wms',
//     params: {'LAYERS': 'GeoHe:daohedaping2', 'TILED': true},
//     serverType: 'geoserver'
//   },
//   viewOpts: {
//     center: [4623, 0],
//     size: [55, 806],
//     zoom: ZOOM_LEVEL.SMALL,  // default zoom
//     maxZoom: ZOOM_LEVEL.MAX,
//     minZoom: ZOOM_LEVEL.MIN
//   }
// }
// maps.set(map1.id, map1)

export {DEFAULT_MAP_ID, ZOOM_LEVEL, DEAFULT_MAP_MATRIXID}
