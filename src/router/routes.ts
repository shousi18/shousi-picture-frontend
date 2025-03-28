import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import ACCESS_ENUM from '@/access/accessEnum.ts'
import { h } from 'vue'
import AddPicturePage from '@/pages/AddPicturePage.vue'
import PictureManagePage from '@/pages/admin/PictureManagePage.vue'
import PictureDetailPage from '@/pages/PictureDetailPage.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: '主页',
    component: HomePage,
    meta: {
      icon: () => h(HomeOutlined),
    },
  },
  {
    path: '/user/login',
    name: '用户登录',
    component: UserLoginPage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/admin',
    name: '数据管理',
    children: [
      {
        path: '/admin/userManage',
        name: '用户管理',
        component: UserManagePage,
        meta: {
          access: ACCESS_ENUM.ADMIN,
        },
      },
      {
        path: '/admin/pictureManage',
        name: '图片管理',
        component: PictureManagePage,
        meta: {
          access: ACCESS_ENUM.ADMIN,
        },
      },
    ],
  },
  {
    path: '/user/register',
    name: '用户注册',
    component: UserRegisterPage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/add_picture',
    name: '创建图片',
    component: AddPicturePage,
  },
  {
    path: '/picture/:id',
    name: '图片详情',
    component: PictureDetailPage,
    props: true,
    meta: {
      hideInMenu: true,
    },
  },
]
