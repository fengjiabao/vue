import io from 'socket.io-client' // eslint-disable-line

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
    this.socket = io(url, connectionOpts)
    window.xsocket = this.socket

    // this.registerSocketEventHandlers()
    // this.registerGlobalEventHandlers()
  }

  getConnection (timeout) {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.connected) {
        console.log('Socket.getConnection: Aready connected.')
        resolve(this.socket)
      } else {
        console.log('Socket.getConnection: Socket do NOT connect.')
      }

      // set our own timeout in case the socket ends some other way than what we are listening for
      let timer = setTimeout(function () {
        timer = null
        error('Socket.getConnection: local timeout.')
      }, timeout)

      // common error handler
      function error (data) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        reject(data)
      }

      // success
      this.socket.on('connect', () => {
        clearTimeout(timer)
        resolve(this.socket)
      })

      // errors
      this.socket.on('connect_error', error)
      this.socket.on('connect_timeout', error)
      this.socket.on('error', error)
      this.socket.on('disconnect', (error) => {
        console.log(error)
      })

      // here reconnect to remote
      this.socket.connect() // 这里是异步
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
      // xbus.trigger('FAILED-FOR-NOCONN', { eventName: eventName })
    }
    return ret
  }
 }