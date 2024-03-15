<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="日期选择" prop="agenttime">
        <el-date-picker type="daterange"
                        v-model="dateRange"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        range-separator="-"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        clearable
                        style="width: 250px"
                        :shortcuts="proxy.pickerDateShortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item prop="agentcode">
        <el-input
            v-model="queryParams.agentcode"
            placeholder="渠道编码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!--      <el-form-item prop="agentname">
              <el-input
                  v-model="queryParams.agentname"
                  placeholder="邀请账号"
                  clearable
                  @keyup.enter="handleQuery"
              />
            </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery" :disabled="isDisable">搜索</el-button>
      </el-form-item>
      <span
          style="position:relative ;color: red ;top:7px;font-size: 15px">友情提示(每日推广数据查询前，请进行一次基础数据的预生成操作)</span>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['report:agentCount:export']"
        >导出
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button :disabled="isDisable"
                   type="primary"
                   plain
                   icon="Plus"
                   size="small"
                   @click="generateData"
                   v-hasPermi="['report:agentCount:generateData']"
        >基础数据预生成
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['report:agentCount:list']"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除频道代码
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data table -->
    <div ref="container" style="position: relative">
      <el-table v-loading="loading" :data="reportList" :stripe="true">
        <el-table-column label="渠道编码" align="center" prop="agentcode">
          <template #default="scope">
            <a style="color: #00afff" @click="jump(scope.row.agentcode,scope.row.agenttime)">{{
                scope.row.agentcode
              }}</a>
          </template>
        </el-table-column>
        <!--        <el-table-column label="邀请账号" min-width="150" align="center" prop="agentname"/>-->
        <el-table-column label="统计时间" align="center" prop="agenttime" min-width="130"/>
        <el-table-column label="当日/总(注册人数)" min-width="130" align="center" prop="regisNumber"
                         :formatter="regisNumber"/>
        <el-table-column label="公司入款（首充）" min-width="130" align="center" prop="gsRukuanjine"/>
        <el-table-column label="线上入款（首充）" min-width="130" align="center" prop="xsRukuanjine"/>
        <el-table-column label="手工入款（首充）" min-width="130" align="center" prop="sgRukuanjine"/>
        <el-table-column label="入款总（首充）" min-width="120" align="center" prop="totalfristRukuanjine"/>
        <el-table-column label="人/笔/金额（出款日总）" min-width="170" align="center" prop="totalChukuanjine"/>
        <el-table-column label="人/笔/金额（入款日总）" min-width="170" align="center" prop="rukuanjine"
                         :formatter="rukuanjine" fixed="right"/>
        <!--        <el-table-column label="送礼次数/金额" min-width="120" align="center" prop="totalGiveprop"/>-->
        <el-table-column label="直播间次数/活跃安卓/活跃苹果" min-width="210" align="center" prop="ios" :formatter="ios"
                         fixed="right"/>
        <!--          <template slot-scope="scope">-->
        <!--            <a style="color: #00afff" @click="jump(scope.row.agentcode,scope.row.agenttime)">{{ scope.row.ios }}</a>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
      </el-table>
    </div>

    <!-- 添加或修改记录 Add or modify records-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="500px">
      <el-form :inline="true" ref="queryRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="渠道编码" prop="agentCode">
          <el-input type="text" v-model="form.agentCode" placeholder="取款限额"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="open=false">取 消</el-button>

      </div>
    </el-dialog>

  </div>
</template>

<script setup name="ReportAgentCount">
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  deletePromotionCode,
  listReportAgentCountData,
  reportAgentCountExport,
  reportGenerateData
} from "@/api/report/reportAgentCount";
import {parseTime} from "@/utils/dateUtils";

const {proxy} = getCurrentInstance();

const reportList = ref([]);

const showSearch = ref(true);
const isDisable = ref(false);
const loading = ref(false);
const open = ref(false);
const dateRange = ref([parseTime(new Date(), '{y}-{m}-{d}'), parseTime(new Date(), '{y}-{m}-{d}')]);

const title = ref('删除频道代码');

const data = reactive({
  form: {},
  queryParams: {
    agentcode: '',
    /*agentname: '',*/
    agenttime: null
  },
  rules: {
    agentCode: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ]
  }
});
const {queryParams, rules, form} = toRefs(data);

/**
 * 查询代理统计，主要用于代理渠道的统计列表
 */
function getList() {
  loading.value = true
  listReportAgentCountData(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    reportList.value = response.data
    loading.value = false
  }).catch((err) => {
    loading.value = false
  })
}

function handleQuery() {
  getList()
}

/** export data */
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return reportAgentCountExport(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '平台充值报表')
  }).catch(() => {
  })
}


function handleDelete() {
  open.value = true
}

function submitForm() {
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deletePromotionCode(form.value.agentCode)
  }).then(() => {
    open.value = false
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

function generateData() {
  isDisable.value = true;
  reportGenerateData(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    if (response.code === 200) {
      proxy.$modal.msgSuccess(response.msg)
      isDisable.value = false
      open.value = false
      getList()
    }
  }).catch((err) => {
    isDisable.value = false
    open.value = false
    loading.value = false
  })
}

function regisNumber(rows, column) {
  return rows.newmember + '/' + rows.totalmember
}

function rukuanjine(rows, column) {
  return rows.totalRukuanrenshu + '/' + rows.totalRukuanbishu + '/' + rows.totalRukuanjine
}

function ios(rows, column) {
  return rows.totalEnterlivetimes + '/' + rows.totalActiveandroid + '/' + rows.totalActiveios
}

getList()
</script>

<style scoped>

</style>