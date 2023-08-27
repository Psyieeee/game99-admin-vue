<template>
  <div class="app-container">
    <el-button type="primary" @click="copy1">交易比数 {{ totalData.totalcount || 0 }}</el-button>
    <el-button type="success" @click="copy2">总成功金额 {{ totalData.rechargeMoney || 0 }}</el-button>
    <!--    <el-button type="info" id="copy4" @click="copy4">成功率 {{ numberUtil.toPercent(this.totalData.failRate) }}</el-button>-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" style="margin-top: 10px" v-show="showSearch"
             label-width="100px">
      <el-form-item label="更新时间" prop="updateTime" label-width="70px" style="width: 210px">
        <el-date-picker type="date"
                        v-model="queryParams.updateTime"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        clearable
                        :shortcuts="toyesDayshortcuts">
        </el-date-picker>
      </el-form-item>

      <el-form-item prop="bankUserName">
        <el-input
            v-model="queryParams.bankUserName"
            placeholder="收款人"
            clearable
            style="width: 160px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充值金额" prop="withdrawMoney">
        <el-col :span="10">
          <el-input
              v-model="queryParams.priceMin"
              placeholder="￥"
              clearable
              autocomplete="on"
              min="0"
              style="width: 86px"
              type="number"
              class="no-number"
              @keyup.enter="handleQuery"
          />
        </el-col>
        <el-col :span="4" class="text-center" style="padding-left: 10px">
          <span>-</span>
        </el-col>
        <el-col :span="10">
          <el-input
              v-model="queryParams.priceMax"
              placeholder="￥"
              clearable
              autocomplete="on"
              min="0"
              style="width: 86px"
              type="number"
              class="no-number"
              @keyup.enter="handleQuery"
          />
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    tab button-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            :disabled="disabled"
            @click="handleExport"
            v-hasPermi="['pay:memberRechargeBankReport:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data into database-->
    <el-table :stripe="true" v-loading="loading" :data="memberBankRechargeList" :highlight-current-row="true">
      <el-table-column label="收款人" :show-overflow-tooltip="true" align="center" prop="bankUserName" min-width="90"/>
      <el-table-column label="银行账号" :show-overflow-tooltip="true" align="center" prop="bankAccount"
                       min-width="200"/>
      <el-table-column label="银行名称" :show-overflow-tooltip="true" align="center" prop="bankName" min-width="120"/>
      <el-table-column label="充值金额" align="center" prop="rechargeMoney" min-width="90"/>
      <el-table-column label="次数" align="center" prop="time" min-width="90"/>
      <el-table-column label="更新时间" min-width="160" align="center" prop="updateTime"/>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

  </div>
</template>

<script name="MemberBankRechargeReport" setup>

import {reactive, ref, toRefs} from "vue";
import {
  exportMemberRechargeBankReport,
  memberBankRechargeReportCount,
  memberRechargeBankReportList
} from "@/api/pay/memberRechargeBankReport";
import {parseTime, toyesDayshortcuts} from "@/utils/dateUtils";
import {copyCommand, downloadExcel} from "@/utils/common";

const {proxy} = getCurrentInstance();

const memberBankRechargeList = ref([]);
const total = ref(0);

const showSearch = ref(true);
const loading = ref(true);
const disabled = ref(false);

const apiData = reactive({

  queryParams: {
    pageNum: 1,
    pageSize: 100,
    updateTime: parseTime(new Date(), '{y}-{m}-{d}'),
    bankUserName: null,
    priceMin: null,
    priceMax: null
  },


  /** 表单参数 form parameter */
  form: {},

  /**统计总的数据 total data */
  totalData: {
    totalcount: 0,
    rechargeMoney: 0
  },

  /**  表单校验 form validation */
  rules: {
    subMoney: [
      {required: true, message: '实际到账金额不能为空', trigger: 'blur'}
    ],
  }
});
const {queryParams, form, rules, totalData} = toRefs(apiData)


/** 复制 */
function copy1() {
  copyCommand(totalData.totalcount)
}

function copy2() {
  copyCommand(totalData.rechargeMoney)
}

/**  查询线下充值信息列表 list all member Recharge Bank report */
function getList() {
  loading.value = true
  memberRechargeBankReportList(queryParams.value).then(res => {
    memberBankRechargeList.value = res.data;
    total.value = res.total
    loading.value = false
  })
}

/**  列表统计 count */
function listCounts() {
  memberBankRechargeReportCount(queryParams.value).then((res) => {
    totalData.value = res
  })
}

/**  handle query*/
function handleQuery() {
  queryParams.pageNum = 1
  getList()
  listCounts()
}

/**  handle reset form query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
}

/** 导出按钮操作 export*/
function handleExport() {
  disabled.value = true
  // const queryParams = this.queryParams
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportMemberRechargeBankReport(queryParams.value)
  }).then(response => {
    downloadExcel(response, '线下充值报表')
    loading.value = false
    disabled.value = false
  }).catch(() => {
    disabled.value = false
  })
}

getList()
</script>

<style scoped>
</style>