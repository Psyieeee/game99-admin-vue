<template>
  <div class="app-container">
    <div v-loading="totalLoading">
      <el-button type="primary" @click="copy1">交易笔数 {{ totalData.total || 0 }}</el-button>
      <el-button type="success" @click="copy2">总成功金额 {{ totalData.successMoney || 0 }}</el-button>
      <el-button type="info" id="copy4" @click="copy3">成功率 {{
          proxy.numberUtil.toPercent(totalData.successRate || 0)
        }}
      </el-button>
      <el-button type="primary" icon="Search" size="small" @click="listCount()" style="margin-left: 20px">统计查询
      </el-button>
    </div>
    <!--    search form-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" style="margin-top: 10px" v-show="showSearch"
             label-width="68px">
      <el-form-item label="创建时间" prop="updateTime" label-width="70px">
        <el-date-picker type="datetimerange"
                        v-model="queryParams.selectDate"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="pickerDateTimeShortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item prop="memberId" style="width: 200px">
        <el-input
            v-model.trim="queryParams.memberId"
            placeholder="请输入会员ID"
            clearable
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item prop="channelName">
        <el-select
            filterable
            v-model="queryParams.channelName"
            placeholder="请选择渠道名称"
            clearable
            style="width: 240px">
          <el-option
              v-for="channelName in channelNameOptions"
              :key="channelName.name"
              :label="channelName.name"
              :value="channelName.name"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="status">
        <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 130px">
          <el-option
              v-for="dict in pay_usdt_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="transactionId" class="input-wd20">
        <el-input
            v-model="queryParams.transactionId"
            placeholder="请输入交易id"
            clearable
            @keyup.enter="handleQuery"/>
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
            v-hasPermi="['pay:memberRechargeUsdt:export']">导出
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


    <!--    display data in table -->
    <el-table stripe v-loading="loading" :data="payUsdtRechargeList">
      <el-table-column label="复制" align="center" width="80">
        <template #default="scope">
          <el-button
              type="primary" size="small"
              @click="handleCopy(scope.row)"
          >复制
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="center" prop="rechargeOrderNo" width="220"/>
      <el-table-column label="会员ID" align="center" prop="memberId" width="120"/>
      <el-table-column label="交易id" align="center" width="400" prop="transactionId">
        <template v-slot="{row}">
          <a :class="{blue:index !== row.transactionId}" @click="copyColumn(row.transactionId)"
             style="color: #1ab394;margin-left: 5px">{{ row.transactionId }}</a>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" min-width="120">
        <template #default="scope">
          <dict-tag :options="pay_usdt_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="充值U数量" align="center" prop="rechargeNumber" min-width="90"/>
      <el-table-column label="充值金额" align="center" prop="rechargeMoney"/>
      <el-table-column label="渠道名称" align="center" min-width="120" prop="channelName" width="120"/>
      <el-table-column label="优惠比例" align="center" prop="discountBill"/>
      <el-table-column label="渠道名称" align="center" min-width="120" prop="chainName"/>
      <el-table-column label="充值地址" align="center" min-width="100" prop="rechargeAddress" width="400"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="操作人" align="center" prop="opName"/>
      <el-table-column label="备注" align="center" min-width="160" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160"/>
      <el-table-column label="审批时间" align="center" prop="updateTime" width="160"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="240">
        <template #default="scope">
          <el-button
              type="primary"
              link
              v-show="scope.row.status == 1"
              @click="handleUpdateLock(scope.row)"
              v-hasPermi="['pay:memberRechargeUsdt:edit']"
          >锁定
          </el-button>
          <el-button
              type="primary"
              link
              v-show="scope.row.status == 0"
              @click="handleUpdateUnLock(scope.row)"
              v-hasPermi="['pay:memberRechargeUsdt:edit']"
          >解锁
          </el-button>
          <el-button
              type="success"
              link
              v-show="scope.row.status == 0"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pay:memberRechargeUsdt:edit']"
          >通过
          </el-button>
          <el-button
              type="danger"
              link
              v-show="scope.row.status == 0"
              @click="handleUpdateRefuse(scope.row)"
              v-hasPermi="['pay:memberRechargeUsdt:edit']"
          >拒绝
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

    <!-- 通过USDT充值记录对话框 -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="500px" style="height: 670px"
               append-to-body>
      <el-form ref="usdtForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="会员ID" prop="memberId">
          <el-input v-model="form.memberId" readonly placeholder="请输入会员ID"/>
        </el-form-item>
        <el-form-item label="渠道名称" prop="channelName">
          <el-input v-model="form.channelName" readonly placeholder="请输入渠道名称"/>
        </el-form-item>
        <el-form-item label="充值U数量" prop="rechargeNumber">
          <el-input v-model="form.rechargeNumber" readonly placeholder="请输入充值U数量"/>
        </el-form-item>
        <el-form-item label="充值金额" prop="rechargeMoney">
          <el-input v-model="form.rechargeMoney" readonly placeholder="请输入充值金额"/>
        </el-form-item>
        <el-form-item label="优惠比例" prop="discountBill">
          <el-input v-model="form.discountBill" readonly placeholder="请输入优惠比例"/>
        </el-form-item>
        <el-form-item label="链名称" prop="chainName">
          <el-input v-model="form.chainName" readonly placeholder="请输入链名称"/>
        </el-form-item>
        <el-form-item label="充值地址" prop="rechargeAddress">
          <el-input v-model="form.rechargeAddress" readonly placeholder="请输入充值地址"/>
        </el-form-item>
        <el-form-item label="交易id" prop="transactionId">
          <el-input type="textarea" v-model="form.transactionId" readonly placeholder="请输入交易id"/>
        </el-form-item>
        <el-form-item label="审核备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入审核备注"/>
        </el-form-item>
        <el-form-item label="MFA验证" prop="googleAuthCode">
          <el-input v-model="form.googleAuthCode" type="number" class="no-number" placeholder="请输入MFA验证码"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">通 过</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script name="MemberRechargeUsdt" setup>
import {
  memberRechargeUsdtEdit,
  memberRechargeUsdtExport, memberRechargeUsdtGetbyId,
  memberRechargeUsdtList,
  memberRechargeUsdtListCount, memberRechargeUsdtLockById, memberRechargeUsdtRefuseById, memberRechargeUstdUnlockById
} from "@/api/pay/memberRechargeUsdt";
import {listAllPayChannel} from "@/api/pay/payChannel";
import {getDefaultTime, pickerDateTimeShortcuts} from "@/utils/dateUtils";
import DictTag from "@/components/DictTag";

const {proxy} = getCurrentInstance();

const {pay_usdt_status} = proxy.useDict("pay_usdt_status");


const channelNameOptions = ref([]);
const payUsdtRechargeList = ref([]);

const total = ref(0);
const index = ref(0);

const open = ref(false);
const loading = ref(true);
const totalLoading = ref(false);
// 显示搜索条件
const showSearch = ref(true);

const title = ref('');

const refreshSec = ref('5');
const refreshDesc = ref('');
const refreshIcon = ref('Refresh');
const refreshType = ref('primary');
const refreshLabel = ref('开始刷新');

const data = reactive({

  /** queryParams */
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    memberId: null,
    userName: null,
    channelName: null,
    rechargeNumber: null,
    rechargeMoney: null,
    status: null,
    discountBill: null,
    chainName: null,
    rechargeAddress: null,
    transactionId: null, //
    opName: null,
    selectDate:[proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
    // orderByColumn: 'createTime',
    // isAsc: 'desc'
  },

  totalData: {
    total: 0,
    successMoney: 0,
    successRate: 0
  },

  form: {},
  rules: {
    remark: [
      {required: true, message: '审核备注不能为空', trigger: 'blur'}
    ],
    googleAuthCode: [
      {required: true, message:'MFA验证码不能为空', trigger: 'blur'}
    ]
  }

});

const {queryParams, totalData,form, rules} = toRefs(data);


function copy1() {
  proxy.copyCommand(totalData.value.total, proxy);
}

function copy2() {
  proxy.copyCommand(totalData.value.successMoney, proxy);
}

function copy3() {
  proxy.copyCommand(proxy.numberUtil.toPercent(totalData.value.successRate || 0), proxy);
}

function handleCopy(row) {
  var status = pay_usdt_status[parseInt(row.status)];
  var textarea = document.createElement("textarea");
  let html = '<table><tr>'
  html += '<td>' + row.memberId + '</td>'
  html += '<td>' + row.channelName + '</td>'
  html += '<td>' + row.rechargeNumber + '</td>'
  html += '<td>' + row.rechargeMoney + '</td>'
  html += '<td>' + row.discountBill + '</td>'
  html += '<td>' + row.chainName + '</td>'
  html += '<td>' + row.rechargeAddress + '</td>'
  html += '<td>' + row.transactionId + '</td>'
  html += '<td>' + status + '</td>'
  html += '<td>' + row.createTime + '</td>'
  html += '<td>' + row.remark + '</td>'
  html += '<td>' + row.opName + '</td>'
  html += '<td>' + row.updateTime + '</td>'
  html += '</tr></table>'
  textarea.value = html;
  proxy.copyCommand(proxy.copyData = html, proxy);
}

function copyColumn(value) {
  index.value = value
  proxy.copyCommand(value, proxy)
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    memberId: null,
    userName: null,
    channelName: null,
    rechargeNumber: null,
    rechargeMoney: null,
    status: null,
    remark: null,
    discountBill: null,
    chainName: null,
    rechargeAddress: null,
    transactionId: null,
    opName: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("usdtForm");
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

/**
 * 查询USDT充值信息列表 Query USDT recharge information list
 */
function getList() {
  loading.value = true
  memberRechargeUsdtList(queryParams.value).then(res => {
    payUsdtRechargeList.value = res.data
    total.value = res.total
    loading.value = false
  })

}

/**
 * 查询USDT充值信息列表统计 Query USDT  statistics information
 */
function listCount() {
  totalLoading.value = true
  memberRechargeUsdtListCount(queryParams.value).then(res => {
    totalData.value = res.data
  }).finally(() => {
    totalLoading.value = false
  })
}

function channelNameList() {
  listAllPayChannel().then(res => {
    channelNameOptions.value = res.data
  })
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
}

/** 锁定按钮操作 */
function handleUpdateLock(row) {
  const id = row.rechargeOrderNo;
  memberRechargeUsdtLockById(id).then(response => {
    proxy.$modal.msgSuccess("锁定成功")
    getList()
  });
}

/** 解锁按钮操作 */
function handleUpdateUnLock(row) {
  loading.value = true
  const id = row.rechargeOrderNo;
  memberRechargeUstdUnlockById(id).then(response => {
    loading.value = false
    if (response.code === 200) {
      proxy.$modal.msgSuccess("解锁成功")

      getList();
    } else {
      proxy.$modal.msgError(response.data.msg)
    }
  });
}

/** 通过按钮操作 */
function handleUpdate(row) {
  reset();
  memberRechargeUsdtGetbyId(row.rechargeOrderNo).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "审批USDT充值记录申请";
  });
}

/** 通过提交按钮 */
function submitForm() {
  proxy.$refs["usdtForm"].validate(valid => {
    if (valid) {
      const id = form.value.rechargeOrderNo
      const remark = form.value.remark
      const googleAuthCode = form.value.googleAuthCode

      memberRechargeUsdtEdit({
        rechargeOrderNo: id,
        remark: remark,
        googleAuthCode: googleAuthCode
      }).then(response => {
        if (response.code == 200) {
          proxy.$modal.msgSuccess(response.msg)
          open.value = false;
          getList();
        } else {
          proxy.$modal.msgError(response.msg)
        }
      }).catch(() => {
        proxy.$modal.msgError("订单审核通过有误")
      })
    }
  });
}

/** 拒绝按钮操作 */
function handleUpdateRefuse(row) {
  proxy.$prompt('请输入审核拒绝备注', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S/,
    inputErrorMessage: '审核拒绝备注不能为空',
  }).then(({value}) => {
    const id = row.rechargeOrderNo
    memberRechargeUsdtRefuseById(id, value).then(response => {
      proxy.$modal.msgSuccess("审核拒绝成功");
      getList();
    });
  }).catch(() => {
    proxy.$modal.msg({
      type: 'info',
      message: '取消输入'
    });
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', "警告", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return memberRechargeUsdtExport(queryParams.value);
  }).then(response => {
    proxy.downloadExcel(response, 'USDT充值记录');
  }).catch(() => {
  })
}

channelNameList()
getList()
</script>

<style scoped>
.dialog-footer {
  float: right;
}
</style>