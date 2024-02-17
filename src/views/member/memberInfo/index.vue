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
            placeholder="会员ID/手机号/电子邮件 , 逗号分隔"
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
                        :default-time="proxy.getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts"
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
      <el-form-item prop="loginDev" style="width: 110px;" id="channelCode">
        <el-select v-model="queryParams.loginDev" placeholder="登录设备" clearable style="width: 110px">
          <el-option value="0" label="H5"></el-option>
          <el-option value="1" label="ios"></el-option>
          <el-option value="2" label="android"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="hasAccountCharge" style="width: 110px;" id="hasAccountCharge">
        <el-select v-model="queryParams.hasAccountCharge" placeholder="是否充值" clearable style="width: 110px">
          <el-option value="true" label="是"></el-option>
          <el-option value="false" label="否"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="online" style="width: 110px;">
        <el-select v-model="queryParams.online" placeholder="在线状态" clearable style="width: 110px">
          <el-option value="true" label="在线的"></el-option>
          <el-option value="false" label="离线"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="version" style="width: 110px;" id="version">
        <el-input
            v-model="queryParams.version"
            placeholder="版本"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item prop="inviterCode" style="width: 110px;" id="inviterCode">-->
<!--        <el-input-->
<!--            v-model="queryParams.inviterCode"-->
<!--            placeholder="邀请码"-->
<!--            clearable-->
<!--            @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item prop="inviterCode" style="width: 110px;" id="inviterCode">
        <el-input
            v-model="queryParams.inviterCode"
            placeholder="邀请码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item prop="channelCode" style="width: 110px;" id="channelCode">-->
<!--        <el-select v-model="queryParams.channelcode" placeholder="全部类型" clearable>-->
<!--          <el-option-->
<!--              v-for="dict in member_device_type"-->
<!--              :key="dict.value"-->
<!--              :label="dict.label"-->
<!--              :value="dict.value"-->
<!--          />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item prop="loginIp" style="width: 110px;" class="loginIp">
        <el-input
            v-model="queryParams.loginIp"
            placeholder="登录IP"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="registerIp" style="width: 110px;" class="registerIp">
        <el-input
            v-model="queryParams.registerIp"
            placeholder="注册IP"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="account" style="width: 155px;" class="bankAccount">
        <el-input
            v-model="queryParams.account"
            placeholder="银行卡号/真实姓名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="remark" style="width: 110px;" class="remark">
        <el-input
            v-model="queryParams.remark"
            placeholder="登录备注"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="deviceId" style="width: 110px;" class="deviceId">
        <el-input
            v-model="queryParams.deviceId"
            placeholder="设备id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!--   min and max search -->
      <el-form-item prop="cost">
        <el-input
            v-model="queryParams.vipMin"
            placeholder="min-vip"
            clearable
            autocomplete="on"
            min="0"
            style="width: 91px"
            type="number"
            class="no-number"
            @keyup.enter.native="handleQuery"
        />
        -
        <el-input
            v-model="queryParams.vipMax"
            placeholder="max-vip"
            clearable
            autocomplete="on"
            min="0"
            style="width: 91px"
            type="number"
            class="no-number"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!--      end min and max search-->

      <el-form-item class="submit-btn">
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
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
            @click="handleAdd"
            size="small"
            v-hasPermi="['member:memberInfo:add']"
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
            v-hasPermi="['member:memberInfo:export']"
        >导出
        </el-button>
      </el-col>
      <!--      <el-col :span="1.5">-->
      <!--        <el-button-->
      <!--            type="primary"-->
      <!--            plain-->
      <!--            icon="Plus"-->
      <!--            size="small"-->
      <!--            @click="openIpBlackList()"-->
      <!--        >查看封停ip-->
      <!--        </el-button>-->
      <!--      </el-col>-->

      <!--      adding new button ip click get pop up-->
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="memberListAccordingToIp()"
        >批量封禁
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="mobileLimitFun()"
        > 限制手机号注册
        </el-button>
      </el-col>

      <!--      end adding button -->
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :stripe="true" v-loading="loading" :data="memberInfoList" @selection-change="handleSelectionChange">
      <el-table-column label="会员ID" align="center" prop="id" min-width="140px">
        <template v-slot="{row}">
          <el-button
              type="info"
              link
              size="small"
              icon="Document"
              @click="handleCopy(row.id)"
          />
          <a @click="personalReport(row.id)" style="color: #1ab394;margin-left: 5px">{{ row.id }}</a>
        </template>
      </el-table-column>
      <el-table-column label="绑卡姓名" :show-overflow-tooltip="true" align="center" prop="cardRealName" width="140"/>
      <el-table-column label="在线状态" :show-overflow-tooltip="true" align="center" prop="online" width="140">
        <template #default="scope">{{scope.row.online ? "在线的" : "离线"}}</template>
      </el-table-column>
      <el-table-column label="手机" prop="phone" align="center" width="120px"/>
      <el-table-column label="会员vip" align="center" prop="vip" width="70px"/>
      <el-table-column label="余额" :show-overflow-tooltip="true" align="center" prop="accountNow" min-width="120"/>
      <el-table-column label="积分" :show-overflow-tooltip="true" align="center" prop="bonusMoney" min-width="120"/>
      <el-table-column label="总平台赠送" :show-overflow-tooltip="true" align="center" prop="promotionAmount" min-width="120"/>
      <el-table-column label="总提现" :show-overflow-tooltip="true" align="center" prop="withdrawAccount" min-width="120"/>
      <el-table-column label="电子邮件" :show-overflow-tooltip="true" align="center" prop="email"
                       min-width="120"
                       :formatter="maskedEmailRow"/>
      <el-table-column label="状态" align="center" min-width="110px">
        <template v-slot="{row}">
          <el-select v-model="row.status" placeholder="请选择状态" size="small"
                     @change="changeType(row)">
            <el-option
                v-for="dict in member_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>

      <!--        <el-table-column label="出款状态" align="center" prop="withdrawStatus" width="140">-->
      <!--            <template #default="scope">-->
      <!--                <el-switch-->
      <!--                        v-model="scope.row.withdrawStatus"-->
      <!--                        :active-value="true"-->
      <!--                        :inactive-value="false"-->
      <!--                        @click="withdrawStatusChange(scope.row)">-->
      <!--                </el-switch>-->
      <!--            </template>-->
      <!--        </el-table-column>-->


      <el-table-column label="注册时间" align="center" prop="registerTime" width="160"/>
      <el-table-column label="登录时间" align="center" prop="loginTime" width="160"/>
      <el-table-column label="登录ip" :show-overflow-tooltip="true" align="center" prop="loginIp" width="180"/>
      <el-table-column label="注册IP" :show-overflow-tooltip="true" align="center" prop="registerIp" width="180"/>
      <el-table-column label="限制地区" :show-overflow-tooltip="true" align="center" prop="loginProvince" width="180"/>
<!--      <el-table-column label="打码账户" align="center" prop="codeNow" min-width="110"/>-->
      <el-table-column label="累计有效投注" align="center" prop="codeTotal" min-width="110"/>
      <el-table-column label="邀请码" align="center" prop="inviterCode" min-width="100"/>
      <el-table-column label="邀请码" align="center" prop="channelCode" min-width="100"/>
      <el-table-column label="用户类型" align="center" prop="channelcode" min-width="200">
        <template #default="scope">
          <span v-if="scope.row.channelcode == null"
                :style="{'color': '#5FB878'}">会员|{{
              scope.row.version == null || scope.row.version == '' || scope.row.version == undefined ? '无' : scope.row.version
            }}|{{ scope.row.loginDev == 2 ? 'andriod' : scope.row.loginDev == 1 ? 'ios' : scope.row.loginDev == 0 ? 'H5' : '其它' }}</span>
          <span v-else :style="{color: (memberType = statusOptions[scope.row.channelcode > 0 ? 1 : 0]).color}">{{
              memberType.dictLabel
            }}|{{
              scope.row.version == null || scope.row.version == '' || scope.row.version == undefined ? '无' : scope.row.version
            }}|{{ scope.row.loginDev == 2 ? 'andriod' : scope.row.loginDev == 1 ? 'ios' : '其它' }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column label="登录备注" align="center" prop="remark" :show-overflow-tooltip="true" min-width="130"/>-->
      <el-table-column label="设备id" align="center" prop="deviceId" :show-overflow-tooltip="true" min-width="130"/>
      <el-table-column label="话163" align="center" prop="yun163" :show-overflow-tooltip="true" min-width="130"/>
      <el-table-column label="登录备注" align="center" prop="remark" :show-overflow-tooltip="true" min-width="130"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="250">
        <template #default="scope">
          <el-button
              type="primary"
              plain
              icon="Menu"
              @click="handleMore(scope.row)"
          >更多
          </el-button>
          <!--          <el-button-->
          <!--              type="warning"-->
          <!--              plain-->
          <!--              @click="boxDish(scope.row)"-->
          <!--          >保险箱余额提出-->
          <!--          </el-button>-->
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


    <!-- 添加或修改用户信息对话框 Add or Modify User Information dialog-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="500px" style="height: 280px"
               append-to-body>
      <el-form ref="memberRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" minlength="11"
                    @blur="changetPhone(form.phone)"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 禁用备注弹框 remark -->
    <el-dialog
        :close-on-click-modal="false"
        :title="muteRemarkTitle"
        v-model="muteRemark"
        width="400px"
        append-to-body
        :show-close="false"
        :close-on-press-escape="false"
        style="height: 230px;"
    >
      <el-input v-model="id" v-show="false"/>
      <el-input v-model="status" v-show="false"/>
      <el-select
          v-model="remarkText"
          placeholder="请选择禁用原因"
          clearable
          style="min-width: 360px"
          v-if="display"
      >
        <el-option
            v-for="dict in muteRemarkOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
        />
      </el-select>

      <el-input v-model="remarked" placeholder="请输入禁用原因" v-if="remarkText == '其他'" style="padding-top: 20px"/>

      <el-input v-model="googleAuthCode" placeholder="MFA验证" style="padding-top: 15px"/>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelUser()">取消</el-button>
        <el-button type="primary" @click="submitMuteRemark">立即提交</el-button>
      </div>
    </el-dialog>
    <!--    remark ended here -->

    <!--member by ip address and realName start from here-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="memberByIpAddressListOpen"
               width="1200px" append-to-body>
      <el-form :model="queryParamIp" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="会员ip" prop="loginIp" class="input-wd25">
          <el-input
              v-model="queryParamIp.loginIp"
              placeholder="会员ip"
              clearable
              @keyup.enter="handleInputQuery"/>
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName" class="input-wd25">
          <el-input
              v-model="queryParamIp.realName"
              placeholder="真实姓名"
              clearable
              @keyup.enter="handleInputQuery"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search"
                     @click="handleSearchQueryByIp"
                     :disabled='!queryParamIp.loginIp && !queryParamIp.realName'>搜索
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :stripe="true" v-loading="loading" :data="memberByIpAddress" style="margin-bottom: 2px;">
        <el-table-column label="会员ID" align="center" prop="id"/>

        <el-table-column label="昵称" align="center" prop="nickName"/>
        <el-table-column label="状态" min-width="90" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="member_type" :value="scope.row.status"/>
          </template>
        </el-table-column>

        <el-table-column label="登录IP" align="center" prop="loginIp"/>
        <el-table-column label="登录备注" align="center" prop="email"/>
      </el-table>

      <div v-if="paginationShow===true">
        <pagination
            v-show="total"
            :total="total"
            :page-sizes="[10,20,100]"
            v-model:page="queryParamIp.pageNum"
            v-model:limit="queryParamIp.pageSize"
            @pagination="searchMbyIpList"/>
      </div>

      <!--      //** handling close button */-->
      <el-row :gutter="10" class="mb8" style="margin-left: 85%;margin-top: 35px">
        <!--        handling onclick deactivate user status-->
        <el-col :span="8">
          <!--          <el-button type="primary" plain style="height: auto" @click="ipBlockHandler" :disabled='!isActive'>-->
          <!--            封禁-->
          <!--          </el-button>-->
        </el-col>
        <!--click on clock member searched panel  -->
        <el-col :span="1.5">
          <el-button type="primary" plain @click="closeTap()" style="height: auto">
            关闭
          </el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <!--member by ip address END here-->

    <!-- excelPrompt dialog -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="openExcel" width="500px"
               style="padding-bottom: 30px" append-to-body>
      <el-form ref="queryExcelForm" :inline="true" label-width="68px">
        <el-form-item label="选择日期" prop="selectDate">
          <el-date-picker type="datetimerange"
                          v-model="queryParams.selectDate"
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
      <div slot="footer" class="dialog-footer" style="margin-top: -25px">
        <el-button type="primary" @click="submitExcelForm">确 定
        </el-button>
        <el-button @click="openExcel=!openExcel">取 消</el-button>
      </div>
    </el-dialog>
    <MobileLimit ref="mobileLimit"/>
    <personal-record-table ref="personalRecord"/>
    <more ref="memberMore"/>
  </div>
</template>

<script setup name="MemberInfo">

import {useDict} from "@/utils/dict";
import {
  listMemberInfo, changeStatusBan, ipBan, addMemberInfo,
  listCountApi, requestBoxDish, getMemberInfo, exportMemberInfo, changeWithdrawStatus
} from "@/api/member/memberInfo";
import More from './more'
import MobileLimit from "@/views/member/memberInfo/mobileLimit";
import PersonalRecordTable from './personalRecordTable'

const router = useRouter();
const {proxy} = getCurrentInstance();

const {
  member_type,
  member_device_type,
  muteRemarkOptions
} = useDict("member_type", "member_device_type", "muteRemarkOptions");


const statusOptions = ref([]);
const ids = ref([]);
const memberInfoList = ref([]);
const memberByIpAddress = ref([]);
/** 状态列表0= 禁用 1=正常 2=测试号3=超管号 status 0=disabled 1=normal 2=test  3= superpipe */
const typeList = ref([]);

const totalLoading = ref(false);
/** 遮罩层 loading */
const loading = ref(false);
/** 非单个禁用 */
const single = ref(true);
/** 非多个禁用 */
const multiple = ref(true);
/** 显示搜索条件 */
const showSearch = ref(true);
const muteRemark = ref(false);
const muteRemarkTitle = ref('');
const memberByIpAddressListOpen = ref(false);
const paginationShow = ref(false);
const isActive = ref(false);

/** 是否显示弹出层 */
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
const remarkText = ref('');
const remarked = ref('');
const loginIp = ref('');
/** 弹出层标题 */
const title = ref('');
const total = ref(0);


const data = reactive({

  /**  统计总的数据 total statistics */
  totalData: {
    peopledTotal: 0,
    totalMoney: 0,
    safeBalanceTotalMoney: 0
  },

  fromMuteRemark: {},
  fromMuteRemarkSpeak: {},

  /**  查询参数 query parameters */
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    email: '',
    account: '',
    searchValue: '', //会员Id,手机号*/
    status: '',
    registerIp: '',
    loginIp: '',
    nickName: '',
    inviterCode: '',
    channelcode: '',
    loginDevice:'',
    downLoadDate: [],
    withdrawStatus: null,
    selectDate: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
    orderByColumn: 'register_time',
    isAsc: 'desc',
  },

  dateRange: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],

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
    searchValue: '', /** 会员Id,账号,手机号 */
    status: '',
    loginIp: '',
    userName: '',
    nickName: '',
    realName: '',
    orderByColumn: 'register_time',
    isAsc: 'desc'
  },
  form: {},
  rules: {},

});

const {
  totalData, dateRange, queryParams, queryParamIp, queryParamsByIp,
  form, rules
} = toRefs(data);


/**  复制 copy */
function copy1() {
  copyCommand(totalData.value.peopledTotal)
}

function copy2() {
  copyCommand(totalData.value.totalMoney)
}

function copy3() {
  copyCommand(totalData.value.safeBalanceTotalMoney)
}

/**  统计 count */
function listCount() {
  totalLoading.value = true
  listCountApi(queryParams.value).then((response) => {
    totalData.value = response
  }).finally(() => {
    totalLoading.value = false
  })
}

/**  copyCommand */
function copyCommand(value) {
  let inputElement = document.createElement('input')
  inputElement.value = value
  document.body.appendChild(inputElement)
  inputElement.select() //选中文本
  document.execCommand('copy') //执行浏览器复制命令
  inputElement.remove()
  proxy.$modal.msgSuccess('复制成功')
}

/** get member info list */
function getList() {
  loading.value = true
  listMemberInfo(queryParams.value).then(response => {
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
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

/**
 * 导出会员提现信息列表 export form
 */
function openExport() {
  openExcel.value = true
}

/** 导出按钮操作 */
function handleExport(date) {
  const queryParams = this.queryParams
  queryParams.params = []
  queryParams.downLoadDate = date
  proxy.$modal.confirm('是否确认导出所有会员列表数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    const exportMemberInfoList = exportMemberInfo(queryParams);
    queryParams.downLoadDate = null
    if (exportMemberInfoList == null) {
      proxy.$modal.msgError("没有数据")
    }
    return exportMemberInfoList
  }).then(response => {
    proxy.downloadExcel(response, '会员列表')
  })
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
        return exportMemberInfo(proxy.addDateRange(queryParams.value, dateRange.value))
      }).then(response => {
        openExcel.value = false
        proxy.downloadExcel(response, '支付信息日志')
      })
    } else {
      proxy.$notify.warning("所选时间不能大于七天")
    }
  }
}

// function openIpBlackList() {
// }

function memberListAccordingToIp() {
  memberByIpAddressListOpen.value = true
  title.value = '查看会员'
}

function mobileLimitFun() {
  proxy.$refs["mobileLimit"].show()
}

/** handling search function */
function handleInputQuery() {
  if (queryParamsByIp.userIp || queryParams.realName) {
    const reg = '^[0-9a-zA-Z_]{1,}$'
    let userIp = queryParamsByIp.userIp.match(reg)
    let realName = queryParams.realName.match(reg)
    if (!userIp || !realName) {
      proxy.$modal.msgError("用户名或ip不正确！")
      return
    }
  }
  queryParamsByIp.pageNum = 1
  getSearchList()
}

/** Query user information list */
function getSearchList() {
  loading.value = true
  listMemberInfo(proxy.addDateRange(queryParamsByIp.value, dateRange.value)).then(response => {
    memberByIpAddress.value = response.data
    total.value = response.total
    if (memberByIpAddress.value.length >= 10) {
      paginationShow.value = true;
    }
    if (memberByIpAddress.value.length > 0) {
      isActive.value = true;
    }
    loading.value = false
  })
}

/** handle search query By Ip Address */
function handleSearchQueryByIp() {
  queryParamIp.pageNum = 1
  searchMbyIpList()
}

/** Search Member By Ip Address */
function searchMbyIpList() {
  listMemberInfo(queryParamIp.value, realName.value).then(response => {
    memberByIpAddress.value = response.data
    total.value = response.total
    if (memberByIpAddress.length >= 10) {
      paginationShow.value = true;
    }
    if (memberByIpAddress.length > 0) {
      isActive.value = true;
    }
    loading.value = false
  })
}

/** start on click ip status to set 0 panel from here */
function ipBlockHandler() {
  /** set Member Status 0, By Ip Address Query Handler*/
  ipBan({loginIp: queryParamIp.loginIp, realName: queryParamIp.realName}).then((res) => {
    if (res.code === 0 || res.code > 200) {
      proxy.$modal.msgError('状态修改失败')
    }
    proxy.$modal.msgSuccess('状态设置0成功')

  }).catch(() => {
    proxy.$modal.msgError('网络异常error')
  }).finally(() => {
    searchMbyIpList()
  })
}

/**click to handle clear data from dialog 'only from front end' */
function closeTap() {
  paginationShow.value = false;

  if (memberByIpAddressListOpen.value === true) {
    memberByIpAddressListOpen.value = false;
    isActive.value = false;
    loading.value = false

    if (queryParamIp.loginIp !== null) {
      queryParamIp.loginIp = "";
    }

    if (queryParamIp.realName !== null) {
      queryParamIp.realName = ""
    }

    if (memberByIpAddress.value !== null) {
      memberByIpAddress.value = null;
    }

    if (queryParamIp.pageNum !== null) {
      queryParamIp.pageNum = null
    }
  }
}


/**  多选框选中数据 Multi-select box select data */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}


/** 更多按钮操作 handle more*/
function handleMore(row) {
  proxy.$refs["memberMore"].show(row.id, row.vip, row.nickName, row.phone, row.email)
}

/** Safe deposit box balance transfer out */
function boxDish(row) {
  proxy.$prompt('MFA验证', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[0-9]{1,10}$/,
    inputErrorMessage: '验证码格式不正确,0-10数字,请重新输入',
  }).then(({value}) => {
    requestBoxDish(row.id, {googleAuthCode: value}).then((res) => {
      if (res.code == 200) {
        proxy.$modal.msgSuccess('保险箱余额提出成功')
        getList()
      } else {
        proxy.$modal.msgError('保险箱余额提出失败')
      }
    })
  }).catch(() => {
    proxy.$message({
      type: 'info',
      message: '取消输入'
    })
  })
}

/**  修改用户状态 Modify user status */
function changeType(row) {
  /**  打开备注禁用弹框 Open the Note Disable popup */
  muteRemark.value = true
  display.value = false
  id.value = row.id
  status.value = row.status
  googleAuthCode.value = null;
  if (row.status === 0) {
    muteRemarkTitle.value = '修改用户状态'
  } else {
    muteRemarkTitle.value = '修改状态'
  }
}

/**  禁用备注提交 Disable note submission */
function submitMuteRemark(row) {
  if (remarked.value !== "") {
    remarkText.value = remarked.value;
  }
  changeStatusBan(id.value, status.value, remarkText.value, googleAuthCode.value).then((res) => {
    if (res.code == 200) {
      proxy.$modal.msgSuccess('状态修改成功')
      muteRemark.value = false
    } else {
      proxy.$modal.msgError('状态修改失败')
    }
  }).catch(() => {
    proxy.$modal.msgError('网络异常')
  })

}

function cancelUser() {
  muteRemark.value = false
  getList();
}


/** 新增按钮操作 Add button action*/
function handleAdd() {
  open.value = true
  title.value = '添加测试用户信息'
}

/** Add input phone number*/
function changetPhone(phone) {
  if (phone) {
    form.value.password = phone.substring(5, 11)
    proxy.$forceUpdate()
  }
}

/** 提交按钮 submit add button*/
function submitForm() {
  proxy.$refs['memberRef'].validate(valid => {
    if (valid) {
      addMemberInfo(form.value).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        open.value = false
        getList()
      })
    }
  })
}


/**  取消按钮 cancel */
function cancel() {
  open.value = false
}

/** click  on copy to copy the id */
function handleCopy(id) {
  copy(id)
}

function copy(data) {
  let value = document.createElement('textarea')
  value.value = data
  document.body.appendChild(value)
  value.select()   //select coming value;
  document.execCommand('Copy') // Execute the browser copy command
  proxy.$message({
    message: data + ' 复制成功',
    type: 'success'
  })
  value.remove()
}


/** getting show(id) method from memberInfo */
function personalReport(getMemberId) {
  getMemberInfo(getMemberId).then(res => {
    title.value = res.data.nickName + " - 个人报表";
    proxy.$refs["personalRecord"].show(getMemberId, title.value);
  })
}

function withdrawStatusChange(row) {
  console.log(row)
  let text = row.withdrawStatus === '1' ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.nickName + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return changeWithdrawStatus(row.id, row.withdrawStatus)
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.withdrawStatus = row.withdrawStatus === '0' ? '1' : '0'
  })
}

function maskedEmailRow(row) {
  return maskValue(row.email);
}

function maskValue( email ) {
  if (email == null || email.length <= 2) {
    return email;
  }
  const parts = email.split('@');
  const maskedLocalPart = parts[0].substring(0, Math.max(0, parts[0].length - 4)) + '****';
  return  maskedLocalPart + '@' + parts[1];
}

/** Personal report end here 个人报告到此结束*/

getList()
</script>

<style scoped>
.dialog-footer {
  float: right;
  padding-top: 35px;
}

table, th, td {
  border: 2px solid rgba(0, 0, 0, 0.10);
  border-collapse: collapse;
}

td {
  height: 40px;
  text-align: center;
}

.bold {
  font-weight: bold;
}
</style>
