import io from 'socket.io-client' // eslint-disable-line
import { EVT, CMD } from '../def/protocol.js'
import { toJson } from '../js/common.js'

// const url = window.location.host
// const url = 'http://localhost:8086'
const url = 'http://60.220.238.150:8086'

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

    this.socket.on(EVT.PUSH, (ress) => {
      // if (!xdata.metaStore.firstPull) return
      // window.xhint.close()
      let res = toJson(ress)
      if (!res) {
        console.warn('PUSH null message.')
        return
      }
      let cmd = res.cmd
      console.log('cmd',cmd)
      let data = res.data  // res.data could be string
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (error) {
          console.warn('CAN NOT parse the PUSHed JSON data: ', data)
          return
        }
      }

      switch (cmd) {
        case 'counting':
          eventBus.$emit('COUNTING-UPDATE', {
            data: data
          })
          break
        case 'event':
          eventBus.$emit('ALARM-UPDATE', {data: data})
          break

        case 'positon_all': // when login, push all the cards under well
          eventBus.$emit('CARD-UPDATE-POS', data)
          break
        case 'pos_map':
          eventBus.$emit('CARD-UPDATE-POS', data)
          eventBus.$emit('COLLECTOR-STATUS-LOGIN')
          // this.updateLastPushTime()
          break

        case 'down_mine':
          eventBus.$emit('CARD-ADD-CARD', data)
          break
        case 'up_mine':
          eventBus.$emit('CARD-REMOVE-CARD', data)
          break
        case 'coal_cutting':
          eventBus.$emit('COAL-CUTTING-START', data)
          break
        case 'tunneller_stat':
          eventBus.$emit('TUNNELLER-STAT-START', data)
          break
        case 'special_area_up_mine':
          eventBus.$emit('CARD-REMOVE-ICON', data)
          break
        case 'device_state':
          eventBus.$emit('DEVICE-UPDATE-STATE', data)
          break
        case 'call_card_resp':
          eventBus.$emit('CALL-CARD-LIST', data)
          break
        case 'call_card_cancel_resp':
          eventBus.$emit('CAll-CARD-REMOVE', data)
          break
        case 'light_ctrl_rsp':
          eventBus.$emit('DEVICE-CHANGE-STATE', data)
          break

        case 'count_detail_resp':
          eventBus.$emit('ALARM-DETAIL-COUNT', data)
          break

        case 'alarm_done':
          // console.log('Got remote ALARM-DONE. \n', res)
          eventBus.$emit('ALARM-DONE', res)
          break

        case 'helpme_done':
          // console.log('Got remote HELPME-DONE. \n', res)
          eventBus.$emit('HELPME-DONE', res)
          break

        case 'leader_arrange':
          eventBus.$emit('CURRENT-LEADER-ARRANGE', data)
          break

        // case 'collector_status':
        //   // console.log('Got remote collector-status. \n', res)
        //   eventBus.$emit('COLLECTOR-STATUS', res)
        //   this.updateLastPushTime()
        //   break

        case 'deal_hand_up_res':
          eventBus.$emit('DRAG-HANDUP-CARD-RES', data)
          break
        
        case 'nosignal_staffs':
          eventBus.$emit('CARD-NOSIGNAL', data)
          break

        case 'resp_all_data':
          if (!this.respAllData) {
            this.respAllData = !this.respAllData
            for (let i = 0; i < data.length; i++) {
              let row = data[i]
              switch (row.cmd) {
                case 'pos_map':
                  eventBus.$emit('POS-ALL-DATA', row)
                  break
                case 'special_area_up_mine':
                  eventBus.$emit('RESP-ALL-DATA', row)
                  break
                case 'event':
                  eventBus.$emit('ALARM-UPDATE', row)
                  break
                case 'callcardlist':
                case 'call_card_resp':
                  eventBus.$emit('CALL-CARD-LIST', row.data)
                  break
                case 'tunneller_stat':
                  eventBus.$emit('TUNNELLER-STAT-START', row.data)
                  break
                case 'coal_cutting':
                  eventBus.$emit('COAL-CUTTING-START', row.data)
                  break
                case 'leader_arrange':
                  eventBus.$emit('CURRENT-LEADER-ARRANGE', row.data)
                  break
              }
            }
          }
          break

        case 'time':
          eventBus.$emit('SERVER-DRIVER-TIME', res)
          break
        case 'environmental_data':
          eventBus.$emit('ENVIRONMENTAL-DATA-START', data)
          break
        case 'person_on_car':
          eventBus.$emit('PERSON-ON-CAR', data)
          break
        case 'resp_all_person_on_car':
          eventBus.$emit('RESP-PERSON-ONCAR', data)
          break
        case CMD.META.DATA:
          eventBus.$emit('META-DATA', res)
          break
        default:
          console.log('res--------',res)
          console.warn(`未知的 PUSH 消息指令：cmd = ${cmd}`)
          break
      }
    })
  }

  registerGlobalEventHandlers () {
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
