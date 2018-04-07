<template>
    <!-- <div>{{ $route.params.id }}</div> -->
    <!--//匹配到一个路由时，参数值会被设置到 this.$route.params，可以在每个组件内使用-->
    <div class="my-root">
        <div class='my-user'>
            <div>
                 <img src='static/img/icon256.png'/>
                 <span>{{userName}}</span>
            </div>
        </div>
        <ul>
            <li v-for="(item,index) in myList" :key='index' @click="doOperate(item.type)">{{item.name}}</li>
        </ul>
        <reset-pwd v-if='showResetPwd' :message='showResetPwd'></reset-pwd>
        <!-- 父组件向子组件传递属性时v-bind传递变量，不带v-bind传递字符串 -->
    </div>
</template>
    
<script>
import resetPwd from './reset.vue'
import {mapState} from 'vuex'
export default {
  name: 'My',
  data () {
    return {
      showResetPwd: false,
      myList: [{name: '更新配置', icon: '', type: 'doUpdate'}, {name: '修改密码', type: 'resetPwd'}, {name: '退出系统', type: 'layOut'}]
    }
  },
  components: {
    resetPwd
  },
  computed: mapState({userName: state => state.storeLogin.user}),
  methods: {
    doOperate: function (type) {
      switch (type) {
        case 'doUpdate':
          console.log('showResetPwd', this.showResetPwd)
          break
        case 'resetPwd':
          console.log('reset')
          this.showResetPwd = true
          break
        case 'layOut':
          console.log('layOut')
          this.$router.replace({ path: '/' })
          break
      }
    }
  }
}
</script>
    
<style scoped lang="less">
.my-root{
    width: 100%;
    height: 90%;
    .my-user{
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40%;
        background: linear-gradient(30deg, #7cf, #09f);
        div{
            width: .6rem;
            height: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;
            img{
                width: 100%;
                border-radius: 100%;
                height: auto;
            }
            span{
                font-size: .2rem;
                color: #fff;
            }
        }
    }
    ul{
        height: 30%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 0 .2rem;
        li{
            list-style: none;
            border-bottom: 1px dotted #ddd;
            font-size: .15rem
        }
    }
}
</style>
