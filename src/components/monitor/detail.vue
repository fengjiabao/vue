<template>
    <div class="monitor-detail">
        <nav><span @click="close">x</span></nav>
    </div>
</template>
<script>
export default {
  methods: {
      close: function (params) {
          this.$parent.showSumDetail = false
      }
  }
}
</script>
<style lang="less" scoped>
    .monitor-detail{
        position: absolute;
        top: 21%;
        width: 90%;
        height: 65%;
        z-index: 999;
        background: #fff;
        nav{
            width: 100%;
            height: .3rem;
            background: #09f;
            padding: 0 0.05rem;
            box-sizing: border-box;
            span{
                width: .2rem;
                height: .3rem;
                line-height: .3rem;
                font-size: .2rem;
                color: #fff;
                float: right;
            }
        }
    }
</style>

