<template>
  <div class="app-container">
    <!--    <div v-loading="totalLoading">-->
    <!--      <el-button type="primary" @click="copy1">投注金额 {{ totalData.totalCost||0 }}</el-button>-->
    <!--      <el-button type="success" @click="copy2">中奖金额 {{totalData.totalPrize||0 }}</el-button>-->
    <!--      <el-button  type="primary" icon="el-icon-search" size="small" @click="totalCount()" style="margin-left: 20px">统计查询</el-button>-->
    <!--    </div>-->
    <!--    search form -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
             style="margin-top: 20px">
      <el-form-item label="下注时间" prop="betTime">
        <el-date-picker type="datetimerange"
                        v-model="updateTime"
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
      <el-form-item prop="memberId" class="input-wd20">
        <el-input
            v-model="queryParams.memberId"
            placeholder="会员ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="issue" style="width: 150px;">
        <el-input
            v-model="queryParams.issue"
            placeholder="下注期数"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="lotteryName">
        <el-select
            v-model="queryParams.lotteryName"
            placeholder="请选择彩票名称"
            clearable
            style="width: 240px">
          <el-option
              v-for="dict in lotteryInfoList"
              :key="dict.name"
              :label="dict.name"
              :value="dict.name"
          />
        </el-select>
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
            v-hasPermi="['lottery:bet:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="lotteryBetList">
      <el-table-column label="用户ID" align="center" prop="memberId"/>
      <el-table-column label="彩票名称" align="center" prop="lotteryName"/>
      <el-table-column label="下注期数" align="center" prop="issue"/>
      <el-table-column label="开奖号码" align="center" prop="code"/>
      <el-table-column label="投注筹码" align="center" prop="chip"/>
      <el-table-column label="投注金额" align="center" prop="cost"/>
      <el-table-column label="下注选择" align="center" prop="betSelect"/>
      <el-table-column label="中奖状态" align="center" prop="status">
        <template #default="value">
          <dict-tag :options="lottery_bet_status" :value="value.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="中奖金额" align="center" prop="prize"/>
      <el-table-column label="下注时间" align="center" min-width="120px" prop="betTime" width="180"/>
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

<script name="LotteryBet" setup>
import {getDefaultTime, pickerDateTimeShortcuts} from "@/utils/dateUtils";
import {listAllLotteryInfo} from "@/api/lottery/lotteryInfo";
import {exportLotteryBet, listLotteryBet} from "@/api/lottery/lotteryBet";
import DictTag from "@/components/DictTag";

const {proxy} = getCurrentInstance();

const lotteryInfoList = ref([])
const lotteryBetList = ref([])
const total = ref(0)

const loading = ref(true)
const showSearch = ref(true)
const totalLoading = ref(false)

const data = reactive({

  queryParams: {
    pageNum: 1,
    pageSize: 20,
    memberId: null,
    lotteryName: null,
    issue: null,
    betIds: null,
    chip: null,
    prize: null,
    cost: null,
    code: null,
    betTime: null,
    updateTime: null,
    anchor: null,
    orderByColumn: 'bet_time',
    isAsc: 'desc',
  },

  totalData: {
    totalCost: 0,
    totalPrize: 0
  },

  /** updateTime */
  updateTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],

  form: {}

});

const {queryParams, updateTime, form} = toRefs(data);
const {lottery_bet_status} = proxy.useDict("lottery_bet_status");

/**
 * 查询彩票会员下注详情列表 list all lottery bet
 */
function getList() {
  loading.value = true
  listLotteryBet(proxy.addDateRange(queryParams.value, updateTime.value)).then(res => {
    lotteryBetList.value = res.data
    total.value = res.total
    loading.value = false
  })

}

function listLotteryInfo() {
  listAllLotteryInfo().then(res => {
    lotteryInfoList.value = res.data
  })
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    lotteryId: null,
    memberId: null,
    lotteryName: null,
    issue: null,
    status: 0,
    methodId: null,
    betSelect: null,
    betIds: null,
    chip: null,
    prize: null,
    cost: null,
    code: null,
    betTime: null,
    updateTime: null,
    anchor: null
  }
  proxy.resetForm('lotteryBetForm')
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

/** 重置按钮操作 reset query*/
function resetQuery() {
  queryParams.dateRange = []
  proxy.resetForm('queryForm')
  handleQuery()
}

/** 导出按钮操作 export data*/
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportLotteryBet(queryParams.value);
  }).then(response => {
    proxy.downloadExcel(response, '投注记录')
  }).catch(() => {
  })
}

listLotteryInfo()
getList()
</script>

<style scoped>

</style>