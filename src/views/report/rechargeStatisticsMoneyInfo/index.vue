<template>
  <div class="app-container">
    <el-button type="primary" @click="copy1">入款总额: {{ totalCount.paymentAmount || 0 }}</el-button>
    <el-button type="success" @click="copy2">出款总额: {{ totalCount.outMoney || 0 }}</el-button>
    <el-button type="primary" @click="copy3">金额合计: {{ totalCount.countMoney || 0 }}</el-button>
<!--    <el-button type="success" @click="copy4">主播工资: {{ totalCount.totalAccountGifts || 0 }}</el-button>-->

<!-- search form-->
    <el-form :model="queryParams" ref="queryForm" style="margin-top: 10px" :inline="true" v-show="showSearch"
             label-width="68px">
      <el-form-item label="日期选择" prop="reptime">
        <el-date-picker type="datetimerange"
                        v-model="dateRange"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-value="getDefaultLastWeekTime()"
                        :shortcuts="pickerDateTimeShortcuts"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button type="warning" icon="Search" size="small" @click="handleReset">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['report:moneyinfo:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!-- display table -->
    <div ref="container" style="position: relative">
      <el-table v-loading="loading" :stripe="true" :data="reportRechargeMoney" @selection-change="handleSelectionChange">
        <el-table-column  label="报表时间" align="center" prop="reptime" min-width="120" fixed="left"/>
        <el-table-column  label="入款总人数" min-width="90" align="center" prop="totalRukuanrenshu">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.totalRukuanrenshu}}</span>
          </template>
        </el-table-column>
        <el-table-column  label="出款总人数" min-width="120" align="center" prop="totalChukuanrenshu" >
          <template v-slot="{row}">
            <span style="color: #FF5722">{{ row.totalChukuanrenshu}}</span>
          </template>
        </el-table-column>
        <el-table-column label="公司入款人数" min-width="100" align="center" prop="gsRukuanrenshu">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.gsRukuanrenshu}}</span>
          </template>
        </el-table-column>
        <el-table-column label="公司入款金额" min-width="100" align="center" prop="gsRukuanjine">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.gsRukuanjine}}</span>
          </template>
        </el-table-column>
        <el-table-column label="线上入款人数" min-width="100" align="center" prop="xsRukunanrenshu">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.xsRukunanrenshu}}</span>
          </template>
        </el-table-column>
        <el-table-column label="线上入款金额" min-width="100" align="center" prop="xsRukunanjine">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.xsRukunanjine}}</span>
          </template>
        </el-table-column>
        <el-table-column label="人工入款人数" min-width="100" align="center" prop="rgRukunanrenshu">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.rgRukunanrenshu}}</span>
          </template>
        </el-table-column>
        <el-table-column label="人工入款金额" min-width="100" align="center" prop="rgRukunanjine">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.rgRukunanjine}}</span>
          </template>
        </el-table-column>
        <el-table-column label="代充人数" min-width="100" align="center" prop="totalAccount">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.totalAccount}}</span>
          </template>
        </el-table-column>
        <el-table-column label="代充金额" min-width="100" align="center" prop="totalLast">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.totalLast}}</span>
          </template>
        </el-table-column>
        <el-table-column label="usdt人数" min-width="100" align="center" prop="totalLast">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.usdtRenshu}}</span>
          </template>
        </el-table-column>
        <el-table-column label="usdt金额" min-width="100" align="center" prop="totalLast">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.usdtJine}}</span>
          </template>
        </el-table-column>
        <el-table-column label="优惠人数" min-width="100" align="center" prop="palmYouhuirenshu">
          <template v-slot="{row}">
            <span style="color: #FF5722">{{ row.palmYouhuirenshu}}</span>
          </template>
        </el-table-column>
        <el-table-column label="平台优惠" min-width="100" align="center" prop="palmYouhuijine">
          <template v-slot="{row}">
            <span style="color: #FF5722">{{ row.palmYouhuijine}}</span>
          </template>
        </el-table-column>
        <el-table-column label="入款总金额" min-width="130" align="center" prop="totalRukuanjine" fixed="right">
          <template v-slot="{row}">
            <span style="color: #5FB878">{{ row.totalRukuanjine}}</span>
          </template>
        </el-table-column>
        <el-table-column label="会员出款总金额" min-width="130" align="center" prop="totalChukuanjine" fixed="right">
          <template v-slot="{row}">
            <span style="color: #FF5722">{{ row.totalChukuanjine}}</span>
          </template>
        </el-table-column>
        <el-table-column label="合计" align="center" prop="totalChukuanjineMath" fixed="right"
                         :formatter="totalChukuanjineMath" min-width="130"/>
      </el-table>
    </div>


  </div>
</template>

<script setup name="RechargeStatisticMoneyInfo">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getDefaultLastWeekTime, getDefaultTime, pickerDateTimeShortcuts} from "@/utils/dateUtils";
import {listReportMoneyInfo, reportMoneyInfoCount, reportMoneyInfoExport} from "@/api/report/reportMoneyInfo";

const {proxy} = getCurrentInstance();

const reportRechargeMoney = ref([]);

const showSearch = ref(true);
const loading = ref(false);

const data = reactive({

  queryParams:{
    reptime: null
  },

  dateRange : [proxy.parseTime(proxy.get7beforeDay().setHours(0, 0, 0, 0))
    , proxy.parseTime(proxy.getTodayEndTime())],

  totalCount:{},

});
const {totalCount,dateRange,queryParams} = toRefs(data);

function copy1(){
  proxy.copyCommand(totalCount.paymentAmount)
}
function copy2(){
  proxy.copyCommand(totalCount.paymentAmount)
}

function copy3(){
  proxy.copyCommand(totalCount.paymentAmount)
}

function copy4(){
  proxy.copyCommand(totalCount.paymentAmount)
}

function getList(){
  loading.value = true
  listReportMoneyInfo({reptime: queryParams.value,
    params: {beginTime: dateRange.value[0], endTime: dateRange.value[1]}} ).then(res=>{
    reportRechargeMoney.value = res.rows
    loading.value = false
    count()
  })
}

function count() {
  loading.value = true
  // queryParams.value.begindate = dateRange.value[0];

  reportMoneyInfoCount({reptime: queryParams.value,
    params: {beginTime: dateRange.value[0], endTime: dateRange.value[1]}}).then(response => {
    totalCount.value = response.data
    loading.value = false
  })
  // reportMoneyInfoCount(queryParams.value).then(response => {
  //   totalCount.value = response.data
  //   loading.value = false
  // })
}

/** 搜索按钮操作 handle reset */
function handleQuery(){
  queryParams.pageNum = 1;
  getList()
}

/** 重置按钮操作 handle resetQuery*/
function handleReset(){
  dateRange.value = [proxy.parseTime(proxy.get7beforeDay().setHours(0, 0, 0, 0))
    , proxy.parseTime(proxy.getTodayEndTime())]
  proxy.resetForm("queryForm")

  handleQuery()
  loading.value = false
}

/** 导出按钮操作 export data*/
function handleExport(){
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return reportMoneyInfoExport(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '平台资金报表')
  }).catch(() => {
  })
}

function totalChukuanjineMath(rows, column) {
  return (rows.totalRukuanjine - rows.totalChukuanjine).toFixed(2)
}

getList()
</script>

<style scoped>

</style>
