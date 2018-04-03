<template>
    <section class="monitor-general">
        <div>
           <span><img class="vehicle-img" src='static/img/vehicle.png'/></span>
        </div>
        <div>
            <span><img src='static/img/staff.png'/></span>
        </div>
    </section>
</template>

<script>
export default {
  data() {
    return {
    }
  }
}
</script>

<style scoped lang="less">
    .monitor-general{
        position: absolute;
        height: 0.4rem;
        width: 90%;
        top: 10%;
        z-index: 9;
        display: flex;
        justify-content: space-between;
        div{
            width: 45%;
            height: 100%;
            background: #fff;
            position: relative;
            span{
                display: inline-block;
                width: 60px;
                height: 0;
                border-top: .4rem #09F solid;
                border-bottom: none;
                border-left: none;
                border-right: transparent 30px solid;
                border-top-left-radius: 5px;
                position: absolute;
                left: 0;
                img{
                    width: 70%;
                    top: -0.38rem;
                    left: .1rem;
                    position: absolute;
                    &.vehicle-img{
                        width: 90%;
                        top: -0.43rem;
                    }
                }
            }
        }
    }
</style>