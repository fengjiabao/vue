/*

格式化 SVG 地图：
1. 确保最外层的 <svg> 元素 id 为 svgmap，即：<svg id="svgmap" ...>
2. 地图数据必须包含在一个 <g> 元素内，建议包含在 <g id="viewport"> 内；（地图数据不包括 defs、style）
3. 确保从地图数据所在的 <g> 至最外层的 <svg> 元素上，都没有 viewBox 属性（因为 viewBox 属性对内层地图进行的转换，会影响后面的坐标计算）；

*/
import ol from 'openlayers'
import {ZOOM_LEVEL} from '../def/map_def.js'
import {mapIcon} from '../def/map_icon.js'
// import echarts from 'echarts'
// const ICON_FILE = '/icons/icons.svg'

// const SVGNS = 'http://www.w3.org/2000/svg'
// const XLINKNS = 'http://www.w3.org/1999/xlink'

// const SYMBOL_WIDTH = 5
// const SYMBOL_HEIGHT = 5
const areas = [1, 6, 27]
let vehiclePoint = mapIcon.vehiclePoint
let vehicleIcon = mapIcon.vehicle
let staffIcon = mapIcon.staff
const MONKEYID = 7

/**
 * [buildPathDef 根据数组，组织开放的 path 字符串]
 * @param  {[Array]} data [坐标数组]
 * @return {[Object]}      [ 包括：{data: [], hopCount: number, path: pathstring}]
 */
function getPolylineBYPoints (data) {
  if (!data || data.length <= 0) {
    return { data: null, hopCount: 0, path: '' }
  }
  let pointList = new Array()
  let hopCount = data.length
  for (let i = 0; i < hopCount; i++) {
    let item = data[i]
    pointList.push([item.x, -item.y])
  }
  return { data: data, hopCount: hopCount, pointCol: pointList }
}

function drawOLLine (layerSource, id, polCol, className, PatrolPath, row) {
  // layerSource.clear()
  let styles = {
    'route': new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 6, color: [237, 212, 0, 0.8]
      })
    }),
    'patrolPath': new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 6, color: 'mediumseagreen'
      })
    }),
    'endMarker': new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: '/icons/endMarker.png'
      })
    }),
    'startMarker': new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: '/icons/startMarker.png'
      })
    }),
    'geoMarker': new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        snapToPixel: false,
        fill: new ol.style.Fill({ color: 'black' }),
        stroke: new ol.style.Stroke({
          color: 'white', width: 2
        })
      })
    })
  }

  let linestring = new ol.geom.LineString(polCol) // 坐标数组
  // var lineFeature = new ol.Feature(linestring,null,style_line);
  var lineFeature = new ol.Feature({
    geometry: linestring,
    finished: false

  })

  if (PatrolPath === 'PatrolPath') { // 巡检
    lineFeature.setId('hisTrackLine')
    lineFeature.setStyle(styles['route'])
  } else if (PatrolPath === 'firstName') {
    lineFeature.setId('firstLine')
    lineFeature.setStyle(styles['route'])
  } else if (PatrolPath === 'secondName') {
    lineFeature.setId('secondLine')
    lineFeature.setStyle(styles['patrolPath'])
  } else {
    lineFeature.setStyle(styles['patrolPath'])
    lineFeature.setId('hisTrackLinePatrolPath')
  }

  // 2、生成轨迹

  let startMarker = new ol.Feature({
    geometry: new ol.geom.Point(polCol[0])
  })
  startMarker.setStyle(styles['startMarker'])
  let endMarker = new ol.Feature({
    geometry: new ol.geom.Point(polCol[polCol.length - 1])
  })
  endMarker.setStyle(styles['endMarker'])
  if (row) {
    startMarker.setProperties({
      'id': id,
      'msg': row,
      'data-type': 'startMarker'
    })
    endMarker.setProperties({
      'id': id,
      'msg': row,
      'data-type': 'endMarker'
    })
  }
  layerSource.addFeature(lineFeature)
  layerSource.addFeature(startMarker)
  layerSource.addFeature(endMarker)
  return { lineFeature: lineFeature, lineLength: linestring.getLength() }
}

function workFace (attributes) { // 控制工作面图标显隐
  let cardID = attributes['data-id']
  let cardObj = xdata.metaStore.getCardBindObjectInfo(cardID)

  if (cardObj && cardObj.vehicle_id) {
    let vId = cardObj.vehicle_id
    let drivingFaceCard = xdata.metaStore.dataInArray.get('drivingface_vehicle')
    let coalFaceCard = xdata.metaStore.dataInArray.get('coalface_vehicle')

    drivingFaceCard = drivingFaceCard && drivingFaceCard.filter(item => item.vehicle_id === vId)
    coalFaceCard = coalFaceCard && coalFaceCard.filter(item => item.vehicle_id === vId)

    if ((drivingFaceCard && drivingFaceCard.length > 0) || (coalFaceCard && coalFaceCard.length > 0)) {
      return 'hidecard'
    } else {
      return 'showcard'
    }
  } else {
    return 'showcard'
  }
}

function convertSVGPath2Coord (pathString) {
  let coordinates = []
  // if (!pathString.includes(' ')) return
  let paths = pathString.split(' ')
  for (let path of paths) {
    let point = path.split(',')
    let x = Number(point[0].substring(1))
    let y = -Number(point[1])
    coordinates.push([x, y])
  }

  return coordinates
}

/**
 * append a symbol to the canvas
 *
 * @method drawSymbol
 *
 * @param  {[type]}     canvas     [description]
 * @param  {[type]}     iconName  [description]
 * @param  {[type]}     attributes [description]
 *
 * @return {[Element]}                [返回被添加的对象]
 */
function drawSymbol (attributes, source, map, type) {
  // let ishide = workFace(attributes)// 控制工作面图标隐藏
  // if (ishide === 'hidecard') {
  //   return
  // }

  // 添加Features
  let geo = type === 'uncover' ? createPosition(attributes) : new ol.geom.Point([attributes.x, -attributes.y])

  if (attributes.geom) {
    let wkt = new ol.format.WKT()
    geo = wkt.readGeometry(attributes.geom)
  }

  let feature = new ol.Feature(geo)
  feature.setId(attributes['data-id'])
  feature.setProperties(attributes)
  // source.addFeature(feature)

  let dataType = attributes['data-subtype']
  let state = attributes['card_state']
  let viewZoom = map.getView().getZoom(), featureStyle
  switch (dataType) {
    case 'vehicle':
      feature.setStyle(createLabelStyle(feature, type, viewZoom, '', map))
      break
    case 'staff':
      feature.setStyle(createLabelStyleStaff(feature, type, state, viewZoom, map))
      break
    case 'landmark':
      feature.setStyle(creareLandmarker(feature, dataType))
      break
    case 'workFace':
      feature.setStyle(createWorkFace(feature))
      break
    default:
      feature.setStyle(createDevice(feature, dataType))
      break
  }
  feature.getStyle() && source.addFeature(feature)

  return feature
}

// 非覆盖区域 给点
function createPosition (attributes) {
  let ret = null
  let areaID = attributes['card_area']
  if (xdata.metaStore.data.area_ex) {
    let area = xdata.metaStore.data.area_ex.get(areaID)
    if (area) {
      if (!area.point.includes(' ')) {
        return
      }
      let paths = area.point.split(' ')
      let x = Number(paths[0].split(',')[0].substring(1))
      let m = Number(paths[1].split(',')[1])
      let n = Number(paths[0].split(',')[1])
      let attrY = Math.random() * (m - n) + n
      ret = new ol.geom.Point([x, -attrY])
    } else {
      ret = new ol.geom.Point([attributes.x, -attributes.y])
    }
  }

  return ret
}

function createLabelStyle (feature, type, viewZoom, rotation, map) {
  rotation = rotation || 0
  let featureId = feature.getId()
  let mapTarget = map.getTarget()
  let vehicle = xdata.metaStore.getCardBindObjectInfo(featureId)
  if (vehicle || mapTarget === 'trackmap') {
    let vType = feature.get('name')
    let category = vehicle && xdata.metaStore.getVehicleCategoryByTypeID(vehicle.vehicle_type_id)
    let view = map.getView()
    if (category || (vehicle && !vehicle.vehicle_type_id && vType === 'tunnellerFace') || mapTarget === 'trackmap') {
      if (viewZoom < ZOOM_LEVEL.SMALL) { // 16
        view.setProperties({zoomLevel: 'SMALL'})
        return getTypeIconPoint(category, rotation, type)
      } else if (viewZoom < ZOOM_LEVEL.MIDDLE) { // 18
        view.setProperties({zoomLevel: 'MIDDLE'})
        return getTypeIconVehicle(category, feature, type, rotation)
      } else {
        view.setProperties({zoomLevel: 'MAX'})
        return getTypeIconBg(category, feature, type, rotation, viewZoom)
      }
    } else {
      console.warn('Can NOT find vehicle_category by vehicle_type_id : ', vehicle.vehicle_type_id)
    }
  } else {
    console.warn('unprefect data!')
  }
}

function getTypeIconPoint (category, rotation, type) {
  // let color = category ? category.color : 'yellow'
  let color = 'yellow'
  return new ol.style.Style({
    image: new ol.style.Icon({
      src: vehiclePoint[color].img,
      rotation: rotation,
      scale: 0.015
    })
  })
  // return new ol.style.Style({
  //   image: new ol.style.Circle({
  //     radius: 5,
  //     rotation: rotation,
  //     snapToPixel: false,
  //     fill: new ol.style.Fill({ color: category.color })
  //   })
  // })
}

function getTypeIconVehicle (category, feature, type, rotation) {
  let vehicleRotation = rotation
  if (rotation) {
    vehicleRotation = rotation
  } else {
    let areaID = feature.get('card_area')
    let area = xdata.metaStore.data.area
    area = area && area.get(areaID)
    if (area) {
      vehicleRotation = area.angle
    }
  }

  let p = {
    rotation: vehicleRotation,
    rotateWithView: true,
    scale: 0.18
  }
  switch (type) {
    case 'unregistered': // 未绑定车辆
      p.src = vehicleIcon.unregistered.img
      break
    case 'hidecard':
      p.src = vehicleIcon.tunnel.img
      p.rotation = -45.55
      p.scale = 0.08
      break
    case 'nosignal': // 没接收到信号
      // p.src = vehicleIcon.nosignal.img
      // break
    default: // 正/静/非覆盖/胶轮车硐室
      let carcolor = category ? category.color : 'green'
      p.src = vehicleIcon[carcolor + 'car'].img
      p.scale = 0.2
  }

  return new ol.style.Style({
    image: new ol.style.Icon(p)
  })
}

function getTypeIconBg (category, feature, type, rotation, viewZoom) {
  let vehicleRotation = rotation
  let carcolor = category ? category.color : 'green'
  if (rotation) {
    vehicleRotation = rotation
  } else {
    let areaID = feature.get('card_area')
    let area = xdata.metaStore.data.area.get(areaID)
    if (area) {
      vehicleRotation = area.angle
    }
  }

  let p = {
    rotation: vehicleRotation,
    rotateWithView: true
  }
  let t = {
    font: '12px',
    fill: new ol.style.Fill({
      color: 'red'
    }),
    stroke: new ol.style.Stroke({
      lineCap: 'square',
      color: '#fff',
      miterLimit: 20,
      width: 10
    }),
    offsetY: -35
  }
  switch (type) {
    case 'special': // 胶轮车硐室
      p.src = type === 'special' ? vehicleIcon[carcolor + 'car'].img : vehicleIcon.nosignal.img
      p.scale = 0.2
      return new ol.style.Style({
        image: new ol.style.Icon(p)
      })
    case 'hidecard':
      p.src = vehicleIcon.tunnel.img
      p.rotation = -45.55
      if (window.workFaceLayer) {
        p.scale = viewZoom / 100
      } else {
        p.scale = 0.08
      }
      return new ol.style.Style({
        image: new ol.style.Icon(p)
      })
    case 'nosignal': // 未接收到信号
      // p.src = type === 'special' ? vehicleIcon[category.color + 'car'].img : vehicleIcon.nosignal.img
      // p.scale = 0.2
      // return new ol.style.Style({
      //   image: new ol.style.Icon(p)
      // })
    case 'unregistered': // 未注册卡
    case 'uncover': // 非覆盖区域 无速度
    default: // 正常 有速度
      p.src = type === 'unregistered' ? vehicleIcon.unregistered.img : vehicleIcon[carcolor + 'car'].img
      p.scale = type === 'unregistered' ? 0.2 : 0.28
      if (type === 'unregistered') { // 未注册卡 卡号
        t.text = String(feature.get('data-id'))
      } else if (type === 'uncover') { // 非覆盖区域 无速度
        t.text = String(feature.get('data-number'))
      } else { // 正常 有速度
        t.text = String(feature.get('data-number')) + '|' + feature.get('card-speed') + 'Km/h'
      }
      let cardId = String(feature.get('data-id'))
      t.text = addPersonNum(cardId, feature, t.text)
      return new ol.style.Style({
        image: new ol.style.Icon(p),
        text: new ol.style.Text(t)
      })
  }
}

function addPersonNum (cardID, feature, text) {
  if (!text) {
    return
  }
  let sum = xdata.PersonOnCarStore && xdata.PersonOnCarStore.personOnCarSum.get(cardID)
  sum = sum ? ',' + sum + '人' : ''
  return text + sum
}

function personOnCar (cardID) {
  let hasThisCard = xdata.PersonOnCarStore.personOnCar.get(cardID)
  return hasThisCard || false
}

function personOutCar (cardID) {
  let hasThisCard = xdata.PersonOnCarStore.presonOutCar.get(cardID)
  return hasThisCard || false
}

function createLabelStyleStaff (feature, type, state, viewZoom, map) {
  let id = feature.get('data-id')
  let name = null
  let names = xdata.metaStore.getCardBindObjectInfo(id)
  let view = map.getView()
  if (names) {
    name = String(names.name)
  } else {
    name = String(id)
  }
  let p = {
    scale: 0.12,
    rotateWithView: true
  }
  let t = {
    fill: new ol.style.Fill({
      color: 'red'
    }),
    stroke: new ol.style.Stroke({
      lineCap: 'square',
      color: '#fff',
      miterLimit: 20,
      width: 10
    }),
    offsetY: -45
  }
  if (viewZoom < ZOOM_LEVEL.STAFFLEAVE) {
    view.setProperties({zoomLevel: 'STAFFSMALL'})
    p.src = staffIcon.point.img
    p.scale = 0.015
    t.name = ''
    if (viewZoom >= ZOOM_LEVEL.MIDDLE) {
      // t.text = name
    }
  } else {
    if (viewZoom >= 21 && viewZoom < 22) {
      p.scale = 0.08
    } else {
      p.scale = 0.12
    }
    view.setProperties({zoomLevel: 'MAX'})
    if (state === MONKEYID) {
      p.src = staffIcon.monkey.img
    } else {
      p.src = staffIcon.normal.img
    }
    t.text = name
  }
  // t.text = name
  return new ol.style.Style({
    image: new ol.style.Icon(p),
    text: new ol.style.Text(t)
  })
  // switch (type) {
  //   case 'nosignal': // 没接收到信号
  //     p.src = staffIcon.nosignal.img
  //     p.scale = 0.12
  //     return new ol.style.Style({
  //       image: new ol.style.Icon(p)
  //     })
  //   case 'unregistered': // 未注册卡
  //   default: // 正常
  //     p.src = type === 'unregistered' ? staffIcon.unregistered.img : staffIcon.normal.img
  //     t.text = type === 'unregistered' ? String(id) : name
  //     return new ol.style.Style({
  //       image: new ol.style.Icon(p),
  //       text: new ol.style.Text(t)
  //     })
  // }
}

function createDevice (feature, dataType) {
  let state = feature.get('state'), id = feature.get('id'), t, style
  let p = {rotateWithView: true}
  switch (dataType) {
    case 'reader':
      let briefName = xdata.metaStore.data.reader.get(id).brief_name
      p.src = `../../img/${state === 0 ? 'reader' : 'unnormal'}.png`
      p.scale = 0.08
      if (briefName) {
        t = {
          text: briefName,
          font: '12px',
          fill: new ol.style.Fill({color: 'red'}),
          stroke: new ol.style.Stroke({lineCap: 'square', color: '#fff', miterLimit: 20, width: 10}),
          offsetY: -25}
      }
      break
    case 'traffic':
      p.src = `../../img/${state === 0 ? 'traffic' : 'untraffic'}.png`
      p.scale = 0.1
      break
    default:
      console.warn('UNKNOWN device type : ', dataType)
      return null
  }
  style = t ? {image: new ol.style.Icon(p), text: new ol.style.Text(t)} : {image: new ol.style.Icon(p)}
  return new ol.style.Style(style)
}

function creareLandmarker (feature, type) {
  return new ol.style.Style({
    image: new ol.style.Icon({
      src: '../../img/landmarker.png',
      scale: 0.08,
      rotateWithView: true
    })
  })
}

function createWorkFace (feature) {
  return new ol.style.Style({
    image: new ol.style.Icon({
      src: '../../img/jue.png',
      scale: 0.5,
      rotateWithView: true
    })
  })
}

/**
 * 拖拽效果
 * @param {*事件} evt
 * @param {*拖拽对象} obj
 */
function doDrag (evt, obj) {
  let disX = evt.clientX - obj.offsetLeft
  let disY = evt.clientY - obj.offsetTop
  obj.style.cursor = 'move'
  obj.onmousemove = function (e) {
    let left = e.clientX - disX
    let top = e.clientY - disY
    obj.style.left = left + 'px'
    obj.style.top = top + 'px'
  }
  obj.onmouseup = function (e) {
    obj.style.cursor = 'default'
    this.onmousemove = null
    this.onmouseup = null
  }
}

/**
 *
 * @param {*装载的dom} canvaCharts
 * @param {*横坐标的数组数据} datax
 * @param {*纵坐标的数组数据} datay
 * @param {*标题党} titleText
 * @param {*} name
 */
function drawLineChart (canvaCharts, datax, datay, titleText, name, minTime, maxTime) {
  if (!canvaCharts) return
  window.xhint.close()
  let myChart
  if (!echarts.getInstanceByDom(canvaCharts)) {
    myChart = echarts.init(canvaCharts)
  } else {
    myChart = echarts.getInstanceByDom(canvaCharts)
  }

  let option = {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%']
      }
    },
    title: {
      left: 'center',
      text: titleText
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'time',
      min: new Date(minTime),
      max: new Date(maxTime),
      boundaryGap: false,
      data: datax
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      min: 'dataMin'
    },
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100
    }, {
      start: 0,
      end: 10,
      handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '80%',
      handleStyle: {
        color: '#fff',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    }],
    series: [
      {
        name: name,
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
          normal: {
            color: 'rgb(255, 70, 131)'
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgb(255, 158, 68)'
            }, {
              offset: 1,
              color: 'rgb(255, 70, 131)'
            }])
          }
        },
        data: datay
      }
    ]
  }
  myChart.setOption(option)
}
export { doDrag, drawSymbol, drawLineChart, getPolylineBYPoints, drawOLLine, createLabelStyle, getTypeIconPoint, workFace, convertSVGPath2Coord, addPersonNum, personOnCar, personOutCar, createPosition, createLabelStyleStaff }
// export { doDrag, drawLineChart, createElement, drawSymbol, drawBBox, drawLine, drawCircle, getPolylineBYPoints, buildClosePath, drawPath, drawOLLine, drawShapeWithLabel, attachAnimation, repositionLabel, createLabelStyle, getTypeIconPoint }
