// 将毫秒数格式化为 hh:mm:ss 格式
function formatElapsedTime (ms) {
    if (ms <= 0) {
      return '00:00:00'
    }
  
    const h = 60 * 60 * 1000
    const m = 60 * 1000
    const s = 1000
  
    let hh = Math.floor(ms / h)
    let mm = Math.floor(ms % h / m)
    let ss = Math.floor(ms % h % m / s)
  
    let shh = paddingLeft(hh)
    let smm = paddingLeft(mm)
    let sss = paddingLeft(ss)
  
    return shh + ':' + smm + ':' + sss
  }

  function toJson (data) {
    if (typeof data === 'object') {
      return data
    }
  
    let ret = null
    if (data && (typeof data === 'string')) {
      try {
        ret = JSON.parse(data)
      } catch (error) {
        console.warn('Can NOT parse the input data to be JSON : ', data)
      }
    } else {
      console.warn('The input data\'s type is NOT string : ', data)
    }
  
    return ret
  }

  export { formatElapsedTime,toJson }