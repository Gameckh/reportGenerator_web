<!-- src/views/Reports.vue -->
<template>
  <div>
    <el-row>
      <el-col :span="20">
        <h2>生成报告</h2>
        <el-form :model="generateForm" @submit.prevent="handleGenerate">
          <el-form-item label="选择模板">
            <el-select v-model="generateForm.templateId" placeholder="请选择模板">
              <el-option
                v-for="template in templates"
                :key="template.id"
                :label="template.name"
                :value="template.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleGenerate">生成报告</el-button>
          </el-form-item>
        </el-form>
        <div id="spreadjs" class="spreadjs" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from '@/utils/axios';
const GC = window.GC

export default {
  name: 'ReportGeneratorPage', // 改为多字名称
  data() {
    return {
      designer: null,
      generateForm: {
        templateId: '',
      },
      templates: [],
    };
  },
  methods: {
    async handleGenerate() {
      if (!this.generateForm.templateId) {
        this.$message.error('请选择模板');
        return;
      }
      try {
        const dataJson = this.getDataJson();
        // eslint-disable-next-line no-unused-vars
        // const response = await axios.post('/api/reports/generate', dataJson, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //     'Access-Control-Allow-Origin': '*'
        //   },
        // });
        this.$message.success('报告生成任务已提交');
        this.generateForm.templateId = '';
        console.log(dataJson);
        // this.fetchReportRecords();
      } catch (error) {
        this.$message.error('报告生成失败');
        console.error(error);
      }
    },
    getDataJson() {
      const spread = this.designer.getWorkbook();
      const sheet = spread.getActiveSheet()
      const res = []
      const startRow = 4
      const startCol = 0
      const usedRange = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.data);
      if(!usedRange) {
        this.$message.error('未获取到有效数据! 请导入数据文件并选中数据sheet.');
        return;
      }
      const rowCount = usedRange.rowCount - startRow;
      const colCount = usedRange.colCount;
      for (let i = startRow; i < startRow + rowCount; i++) {
          const row = []
          for(let c = startCol; c < startCol + colCount; c++) {
              row[c] = sheet.getText(i, c)
          }
          res.push(row)
      }
      return res;
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
    async downloadReport(id) {
      try {
        const response = await axios.get(`/api/reports/download/${id}`, {
          responseType: 'blob',
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `报告_${id}.zip`);
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
    this.designer = new GC.Spread.Sheets.Designer.Designer('spreadjs')
  },
};
</script>

<style scoped>
.upload-demo i {
  font-size: 28px;
  color: #1890ff;
}
.spreadjs {
  height:calc(100vh - 350px);
  width:100%;
  border:'solid gray 1px';
}
</style>
