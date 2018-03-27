const url = 'http://localhost:8086'
const connectionOpts = {
  'reconnectionAttempts': 'Infinity', // avoid having user reconnect manually in order to prevent dead clients after a server restart
  'timeout': 10000, // 10s, before connect_error and connect_timeout are emitted.
  'transports': ['websocket']
}
export {url, connectionOpts}
