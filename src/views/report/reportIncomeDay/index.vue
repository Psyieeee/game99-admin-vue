<template>
  <div class="app-container">
    <el-button type="primary" @click="copy1">总成功金额: {{ totalCount.countSuccessMoney || 0 }}</el-button>
    <el-button type="primary" icon="Search" size="small" @click="handleCount">搜索</el-button>
    <el-form :model="queryParams" ref="queryForm" :inline="true" style="margin-top: 10px" v-show="showSearch"
             label-width="100px">
      <el-form-item label="更新时间" prop="updateTime" label-width="70px">
        <el-date-picker type="date"
                        v-model="queryParams.paydate"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        clearable
                        :shortcuts="toyesDayshortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="2" style="margin-left: 10px">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['report:incomeDay:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="reportIncomeDayList" :stripe="true">
      <el-table-column label="收款金额" align="center" prop="money"/>
      <el-table-column label="线下或者线上" align="center" prop="type"/>
      <el-table-column label="收款平台" align="center" prop="payplam"/>
      <el-table-column label="收款通道" align="center" prop="paychancl"/>
      <el-table-column label="收款商户" align="center" prop="paycard"/>
      <el-table-column label="时间" align="center" prop="paydate">
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup name="ReportIncomeDay">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {parseTime, toyesDayshortcuts} from "@/utils/dateUtils";
import {CountReportIncomeDay, ExportReportIncomeDay, listReportIncomeDay} from "@/api/report/resportIncomeDay";

const {proxy} = getCurrentInstance();

const showSearch = ref(true);
const loading = ref(false);
const reportIncomeDayList = ref([]);
const total = ref();

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    paydate: parseTime(new Date(), '{y}-{m}-{d}'),
  },
  totalCount: {
    countSuccessMoney: 0
  }
});
const {queryParams, totalCount} = toRefs(data)

function copy1() {
  proxy.copyCommand(totalCount.value.countSuccessMoney, proxy)
}

function getList() {
  loading.value = true
  listReportIncomeDay(queryParams.value).then(res => {
    reportIncomeDayList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** handle count */
function handleCount() {
  CountReportIncomeDay().then(res => {
    totalCount.value = res.data
  })
}

/** handle query */
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
}

/** export data */
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return ExportReportIncomeDay(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '平台充值报表')
  }).catch(() => {
  })
}

getList()
</script>

<style scoped>

</style>