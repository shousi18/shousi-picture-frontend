<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <GlobalSider class="sider"/>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer">
        <a href="https://blog.csdn.net/weixin_74879735?type=blog" target="_blank">
          <img src="https://img.shields.io/badge/向阳256-CSDN-blue" />
        </a>
        <a href="https://github.com/shousi18" style="margin-left: 20px" target="_blank">
          <img src="https://img.shields.io/badge/shousi18-Github-blue" />
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/layout/GlobalHeader.vue'
import GlobalSider from '@/components/layout/GlobalSider.vue'
</script>

<style scoped>
#basicLayout .header {
  padding-inline: 20px;
  background: #fff;
  color: unset;
  margin-bottom: 2px;
}

#basicLayout .sider {
  background: #fff;
  padding-top: 5px;
  border-right: 0.5px solid #eee;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

#basicLayout .content {
  padding: 28px;
  background: #fff;
  margin-bottom: 28px;
}

#basicLayout .footer {
  bottom: 0;
  padding: 20px;
  position: fixed;
  background: #efefef;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
