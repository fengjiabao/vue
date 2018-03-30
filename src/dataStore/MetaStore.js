

import { formatElapsedTime } from '../../static/js/common.js'
import { CARD } from '../def/state.js'
import { DEFAULT_MAP_ID } from '../def/map_def.js'
import specialTable from '../def/special_tablekey_def.js'

// 以 '_id' 结尾的通配符
let endWithID = /^(\w*)_id$/i

const CARD_TYPES = ['vehicle_extend', 'staff_extend', 'adhoc']

export default class MetaStore {
  constructor (gstore) {
    this.gstore = gstore
    this.needMove = false // 判断切换到实时地图界面是否需要动画

    this.maptype = 'MONITOR' // 判断地图是否为实时地图
    this.workAreaList = new Map() // 工作面所属区域列表
    this.defaultMapID = DEFAULT_MAP_ID // 当前显示的地图id, 如未加载完数据时，默认显示数据表第一条数据，数据表无数据时再显示id为5的地图

    this.defs = null // meta data definition
    this.data = {} // meta data store

    // 以卡号为索引的、卡绑定对象的列表
    this.cardIndex = new Map()  // card_id -> staff or vehicle

    this.dataInArray = new Map() // name => array
    this.driverData = new Map()
    this.maxIDs = {} // meta data max id,
    this.alarm = new Map()
    this.staffs = new Map() // 人员详细信息
    this.vehicles = new Map() // 车辆详细信息
    this.deptStaff = new Map()//人员按部门分组
    this.deptVehicle = new Map()//车辆按部门分组
    // 是否需要过滤部分卡
    this.needFilterCards = false

    this.firstPull = false

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    eventBus.$on('META-DEF', (res) => {
      self.saveMetaDef(res.data)
      // xdata.dexieDBStore.openLocalDb()
    })

    eventBus.$on('META-DATA', (res) => {
      // console.log(res)
      if (res && res.code === 0) { // execute succeed
        // self.saveMetaData(res.data.name, res.data.rows)
        let length = Object.keys(this.defs).length
        if (res.data.name === 'mdt_update' && this.defs) {
          if (!this.first && !this.data.mdt_update) {
            let msg = {
              information: '系统正在升级中，请勿关闭页面！'
            }
            // window.xhint.showLoading(msg)
            this.first = !this.first
          }
          eventBus.$emit('DB-OPEN', (res.data))
        } else if (res.data.name === 'driver_arrange') {
          let data = res.data.rows
          if (data && data.length > 0) {
            let time = new Date().format('yyyy-MM-dd')
            let currentArrangement = data.filter(item => new Date(item.driver_date).format('yyyy-MM-dd') === time)
            currentArrangement && currentArrangement.length > 0 && self.updateDriverData(currentArrangement)
          }
        } else {
          let name = res.data.name
          if (name.indexOf('dat') < 0) {
            name = `dat_${res.data.name}`
          }
          xdata.dexieDBStore.db && xdata.dexieDBStore.db[name] ? xdata.dexieDBStore.storeDATA(name, res.data.rows, res.upMethod) : this.saveMetaData(res.data.name, res.data.rows)
        }
      } else {
        console.warn(`获取 META ${res.data.name} 失败。`)
      }
    })
  }

  getMdtlength () {
    // let table = xdata.dexieDBStore.db['mdt_update'] || xdata.dexieDBStore.db.table['mdt_update']
    // let arr = table && await table.toArray()
    let arr = xdata.dexieDBStore.rows
    if (!arr) {
      arr = this.data.mdt_update && Array.from(this.data.mdt_update.values())
    }
    if (arr && Object.keys(this.data).length >= arr.length && !this.firstPull && arr.length !== 0) {
      console.log('=====================', Object.keys(this.data).length)
      this.firstPull = true
      window.xhint.close()
    }
  }

  handleTable (name, rows) {
    // name = name.slice(4)
    let self = this
    if (name === 'setting') {
      if (rows) {
        for (let i = 0, len = rows.length; i < len; i++) {
          self.alarm.set(rows[i].name, rows[i].value)
        }
      }
      if (!self.alarm.get('alarm')) {
        self.alarm.set('alarm', xdata.alarmStore.defaultAlarmLevel) // 默认显示全部
      }
    }

    if (name === 'rules') {
      this.updateFilterCardFlag()
    }

    // set the driver arrangement data  ------- begin
    if (name === 'driver_arrange') {
      if (rows && rows.length > 0) {
        let time = new Date().format('yyyy-MM-dd')
        let currentArrangement = rows.filter(item => new Date(item.driver_date).format('yyyy-MM-dd') === time)
        currentArrangement && currentArrangement.length > 0 && self.updateDriverData(currentArrangement)
      }
    }

    if (this.data['drivingface'] && this.data['drivingface_vehicle'] && this.data['vehicle_extend'] && this.data['vehicle'] && this.data['vehicle_type']) {
      if (!this.driveringLayer) {
        eventBus.$emit('MAP-INIT-LABEL')
        this.driveringLayer = !this.driveringLayer
      }
    }

    if (name === 'camera') {
      eventBus.$emit('MAP-INIT-CAMERA')
    }

    if (this.data['staff'] && this.data['staff_extend']) {
      if (this.staffs.size && this.staffs.size === this.data.staff.size) return
      this.jointObj('staff')
    }

    if (this.data['vehicle'] && this.data['vehicle_extend']) {
      if (this.vehicles.size && this.vehicles.size === this.data.vehicle.size) return
      this.jointObj('vehicle')
    }
    
    if (name === 'area') {
      eventBus.$emit('MAP-INIT-AREALIST', (Array.from(xdata.metaStore.data.area.values())))
    }

    if (name === 'drivingface_vehicle') {
      this.setWorkArea(rows)
    }

    if (name === 'coalface_vehicle') {
      this.setWorkArea(rows)
    }

    if (name === 'map_gis') {
      eventBus.$emit('SAVE-GIS-MAP', (rows))
      this.defaultMapID = this.getDefaultMapID()
    }
    
  }

  setWorkArea (rows) {
    if (!rows) return
    for (let i = 0, len = rows.length; i < len; i++) {
      this.workAreaList.set(rows[i].area_id, rows[i].area_id)
    }
  }

  async saveData(name, value) {
    try {
      let table = xdata.dexieDBStore.db.table(name) || xdata.dexieDBStore.db[name]
      let rows = value ? value : await table.toArray()
      let keyname = name.slice(4)
      this.saveMetaData(keyname, rows)
      this.handleTable(keyname, rows)
      this.getMdtlength()
      this.dealDataByDept()
    } catch (error) {
      console.warn(`table ${name} does not exist!`)
    }
  }

  dealDataByDept(){
    this.distributeDept('staff_extend','staff')
    this.distributeDept('vehicle_extend','vehicle')
    eventBus.$emit('DISTRIBUTE-HAD-OVER')
  }

  distributeDept(tableName, baseTable) { //按部门存储人员或车辆数据
    let deptData = xdata.metaStore.dataInArray.get('dept'),
      tableData = xdata.metaStore.dataInArray.get(tableName)
    let baseData = baseTable === 'staff' ? xdata.metaStore.data.staff : xdata.metaStore.data.vehicle
    if (tableData && tableData.length > 0 && deptData && deptData.length > 0) {
      for (let i = 0, len = deptData.length; i < len; i++) {
        // let data = tableData.filter(item =>item.dept_id === deptData[i].dept_id)
        let data = tableData.filter((item) => {
          let ident = baseTable === 'staff' ? item.staff_id : item.vehicle_id
          if (item.dept_id === deptData[i].dept_id && baseData.get(ident)) return item //保证staff及extend表中数据一一对应，防止直接在数据库中插入某一表的一条数据
        })
        tableName === 'staff_extend' && data ? this.deptStaff.set(deptData[i].dept_id, data) : this.deptVehicle.set(deptData[i].dept_id, data)
      }
    }
  }

  
  dealSpecialId (keyName,name) {
    return specialTable[name] ? specialTable[name] : keyName
  }
  /*
   * name: the meta_data's name, such as : staff, reader, etc.
   * keyName: the key's name
   * data: the origin resultset
   */
  saveMetaData (name, rows) {
    // console.debug(`meta: ${name}, \t\tcount: ${rows ? rows.length : 0}`)

    // save to a map
    this.dataInArray.set(name, rows) // TODO: meta saved two copys !!!

    let tmp = new Map() // temp map to save the rows
    let cardList = CARD_TYPES.includes(name) ? new Map() : null
    let maxID = 0
    if (rows) {
      let def = this.defs && this.defs[name]
      let keyName = def ? def.fields.names[def.keyIndex] : name + '_id'
      keyName = this.dealSpecialId(keyName,name)
      for (let item of rows) {
        // save to data
        let keyValue = item[keyName]
        tmp.set(keyValue, item)

        // is card, save to cardIndex
        if (cardList) {
          let cardID = item['card_id']
          cardList.set(cardID, item)
          this.cardIndex.set(cardID, item)
        }

        // init the maxID
        if (keyValue > maxID) {
          maxID = keyValue
        }
      }
    }

    this.data[name] = tmp
    this.maxIDs[name] = maxID

    if (['reader', 'traffic', 'speaker', 'turnout'].includes(name)) {
      eventBus.$emit('DEVICE-INFO-UPDATED')  // tell others to update the device info
    }

    if (cardList) {
      eventBus.$emit('CARD-INFO-UPDATE', { type: name, data: cardList })
    }

    this.broadcastMetaUpdate(name, maxID, rows)
  }

  jointObj (type) {
    let objects = this.dataInArray.get(type)
    if (objects) {
      for (let i = 0, len = objects.length; i < len; i++) {
        let obj = objects[i]
        let objID = obj[type + '_id']
        let name = obj.name
        let spy = xdata.spell.makePy(name)
        let brief = spy ? spy[0] : ''
        obj.spy = brief
        let objExtend = this.data[type + '_extend'].get(objID)
        let objInfo = this.concatObject(obj, objExtend)
        if (type === 'staff') {
          this.staffs.set(objID, objInfo)
        } else if (type === 'vehicle') {
          this.vehicles.set(objID, objInfo)
        }
      }
    }
  }

  /**
   * [broadcastMetaUpdate when meta updated, inform all (the views) to refresh their local data]
   * @param  {[type]} name [meta data's name]
   * @param  {[type]} rows [the result data, may be null]
   * @return {[type]}      [description]
   */
  broadcastMetaUpdate (name, maxID, rows) {
    let def = this.defs ? this.defs[name] : name + '_id'
    let table = {
      def: def,
      maxid: maxID,
      rows: rows
    }
    eventBus.$emit('META-DATA-UPDATE', table)
  }

  saveMetaDef (data) {
    this.defs = data
  }

  // operation

  /**
   * 从数据集 name 中，获取 key 值为 id 的字段 field 的值
   * @param {*} name 数据集名称，比如 map
   * @param {*} id 数据集中 key 的值，比如 1
   * @param {*} field 需要获取字段的名称，比如 map_id
   */
  getField (name, id, field) {
    let ret = null
    if (name && id && field) {
      let rows = this.data[name]
      if (rows) {
        let row = rows.get(id)
        if (row) {
          ret = row[field]
        }
      }
    }
    return ret
  }

  formatStateArray (def, row, rule) { // rule: SHORT-DATE or not, etc.
    if (!def || !row) {
      return row
    }
    let ret = []
    for (let i = 0, len = def.fields.names.length; i < len; i++) {
      let name = def.fields.names[i]

      if (i === def.keyIndex) { // key 不做转换
        ret.push(row[i])
        continue
      }
      let type = def.fields.types[i]
      let value = row[i]
      if (name === 'area_id' && row[i] === 0) {
        value = '未识别区域'
      } else {
        value = this.formatField(name, value, type, rule)
      }

      if (name === 'work_time') {  // 工作时间转化
        value = formatElapsedTime(value)
      }

      if (name === 'map_pos') {  // 地图位置信息组装
        value = this.getPositionDesc(row[i], row[i + 1], row[i + 2])
      }
      ret.push(value)
    }

    return ret
  }

  formatnosignalcards (def, row, rule) {
    if (!def || !row) {
      return row
    }
    let ret = []
    for (let i = 0; i < def.fields.names.length; i++) {
      let name = def.fields.names[i]
      let type = def.fields.types[i]
      let value = row[CARD[name]]
      if (name === 'map_pos') {  // 地图位置信息组装
        value = this.getPositionDesc(row[16], row[17], row[18])
      } else if (name === 'occupation_id') {
        let occupationID = this.getCardBindObjectInfo(row[0]) ? this.getCardBindObjectInfo(row[0]).occupation_id : '未识别岗位'
        value = this.formatField(name, occupationID, type, rule)
      } else if (name === 'state_biz') {
        value = this.formatField('state_biz_id', value, type, rule)
      } else if (name === 'work_time') {  // 工作时间转化
        value = formatElapsedTime(value)
      } else {
        value = this.formatField(name, value, type, rule)
      }
      ret.push(value)
      // let value = row[CARD.name]
    }

    return ret
  }

  //  获得位置描述
  getPositionDesc (landmarkID, directionID, distance) {
    let ret = ''

    let landmarkName = this.getNameByID('landmark_id', landmarkID)
    if (landmarkName !== 0 && distance) {
      distance = distance.toFixed(2)
      ret = landmarkName
      let directionName = this.getNameByID('direction_mapper_id', directionID)
      if (directionName !== 0) {
        if (distance !== 0) {
          ret = landmarkName + directionName + distance + '米'
        }
      } else {
        if (distance !== 0) {
          ret = landmarkName + distance + '米'
        }
      }
    }

    return ret
  }

  formatRecordArray (def, row, rule) { // rule: SHORT-DATE or not, etc.
    if (!def || !row) {
      return row
    }

    let ret = []
    for (let i = 0; i < def.fields.names.length; i++) {
      let name = def.fields.names[i]

      if (i === def.keyIndex) { // key 不做转换
        ret.push(row[name])
        continue
      }

      let type = def.fields.types[i]
      let value = row[name]
      value = this.formatField(name, value, type, rule)

      ret.push(value)
    }
    return ret
  }

  formatLoop (def, row, rule) {
    let ret = {}
    for (let i = 0; i < def.fields.names.length; i++) {
      let name = def.fields.names[i]

      if (i === def.keyIndex) { // key 不做转换
        ret[name] = row[name]
        continue
      }

      let type = def.fields.types[i]
      let value = row[name]
      value = this.formatField(name, value, type, rule)

      ret[name] = value
    }
    return ret
  }

  formatRecord (def, row, rule) { // rule: SHORT-DATE or not, etc.
    if (!def || !row) {
      return row
    }
    let name = def.name
    let basicExtend = null
    let basic = this.formatLoop(def, row, rule)
    if (name === 'staff' || name === 'vehicle') { // 车辆和人员 需要基础表信息和业务表信息拼起来 组成完整信息
      basicExtend = this.formatLoop(this.defs[name + '_extend'], row, rule)
    }
    return this.concatObject(basic, basicExtend)
  }

  formatField (name, value, type, rule) {
    if (value === null || value === undefined || value === '') {
      return ''
    }
    if (name === 'speed') {
      // console.warn('speed', value)
    }
    // debugger  // eslint-disable-line
    let ret = value
    switch (type) {
      case 'NUMBER':
      case 'SELECT':
        if (endWithID.exec(name)) {
          ret = this.getNameByID(name, value)
        }
        break
      case 'DATETIME':
        let sformater = rule && rule === 'SHORT-DATE' ? 'MM-dd hh:mm' : 'yyyy-MM-dd hh:mm:ss'
        ret = new Date(value).format(sformater)
        break
      default:
        // console.warn('未知的字段类型：', type)
        break
    }

    return ret
  }

  /**
   * 从 'xxx_id' 字段获取所对应的名称(name字段)
   * 要求：
   * 1. 所有 id 字段必须为 xxx_id 的形式，其对应表的名字为 dat_xxx，如 map_id, 对应表为 dat_map
   * 2. 有一个 name 字段，如 dat_map 中，有一个 name 字段，是对 map_id 的名称
   * 则： getNameByID('map_id', 5) 可以获得 map_id = 5 的地图的名称
   *
   * @method getNameByID
   *
   * @param  {[type]}    idFieldName  [description]
   * @param  {[type]}    idFieldValue [description]
   *
   * @return {[type]}                   [description]
   */
  getNameByID (idFieldName, idFieldValue) {
    let fieldName = 'name'
    if (idFieldName === 'device_type_id' || idFieldName === 'card_type_id') {
      fieldName = 'detail' // device 和 card 的描述字段是 'detail'
    }

    return this.getFieldByID(idFieldName, idFieldValue, fieldName)
  }

  // 根据 cardID 获得绑定对象的名称（name）：人员 - 姓名；车辆 - 车牌
  getCardNameByID (cardID) {
    let name = null

    let objInfo = this.getCardBindObjectInfo(cardID)
    name = objInfo && objInfo.name

    return name
  }

  getFieldByID (idName, idValue, fieldName) {
    let ret = idValue
    let r = endWithID.exec(idName)
    if (r) {
      let ds = this.data[r[1]]
      if (ds) {
        let row = ds.get(parseInt(idValue, 10))
        if (row) {
          let label = row[fieldName]
          if (label) {
            ret = label
          }
        }
      }
    }

    return ret
  }

  /**
   * [getList 根据 xx_id 字段，获取对应的列表
   * @param  {[type]} idName [description]
   * @return {[type]}        [list: [{row}, {row}, ...]]
   */
  getList (idName) {
    let list = []
    let r = endWithID.exec(idName)
    if (r) {
      let dsName = r[1]
      let ds = this.data[dsName]
      if (ds) {
        list = ds.values()
      }
    }

    return list
  }

  // ----------- about card ----------- start
  // card, card_type, cardBindedObject(staff, vehicle)
  getCardLevelID (cardID) {
    let info = this.getCardInfo(cardID)
    return info ? info.level_id : null
  }

  getCardLevelInfo (cardID) {
    let cardLevelID = this.getCardLevelID(cardID)
    return cardLevelID ? this.data['level'].get(cardLevelID) : null
  }

  getCardLevelName (cardID) {
    return this.getCardLevelInfo(cardID).name
  }

  getCardTypeID (cardID) {
    let card = this.getCardInfo(cardID)
    return card ? card.card_type_id : -1
  }

  getCardTypeInfo (cardID) {
    let ret = null

    let cardTypeID = this.getCardTypeID(cardID)
    cardTypeID = parseInt(cardTypeID, 10)
    if (cardTypeID >= 0) {
      ret = this.data['card_type'] && this.data['card_type'].get(cardTypeID)
    }

    return ret
  }

  getCardTypeName (cardID) {
    let typeInfo = this.getCardTypeInfo(cardID)
    return typeInfo ? typeInfo.name : undefined
  }

  getCardInfo (cardID) {
    let cards = this.data['card']
    return cards ? cards.get(cardID) : null
  }

  concatObject (obj1, obj2) {
    for (var key in obj2) {
      if (obj1.hasOwnProperty(key)) continue// 有相同的属性则略过
      obj1[key] = obj2[key]
    }
    return obj1
  }

  getVehicleCategoryByTypeID (vehicleTypeID) {
    let ret = null

    let vehicleTypes = this.data['vehicle_type']
    let vehicleTypeObj = vehicleTypes && vehicleTypes.get(vehicleTypeID)

    if (vehicleTypeObj) {
      let vehicleCategorys = this.data['vehicle_category']
      ret = vehicleCategorys && vehicleCategorys.get(vehicleTypeObj.vehicle_category_id)
    }

    return ret
  }

  /**
   * 获得卡所绑定对象的信息
   * @param {*} cardID 卡号
   */
  getCardBindObjectInfo (cardID) {  // such as staff or vehicle
    let cardTypeName = this.getCardTypeName(cardID)
    let baseInfoTable = this.data[cardTypeName]
    if (!baseInfoTable && !this[cardTypeName]) {
      this.pullDownMetadata(cardTypeName)
      baseInfoTable = this.data[cardTypeName]
    }

    let objExtendInfo = this.cardIndex.get(cardID)
    if (!objExtendInfo && !this[cardTypeName + '_extend']) {
      this.pullDownMetadata(cardTypeName + '_extend')
      objExtendInfo = this.cardIndex.get(cardID)
    }
    let objID = objExtendInfo && objExtendInfo[cardTypeName + '_id']

    let objBaseInfo = baseInfoTable && baseInfoTable.get(objID)

    // 防止如果一张卡触发拉取元数据，但是并未拉取到，每张push来的定位数据卡重复多次拉取元数据
    this[cardTypeName] = true
    this[cardTypeName + '_extend'] = true

    return this.concatObject(objExtendInfo, objBaseInfo)
  }

  // process driver-arrange data  ------ begin

  // 司机是三班制，获取当前班次的 ID
  // TODO: 需要修改 hardcode
  getCurrentShiftID () {
    let shiftID = -1

    let time = new Date().format('hh:mm:ss')
    if (time >= '23:00:00' || time < '07:00:00') {
      shiftID = 1
    } else if (time >= '07:00:00' && time < '15:00:00') {
      shiftID = 2
    } else {
      shiftID = 3
    }

    return shiftID
  }

  // 更新当前班次的司机排班到 this.driverData 中
  updateDriverData (data) {
    let shiftID = this.getCurrentShiftID()

    let recs = data.filter(item => item.shift_id === shiftID)
    if (recs && recs.length > 0) {
      this.driverData.clear()  // clear all preview data first

      for (let i = 0, len = recs.length; i < len; i++) {
        let rec = recs[i]
        // let driverID = rec.staff_id
        // let staff = this.data.staff && this.data.staff.get(driverID)
        // let tel = staff && staff.telephone
        // rec['tel'] = tel
        this.driverData.set(recs[i].vehicle_number, rec)
      }
    }
  }

  getVehicleDriver (vehicleNumber) {
    return this.driverData && this.driverData.get(vehicleNumber)
  }

  /**
   *  获取默认的地图 id，
   */
  getDefaultMapID () {
    let maps = this.data['map_gis'] ? this.data['map_gis'].values() : null
    let defaultMap
    if(maps){
      maps = Array.from(maps)
      defaultMap = this.getDefaultMapData(maps)
      if(!defaultMap){//没有默认字段填写时，为第一张地图
        defaultMap = maps[0]
      }
    }

    return defaultMap ? defaultMap['map_id'] : DEFAULT_MAP_ID
  }

  getDefaultMapData(maps) {
    for (let i = 0, len = maps.length; i < len; i++) {
       if(maps[i].default_map === '是'){
         return maps[i]
       } 
    }
  }

  // 是否需要过滤部分卡
  // 被过滤目标不在前端显示,即生效, 目前数据库为0生效
  updateFilterCardFlag () {
    this.needFilterCards = false  // 默认不过滤

    let rules = this.dataInArray.get('rules')
    let filterCardRules = rules && rules.filter(item => item.name === 'filtercard')
    let filterCardRule = filterCardRules && filterCardRules[0]

    if (filterCardRule && filterCardRule.status === 0) {
      this.needFilterCards = true
    }
  }

  // 返回一张卡是否显示
  // return : 1 - display, 0 - hide
  needDisplay (cardID) {
    let ret = true

    if (this.needFilterCards) {
      let obj = this.getCardBindObjectInfo(cardID)
      if (obj && (obj.need_display === 0)) { // obj.need_display = 0, 不显示
        ret = false
      }
    }

    return ret
  }
  /**
   * { vehicle_id : 1110 }
   * @param {*}
   */
  needDisplayByJobNumber (obj) { // 过滤通过工号，因为一张卡可绑定不同的对象
    let ret = true
    let needDisplay = null
    if (this.needFilterCards) {
      if (obj.vehicle_id) {
        let vData = xdata.metaStore.data.vehicle_extend.get(obj.vehicle_id)
        needDisplay = vData && vData.need_display
      } else if (obj.staff_id) {
        let sData = xdata.metaStore.data.staff_extend.get(obj.staff_id)
        needDisplay = sData && sData.need_display
      }
      if (needDisplay === 0) {
        ret = false
      }
    }
    return ret
  }

  // 获得过滤后的 人员/车辆 列表，用于模糊查询
  getFilterCardList () {
    this.filteredStaffs = []
    this.filteredVehicles = []
    if (this.needFilterCards) {
      if (!this.dataInArray.get('staff_extend') || !this.dataInArray.get('vehicle_extend')) {
        return console.warn('请更新server！')
      }
      this.dataInArray.get('staff_extend').filter((item) => {
        if (item.need_display === 1) {
          let objID = item.card_id
          this.filteredStaffs.push(this.getCardBindObjectInfo(objID))
        }
      })
      this.dataInArray.get('vehicle_extend').filter((item) => {
        if (item.need_display === 1) {
          let objID = item.card_id
          this.filteredVehicles.push(this.getCardBindObjectInfo(objID))
        }
      })
    } else {
      this.filteredStaffs = this.dataInArray.get('staff')
      this.filteredVehicles = this.dataInArray.get('vehicle')
    }
    this.filteredVehicles = this.fiilterWorkFaceCard(this.filteredVehicles)
    return { staffs: this.filteredStaffs, vehicles: this.filteredVehicles }
  }

  // 根据 vehicle_id，过滤掉工作面的卡
  fiilterWorkFaceCard (cards) {
    let drivingfaceCards = this.dataInArray.get('drivingface_vehicle')
    if (!drivingfaceCards || drivingfaceCards.length <= 0) {
      return cards
    }

    let filterData = []
    let filteredVechicleID = drivingfaceCards.map(item => item.vehicle_id)
    for (let i = 0, len = cards.length; i < len; i++) {
      if (!filteredVechicleID.includes(cards[i].vehicle_id)) {
        filterData.push(cards[i])
      }
    }

    return filterData
  }

  // 登录加载不到元数据时，继续拉取元数据
  pullDownMetadata (name) {
    if (name) {
      let dataLongs = this.data[name] && this.data[name].size
      if (!dataLongs) {
        let sql = `select * from dat_${name}`
        this.loopPullDown(name, sql, true)
        this.openOnEvent(name)
      }
    }
  }

  loopPullDown (name, sql, isLoop) {
    console.log(isLoop)
    let num = 1
    while (num <= 3 && isLoop) {
      let msg = {
        cmd: 'query',
        data: {
          name: name,
          sql: sql
        }
      }

      eventBus.$emit('REPT-FETCH-DATA', {
        req: msg,
        def: {
          name: name
        }
      })

      num++
    }
  }

  openOnEvent (name) {
    eventBus.$on('REPT-SHOW-RESULT', (ds) => {
      if (ds.def.name === name) {
        this.saveMetaData(ds.def.name, ds.def.rows)
        this.loopPullDown('', '', false) // 拉取到数据后，停止拉取数据
      }
    })
  }

  /*
  fiilterWorkFaceByCardID (cards) { // 过滤掉工作面的卡通过card_id
    let filterData = []
    let drivingfaceCards = this.dataInArray.get('drivingface_vehicle')
    drivingfaceCards.filter((item) => {
      for (let i = 0, len = cards.length; i < len; i++) {
        let cardID = xdata.metaStore.data.vehicle_extend.get(item.vehicle_id)
        cardID = cardID && cardID.card_id
        if (cards[i][0] !== cardID) {
          filterData.push(cards[i])
        }
      }
    })
    return filterData
  } */
}
