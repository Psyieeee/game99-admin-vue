<template>
  <div class="app-container">
    <div v-loading="totalLoading">
      <el-button type="primary" @click="copy1">交易笔数 {{ totalData.total || 0 }}</el-button>
      <el-button type="success" @click="copy2">总成功金额 {{ totalData.totalMoney || 0 }}</el-button>
      <el-button type="warning" @click="copy3">补单金额 {{ totalData.replenishmentTotalMoney || 0 }}</el-button>
      <el-button type="info" id="copy4" @click="copy4">成功率 {{
          proxy.numberUtil.toPercent(totalData.failRate || 0)
        }}
      </el-button>
      <el-button type="primary" icon="Search" size="small" @click="listCount()" style="margin-left: 20px">统计查询
      </el-button>
    </div>
    <el-form :model="queryParams" ref="queryForm" class="mt10" :inline="true" v-show="showSearch"
             label-width="100px">
      <el-form-item label="回调时间" prop="updateTime" label-width="70px">
        <el-date-picker type="datetimerange"
                        v-model="updateTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="proxy.getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item prop="status" class="col-w100">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable>
          <el-option
              v-for="dict in pay_online_recharge_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="platformId" class="col-w150">
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
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="searchValue" style="width: 200px">
        <el-input
            v-model.trim="queryParams.searchValue"
            placeholder="会员ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="searchOrderNo" style="width: 200px">
        <el-input
            v-model="queryParams.searchOrderNo"
            placeholder="上游订单号/订单号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>

      <!--      buttons -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
              type="warning"
              plain
              icon="Download"
              size="small"
              :disabled="disabled"
              @click="openExport"
              v-hasPermi="['pay:memberRechargeOnline:export']"
          >导出
          </el-button>
        </el-col>

        <el-col :span="7">
          <el-descriptions :column="3" size="small">
            <el-descriptions-item label="记录刷新" width="175px">
              <el-select v-model="refreshSec" placeholder="时间间隔" style="width: 110px" size="small">
                <el-option value="5" label="5秒"></el-option>
                <el-option value="10" label="10秒"></el-option>
                <el-option value="15" label="15秒"></el-option>
                <el-option value="20" label="20秒"></el-option>
                <el-option value="30" label="30秒"></el-option>
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item width="100px">
              <el-button :type="refreshType" :icon="refreshIcon" size="small" @click="refreshData">
                {{ refreshLabel }}
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item>{{ refreshDesc }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!--      display data into table -->
      <el-table :stripe="false" v-loading="loading" :data="rechargeOnlineList" :highlight-current-row="true"
                :default-sort="{prop: 'updateTime', order: 'descending'}" :row-style="tableRowStyleOnline">
        <el-table-column label="订单号" min-width="195" align="center" prop="orderNo"/>
        <el-table-column label="会员ID" min-width="120" align="center" prop="memberId"/>
        <el-table-column label="支付平台" min-width="120" align="center" prop="platformName"/>
        <el-table-column label="支付通道" min-width="150" align="center" prop="channelName"/>
        <el-table-column label="费率" width="100" align="center" prop="rateStr"/>
        <el-table-column label="请求金额" width="100" align="center" prop="money"/>
        <el-table-column label="实际金额" width="100" align="center" prop="realMoney"/>
        <el-table-column label="订单状态" width="100" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="pay_online_recharge_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="订单时间" width="160" align="center" prop="payTime" sortable/>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" sortable/>
        <el-table-column label="rechargeType" align="center" prop="rechargeType" width="160" sortable/>
        <el-table-column label="是否首次" align="center" prop="first" width="90">
          <template #default="scope">
            <dict-tag :options="first" :value="scope.row.first"/>
          </template>
        </el-table-column>
        <el-table-column label="上游订单号" align="center" prop="upperOrderNo" min-width="220"/>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" min-width="180"/>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right"
                         min-width="120">
          <template #default="scope">
            <el-button
                type="danger"
                link
                icon="Edit"
                size="small"
                v-show="scope.row.status === 0 || scope.row.status === -1"
                @click="handlePatchOrder(scope.row)"
                v-hasPermi="['pay:memberRechargeOnline:patchOrder']"
            >人工补单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
          v-show="total"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />


      <!-- excelPrompt dialog -->
      <el-dialog :close-on-click-modal="false" :title="title" v-model="openExcel" width="500px"
                 style="padding-bottom: 30px" append-to-body>
        <el-form ref="queryExcelForm" :inline="true" label-width="68px">
          <el-form-item label="选择日期" prop="selectDate">
            <el-date-picker type="datetimerange"
                            v-model="updateTime"
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            :style="{width: '95%'}"
                            start-placeholder="开始时间"
                            end-placeholder="开始时间"
                            range-separator="至"
                            clearable
                            :default-time="proxy.getDefaultTime()"
                            :shortcuts="proxy.pickerDateTimeShortcuts"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitExcelForm">确 定
          </el-button>
          <el-button @click="openExcel=!openExcel">取 消</el-button>
        </div>
      </el-dialog>

      <!--  PatchOrder form-->
      <el-dialog :close-on-click-modal="false" title="人工补单" v-model="open" style="padding-bottom: 30px"
                 width="500px"
                 append-to-body>
        <el-form ref="patchOrderForm" :model="form" :rules="rules" label-width="120px">
          <input v-model="form.channelId" type="hidden">

          <el-form-item label="订单编号" prop="orderNo">
            <el-input v-model="form.orderNo" readonly/>
          </el-form-item>
          <el-form-item label="会员ID" prop="memberId">
            <el-input v-model="form.memberId" readonly/>
          </el-form-item>
          <el-form-item label="支付平台" prop="platformName">
            <el-input v-model="form.platformName" readonly/>
          </el-form-item>
          <el-form-item label="支付渠道" prop="channelName">
            <el-input v-model="form.channelName" readonly/>
          </el-form-item>
          <el-form-item label="订单时间" prop="payTime">
            <el-input v-model="form.payTime" readonly/>
          </el-form-item>
          <el-form-item label="支付状态" prop="status">
            <el-input v-model="form.status" readonly/>
          </el-form-item>
            <el-form-item label="rechargeType" prop="rechargeType">
            <el-input v-model="form.rechargeType" readonly/>
          </el-form-item>
          <el-form-item label="请求金额" prop="money">
            <el-input v-model="form.money" readonly/>
          </el-form-item>
          <el-form-item label="实际到账金额" prop="realMoney">
            <el-input v-model="form.realMoney" type="number" placeholder="请输入实际到账金额"/>
          </el-form-item>
          <el-form-item label="MFA验证" prop="googleAuthCode">
            <el-input v-model="form.googleAuthCode" type="number" placeholder="请输入MFA验证码"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </el-dialog>


    </el-form>
  </div>
</template>

<script name="MemberRechargeOnline" setup>

import {
  memberRechargeOnlineById,
  memberRechargeOnlineCount,
  memberRechargeOnlineExport,
  memberRechargeOnlineList, memberRechargeOnlinePreOrder
} from "@/api/pay/memberRechargeOnline";

const router = useRouter();
const {proxy} = getCurrentInstance();

const {pay_online_recharge_status, first} = proxy.useDict("pay_online_recharge_status", "first");

import {reactive, ref, toRefs} from "vue";
import {getAllPayPlatform} from "@/api/pay/payPlatform";
import DictTag from "@/components/DictTag";


const rechargeOnlineList = ref([]);
const payPlatformOptions = ref([]);

const open = ref(false);
const openExcel = ref(false);
const disabled = ref(false);
const totalLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);

const title = ref('');
const total = ref(0);


const refreshSec = ref('5');
const refreshDesc = ref('');
const refreshIcon = ref('Refresh');
const refreshType = ref('primary');
const refreshLabel = ref('开始刷新');


const data = reactive({

  queryParams: {
    pageNum: 1,
    pageSize: 50,
    orderNo: null,
    searchValue: null,
    platformName: null,
    searchOrderNo: null,
    channelName: null,
    rechargeType:null,
    status: null,
    realMoney: null,
    downLoadDate: [],
  },
  updateTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],

  totalData: {
    total: 0,
    successCount: 0,
    failRate: 0,
    replenishmentTotalMoney: 0
  },
  form: {},
  // 表单校验
  rules: {
    realMoney: [
      {required: true, message: '实际到账金额不能为空', trigger: 'blur'}
    ],
    googleAuthCode: [
      {required: true, message: 'google验证码不能为空', trigger: 'blur'}
    ]
  }
});

const {queryParams, updateTime, totalData, form, rules} = toRefs(data);


function copy1() {
  proxy.copyCommand(totalData.value.total, proxy)
}

function copy2() {
  proxy.copyCommand(totalData.value.totalMoney, proxy)
}

function copy3() {
  proxy.copyCommand(totalData.value.replenishmentTotalMoney, proxy)

}

function copy4() {
  proxy.copyCommand(proxy.numberUtil.toPercent(totalData.value.failRate), proxy)
}

/** 查询线上充值信息列表 get list of memberRecharge online*/
function getList() {
  loading.value = true
  memberRechargeOnlineList(proxy.addDateRange(queryParams.value, updateTime.value)).then(response => {
    rechargeOnlineList.value = response.data
    total.value = response.total
    loading.value = false
  })
}

/** list Count */
function listCount() {
  totalLoading.value = true
  memberRechargeOnlineCount(proxy.addDateRange(queryParams.value, updateTime.value)).then(response => {
    totalData.value = response
    console.info(totalData.value)
  }).finally(() => {
    totalLoading.value = false
  })
}

/** list Pay platform */
function payPlatformListAll() {
  getAllPayPlatform().then(res => {
    payPlatformOptions.value = res.data
  })
}

/** 表单重置 */
function reset() {
  form.value = {
    memberId: null,
    orderNo: null,
    payTime: null,
    platformName: null,
    channelName: null,
    status: null,
    money: null,
    realMoney: null,
    googleAuthCode: null
  }
  proxy.resetForm('patchOrderForm')
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

/** 重置按钮操作 handle resetForm*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

function refreshData() {
  if (refreshType.value === 'primary') {
    refreshType.value = 'danger'
    refreshIcon.value = 'CircleCloseFilled'
    refreshLabel.value = '停止刷新'
    refreshDesc.value = ''

    stopRefresh()
    getList()
    startRefresh()
  } else {
    refreshType.value = 'primary'
    refreshIcon.value = 'Refresh'
    refreshLabel.value = '开始刷新'
    refreshDesc.value = ''
    stopRefresh()
  }
}

function tableRowStyleOnline({row, rowIndex}) {
  if (row.first) {
    console.info(row)
    return {backgroundColor: '#e9d1d1'}
  }
  return null;
}

function startRefresh() {
  let secs = refreshSec.value
  window.refreshInterval = setInterval(function () {
    if (secs === 0) {
      getList()
      secs = refreshSec.value
    }
    refreshDesc.value = secs + '秒后开始刷新'
    secs--
  }, 1000)
}

function stopRefresh() {
  clearInterval(window.refreshInterval)
}

function openExport() {
  title.value = "导出提示"
  openExcel.value = true
}

function submitExcelForm() {
  if (updateTime.value) {
    const time1 = new Date(updateTime.value[1]).getTime();
    const time2 = new Date(updateTime.value[0]).getTime();
    if ((time1 - time2) < 604800000) {
      proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        return memberRechargeOnlineExport(proxy.addDateRange(queryParams.value, updateTime.value))
      }).then(response => {
        openExcel.value = false
        proxy.downloadExcel(response, '支付信息日志')
      })
    } else {
      proxy.$notify.warning("所选时间不能大于七天")
    }
  }
}

function handlePatchOrder(row) {
  memberRechargeOnlineById(row.orderNo).then(res => {
    form.value = res.data;
    if (form.value.status === 0) {
      open.value = true
    } else if (form.value.status === -1) {
      open.value = true
    } else {
      getList()
    }
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['patchOrderForm'].validate(valid => {
    if (valid) {
      memberRechargeOnlinePreOrder({
        orderNo: form.value.orderNo,
        realMoney: form.value.realMoney, googleAuthCode: form.value.googleAuthCode
      }).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        if (response.code == 200) {
          open.value = false
          getList()
        }
      })
    }
  })
}

payPlatformListAll()
getList()
</script>

<style scoped>
</style>