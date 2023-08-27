<template>
  <div class="app-container">
    <!-- search form-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item prop="ktime">
        <el-date-picker type="datetimerange"
                        v-model="beginTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="pickerDateTimeShortcuts"
        ></el-date-picker>
      </el-form-item>
      <el-form-item prop="name">
        <el-select
            filterable
            v-model="queryParams.name"
            placeholder="请选择彩种"
            clearable
            style="width: 240px">
          <el-option
              v-for="dict in lotteryInfoNameOptions"
              :key="dict.name"
              :label="dict.name"
              :value="dict.name"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="status">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable>
          <el-option
              v-for="dict in lottery_history_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="issue" class="input-wd20">
        <el-input
            v-model="queryParams.issue"
            placeholder="请输入期数"
            clearable
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-show="showTable" :data="lotteryHistory">
      <el-table-column label="彩票ID" prop="id" min-width="130"/>
      <el-table-column label="彩票名称" prop="name" min-width="100"/>
      <el-table-column label="开奖号码" prop="code" min-width="180"/>
      <el-table-column label="状态" prop="status" min-width="100">
        <template #default="scope">
          <dict-tag :options="lottery_history_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="总投注" prop="totalBet" min-width="100"/>
      <el-table-column label="预计派奖总额" prop="totalPrize" min-width="100"/>
      <el-table-column label="期数" prop="issue" min-width="100"/>
      <el-table-column label="开奖时间" prop="ktime" min-width="130"/>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,50,100]"
        @pagination="getList"
    />


  </div>
</template>

<script name="LotteryHistory" setup>

import {listLotteryHistory} from "@/api/lottery/lotteryHistory";
import DictTag from "@/components/DictTag";
import {listAllLotteryInfo} from "@/api/lottery/lotteryInfo";
import {pickerDateTimeShortcuts, getDefaultTime} from "@/utils/dateUtils";

const {proxy} = getCurrentInstance();

const loading = ref(true);
const showSearch = ref(true);
const showTable = ref(true);
const lotteryHistory = ref([]);
const lotteryInfoNameOptions = ref([]);
const total = ref(0);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    issue: null,
    name: null,
    orderByColumn: 'ktime',
    isAsc: 'desc',
  },
  form: {},
  /** updateTime */
  beginTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],

});
const {queryParams, beginTime, form} = toRefs(data);
const {lottery_history_status} = proxy.useDict("lottery_history_status")

function getList() {
  loading.value = true
  listLotteryHistory(proxy.addDateRange(queryParams.value, beginTime.value)).then(res => {
    lotteryHistory.value = res.data
    total.value = res.total
    loading.value = false
  })
}

function lotteryInfoList() {
  listAllLotteryInfo().then(res => {
    lotteryInfoNameOptions.value = res.data
  })
}

/** handle query */
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

/** reset form query */
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
}


getList()
lotteryInfoList()
</script>

<style scoped>

</style>
