<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="回调日期" prop="callbackTime">
        <span class="demonstration"></span>
        <el-date-picker type="datetimerange"
                        v-model="callbackTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="提现订单号" prop="withdrawOrderNo" style="width: 305px">
        <el-input
            v-model="queryParams.withdrawOrderNo"
            placeholder="请输入提现订单号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="代付订单号" prop="agentOrderNo" style="width: 350px">
        <el-input
            v-model="queryParams.agentOrderNo"
            placeholder="请输入代付订单号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="回调状态" prop="callbackStatus">
        <el-select v-model="queryParams.callbackStatus" placeholder="请选择回调状态" clearable>
          <el-option
              v-for="dict in callback_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!--export button-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['pay:payAgentLog:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data -->
    <el-table :stripe="true" v-loading="loading" :data="payAgentLogAllList">
      <el-table-column label="提现订单号" align="center" prop="withdrawOrderNo" width="180"/>
      <el-table-column label="三方订单号" align="center" prop="agentOrderNo" min-width="150"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="提现者ID" align="center" prop="withdrawId" min-width="120"/>
      <el-table-column label="代付通道" align="center" prop="channelName" min-width="100"/>
      <el-table-column label="提现金额" align="center" prop="withdrawMoney" min-width="100"/>
      <el-table-column label="提现时间" align="center" prop="createTime" width="160"/>
      <el-table-column label="回调时间" align="center" prop="callbackTime" width="160"/>
      <el-table-column label="回调状态" align="center" prop="callbackStatus" width="100">
        <template #default="scope">
          <dict-tag :options="callback_status" :value="scope.row.callbackStatus"/>
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,30,50]"
        @pagination="getList"
    />

  </div>

</template>

<script name="PayAgentLog" setup>

import {reactive, ref, toRefs} from "vue";
import {getDefaultTime} from "@/utils/dateUtils";
import {payAgentLogExport, payAgentLogList} from "@/api/pay/payAgentLog";
import DictTag from "@/components/DictTag";

const {proxy} = getCurrentInstance();

const payAgentLogAllList = ref([]);

const total = ref(0);

const showSearch = ref(true);
const loading = ref(true);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    withdrawOrderNo: null,
    agentOrderNo: null,
    bankAccount: null,
    callbackStatus: null,
    channelId: null,
    channelName: null,

  },
  /** updateTime */
  callbackTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
});

const {queryParams, callbackTime} = toRefs(data);

const {callback_status} = proxy.useDict("callback_status")

function getList() {
  loading.value = true
  payAgentLogList(proxy.addDateRange(queryParams.value, callbackTime.value)).then(res => {
    payAgentLogAllList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

// 表单重置
function reset() {
  proxy.resetForm('queryForm')
}

/** 重置按钮操作 handle reset query*/
function resetQuery() {
  callbackTime.value = []
  proxy.resetForm('queryForm')
  handleQuery()
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return payAgentLogExport(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '代充下单')
  }).catch(() => {
  })
}

getList()
</script>

<style scoped>

</style>