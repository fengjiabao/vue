import io from 'socket.io-client' // eslint-disable-line
import { EVT } from '../def/protocol.js'

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
  }

  registerSocketEventHandlers () {
    this.socket.on(EVT.META, (res) => {
      console.log('res---',res)
      console.log('eventbus',eventBus)
    })
  }
 }
