import OlMapCardLayer from './OlMapCardLayer.js'
export default class OlMapWorkspace {
    constructor (map, mapID, mapType) {
      this.map = map
      this.mapID = mapID
      this.mapType = mapType

      this.cardLayer = null

      this.init()
    }

    init () {
      this.cardLayer = new OlMapCardLayer(this)
    }

    doAnimate (msg) {
      let duration = xdata.cardStore.averageUpdateDuration * 0.95  // 本次动画周期 为 上次数据刷新周期 的 95%，尽量避免动画被中断
      // let duration = 980 // 980 ms
      this.animator.animate(msg.msg, msg.x, msg.y, duration)
    }
}