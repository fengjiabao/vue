<template>
    <!-- <div>{{ $route.params.id }}</div> -->
    <!--//匹配到一个路由时，参数值会被设置到 this.$route.params，可以在每个组件内使用-->
    <div class="history-root">
        <span>Hello, welcome to history page!</span>
    </div>
</template>
    
<script>

</script>
    
<style scoped lang="less">
    .history-root{
        width: 100%;
        height: 90%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: .3rem;
    }

</style>
