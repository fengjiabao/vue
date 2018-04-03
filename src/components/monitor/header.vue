<template>
  <header class="monitor-header">
    <section class="whfill">
      <div @click="changeSHowList">{{curTitle}}</div>
      <input :placeholder="curPlaceHolder">
      <div><img src='static/img/search.png'/></div>
    </section>
    <ul>
      <li v-for="(item, index) in list" v-if="showHeadList" @click='changeCurTitle(item)' :key="index">{{item.name}}</li>
    </ul>
  </header>
</template>

<script>
export default {
  data() {
    return {
      curTitle: '车辆',
      curPlaceHolder: '车牌、车牌首字母、卡号',
      list: [{name: '车辆',curPlaceHolder: '车牌、车牌首字母、卡号'},{name: '人员',curPlaceHolder: '人员、人员首字母、卡号'}],
      showHeadList: false,
      isactive: false
    }
  },
  methods:{
    changeSHowList: function () {
      this.showHeadList = !this.showHeadList
    },
    changeCurTitle: function (item) {
      this.changeSHowList()
      this.curPlaceHolder = item.curPlaceHolder
      this.curTitle = item.name
    }
  }
}
</script>

<style scoped lang="less">
.monitor-header{
  position: absolute;
  width: 100%;
  height: 0.38rem;
  z-index: 999;
  padding: 0.062rem 4%;
  box-sizing: border-box;
  background: linear-gradient(30deg, #7cf, #09f);
  section{
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-around;
    div{
      width: 0.3rem;
      height: 80%;
      background: #09F;
      color: #fff;
      line-height: 0.2rem;
      &:nth-child(3){
        background: #fff;
        display: flex;
        width: 0.2rem;
        img{
          width: 100%;
          height: auto;
        }
      }
    }
    input{
      border: none;
      height: 80%;
      width: 75%;
    }
  }
  ul{
    background: #f5f5f5;
    width: .8rem;
    padding: 0;
    li{
      list-style: none;
      height: 0.28rem;
      line-height: 0.28rem;
    }
  }
}
</style>