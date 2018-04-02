

import MetaStore from './MetaStore.js'
import DexieDBStore from './DexieDBStore.js'
import MapStore from './MapStore.js'
export default class DataStore {
    constructor (store) {
    //   this.userName = null // save the login user name
    //   this.roleID = null
    //   this.lastUpdate = null // the last socket.io communication time.
    //   this.collectorStatus = -1  // 未连接
      this.metaStore = new MetaStore(this,store)
      this.dexieDBStore = new DexieDBStore(this,store)
      this.mapStore = new MapStore(this,store)
    }
  
  }
  