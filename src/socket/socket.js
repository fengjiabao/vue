import io from 'socket.io-client' // eslint-disable-line
import { EVT,CMD} from '../def/protocol.js'

// const url = window.location.host
const url = 'http://localhost:8086'
// const url = 'http://local.beijingyongan.com:9000'

const connectionOpts = {
  // "force new connection": true,
  'reconnectionAttempts': 'Infinity', // avoid having user reconnect manually in order to prevent dead clients after a server restart
  'timeout': 10000, // 10s, before connect_error and connect_timeout are emitted.
  'transports': ['websocket']
}
export default class Socket {
  constructor () {
    console.log('Init websocket. The url is: ', url)
    this.socket = io.connect(url, connectionOpts)
    window.xsocket = this.socket

    this.registerSocketEventHandlers()
    this.registerGlobalEventHandlers()
  }

  registerSocketEventHandlers () {
    this.socket.on(EVT.META, (res) => {
      let cmd = res.cmd

      switch (cmd) {
        case CMD.META.META_DEF:
          eventBus.$emit('META-DEF', res)
          break
        case CMD.META.CARD_DEF:
          eventBus.$emit('CARD-STATE-DEF', res)
          break
        case CMD.META.DATA:
          eventBus.$emit('META-DATA', res)
          break
        case CMD.META.UPDATE:
          eventBus.$emit('META-UPDATE-DB-RES', res) // deal with in meta-dialog
          break
        case CMD.META.PULL_ALL:
          eventBus.$emit('ALL-DATA-HAS-PULL', res)
          break
        default:
          console.warn(`未知的 META 指令：cmd = ${cmd}`)
          break
      }
    })
  }

  registerGlobalEventHandlers(){
    let self = this
    eventBus.$on('PULL-DOWN-METADATA', (msg) => {
      self.sendMsg(EVT.META, msg)
    })

    eventBus.$on('REPT-FETCH-DATA', (msg) => {
      self.getRept(msg)
    })
  }

  sendMsg (eventName, msg, cb) {
    let socket = this.socket

    let ret = false
    if (socket && socket.connected) {
      cb && cb instanceof Function ? socket.emit(eventName, msg, cb) : socket.emit(eventName, msg)
      ret = true
    } else {
      console.warn('Socket.js : The socket is disconnected.')
      eventBus.$emit('FAILED-FOR-NOCONN', { eventName: eventName })
    }
    return ret
  }

  getRept (msg) {
    this.sendMsg('REPT', msg.req, (res) => {
      let ds = {
        def: msg.def,
        rows: res.data,
        total: res.total,
        pageIndex: res.pageIndex
      }
      eventBus.$emit('REPT-SHOW-RESULT', ds)
    })
  }
 }
