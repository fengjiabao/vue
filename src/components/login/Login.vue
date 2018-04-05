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
          <input type="text"  placeholder="用户名..." v-model="user"/>
          <input type="password"  placeholder="密码..." v-model="pwd"/>
          <p v-if='showTips'>{{tips}}</p>
          <button @click="startLogin">登录</button>
        </div>
    </div>
  </div>
</template>

<script>
import Socket from '@/socket/socket.js' // to do
import { mapState } from 'vuex' // 简化computed引入

export default {
  name: 'Login',
  data () {
    return {
      user: '',
      pwd: '',
      sock: ''
    }
  },
  // computed:{
  //   showTips () {
  //     return this.$store.state.storeLogin.showTips
  //   }
  // },
  computed: mapState({ showTips: state => state.storeLogin.showTips }), // 简化写法
  methods: {
    startLogin: function () {
      if (!this.sock) {
        this.sock = new Socket()
      }
      if (this.sock.socket.connected) {
        this.doLogin(this.user, this.pwd)
      }
    },
    doLogin: function (name, pwd) {
      let reqMsg = {
        cmd: 'login',
        data: {
          user_name: name,
          user_pass: pwd
        }
      }
      this.pwd = pwd
      this.sock.socket.emit('USER', reqMsg, (res) => {
        if (res.code === 0) {
          this.$store.commit('hide')
          this.$store.commit('saveLoginData', {name: name, pwd: pwd})
          console.log('store------------', this.$store)
          this.$router.replace({ path: '/Monitor' })
        } else {
          this.$store.commit('show')
          this.tips = '登录失败！'
        }
      })
    }
    // focus: function () {
    //   this.showTips = false
    // }
  },
  watch: {// 此处当账户和密码改变时隐藏tips,也可以利用onfocus事件来实现，但此处为了学习watch  可参考和commputed区别
    user: function (val) {
      this.$store.commit('hide')
    },
    pwd: function (val) {
      this.$store.commit('hide')
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
      padding: 0 0.1rem;
      font-size: 0.14rem;
    }
    button{
      background: #09f;
      color: #fff;
    }
    p{
      color: red;
    }
}
</style>
