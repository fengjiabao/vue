<template>
    <!-- <div>{{ $route.params.id }}</div> -->
    <!--//匹配到一个路由时，参数值会被设置到 this.$route.params，可以在每个组件内使用-->
    <div>
      <div>I am user html</div>
      <p>
        <router-link to="/userHome">child1</router-link>
        <router-link to="/userPost">child2</router-link>
      </p>
      <router-view/>
    </div>
</template>
    
<script>
export default {
  name: 'User'
}
</script>
    
<style>

</style>

