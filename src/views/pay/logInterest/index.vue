<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="选择日期" prop="selectDate">
        <el-date-picker type="datetimerange"
                        v-model="selectDate"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        :style="{width: '95%'}"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts"
                        @change="handleChange"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="交易类型" label-width="130px" prop="transactionType">
        <el-select v-model="queryParams.transactionType" clearable placeholder="Please select transaction type">
          <el-option label="存入" value="DEPOSIT"></el-option>
          <el-option label="取出" value="WITHDRAW"></el-option>
          <el-option label="利息钱" value="RECEIVE"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="会员ID" prop="memberId" label-width="90px">
        <el-input
            v-model.trim="queryParams.memberId"
            placeholder="Please enter your member ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
<!--    end search tab-->

<!--    tab buttons 选项卡按钮-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!--    display data into table 将所有数据列表显示到表格中-->
    <el-table :stripe="true" v-loading="loading" :data="interestLogList">
      <el-table-column label="会员ID" align="center" prop="memberId" min-width="80"/>
      <el-table-column label="名字" align="center" prop="nickName" min-width="120"/>
      <el-table-column label="APR(%)" align="center" prop="rate" min-width="130"/>
      <el-table-column label="交易类型" align="center" prop="transactionType" min-width="130">
        <template #default="scope">{{processTransactionType(scope.row.transactionType)}}</template>
      </el-table-column>
      <el-table-column label="金额" align="center" prop="amount"/>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="180">
        <template #default="scope">{{new Date(scope.row.createTime).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}}</template>
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

<script name="logInterest" setup>

import {reactive, ref, toRefs} from "vue";
import {getDefaultTime} from "@/utils/dateUtils";
import {exportPayLog, listPayLog} from "@/api/pay/payLog";
import {downloadExcel} from "@/utils/common";
import {exportLogInterest, listLogInterest} from "@/api/pay/logInterest";

const {proxy} = getCurrentInstance();

const interestLogList = ref([]);
const total = ref(0);

const showSearch = ref(true);
const loading = ref(false);
const selectDate = ref( [proxy.parseTime(proxy.getTodayStartTime()),proxy.parseTime(proxy.getTodayEndTime())] );

const data = reactive({
  queryParams:{
    startDate: selectDate.value[0],
    endDate: selectDate.value[1],
    pageNum: 1,
    pageSize: 20,
    memberId: null,
    transactionType: null,
  }
});

const {queryParams} = toRefs(data);
function getList(){
  loading.value = false
  listLogInterest(queryParams.value).then(response=>{
    interestLogList.value = response.rows;
    total.value = response.total
    loading.value = false
  })
}

function processTransactionType(transactionType) {
  switch (transactionType) {
    case "DEPOSIT":
      return '存入';
    case "WITHDRAW":
      return '取出';
    case "RECEIVE":
      return '利息钱';
    default:
      return '';
  }
}

function handleChange(){
  loading.value = false
  if (selectDate.value != null){
    data.queryParams.startDate = selectDate.value[0];
    data.queryParams.endDate = selectDate.value[1];
  } else {
    data.queryParams.startDate = null;
    data.queryParams.endDate = null;
  }
  loading.value = false
}

/**  多选框选中数据 */

/** 搜索按钮操作 handle search query */
 function handleQuery(){
  getList()
}

/** 重置按钮操作 */
 function resetQuery(){
   proxy.resetForm('queryForm')
   handleQuery()
}

 /** 导出按钮操作*/
 function handleExport(){
   proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
     confirmButtonText: '确认',
     cancelButtonText: '取消',
     type: 'warning'
   }).then(function() {
     return exportLogInterest(queryParams.value)
   }).then(response => {
     downloadExcel(response, '支付信息日志')
   })
}

getList()
</script>
<style scoped>

</style>