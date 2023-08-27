<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormS" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item prop="searchTime">
        <el-date-picker type="datetimerange"
                        v-model="searchTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts"/>
      </el-form-item>
      <el-form-item prop="opName" style="width: 120px;">
        <el-input
            v-model="queryParams.opName"
            placeholder="操作人"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="memberWithdrawLogList">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="审核人" align="center" prop="opName"/>
      <el-table-column label="审核总提现金额" align="center" prop="money"/>
      <el-table-column label="状态" align="center" prop="statusDes"/>
      <el-table-column label="审核次数" align="center" prop="times"/>
    </el-table>

  </div>
</template>

<script setup name="MemberWithdrawReport">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {memberWithdrawDetailReportCount} from "@/api/pay/memberWithdrawDetail";
import {getDefaultTime} from "@/utils/dateUtils";

const {proxy} = getCurrentInstance();

/** loading page */
const loading = ref(false);
/** show search form */
const showSearch = ref(true);

/** store data in list  */
const memberWithdrawLogList = ref([]);

const total = ref(0);

/** reactive data */
const data = reactive({

  queryParams: {
    pageNum: 1,
    pageSize: 30,
    memberId: null,
    withdrawMoney: null,
    bankAccount: null,
    bankUserName: null,
    status: null,
    updateTime: null,
    orderNo: null,
    account: null,
    orderByColumn: 'opName',
    isAsc: 'desc'
  },
  /**search time setup */
  searchTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
});

const {queryParams, searchTime} = toRefs(data);

/** get all list of data */
function getList() {
  loading.value = true
  memberWithdrawDetailReportCount(proxy.addDateRange(queryParams.value, searchTime.value)).then(res => {
    memberWithdrawLogList.value = res.data
    total.value = res.data
    loading.value = false
  })
}

/** handle query */
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

/** reset query */
function resetQuery() {
  proxy.resetForm("queryFormS")
  handleQuery()
}

getList()
</script>

<style scoped>

</style>