import Dexie from 'dexie'
const DB_NAME = 'YaLocDataInBrowserDB'

export default class DexieDBStore {
  constructor (gstore) {
    this.gstore = gstore
    this.db = null
    this.data = new Map() // 拉取元数据表
    this.dbstore = false
    this.mdtdata = null
    this.forceUpdateMetadata = false // 是否为强制更新数据
    this.forceData = new Map() // 强制更新元数据列表
    this.version = 1

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this
    eventBus.$on('DB-OPEN', (res) => {
      let name = res.name
      let rows = res.rows
      self.openDB(name, rows)
    })

    eventBus.$on('OPEN-LOCAL-DB',()=>{
      self.openLocalDb()
    })

    eventBus.$on('META-UPDATE-DB-RES', (res) => {
      console.log(res)
      if (xdata.metaStore.data[res.data.name]) {
        if (res.code === 0) {
          let storename = `dat_${res.data.name}`
          let key = res.data.id
          if (res.data.op === 'DELETE') {
            key && this.deleteAssignData(storename, key)
          }
          let timename = res.mdtdata.timename
          let time = res.mdtdata.time
          this.name && this.db[this.name].update(storename, {timename: time})
        }
      }
    })

    eventBus.$on('REPT-SHOW-RESULT', (ds) => {
      if (this.data.get(ds.def.name)) { // 更新dat表
        // console.log('update indexDB', ds.def.name, this.data)
        this.data.set(ds.def.name, ds.rows)
        if (this.dbstore) { // 确保this.db.version(1).stores(msg)执行完成
          let name = ds.def.name
          if (name.indexOf('dat') < 0) {
            name = `dat_${ds.def.name}`
          }
          this.storeDATA(name, ds.rows)
          this.data.delete(ds.def.name)
        }
      }
    })

    eventBus.$on('ALL-DATA-HAS-PULL', (res) => {
      if (res.code === 0) {
        this.forceUpdateMetadata = false
      }
    })
  }

  async openLocalDb() {
    this.db = new Dexie(DB_NAME)
    try {
      this.db && await this.db.open()
    } catch (error) {
      return console.warn('No data is stored yet!')
    }
    this.version = this.db.verno
    let data = await this.db.table('mdt_update').toArray()
    for (let i = 0, len = data.length; i < len; i++) {
      let tableGroup = data[i], tableName = tableGroup.tableName
      xdata.metaStore.saveData(tableName)
    }
    console.log('xdata.metaStore', xdata.metaStore)
  }

  async getArray (name, storename) {
    let self = this
    let arr = self.db[name] && await self.db[name].toArray()
    if (arr && arr.length <= 0) { // 只有objectStore，但是没有对应基础表数据
      self.initDB(name) // 拉取所有数据
    } 
    // else { // 有基础表数据时
    //   self.compareTableTime(name, storename) // 比较存储的dat_mdt_update表中的时间
    // }
  }

  // name: dat_xxx    defname: xxx
  async openDB (datname, rows) {
    // 强制更新 ？ 删除本地indexDB ：关闭数据库
    if (this.forceUpdateMetadata) { 
      await this.db.delete()
      this.version = 1
      this.forceUpdateMetadata = false
      this.storeForceData = true
    } else {
      this.db && this.db.isOpen() && this.db.close()
    }
    
    let self = this
    this.name = datname
    this.rows = rows
    this.db = new Dexie(DB_NAME)
    // let storenames = rows
    let msg = {}
    msg[datname] = 'tableName'
    let version = parseInt(this.version, 10)
    version = version ? parseInt(version, 10) : 1

    if (!rows) return

    for (let i = 0,len = rows.length; i < len; i++) { // objectStore
      let storename = rows[i]
      let name = storename.tableName
      let key = null
      if (!this.db[name]) {
        let defname = name.slice(4)
        let def = xdata.metaStore.defs[defname] 
        if (def) {
          key = def.fields.names[def.keyIndex]
        } else {
          key = name.slice(4) + '_id'
          if (name === 'dat_staff_extend') {
            key = 'staff_id'
          } else if (name === 'dat_vehicle_extend') {
            key = 'vehicle_id'
          }
        }
      }
      msg[name] = key
    }

    this.db.version(version).stores(msg)
    this.db.version(version + 1).stores(msg)
    await this.db.open()
    let data = await this.db.table('mdt_update').toArray()
    if (this.db.isOpen()) {
      let msg = {
        cmd: 'pull_down_metadata',
        data: {
          mdtdata: data
        }
      }
      eventBus.$emit('PULL-DOWN-METADATA', msg)
    }
    
    for (let i = 0,len = rows.length; i < len; i++) {
      let storename = rows[i]
      let name = storename.tableName
      self.getArray(name, storename)
    }
    self.dbstore = true
    self.storeDATA(self.name, self.rows) // 每次更新indexDB中dat_mdt_update表
  }

  initDB (name) {
    let len = name.length,defName = name.slice(4,len),defData = xdata.metaStore.defs[defName]
    let sqlStr = defData && defData.fields.names 
    sqlStr = sqlStr ? sqlStr : '*' 
    let sql = `select ${sqlStr} from ${name}`
    let sqlname = name
    this.data.set(sqlname, true)
    this.inquireDB(sqlname, sql)
  }

  inquireDB (name, sql) {
    let message = {
      cmd: 'query',
      data: {
        name: name,
        sql: sql
      }
    }
    eventBus.$emit('REPT-FETCH-DATA', {
      req: message,
      def: {
        name: name
      }
    })
  }

  storeDATA (name, value, upmethod) {
    let self = this
    let storename
    try {
      storename = this.db[name] || this.db.table(name)
    } catch (error) {
      console.warn(`Table ${name} not exist`)
    }
    
    if (storename) {
      this.db.transaction('rw', storename, async() => {
        if (value) {
          if (upmethod == 'DELETE') {
            await storename.clear()
          }
          for (let i = 0; i < value.length; i++) {
            let id = await storename.put(value[i])
            // console.log(`added ${storename.name} with id ${id}`)
          }
          xdata.metaStore.saveData(name)
        }
      }).then(() => {
        console.log(`added ${storename.name}`)
        if (self.storeForceData) {
          self.forceData.set(name, true)
          eventBus.$emit('PROGRESS-BAR')
        }
        if (self.forceData.size >= this.rows.length) {
          self.storeForceData = false
        }
      }).catch(e => {
        console.warn(`更新元数据${name}失败`)
      })
    }
  }

  async deleteAssignData (storename, key) {
    this.db[storename] && await this.db[storename].delete(key)
    xdata.metaStore.saveData(storename) //等待删除之后，更新metaStore
  }
}
