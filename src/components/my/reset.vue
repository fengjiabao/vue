<template>
    <div class="my-reset whfill">
        <article>
            <nav>
                <span>修改密码</span>
                <span @click="closePage">X</span>
            </nav>
            <section>
                <p v-for="(item,index) in list" :key='index'>
                    <span>{{item.name}}</span>
                    <input type='password' v-model='item.value' @focus='hideTips' :placeholder="item.placeholder"/>
                </p>
                <div v-if="showTips">{{tips}}</div>
                <p class="btn-save"><button @click="resetPwd">确定</button></p>
            </section>
        </article>
    </div>
</template>
<script>
export default{
  data () {
    return {
      showTips: false,
      list: [{name: '当前密码:', placeholder: '请输入当前密码...', value: ''}, {name: '新密码:', placeholder: '请输入新密码...', value: ''}, {name: '重复新密码:', placeholder: '请重复输入新密码...', value: ''}]
    }
  },
  props: ['message'], // 此处练习父子组件通信
  methods: {
    closePage: function () {
      this.$parent.showResetPwd = false
    },
    resetPwd: function () {
      if (!this.checkForm()) {
        this.showTips = true
        this.tips = '两次密码输入不一致，请核对后输入'
      } else {
          // to send msg to webserver~
      }
    },
    checkForm: function () {
      let setPwd = this.list[1].value, reptPwd = this.list[2].value
      return setPwd === reptPwd
    },
    hideTips: function () {
      this.showTips = false
    }
  }
}
</script>
<style scoped lang="less">
    .my-reset{
        background: rgba(0, 0, 0, 0.5);
        position: absolute;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        article{
            width: 90%;
            height: 60%;
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            nav{
                height: .35rem;
                background: #4af;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 .1rem;
                color: #fff;
                span:nth-child(2){
                    height: .3rem;
                    width: .2rem;
                    line-height: .3rem;
                }
            }
            section{
                flex: 1;
                padding: .12rem .24rem;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                align-items: flex-start;
                div{
                    width: 100%;
                    font-size: .12rem;
                    color: red;
                }
                p{
                    display: flex;
                    flex: 1;
                    width: 100%;
                    span,input{
                        height: .3rem;
                        line-height: .3rem;
                        border: none;
                        font-size: .12rem
                    }
                    input{
                        padding: 0 .1rem
                    }
                    span{
                        display: inline-block;
                        width: .7rem;
                        text-align: left;
                    }
                }
                .btn-save{
                    justify-content: center;
                    button{
                        width: 100%;
                        color: #fff;
                        font-size: .rem;
                        background: #09f;

                    }
                }
            }
        }
    }

</style>