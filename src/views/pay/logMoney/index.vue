<template>
  <div class="app-container">
    <div v-loading="totalLoading">
      <el-button type="primary" @click="copy1">行为类型统计 {{ totalData.totalIncome || 0 }}</el-button>
      <el-button type="primary" icon="Search" size="small" @click="listCount()" style="margin-left: 20px">统计查询
      </el-button>
    </div>
    <!-- search form -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="88px"
             style="margin-top: 10px">
      <el-form-item label="行为类型" prop="type" class="checkbox-type">
        <el-checkbox-group v-model="queryParams.types">
          <el-checkbox v-for="item in typeOptions" :key="item.type" :label="item.type">{{ item.des }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="创建时间" prop="selectDate" label-width="100px">
        <el-date-picker type="datetimerange"
                        v-model="selectTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="pickerDateTimeShortcuts"/>
      </el-form-item>
      <el-form-item prop="searchValue" class="input-wd20">
        <el-input
            v-model.trim="queryParams.searchValue"
            placeholder="会员ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="mark">
        <el-input v-model="queryParams.mark" placeholder="请选择入款备注" clearable/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
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
            v-hasPermi="['member:logMoney:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- display Data in the table -->
    <el-table :data="logMoneyList" :stripe="true" stripe v-loading="loading">
      <el-table-column label="会员编号" align="center" prop="userId" min-width="140"/>
      <el-table-column label="变化类型" prop="type" align="center" min-width="60">
        <template #default="scope">
          <div v-for="(item, index) in types">
            <span v-if="item.type === scope.row.type">{{ item.des }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="des" align="center" min-width="120"/>
      <el-table-column label="备注信息" prop="mark" align="center" min-width="120"/>
      <el-table-column label="支出" prop="pay" align="center" min-width="70"/>
      <el-table-column label="收入" prop="income" align="center" min-width="70"/>
      <el-table-column label="变化前余额" align="center" prop="totalBefore" min-width="90"/>
      <el-table-column label="余额" align="center" prop="total" min-width="90"/>
      <el-table-column label="创建时间" prop="createTime" align="center" min-width="140">
        <template #default="scope">
          <a style="color: #00afff"
             @click="jump(scope.row.userId,parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}'))">{{
              parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}')
            }}</a>
        </template>
      </el-table-column>
      <el-table-column label="备注订单号" align="center" prop="markorder" min-width="140"/>
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

<script name="LogMoney" setup>
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  logMoneyAllList,
  logMoneyExport,
  logMoneyListData,
  moneyLogListCount,
} from "@/api/pay/logMoney";
import {getDefaultTime, pickerDateTimeShortcuts,parseTime} from "@/utils/dateUtils";
import {downloadExcel} from "@/utils/common";


const {proxy} = getCurrentInstance();

const loading = ref(true);
const totalLoading = ref(false);
const showSearch = ref(true);
const typeOptions = ref([]);
const logMoneyList = ref([]);
const types = ref([]);
const total = ref(0);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    userId: null,
    userName: null,
    types: [],
    createTime: null,
    remarkValue: null,
    orderByColumn: 'create_time',
    isAsc: 'desc',
  },

  /** updateTime */
  selectTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],


  totalData: {
    totalIncome: 0
  }

});

const {totalData, queryParams, selectTime} = toRefs(data);
const {log_money_mark} = proxy.useDict("log_money_mark");


function copy1() {
  proxy.copyCommand(totalData.value.totalIncome, proxy)
}

/**
 * 查询 会员资金信息列表 list data
 */
function getList() {
  loading.value = true
  logMoneyListData(proxy.addDateRange(queryParams.value, selectTime.value)).then(response => {
    logMoneyList.value = response.data
    total.value = response.total
    loading.value = false
  })
}

/**
 * 行为类型统计list all data
 */
function listCount() {
  moneyLogListCount(queryParams.value).then((res) => {
    totalData.value = res.data
  }).finally(() => {
    totalLoading.value = false
  })
}

function jump(userId, createTime) {
  proxy.$router.push({path: '/member/memberGameData', query: {userId: userId, createTime: createTime}})
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 reset query */
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery()
  loading.value = false
}

function logMoneyAllListData() {
  logMoneyAllList().then(res => {
    typeOptions.value = res.data
  })
}

function listAllLogType() {
  logMoneyAllList().then(res => {
    types.value = res.data
  })
}


/** 导出按钮操作 handle export data */
function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return logMoneyExport(queryParams.value)
  }).then(response => {
    downloadExcel(response, '支付类型')
  }).catch(() => {
  })
}

logMoneyAllListData()
getList();
listAllLogType()
</script>

<style scoped>

</style>