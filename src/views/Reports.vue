<!-- src/views/Reports.vue -->
<template>
  <div>
    <el-row>
      <el-col :span="20">
        <h2>生成报告</h2>
        <el-form :model="generateForm" @submit.prevent="handleGenerate">
          <el-form-item label="选择模板" style="width: 600px;">
            <el-select v-model="generateForm.templateId" placeholder="请选择模板">
              <el-option
                v-for="template in templates"
                :key="template.name"
                :label="template.name"
                :value="template.path"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleGenerate" 
              :loading="isGenerating"
              :disabled="isGenerating"
            >
              {{ isGenerating ? '生成中...' : '生成报告' }}
            </el-button>
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
      isGenerating: false, // 添加生成状态
    };
  },
  methods: {
    async handleGenerate() {
      if (!this.generateForm.templateId) {
        this.$message.error('请选择模板');
        return;
      }
      
      const spread = this.designer.getWorkbook();
      const sheet = spread.getActiveSheet()
      const startRow = sheet.getActiveRowIndex()
      const startCol = sheet.getActiveColumnIndex()

      // 询问用户是否确认生成报告
      const confirm = await this.$confirm('抓取报告数据，从第' + (startRow + 1) + '行，第' + (startCol + 1) + '列开始，是否确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      if(!confirm) {
        return;
      }
      
      const dataJson = this.getDataJson(startRow, startCol);
      if(!dataJson || dataJson.length === 0) {
        // this.$message.error('没有解析出有效数据');
        return;
      }
      
      // 设置生成状态为true
      this.isGenerating = true;
      
              try {
          console.log(this.generateForm.templateId);
          const response = await axios.post('/api/reports/generate', {
            templatePath: this.generateForm.templateId,
            data: JSON.stringify(dataJson)
          }, {
            headers: {
              'Access-Control-Allow-Origin': '*'
            },
            timeout: 0, // 设置超时时间为0，表示无限等待
            responseType: 'blob', // 接收二进制文件
          });
          
          // 直接处理返回的ZIP文件
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `报告_${new Date().getTime()}.zip`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          this.$message.success('报告生成成功');
          this.generateForm.templateId = '';
          console.log(dataJson);
        } catch (error) {
          this.$message.error('报告生成失败');
          console.error(error);
        } finally {
          // 无论成功还是失败，都要重置生成状态
          this.isGenerating = false;
        }
    },
    getDataJson(startRow, startCol) {
      const spread = this.designer.getWorkbook();
      const sheet = spread.getActiveSheet()
      const res = []
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
        const response = await axios.get('/api/templates/list');
        this.templates = response.data;
      } catch (error) {
        this.$message.error('获取模板列表失败');
        console.error(error);
      }
    },

  },
  mounted() {
    this.fetchTemplates();
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
