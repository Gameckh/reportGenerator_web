<!-- src/views/Templates.vue -->
<template>
  <div>
    <el-row>
      <el-col :span="20">
        <h2>上传模板</h2>
        <el-form :model="uploadForm" @submit.prevent="handleUpload">
          <el-form-item label="模板名称">
            <el-input v-model="uploadForm.name" placeholder="请输入模板名称" ></el-input>
          </el-form-item>
          <el-form-item label="模板文件">
            <el-upload
              class="upload-demo"
              action="#" 
              drag
              :limit="1"
              :on-exceed="handleExceed"
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
      <el-col :span="20">
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
                @click="downloadTemplate(row.id)"
              >下载</el-button>
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
    beforeUpload(file) {
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      if (!isDocx) {
        this.$message.error('只能上传 .docx 文件');
      }
      if (isDocx) {
        this.fileList.push(file);
      }
      return false; // 阻止自动上传
    },
    handleExceed() {
      this.$message.error('只能上传一个文件');
    },
    async handleUpload() {
      if (!this.uploadForm.name) {
        this.$message.error('请输入模板名称');
        return;
      }
      if (this.fileList.length === 0) {
        this.$message.error('请上传模板文件');
        return;
      }

      const formData = new FormData();
      formData.append('name', this.uploadForm.name);
      formData.append('file', this.fileList[0]);

      try {
        // eslint-disable-next-line no-unused-vars
        const response = await axios.post('/api/templates/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*'
          },
        });
        this.$message.success('模板上传成功');
        this.fileList.clear();
        this.uploadForm.name = '';
        this.fetchTemplates();
      } catch (error) {
        this.$message.error('模板上传失败');
        console.error(error);
      }
    },
    async fetchTemplates() {
      try {
        const response = await axios.get('/api/templates');
        this.templates = response.data;
      } catch (error) {
        this.$message.error('获取模板列表失败');
        console.error(error);
      }
    },
    async downloadTemplate(id) {
      try {
        const response = await axios.get(`/api/templates/download/${id}`, {
          responseType: 'blob',
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const template = this.templates.find(t => t.id === id);
        link.setAttribute('download', template.name + '.docx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        this.$message.error('下载失败');
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
