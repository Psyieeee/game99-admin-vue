<template>
  <div class="app-container">
    <!-- display total -->
    <div v-loading="totalLoading">
      <el-button type="primary" @click="copy1">会员人数 {{ totalData.peopledTotal || 0 }}</el-button>
      <el-button type="success" @click="copy2">余额总计 {{ totalData.totalMoney || 0 }}</el-button>
      <el-button type="warning" @click="copy3">保险箱余额总计 {{ totalData.safeBalanceTotalMoney || 0 }}
      </el-button>
      <el-button type="primary" icon="Search" size="small" @click="listCount()" style="margin-left: 20px">
        统计查询
      </el-button>
    </div>
    <!-- search form start from here-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" style="margin-top: 20px">
      <el-form-item label="搜索成员" prop="searchValue">
        <el-input
            v-model.trim="queryParams.searchValue"
            placeholder="会员ID/手机号 , 逗号分隔的成员搜索"
            clearable
            type="primary"
            link
            style="width: 400px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期范围" prop="registerTime">
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
                        :shortcuts="pickerDateTimeShortcuts"
        ></el-date-picker>
      </el-form-item>
      <el-form-item prop="status" style="width: 110px;">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable>
          <el-option
              v-for="dict in member_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="inviterCode" style="width: 110px;" id="inviterCode">
        <el-input
            v-model="queryParams.inviterCode"
            placeholder="邀请码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="channelcode" style="width: 110px;" id="channelCode">
        <el-select v-model="queryParams.channelcode" placeholder="全部类型" clearable>
          <el-option
              v-for="dict in member_device_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="loginIp" style="width: 110px;" class="loginIp">
        <el-input
            v-model="queryParams.loginIp"
            placeholder="登录IP"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="bankAccount" style="width: 155px;" class="bankAccount">
        <el-input
            v-model="queryParams.bankAccount"
            placeholder="银行卡号/真实姓名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="email" style="width: 110px;" class="email">
        <el-input
            v-model="queryParams.remark"
            placeholder="登录备注"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item class="submit-btn">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>

    </el-form>
    <!-- search form end here-->
    <!--  handle button on table-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            v-hasPermi="['member:infoHistory:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="openExport"
            size="small"
            v-hasPermi="['member:infoHistory:export']"
        >导出
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="openIpBlackList()"
        >查看封停ip
        </el-button>
      </el-col>

      <!--      adding new button ip click get pop up-->
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
        >批量封禁
        </el-button>
      </el-col>
      <!--      end adding button -->
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :stripe="true" v-loading="loading" :data="memberInfoList">
      <el-table-column label="会员ID" align="center" prop="id" min-width="140px">
        <template v-slot="{row}">
          <el-button
              type="text text-info"
              size="small"
              icon="Document"
              @click="handleCopy(row.id)"
          />
          <a style="color: #1ab394;margin-left: 5px">{{ row.id }}</a>
        </template>
      </el-table-column>
      <el-table-column label="昵称" :show-overflow-tooltip="true" align="center" prop="nickName" min-width="160"/>
      <el-table-column label="会员vip" align="center" prop="vip" min-width="70px"/>
      <el-table-column label="余额" :show-overflow-tooltip="true" align="center" prop="accountNow" min-width="120px"/>
      <el-table-column label="保险箱余额" :show-overflow-tooltip="true" align="center" prop="boxAccount"
                       min-width="120px"/>
      <el-table-column label="状态" align="center" min-width="110px">
        <template v-slot="{row}">
          <el-select v-model="row.status" placeholder="请选择状态" size="small"
                     @change="changeType(row)"
          >
            <el-option
                v-for="dict in member_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" prop="registerTime" width="160"/>
      <el-table-column label="登录时间" align="center" prop="loginTime" width="160"/>
      <el-table-column label="登陆次数" align="center" prop="loginNum" min-width="100px"/>
      <el-table-column label="登录ip" :show-overflow-tooltip="true" align="center" prop="loginIp" width="180"/>
      <el-table-column label="注册IP" :show-overflow-tooltip="true" align="center" prop="registerIp" width="180"/>
      <el-table-column label="限制地区" :show-overflow-tooltip="true" align="center" prop="loginProvince" width="180"/>
      <el-table-column label="打码账户" align="center" prop="codeTotal" min-width="110"/>
      <el-table-column label="累计有效投注" align="center" prop="codeNow" min-width="110"/>
      <el-table-column label="邀请码" align="center" prop="inviterCode" min-width="100"/>
      <el-table-column label="用户类型" align="center" prop="channelcode" min-width="200">
        <template #default="scope">
          <span v-if="scope.row.channelcode == null"
                :style="{'color': '#5FB878'}">会员|{{
              scope.row.version == null || scope.row.version == '' || scope.row.version == undefined ? '无' : scope.row.version
            }}|{{ scope.row.loginDev == 2 ? 'andriod' : scope.row.loginDev == 1 ? 'ios' : '其它' }}</span>
          <span v-else :style="{color: (memberType = statusOptions[scope.row.channelcode > 0 ? 1 : 0]).color}">{{
              memberType.dictLabel
            }}|{{
              scope.row.version == null || scope.row.version == '' || scope.row.version == undefined ? '无' : scope.row.version
            }}|{{ scope.row.loginDev == 2 ? 'andriod' : scope.row.loginDev == 1 ? 'ios' : '其它' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录备注" align="center" prop="remark" :show-overflow-tooltip="true" min-width="130px"/>
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="120">-->
<!--        <template #default="scope">-->
<!--          <el-button-->
<!--              type="primary"-->
<!--              plain-->
<!--              icon="Menu"-->
<!--              @click="handleMore(scope.row)"-->
<!--          >更多-->
<!--          </el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
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
               style="height: 200px" append-to-body>
      <el-form ref="queryExcelForm" :inline="true" label-width="68px">
        <el-form-item label="选择日期" prop="registerTime">
          <el-date-picker type="datetimerange"
                          v-model="dateRange"
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitExcelForm">确 定
        </el-button>
        <el-button @click="openExcel=!openExcel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="MemberInfoHistory" setup>

import {useDict} from "@/utils/dict";
import {reactive, ref, toRefs} from "vue";
import {getTodayEndTime, getTodayStartTime, parseTime} from "@/utils/dateUtils";
import {exportMemberInfoHistory, listCountApi, listMemberInfoHistory} from "@/api/member/memberInfoHistory";
import {
  pickerDateTimeShortcuts,
  getDefaultTime
} from "@/utils/dateUtils";


const router = useRouter();
const {proxy} = getCurrentInstance();

const {member_type, member_device_type, muteRemarkOptions} = useDict("member_type", "device_type", "muteRemarkOptions");


const statusOptions = ref([]);
const ids = ref([]);
const memberInfoList = ref([]);
const memberByIpAddress = ref([]);
const firstOptions = ref([]);
// 状态列表0= 禁用 1=正常 2=测试号3=超管号 status 0=disabled 1=normal 2=test  3= superpipe
const typeList = ref([]);

const totalLoading = ref(false);
// 遮罩层 loading
const loading = ref(false);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
const muteRemark = ref(false);
const muteRemarkSpeak = ref(false);
const memberByIpListList = ref(false);
const memberByIpAddressListOpen = ref(false);
const paginationShow = ref(false);
const isActive = ref(false);
const personalReportOpen = ref(false);
// 是否显示弹出层
const open = ref(false);
const display = ref(false);
const openExcel = ref(false);

const googleAuthCode = ref(null);


const first = ref(null);
const phone = ref(null);
const password = ref(null);
const agent = ref(null);
const memberCode = ref(0);
const memberId = ref(null);
const id = ref('');
const username = ref('');
const status = ref('');
const realName = ref('');
const remark = ref('');
const remarked = ref('');
const loginIp = ref('');
// 弹出层标题
const title = ref('');
const total = ref(0);

const data = reactive({

  //统计总的数据 total statistics
  totalData: {
    peopledTotal: 0,
    totalMoney: 0,
    safeBalanceTotalMoney: 0
  },

  fromMuteRemark: {},
  fromMuteRemarkSpeak: {},

  // 查询参数 query parameters
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    email: '',
    bankAccount: '',
    searchValue: '', //会员Id,账号,手机号
    status: '',
    loginIp: '',
    nickName: '',
    inviterCode: '',
    channelcode: '',
    downLoadDate: [],
    selectDate: [parseTime(getTodayStartTime()), parseTime(getTodayEndTime())],
    orderByColumn: 'register_time',
    isAsc: 'desc'
  },

  dateRange: [parseTime(getTodayStartTime()), parseTime(getTodayEndTime())],

  queryParam: {
    pageNum: 1,
    pageSize: 20,
    orderByColumn: 'register_time',
    isAsc: 'desc'
  },
  queryParamIp: {
    pageNum: 1,
    pageSize: 20,
    orderByColumn: 'register_time',
    isAsc: 'desc'
  },
  queryParamsByIp: {
    pageNum: 1,
    pageSize: 20,
    email: '',
    searchValue: '', //会员Id,账号,手机号
    status: '',
    loginIp: '',
    userName: '',
    nickName: '',
    realName: '',
    orderByColumn: 'register_time',
    // isAsc: 'desc'
  },
  form: {},
  rules: {},


});

const {totalData, dateRange, queryParams, form, rules} = toRefs(data);


//复制 copy
function copy1() {
  proxy.copyCommand(totalData.value.peopledTotal, proxy)
}

function copy2() {
  proxy.copyCommand(totalData.value.totalMoney, proxy)
}

function copy3() {
  proxy.copyCommand(totalData.value.safeBalanceTotalMoney, proxy)
}

function handleCopy(row) {
  proxy.copyCommand(row.id, proxy)
}

//统计 count
function listCount() {
  totalLoading.value = true
  listCountApi(queryParams.value).then((response) => {
    totalData.value = response
  }).finally(() => {
    totalLoading.value = false
  })
}

/** get member info list */
function getList() {
  loading.value = true
  listMemberInfoHistory(queryParams.value).then(response => {
    memberInfoList.value = response.data;
    total.value = response.total
    loading.value = false
  })
}

/** handle search query */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** reset form query */
function resetQuery() {
  proxy.resetForm('memberRef')
  handleQuery()
}

/**
 * 导出会员提现信息列表 export form
 */
function openExport() {
  openExcel.value = true
}

/**
 * 导出会员提现信息列表 export data
 */
function submitExcelForm() {
  if (dateRange.value) {
    const time1 = new Date(dateRange.value[1]).getTime();
    const time2 = new Date(dateRange.value[0]).getTime();
    if ((time1 - time2) < 604800000) {
      proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        return exportMemberInfoHistory(proxy.addDateRange(queryParams.value, dateRange.value))
      }).then(response => {
        openExcel.value = false
        proxy.downloadExcel(response, '支付信息日志')
      })
    } else {
      proxy.$notify.warning("所选时间不能大于七天")
    }
  }
}

function openIpBlackList() {
}

getList()
</script>

<style scoped>

</style>