/**
 * socket.io 通讯的事件名称
 * 全部大写，与 socket.io 本身的事件名称区别。
 *
 * @type {Object}
 */
let EVT = {
    USER: 'USER',
    FILE: 'FILE',
    META: 'META',
    PUSH: 'PUSH',
    CALL: 'CALL',
    EVENT: 'EVENT',
    ALARM: 'ALARM',
    HELP: 'HELP',  // help me
    TIME: 'TIME',
    ALL: 'ALL'
  }
  
  let CMD = {
    USER: {
      LOGIN: 'login',
      LOGOUT: 'logout',
      MODIFY: 'modify',
      STANDBY: 'standby'
    },
  
    FILE: {
      UPLOAD: 'upload',
      DOWNLOAD: 'download'
    },
  
    META: {
      DATA: 'meta_data',
      ALL_DATA: 'all_meta_data',
      META_DEF: 'meta_definition',
      CARD_DEF: 'card_definition',
      PULL_ALL: 'meta_data_all',
      UPDATE: 'update'
    },
  
    PUSH: { // 客户端无请求，由服务器直接 PUSH 过来
  
    },
  
    CALL: { // 服务端无应答，由客户端发往服务端
  
    },
    HELP: {
  
    },
    ALL: { // 登录请求全部数据
  
    }
  }
  
  let OP = {
    INSERT: 'insert',
    UPDATE: 'update',
    DELETE: 'delete',
    QUERY: 'query'
  }
  
  export { EVT, CMD, OP }
  