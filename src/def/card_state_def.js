const cardStateDef = {
    vehicle: {
      name: 'vehicle',
      label: '车辆',
      table: 'dat_vehicle_dync', // 动态 push 数据
      keyIndex: 0, // table中key值在 field 中的位置
      iconName: 'icon-truck',
      fields: {
        names: ['card_id', 'card_type_id', 'number', 'x', 'y', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'dept_id', 'state_card_id', 'state_object_id', 'state_biz_id', 'speed', 'map_pos'], // 字段
        types: ['NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'], // 字段类型
        labels: ['卡号', '卡类型', '车牌号', 'X坐标', 'Y坐标', '最后出车时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域', '部门', '电量', '运动状态', '状态', '速度', '位置']
      }
    },
  
    staff: {
      name: 'staff',
      label: '人员',
      table: 'dat_staff_dync', // 动态 push 数据
      keyIndex: 0, // table中key值在 field 中的位置
      iconName: 'icon-bizman-group',
      fields: {
        names: ['card_id', 'card_type_id', 'number', 'x', 'y', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'dept_id', 'state_card_id', 'state_object_id', 'state_biz_id', 'speed', 'map_pos'], // 字段
        types: ['NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'], // 字段类型
        labels: ['卡号', '卡类型', '姓名', 'X坐标', 'Y坐标', '入井时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域', '部门', '电量', '运动状态', '状态', '速度', '位置']
      }
    },
  
    adhoc: {
      name: 'adhoc',
      label: '自组网设备',
      table: 'dat_adhoc_dync', // 动态 push 数据
      keyIndex: 0, // table中key值在 field 中的位置
      fields: {
        names: ['card_id', 'card_type_id', 'number', 'x', 'y', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'dept_id', 'state_card_id', 'state_object_id', 'state_biz_id', 'speed'], // 字段
        types: ['NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER'], // 字段类型
        labels: ['卡号', '卡类型', '名称', 'X坐标', 'Y坐标', '下井时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域', '部门', '设备状态', '运动状态', '状态', '速度']
      }
    }
  }
  
  module.exports = cardStateDef
  