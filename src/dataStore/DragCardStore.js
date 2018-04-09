export default class DragCardStore {
    constructor (gstore) {
      this.gstore = gstore
  
      // this.dragCardList = new Map() // 移动到非覆盖区域
      this.moveCardList = new Map() // 移动车辆暂存列表，由于将丢失信号卡的移动动画解开
    }
  }
  