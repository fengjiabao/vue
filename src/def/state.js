// 定义 PUSH 消息的数据结构
// PUSH 过来的消息，数据统一采用数组的形式。所以在读取的时候，需要严格的字段顺序

// 卡状态数组的数据结构
const CARD = {
    card_id: 0,
    card_type_id: 1,  // 卡类型：staff, 人卡； vehicle, 车卡
    object_id: 2,   // 卡绑定对象的编号，比如：车是 车牌号；人是 身份证。
    x: 3,
    y: 4,
    down_time: 5,
    enter_area_time: 6,
    rec_time: 7,
    work_time: 8,
    map_id: 9,
    area_id: 10,
    dept_id: 11,
    state_card: 12,
    state_object: 13,
    state_biz: 14,
    speed: 15,
    mark_id: 16,
    mark_direction: 17,
    mark_distance: 18,
    occupation_level_id: 19
  }
  export { CARD }
  