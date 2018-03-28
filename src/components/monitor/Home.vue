<template>
    <!-- <div>{{ $route.params.id }}</div> -->
    <!--//匹配到一个路由时，参数值会被设置到 this.$route.params，可以在每个组件内使用-->
    <div class="whfill">
      <router-view/>
      <p>
        <router-link to="/Monitor">
          <img src='static/img/monitor.png'/>
          <span>实时</span>
        </router-link>
        <router-link to="/History">
          <img src='static/img/history.png'/>
          <span>历史</span>
        </router-link>
        <router-link to="/My">
          <img src='static/img/my.png'/>
          <span>我的</span>
        </router-link>
      </p>
    </div>
</template>
    
<script>
export default {
  name: 'Home'
}
</script>
    
<style scoped lang="less">
  p{
    display: flex;
    justify-content: space-around;
    .active{
      color: #09f
    }
    a{
      width: 33%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: #666;
      img{
        width: 30%;
        height: auto;
      }
    }
  }
</style>

