<template>
  <div class="page-login whfill">
   <div class="login-head">
      <img src="static/img/luanlogo.png" class="customer-logo"/>
    </div>
    <div class="login-content">
        <div class="slogan-panel">
          <div class="slogan">矿井北斗精准定位安全管理系统</div>
          <div class="minor-slogan">精益化生产 · 精准化管控 · 精细化操作</div>
        </div>
        <div class="login-form">
          <input type="text" placeholder="用户名" v-model="user"/>
          <input type="text" placeholder="密码" v-model="pwd"/>
          <button @click="startLogin">登录</button>
        </div>
    </div>
  </div>
</template>

<script>
// import Socket from '@/socket/socket.js'
import io from 'socket.io-client' 
export default {
  name: 'Login',
  data () {
    return {
      user: '',
      pwd: '',
      // Socket: Socket,
      sock: ''
    }
  },
  methods: {
    startLogin: function () {
     if (!this.sock) {
        this.sock = io.connect('http://localhost:8086',{
          // "force new connection": true,
          'reconnectionAttempts': 'Infinity', // avoid having user reconnect manually in order to prevent dead clients after a server restart
          'timeout': 10000, // 10s, before connect_error and connect_timeout are emitted.
          'transports': ['websocket']
        })
      }
    console.log('this.sock',this.sock)
    //  let self = this
    //  this.sock.getConnection(3000).then((socket) => {
    //   self.doLogin(username, userpwd)
    //  }).catch((msg) => {
    //   console.warn('Get connection error, please try later: ', msg)
    // })
      // this.$router.replace({ path: '/User' })
    },
    doLogin: function (name, pwd) {
      let reqMsg = {
      cmd: 'LOGIN',
      data: {
        user_name: name,
        user_pass: pwd
      }
      }
      this.pwd = pwd
      this.sock.socket.emit('USER', reqMsg, (data) => {
        console.log('data---------',data)
      })

    }
  }
}
</script>

<style scoped lang="less">
.login-content{
    height: 4rem;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .slogan-panel{
        height: .8rem;
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        .slogan{
          font-size: .19rem
        }
        .minor-slogan{
          font-size: .14rem
        }
    }
}
.page-login{
    background: #4af;
    background-image: linear-gradient(15deg, #009fff, #05b720, #0586f5, #063394);
    .login-head{
      height: .7rem;
      padding: 0.05rem,0,0,0.08rem;
      .customer-logo{
        position: absolute;
        top: .1rem;
        left: .1rem;
      }
    }
}

.login-form{
    height: 1.5rem;
    padding: 0 28%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    input,button{
      height: .28rem;
      border: none;
      padding: 0 0.1rem
    }
    button{
      background: #09f;
      color: #fff
    }
}
</style>
