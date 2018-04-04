export default class DisplayingStore {
    constructor () {
      // this.gstore = gstore
  
      // 正在显示的人员列表：cardID -> flag
      this.displayList = new Map()
    }
  
    set (id, flag) {
      this.displayList.set(id, flag)
    }
  
    get (id) {
      return this.displayList.get(id)
    }
  
    getInArray () {
      return Array.from(this.displayList.keys())
    }
  
    delete (id) {
      this.displayList.delete(id)
    }
  
    clear () {
      this.displayList.clear()
    }
  
    has (id) {
      return this.displayList.has(id)
    }
  }
  