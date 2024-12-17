<!-- src/App.vue -->
<template>
  <div id="app">
    <el-container style="height: 96vh;">
      <el-aside width="200px" style="background-color: #f0f2f5;">
        <el-menu
          default-active="Reports"
          class="el-menu-vertical-demo"
          @select="handleSelect"
        >
          <el-menu-item index="Reports">报告生成</el-menu-item>
          <el-menu-item index="Templates">模板管理</el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="background-color: #409EFF; color: white; text-align: center;">
          <h2>报告生成系统</h2>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    handleSelect(key) { // 移除 keyPath
      if (key === 'Reports') {
        this.$router.push('/');
      } else if (key === 'Templates') {
        this.$router.push('/templates');
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
