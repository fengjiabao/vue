import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import User from '@/components/User'
import UserHome from '@/components/UserHome'
import UserPost from '@/components/UserPost'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/:id',//一个路径参数，使用：标记
    //   name: 'User',
    //   component: User
    // }
    {
      path: '/User',
      name: 'User',
      component: User,
      children: [
        {path: '/userHome', component: UserHome},
        {path: '/userPost', component: UserPost}
      ]
    },
    {
      path: '/HelloWorld',
      name: 'HelloWorld',
      component: HelloWorld
    }
  ]
})
