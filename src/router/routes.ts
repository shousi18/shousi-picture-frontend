import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import {
  HomeOutlined,
  MessageOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue'
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
import SearchPicturePage from '@/pages/picture/SearchPicturePage.vue'
import SearchPictureBySoPage from '@/pages/picture/SearchPictureBySoPage.vue'
import SpaceAnalyzePage from '@/pages/analyze/SpaceAnalyzePage.vue'
import SpaceUserManagePage from '@/pages/admin/SpaceUserManagePage.vue'
import UserInfoPage from '@/pages/user/UserInfoPage.vue'
import MyPicturesPage from '@/pages/user/MyPicturesPage.vue'
import MyMessagePage from '@/pages/user/MyMessagePage.vue'
import MemberCodePage from '@/pages/admin/MemberCodePage.vue'

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
      access: ACCESS_ENUM.NOT_LOGIN,
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
      {
        path: '/admin/memberCode',
        name: '会员码管理',
        component: MemberCodePage,
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
      access: ACCESS_ENUM.NOT_LOGIN,
    },
  },
  {
    path: '/user/info',
    name: '用户信息',
    component: UserInfoPage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/add_picture',
    name: '创建图片',
    component: AddPicturePage,
    meta: {
      icon: () => h(PlusCircleOutlined),
    },
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
    meta: {
      hideInMenu: true,
    },
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
    },
  },
  {
    path: '/my_pictures',
    name: '我的发布',
    component: MyPicturesPage,
    meta: {
      icon: () => h(UploadOutlined),
    },
  },
  {
    path: '/my_message',
    name: '我的消息',
    component: MyMessagePage,
    meta: {
      icon: () => h(MessageOutlined),
    },
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
  {
    path: '/search_picture',
    name: '图片搜索',
    component: SearchPicturePage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/search_picture_so',
    name: '图片搜索(360)',
    component: SearchPictureBySoPage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/space_analyze',
    name: '空间分析',
    component: SpaceAnalyzePage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/spaceUserManage/:id',
    name: '空间成员管理',
    component: SpaceUserManagePage,
    props: true,
    meta: {
      hideInMenu: true,
    },
  },
]
