import ol from 'openlayers'
import {convertSVGPath2Coord} from '../js/mapUtils.js'

const uncover = 1000
export default class AreaListStore {
  constructor (gstore) {
    this.gstore = gstore
    this.arealist = new Map()
    this.uncoverAreaList = new Map()
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    eventBus.$on('MAP-INIT-AREALIST', (rows) => {
      this.setAreaList(rows)
    })
  }

  setAreaList (rows) {
    // console.log(rows)
    if (!rows) return
    for (let area of rows) {
      if (area.path) {
        let coordinates = convertSVGPath2Coord(area.path)
        let polygon = new ol.geom.Polygon([coordinates])
        this.arealist.set(area.area_id, polygon)
        if (area.area_type_id === uncover) {
          this.uncoverAreaList.set(area.area_id, polygon)
        }
      }
    }
  }
}
