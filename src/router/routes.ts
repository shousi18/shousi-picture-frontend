import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import ACCESS_ENUM from '@/access/accessEnum.ts'
import { h } from 'vue'
import AddPicturePage from '@/pages/picture/AddPicturePage.vue'
import PictureManagePage from '@/pages/admin/PictureManagePage.vue'
import PictureDetailPage from '@/pages/picture/PictureDetailPage.vue'
import AddPictureBatchPage from '@/pages/picture/AddPictureBatchPage.vue'
import SpaceManagePage from '@/pages/admin/SpaceManagePage.vue'
import AddSpacePage from '@/pages/space/AddSpacePage.vue'
import MySpacePage from '@/pages/space/MySpacePage.vue'
import SpaceDetailPage from '@/pages/space/SpaceDetailPage.vue'

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
      {
        path: '/admin/spaceManage',
        name: '空间管理',
        component: SpaceManagePage,
        meta: {
          access: ACCESS_ENUM.ADMIN,
        },
      },
    ],
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
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
    path: '/add_picture/batch',
    name: '创建批量图片',
    component: AddPictureBatchPage,
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: '/add_space',
    name: '创建空间',
    component: AddSpacePage,
  },
  {
    path: '/my_space',
    name: '空间跳转',
    component: MySpacePage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/space/:id',
    name: '我的空间',
    component: SpaceDetailPage,
    props: true,
    meta: {
      hideInMenu: true,
    }
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
