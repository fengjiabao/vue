import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Home from '@/components/monitor/Home'
import Monitor from '@/components/monitor/Monitor'
import Historys from '@/components/monitor/History'
import My from '@/components/monitor/My'
import Login from '@/components/login/Login'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'active',
  routes: [
    // {
    //   path: '/:id',//一个路径参数，使用：标记
    //   name: 'User',
    //   component: User
    // }
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/Home',
      name: 'Home',
      component: Home,
      children: [
        {path: '/Monitor', component: Monitor},
        {path: '/History', component: Historys},
        {path: '/My', component: My}
      ]
    },
    {
      path: '/HelloWorld',
      name: 'HelloWorld',
      component: HelloWorld
    }
  ]
})
