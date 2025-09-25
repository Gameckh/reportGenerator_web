<!-- src/views/Reports.vue -->
<template>
  <div>
    <el-row>
      <el-col :span="24">
        <h2>生成报告</h2>
        <el-form :model="generateForm" @submit.prevent="handleGenerate" class="compact-form">
          <!-- 第一行：模板选择和操作按钮 -->
          <div class="form-row">
            <div class="form-item-group">
              <label class="form-label">选择模板:</label>
              <el-select v-model="generateForm.templateId" placeholder="请选择模板" style="width: 200px;">
                <el-option v-for="template in templates" :key="template.name" :label="template.name"
                  :value="template.path"></el-option>
              </el-select>
            </div>

            <!-- 操作按钮 -->
            <div class="form-item-group button-group">
              <el-button type="success" @click="handleImportExcel">
                导入Excel
              </el-button>
              <el-button type="primary" @click="handleGenerate" :loading="isGenerating" :disabled="isGenerating">
                {{ isGenerating ? '生成中...' : '生成报告' }}
              </el-button>
            </div>
          </div>

          <!-- 第二行：命名方式和相关控件 -->
          <div class="form-row">
            <!-- 命名方式选择 -->
            <div class="form-item-group">
              <label class="form-label">命名方式:</label>
              <el-radio-group v-model="generateForm.namingMethod" @change="handleNamingMethodChange" size="small">
                <el-radio value="column">列命名</el-radio>
                <el-radio value="custom">自定义</el-radio>
              </el-radio-group>
            </div>

            <!-- 列选择 -->
            <div v-if="generateForm.namingMethod === 'column'" class="form-item-group">
              <label class="form-label">选择列:</label>
              <el-select v-model="generateForm.nameColumn" placeholder="选择列" size="small" style="width: 150px;">
                <el-option v-for="(col, index) in availableColumns" :key="index"
                  :label="`${getColumnLabel(index)}: ${col}`" :value="index.toString()">
                </el-option>
              </el-select>
            </div>

            <!-- 自定义标题输入 -->
            <div v-if="generateForm.namingMethod === 'custom'" class="form-item-group">
              <label class="form-label">报告标题:</label>
              <el-input v-model="generateForm.baseFileName" placeholder="如：员工报告" maxlength="50" size="small"
                style="width: 150px;">
              </el-input>
            </div>

            <!-- 分隔线 -->
            <el-divider direction="vertical" style="height: 32px; margin: 0 10px;"></el-divider>

            <!-- 二维码列选择 -->
            <div class="form-item-group">
              <label class="form-label">二维码列:</label>
              <el-select v-model="generateForm.qrCodeColumn" placeholder="选择二维码列" size="small" style="width: 150px;">
                <el-option v-for="(col, index) in availableColumns" :key="index"
                  :label="`${getColumnLabel(index)}: ${col}`" :value="index.toString()">
                </el-option>
              </el-select>
              <!-- 二维码长宽(正整数输入框),默认38 -->
              <el-input v-model="generateForm.qrCodeWidth" placeholder="二维码长" size="small" style="width: 150px;"
                type="number" :min="1" :max="1000">
              </el-input>
              <el-input v-model="generateForm.qrCodeHeight" placeholder="二维码宽" size="small" style="width: 150px;"
                type="number" :min="1" :max="1000">
              </el-input>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="form-tips">
            <span v-if="generateForm.namingMethod === 'column'">提示：选择某一列的值将作为生成的报告文件名，如果该列值有重复则报告会被覆盖</span>
            <span v-else-if="generateForm.namingMethod === 'custom'">提示：报告将命名为"标题_序号"的格式，如：员工报告_1.docx</span>
            <br v-if="generateForm.namingMethod">
            <span>二维码列：选择包含二维码数据的列，该列的数据将用于生成报告中的二维码</span>
          </div>
        </el-form>
        <div id="spreadjs" class="spreadjs" />
      </el-col>
    </el-row>

    <!-- 隐藏的文件输入框 -->
    <input id="selectedFile" type="file" accept=".xlsx" style="display: none;" />
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
        namingMethod: 'column', // 默认使用列命名
        nameColumn: '', // 选择的列索引
        baseFileName: '', // 自定义标题
        qrCodeColumn: '', // 二维码列索引
        qrCodeWidth: 38, // 二维码长，默认38
        qrCodeHeight: 38, // 二维码宽，默认38
      },
      templates: [],
      isGenerating: false, // 添加生成状态
      availableColumns: [], // 可用的列
    };
  },
  methods: {
    initDesigner() {
      // 初始化SpreadJS Designer
      this.designer = GC.Spread.Sheets.Designer.findControl('spreadjs')
      if (!this.designer) {
        this.designer = new GC.Spread.Sheets.Designer.Designer('spreadjs');
        this.designer.setData('isRibbonCollapse', true);
        console.log('new designer');
      } else {
        console.log('old designer');
      }
    },

    handleImportExcel() {
      // 触发文件选择框
      document.getElementById('selectedFile')?.click();
    },

    importFile(file) {
      const spread = this.designer.getWorkbook();
      // 导入Excel文件到SpreadJS
      spread.import(file, () => {
        // 清空文件输入框，允许重复选择同一文件
        const fileInput = document.getElementById('selectedFile');
        if (fileInput) fileInput.value = '';

        // 更新可用列信息
        this.updateAvailableColumns();
        // 为了解决第一次导入文件白屏的问题
        setTimeout(() => {
          spread.getActiveSheet().repaint();
        }, 100);
      }, (error) => {
        this.$message.error('Excel文件导入失败：' + error.message);
        const fileInput = document.getElementById('selectedFile');
        if (fileInput) fileInput.value = '';
      }, {
        fileType: GC.Spread.Sheets.FileType.excel
      });
    },

    // 更新可用列信息
    updateAvailableColumns() {
      const spread = this.designer.getWorkbook();
      const sheet = spread.getActiveSheet();
      const usedRange = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.data);

      if (usedRange) {
        const colCount = usedRange.colCount;
        this.availableColumns = [];

        for (let i = 0; i < colCount; i++) {
          // 尝试获取列头，如果没有则使用默认的列标记
          let columnHeader = '';
          try {
            // 尝试获取第一行作为列头
            columnHeader = sheet.getText(0, i, GC.Spread.Sheets.SheetArea.colHeader) || '';
          } catch (error) {
            console.warn('获取列头失败:', error);
          }

          // 如果列头为空，使用默认的列标记
          if (!columnHeader.trim()) {
            columnHeader = `列${i + 1}`;
          }

          this.availableColumns.push(columnHeader);
        }
      }
    },

    // 将列索引转换为A、B、C...格式
    getColumnLabel(index) {
      let label = '';
      while (index >= 0) {
        label = String.fromCharCode(65 + (index % 26)) + label;
        index = Math.floor(index / 26) - 1;
      }
      return label;
    },

    // 处理命名方式变化
    handleNamingMethodChange() {
      // 清空相关字段
      if (this.generateForm.namingMethod === 'column') {
        this.generateForm.baseFileName = '';
      } else {
        this.generateForm.nameColumn = '';
      }
    },

    async handleGenerate() {
      if (!this.generateForm.templateId) {
        this.$message.error('请选择模板');
        return;
      }

      // 验证命名方式
      if (this.generateForm.namingMethod === 'column' && !this.generateForm.nameColumn) {
        this.$message.error('请选择用于命名的列');
        return;
      }

      if (this.generateForm.namingMethod === 'custom' && !this.generateForm.baseFileName.trim()) {
        this.$message.error('请输入报告标题');
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
      if (!confirm) {
        return;
      }

      const dataJson = this.getDataJson(startRow, startCol);
      if (!dataJson || dataJson.length === 0) {
        // this.$message.error('没有解析出有效数据');
        return;
      }

      // 设置生成状态为true
      this.isGenerating = true;

      try {
        console.log(this.generateForm.templateId);

        // 构建请求参数
        const requestData = {
          templatePath: this.generateForm.templateId,
          data: dataJson // 直接传递数组，不需要JSON.stringify
        };

        // 根据命名方式添加相应参数
        if (this.generateForm.namingMethod === 'column') {
          requestData.nameColumn = this.generateForm.nameColumn;
        } else if (this.generateForm.namingMethod === 'custom') {
          requestData.baseFileName = this.generateForm.baseFileName.trim();
        }

        // 添加二维码列参数
        if (this.generateForm.qrCodeColumn) {
          requestData.qrCodeColumn = this.generateForm.qrCodeColumn;
          requestData.qrCodeWidth = this.generateForm.qrCodeWidth;
          requestData.qrCodeHeight = this.generateForm.qrCodeHeight;
        }

        const response = await axios.post('/api/reports/generate', requestData, {
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
      if (!usedRange) {
        this.$message.error('未获取到有效数据! 请导入数据文件并选中数据sheet.');
        return;
      }
      const rowCount = usedRange.rowCount - startRow;
      const colCount = usedRange.colCount;
      for (let i = startRow; i < startRow + rowCount; i++) {
        const row = []
        for (let c = startCol; c < startCol + colCount; c++) {
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
    this.initDesigner();
    this.fetchTemplates();

    // 添加文件选择事件监听器
    document.getElementById('selectedFile')?.addEventListener('change', (event) => {
      let file = event.target.files[0];
      if (!file) {
        return;
      }
      this.importFile(file);
    });
  },
};
</script>

<style scoped>
.upload-demo i {
  font-size: 28px;
  color: #1890ff;
}

.spreadjs {
  height: calc(100vh - 330px);
  width: 100%;
  border: 'solid gray 1px';
}

/* 紧凑表单样式 */
.compact-form {
  margin-bottom: 10px;
}

.form-item-template {
  margin-bottom: 10px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.form-item-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.form-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  min-width: fit-content;
}

.button-group {
  gap: 10px;
}

.form-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  padding-left: 10px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-row {
    gap: 10px;
  }

  .form-item-group {
    gap: 5px;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .button-group {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
