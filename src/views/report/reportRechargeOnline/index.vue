<template>
  <div class="app-container">
    <el-button type="primary" @click="copy1">通道总数 {{ totalData.totalcount || 0 }}</el-button>
    <el-button type="success" @click="copy2">总成功金额 {{ totalData.realMoney || 0 }}</el-button>
    <el-button type="success" @click="copy3">手续费总额 {{ totalData.handlingfeeTotal || 0 }}</el-button>
    <el-button type="success" @click="copy4">结算总金额 {{
        totalData.realMoney - totalData.handlingfeeTotal || 0
      }}
    </el-button>
    <el-button type="primary" icon="Search" size="small" @click="handleCount">搜索</el-button>
    <!--     search form -->
    <el-form :model="queryParams" ref="queryForm" style="margin-top: 10px" :inline="true" v-show="showSearch"
             label-width="100px">
      <el-form-item label="更新时间" prop="updateTime" label-width="70px" style="width: 210px;">
        <el-date-picker type="date"
                        v-model="queryParams.updateTime"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        clearable
                        :shortcuts="toyesDayshortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item prop="platformId" style="width: 150px">
        <el-select
            filterable
            v-model="queryParams.platformId"
            placeholder="支付平台"
            clearable>
          <el-option
              v-for="dict in payPlatformOptions"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="channelName">
        <el-input
            v-model="queryParams.channelName"
            placeholder="支付通道"
            clearable
            style="width: 160px"
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--export button -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            :disabled="disabled"
            @click="handleExport"
            v-hasPermi="['pay:memberRechargeOnline:export']"
        >导出
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="memberOnlineReportList" stripe>
      <el-table-column label="支付平台" min-width="120" align="center" prop="platformName"/>
      <el-table-column label="支付通道" min-width="150" align="center" prop="channelName"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="请求金额" min-width="80" align="center" prop="money"/>
      <el-table-column label="实际金额" min-width="80" align="center" prop="realMoney"/>
      <el-table-column label="费率" min-width="80" align="center" prop="channelPayRate"/>
      <el-table-column label="手续费" min-width="80" align="center" prop="handlingfee"/>
      <el-table-column label="结算金额" min-width="80" align="center" prop="remaining"/>
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

<script setup name="ReportRechargeOnline">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getAllPayPlatform} from "@/api/pay/payPlatform";
import {parseTime, toyesDayshortcuts} from "@/utils/dateUtils";
import {
  memberOnlineReportListCount,
  memberOnlineReportListData,
  memberRechargeOnlineExportReport
} from "@/api/pay/memberRechargeOnline";

const {proxy} = getCurrentInstance();

const showSearch = ref(true);
const loading = ref(true);
const disabled = ref(false);
const memberOnlineReportList = ref([]);
const payPlatformOptions = ref([]);
const total = ref(0)


const data = reactive({

  queryParams: {
    pageNum: 1,
    pageSize: 50,
    platformId: null,
    channelName: null,
    updateTime: parseTime(new Date(), '{y}-{m}-{d}'),
  },
  totalData: {
    realMoney: 0,
      totalcount:0,
    handlingfeeTotal: 0,
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    RealMoney: [
      {required: true, message: '实际到账金额不能为空', trigger: 'blur'}
    ],
  }
});
const {queryParams, totalData, form, rules} = toRefs(data)


function copy1() {
  proxy.copyCommand(total.value,proxy)
}

function copy2() {
  proxy.copyCommand(totalData.value.realMoney,proxy)
}

function copy3() {
  proxy.copyCommand(totalData.value.handlingfeeTotal,proxy)
}

function copy4() {
  proxy.copyCommand((totalData.value.realMoney - totalData.value.handlingfeeTotal),proxy)
}

/**
 * list of report
 */
function getList() {
  loading.value = true
  memberOnlineReportListData(queryParams.value).then(res => {
    memberOnlineReportList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

/** 重置按钮操作 handle resetQuery*/
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false
}

function allPayPlateForm() {
  getAllPayPlatform().then(res => {
    payPlatformOptions.value = res.data
  })
}

/** 导出按钮操作 export data*/
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return memberRechargeOnlineExportReport(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '线上通道报表')
    loading.value = false
    disabled.value = false
  }).catch(() => {
  })
}

/** handle count */
function handleCount() {
  memberOnlineReportListCount(queryParams.value).then(res => {
    totalData.value = res;
  })
}


allPayPlateForm()
getList()
</script>

<style scoped>

</style>