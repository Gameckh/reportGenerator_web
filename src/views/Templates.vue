<!-- src/views/Templates.vue -->
<template>
  <div>
    <el-row>
      <el-col :span="24">
        <h2>上传模板</h2>
        <el-form :model="uploadForm" @submit.prevent="handleUpload">
          <el-form-item label="模板文件">
            <el-upload
              class="upload-demo"
              action="#" 
              drag
              :limit="1"
              :on-exceed="handleExceed"
              :on-change="changeFile"
              :auto-upload="false"
              :file-list="fileList"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-upload="beforeUpload"
              :before-remove="beforeRemove"
              accept=".docx"
            >
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpload">上传</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

      
    <el-row>
      <el-col :span="24">
        <h2>模板列表</h2>
        <el-table :data="templates" style="width: 100%">
          <el-table-column prop="id" label="ID" width="50"></el-table-column>
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button
                size="mini"
                type="primary"
                @click="downloadTemplate(row.name)"
              >下载</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="deleteTemplate(row.name)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'TemplateManagerPage', // 改为多字名称
  data() {
    return {
      uploadForm: {
        name: '',
      },
      fileList: [],
      templates: [],
    };
  },
  methods: {
    changeFile(file) {
      this.fileList = [file.raw];
      return false;
    },
    handleExceed() {
      this.$message.error('只能上传一个文件');
    },
    async handleUpload() {
      if (this.fileList.length === 0) {
        this.$message.error('请上传模板文件');
        return;
      }
      const formData = new FormData();
      formData.append('file', this.fileList[0]);
      try {
        // eslint-disable-next-line no-unused-vars
        const response = await axios.post('/api/templates/upload', formData, {
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
        });
        this.$message.success('模板上传成功');
        this.fileList = [];
        this.uploadForm.name = '';
        this.fetchTemplates();
      } catch (error) {
        this.$message.error('模板上传失败');
        console.error(error);
      }
    },
    async fetchTemplates() {
      try {
        const response = await axios.get('/api/templates/list');
        this.templates = response.data;
      } catch (error) {
        this.$message.error('获取模板列表失败');
        console.error(error);
      }
    },
    async downloadTemplate(templateName) {
      try {
        const response = await axios.get(`/api/templates/download/${templateName}`, {
          responseType: 'blob' // 接收二进制文件
        });

        // 创建文件下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', templateName);
        document.body.appendChild(link);
        link.click();

        this.$message.success('模板下载成功');
      } catch (error) {
        this.$message.error('下载模板失败');
        console.error(error);
      }
    },
    async deleteTemplate(templateName) {
      try {
        await axios.delete(`/api/templates/delete/${templateName}`);
        this.$message.success('模板删除成功');
        this.fetchTemplates();
      } catch (error) {
        this.$message.error('删除模板失败');
        console.error(error);
      }
    },
  },
  mounted() {
    this.fetchTemplates();
  },
};
</script>

<style scoped>
.upload-title {
  width: 500px;
}
.upload-demo {
  width: 300px;
  font-size: 28px;
  color: #1890ff;
}
</style>
