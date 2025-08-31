<!-- src/App.vue -->
<template>
  <div id="app">
    <el-container style="height: 98vh;">
      <el-aside :width="isCollapse ? '64px' : '180px'" style="background-color: #f0f2f5; transition: width 0.3s;">
        <div class="sidebar-header">
          <el-button 
            type="text" 
            @click="toggleCollapse"
            class="collapse-btn"
          >
            <el-icon>
              <Expand v-if="isCollapse" />
              <Fold v-else />
            </el-icon>
          </el-button>
        </div>
        <el-collapse v-model="activeNames" accordion class="sidebar-collapse">
          <el-collapse-item name="1">
            <template #title>
              <el-tooltip 
                content="报告管理" 
                placement="right" 
                :show-after="200"
                :disabled="!isCollapse"
              >
                <div class="title-content">
                  <el-icon><Document /></el-icon>
                  <span v-show="!isCollapse" style="margin-left: 8px;">报告管理</span>
                </div>
              </el-tooltip>
            </template>
            <div class="collapse-content">
              <el-tooltip 
                content="报告生成" 
                placement="right" 
                :show-after="200"
                :disabled="!isCollapse"
              >
                <div 
                  class="collapse-item" 
                  :class="{ active: currentRoute === '/' }"
                  @click="handleSelect('Reports')"
                >
                  <el-icon><EditPen /></el-icon>
                  <span v-show="!isCollapse">报告生成</span>
                </div>
              </el-tooltip>
              <el-tooltip 
                content="模板管理" 
                placement="right" 
                :show-after="200"
                :disabled="!isCollapse"
              >
                <div 
                  class="collapse-item" 
                  :class="{ active: currentRoute === '/templates' }"
                  @click="handleSelect('Templates')"
                >
                  <el-icon><Files /></el-icon>
                  <span v-show="!isCollapse">模板管理</span>
                </div>
              </el-tooltip>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-aside>

      <el-container>
        <el-header style="background-color: #409EFF; color: white; text-align: center; display: flex; align-items: center; justify-content: center;">
          <h2 style="margin: 0;">报告生成系统</h2>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { Document, EditPen, Files, Expand, Fold } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    Document,
    EditPen,
    Files,
    Expand,
    Fold
  },
  data() {
    return {
      activeNames: ['1'],
      currentRoute: '/',
      isCollapse: true
    }
  },
  mounted() {
    this.currentRoute = this.$route.path
  },
  watch: {
    $route(to) {
      this.currentRoute = to.path
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    handleSelect(key) {
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

.sidebar-header {
  padding: 8px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
}

.collapse-btn {
  color: #606266;
  font-size: 16px;
}

.collapse-btn:hover {
  color: #409EFF;
}

.sidebar-collapse {
  border: none;
  background-color: transparent;
}

.sidebar-collapse .el-collapse-item__header {
  background-color: transparent;
  border: none;
  padding: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.sidebar-collapse .el-collapse-item__header:hover {
  background-color: #e6f7ff;
}

.sidebar-collapse .el-collapse-item__content {
  padding: 0;
  background-color: transparent;
}

.collapse-content {
  padding: 8px 0;
}

.title-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.collapse-item {
  display: flex;
  align-items: center;
  padding: 12px 16px 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  white-space: nowrap;
}

.collapse-item:hover {
  background-color: #e6f7ff;
  color: #409EFF;
}

.collapse-item.active {
  background-color: #e6f7ff;
  color: #409EFF;
  border-right: 3px solid #409EFF;
}

.collapse-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
  flex-shrink: 0;
}

.collapse-item span {
  font-size: 14px;
}

/* 收起状态下的样式调整 */
.sidebar-collapse .el-collapse-item__header {
  justify-content: center;
}

.sidebar-collapse .el-collapse-item__header .el-icon {
  margin-right: 0;
}

/* 收起状态下的子菜单项样式 */
.sidebar-collapse .collapse-item {
  justify-content: center;
  padding: 12px 8px;
}

.sidebar-collapse .collapse-item .el-icon {
  margin-right: 0;
}

/* Tooltip样式优化 */
.el-tooltip__trigger {
  width: 100%;
}
</style>
