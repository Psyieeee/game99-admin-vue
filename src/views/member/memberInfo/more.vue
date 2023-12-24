<template>
  <div>
    <!-- 导入表 -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="visible" width="1365px" top="5vh" append-to-body>

      <!--顶部按钮 tab menu-->
      <div class="page-tab" style="margin-bottom: 20px">
        <button type="button" class="el-button el-button--primary el-button--small is-plain" @click="change(3,'加分')">
          <span>加分</span></button>
        <button type="button" class="el-button el-button--primary el-button--small is-plain"
                @click="change(1,'三方游戏')">
          <span>三方游戏</span></button>
        <button type="button" class="el-button el-button--primary el-button--small is-plain"
                @click="change(5,'银行卡')">
          <span>银行卡</span></button>
        <button type="button" class="el-button el-button--primary el-button--small is-plain"
                @click="change(10,'发送短信')">
          <span>发送短信</span></button>
        <button type="button" class="el-button el-button--primary el-button--small is-plain"
                @click="change(4,'重置密码')">
          <span>重置密码</span></button>
        <button type="button" class="el-button el-button--primary el-button--small is-plain"
                @click="change(11,'重置手机号')">
          <span>重置手机号</span></button>
        <button type="button" class="el-button el-button--primary el-button--small is-plain"
                @click="change(13,'重置邀请码')">
          <span>重置邀请码</span></button>

        <button type="button" class="el-button el-button--success el-button--small is-plain"
                @click="change(2,'资金明细')">
          <span>资金明细</span>
        </button>

        <button
            type="button"
            class="el-button el-button--success el-button--small is-plain"
            @click="change(6,'重置保险箱')">
          <span>重置保险箱</span>
        </button>

        <button
            type="button"
            class="el-button el-button--success el-button--small is-plain"
            @click="change(7,'重置提现')">
          <span>重置提现</span>
        </button>

        <button
            type="button"
            class="el-button el-button--success el-button--small is-plain"
            @click="change(8,'打码修复')">
          <span>打码修复</span>
        </button>

        <button type="button" class="el-button el-button--success el-button--small is-plain"
                @click="change(9,'修改Vip')">
          <span>修改Vip</span>
        </button>


        <button type="button" class="el-button el-button--success el-button--small is-plain"
                @click="change(15,'域名展示')">
          <span>域名展示</span>
        </button>
      </div>

      <!--积分明细-->
      <el-row v-if="index===1">
        <el-table @row-click="clickRow" ref="table" :data="dbTableList" style="margin-bottom: 50px" height="460px"
                  v-loading="loading">
          <el-table-column prop="platformName" label="游戏名称" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="money" label="金额" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="createTime" label="操作">
            <template v-slot="{row}" v-if="index===1">
              <el-button @click="gameEscs(row)">下分</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <el-row v-if="index===3" style="padding-bottom: 30px">
        <el-form ref="addPointForm" :model="form" :rules="rules" label-width="110px" style="width: 100%;">
          <el-form-item label="加分金额" prop="score">
            <el-input v-model="form.score" type="number" placeholder="请输入金额"/>
          </el-form-item>
          <el-form-item label="入款类型" prop="moneydes">
            <el-select v-model="form.moneydes" placeholder="入款类型" clearable>
              <el-option
                  v-for="item in moneydesOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="支付备注" prop="remarkPay">
            <el-input v-model="form.remarkPay" placeholder="请输入支付备注"/>
          </el-form-item>
          <el-form-item label="加分备注" prop="mk">
            <el-input v-model="form.mk" placeholder="请备注具体加分入金原因"/>
          </el-form-item>
          <el-form-item label="订单备注" prop="ordermk">
            <el-input v-model="form.ordermk" placeholder="补单请填写补单订单号，末开奖补回请填写开期号，无则填写为0"/>
          </el-form-item>
          <el-form-item label="待打码金额" prop="betMoney">
            <el-input v-model="form.betMoney" type="number" placeholder="还需打码金额"
                      @blur="codeMoney(form.betMoney,form.score)"/>
          </el-form-item>
          <el-form-item label="打码倍数" prop="beatNum">
            <el-input v-model="form.beatNum" type="number"
                      placeholder="请按顺序先输入加分金额，再输入待打码金额，系统会自动计算打码倍数。默认请填写1,如未打算打码可填写为0"/>
          </el-form-item>
          <el-form-item label="谷歌验证码" prop="googleAuthCode">
            <el-input v-model="form.googleAuthCode" placeholder="请输入谷歌验证码"/>
          </el-form-item>
        </el-form>
      </el-row>

      <!--重置密码-->
      <el-row v-if="index===4">
        <el-form ref="passwordResetRef" :model="form" :rules="rules" label-width="110px" style="width: 60%;">
          <el-form-item label="重置密码" prop="password">
            <el-input v-model="form.password" placeholder="请输入新密码"/>
          </el-form-item>
          <el-form-item label="google验证码" prop="googleAuthCode">
            <el-input v-model="form.googleAuthCode" placeholder="请输入google验证码"/>
          </el-form-item>
        </el-form>
      </el-row>

      <!--银行卡-->
      <el-row v-if="index===5">
        <el-table
            @row-click="clickRow"
            ref="table"
            :data="dbTableList"
            @selection-change="handleSelectionChange"
            height="460px"
            style="margin-bottom: 40px"
            v-loading="loading">
          <el-table-column align="center" prop="realName" label="真实姓名" :show-overflow-tooltip="true"
                           min-width="120">
            <template v-slot="{row}" v-if="index===5">
              <el-input v-model="row.realName"></el-input>
            </template>
          </el-table-column>

          <el-table-column align="center" prop="bankId" label="银行类型" :show-overflow-tooltip="true" min-width="135">
            <template v-slot="{row}" v-if="index===5">
              <el-select filterable
                         v-model="row.bankId">
                <el-option v-for="dict in bankListOptions"
                           :key="dict.id"
                           :label="dict.bankName"
                           :value="dict.id"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="bankAccount" label="银行卡号" :show-overflow-tooltip="true" min-width="150"
                           align="center">
            <template v-slot="{row}" v-if="index===5">
              <el-input v-model="row.bankAccount"></el-input>
              <el-input type="hidden" v-model="row.oldBankAccount"></el-input>
              <el-input type="hidden" v-model="row.oldBankId"></el-input>
              <el-input type="hidden" v-model="row.oldRealName"></el-input>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="bankAddress" label="银行地址" :show-overflow-tooltip="true"
                           min-width="140">
            <template v-slot="{row}" v-if="index===5">
              <el-input v-model="row.bankAddress"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label=" 绑定时间" :show-overflow-tooltip="true" min-width="110"
                           align="center"></el-table-column>
          <el-table-column label="操作" min-width="140" align="center">
            <template v-slot="{row}" v-if="index===5">
              <el-button
                  @click="unbind(row)"
                  v-show="row.dv==1"
                  type="primary"
                  link
                  disabled
                  size="small"
                  style="margin-left: 12px"
                  v-has-permi="['member:memberInfo:unbindCard']"
              >主卡解绑
              </el-button>
              <el-button
                  @click="unbind(row)"
                  v-show="row.dv==0"
                  type="primary"
                  link
                  size="small"
                  v-has-permi="['member:memberInfo:unbindCard']"
              >副卡解绑
              </el-button>
              <el-button
                  @click="changeBank(row)"
                  size="small"
                  type="warning"
                  link
                  style="margin-left: 3px"
                  v-has-permi="['member:memberInfo:changeBank']"
              >确认修改
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
      </el-row>

      <!--发送短信-->
      <el-row v-if="index===10">
        <el-form label-width="110px">
          <el-form-item label="短信信息">
            <el-select
                filterable
                v-model="data.msg"
                placeholder="请选择发送的信息"
                clearable
                style="width: 240px">
              <el-option
                  v-for="dict in member_msg "
                  :key="dict.value"
                  :value="dict.value"
                  :label="dict.label"/>
            </el-select>
          </el-form-item>
        </el-form>
      </el-row>


      <!--重置手机号 update phone number-->
      <el-row v-if="index===11">
        <el-form ref="mobileFormRef" label-width="110px" :model="mobileForm" :rules="mobileRules">
          <el-form-item label="旧手机号" prop="phone">
            <el-input v-model="mobileForm.phone" placeholder="请输入旧手机号" readonly class="mr10"
                      style="float: left;width:500px"/>
            <el-button type="primary" @click="fullMobile()" v-has-permi="['member:memberInfo:fullMobile']">查看完整手机号
            </el-button>
          </el-form-item>
          <el-form-item label="新手机号" prop="newMobile">
            <el-input v-model="mobileForm.newMobile" placeholder="请输入新手机号"/>
          </el-form-item>
          <el-form-item label="google验证码" prop="googleAuthCode">
            <el-input v-model="mobileForm.googleAuthCode" placeholder="请输入google验证码"/>
          </el-form-item>
        </el-form>
      </el-row>

      <!--重置邀请码 reset invitation code -->
      <el-row v-if="index===13">
        <el-form ref="formInviterCode" :model="form" :rules="inviterCodeRules" label-width="110px">
          <el-form-item label="重置邀请码" prop="inviterCode">
            <el-input v-model="form.inviterCode" placeholder="请输入邀请码"/>
          </el-form-item>
          <el-form-item label="google验证码" prop="googleAuthCode">
            <el-input v-model="form.googleAuthCode" placeholder="请输入google验证码"/>
          </el-form-item>
        </el-form>
      </el-row>


      <!--域名展示-->
      <el-row v-if="index===15">
        <el-form label-width="110px">
          <el-form-item label="登录域名">
            {{ registerDomain }}
          </el-form-item>
          <el-form-item label="注册域名">
            {{ LoginDomain }}
          </el-form-item>
        </el-form>
      </el-row>

      <!-- 修改vip等级 display vip-->
      <el-dialog
          :close-on-click-modal="false"
          title="修改vip等级和昵称"
          v-model="showVip"
          width="400px"
          append-to-body
          :show-close="false"
          :close-on-press-escape="false" style="padding-bottom: 30px">Vip等级
        <el-input v-model="vip"/>
        <div slot="footer" class="dialog-footer" style="margin-top: 15px">
          <el-button @click="showVip = !showVip">取消</el-button>
          <el-button
              type="primary"
              :disabled="showVipDisabled"
              @click="updateVip"
          >立即提交
          </el-button>
        </div>
      </el-dialog>


      <!-- footer slots adding to all models -->
      <template #footer>
        <el-button
            type="primary"
            @click="handlePassword"
            v-show="index === 4"
        >确 定
        </el-button>
        <el-button
            type="primary" @click="updateMobile()"
            v-show="index ===11">
          确 定
        </el-button>

        <el-button
            type="primary"
            @click="handleImportTable"
            v-show="index === 3"
        >确 定
        </el-button>

        <el-button
            type="primary"
            @click="sendMsg()"
            v-show="index ===10">
          确 定
        </el-button>

        <el-button
            type="primary"
            v-show="index===13"
            @click="updateInviterCode()">
          确 定
        </el-button>

        <el-button @click="visible = false">取 消</el-button>
      </template>
      <!--  end footer slots for all dialog models-->

      <TableShow ref="tableShow"/>
    </el-dialog>
  </div>
</template>

<script setup name="More">
import {reactive, ref, toRefs} from "vue";
import {gameBalance, gameEsc} from "@/api/game/base";
import {
  addScore,
  cardListData,
  changeBankData,
  fullMobileData,
  getMemberInfo,
  memberBcodeRepair,
  memberResetPassword,
  resetBoxPasswd,
  resetPassword,
  resetWithdrawal,
  sendMsgs,
  unbindCard,
  updateInvitationCode,
  updateMobileData,
  updateVipData
} from "@/api/member/memberInfo";
import {memberWithdrawDetailReportById, memberWithdrawDetailReportList} from "@/api/pay/memberWithdrawDetail";
import {validMobile, validNumber} from "@/utils/validate";
import TableShow from "@/views/member/memberInfo/tableShow";
import {listConfigBankListAll} from "@/api/pay/configBankList";

const {proxy} = getCurrentInstance();

const index = ref(3);
const memberId = ref(null);
const registerDomain = ref(null);
const LoginDomain = ref(null);
const title = ref('加分');
const vip = ref(1);
const oldVip = ref(1);
const nickName = ref('');
const visible = ref(false);
const loading = ref(false);
const showVip = ref(false);
const showVipDisabled = ref(false);
const total = ref(0);
const dbTableList = ref([]);
const tables = ref([]);
const bankListOptions = ref([]);

const data = reactive({
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10000,
    tableName: undefined,
    tableComment: undefined
  },
  msg: '',
  mobileForm: {
    phone: ''
  },
  form: {
    beatNum: 0,
    googleAuthCode: null,
    id: null,
    mk: null,
    moneydes: null,
    ordermk: null,
    remarkPay: null,
    score: null,
    betMoney: null
  },
  //入款类型
  moneydesOptions: [{
    value: '1',
    label: '人工入款'
  }, {
    value: '2',
    label: '线上入款'
  }, {
    value: '3',
    label: '线下入款'
  }],

  /** 手机号校验规则 */
  mobileRules: {
    oldMobile: [
      {required: true, message: '旧手机号码不能为空', trigger: 'blur'},
      {max: 100, message: "旧手机号码长度不能超过11位"},
      {validator: validMobile, trigger: "blur"}
    ],
    newMobile: [
      {required: true, message: '新手机号码不能为空', trigger: 'blur'},
      {max: 11, message: "新手机号码长度不能超过11位"},
      {min: 11, message: "新手机号码长度不能超过11位"},
      {validator: validMobile, trigger: "blur"}
    ],
    googleAuthCode: [
      {required: true, message: '谷歌验证码不能为空', trigger: 'blur'},
      {validator: validNumber, trigger: "blur"}
    ]
  },
  inviterCodeRules: {},
  /**  加分表单校验 */
  rules: {
    password: [
      {required: true, message: '重置密码不能为空', trigger: 'blur'},
      {max: 30, message: "重置密码长度不能超过30个字符"}
    ],
    score: [
      {required: true, message: '加分金额不能为空', trigger: 'blur'}
    ],
    moneydes: [
      {required: true, message: '入款备注不能为空', trigger: 'blur'}
    ],
    mk: [
      {required: true, message: '备注信息不能为空', trigger: 'blur'}, {max: 200, message: "备注信息长度不能超过200位"}
    ],
    ordermk: [
      {required: true, message: '订单备注不能为空', trigger: 'blur'}, {max: 200, message: "备注信息长度不能超过200位"}
    ],
    googleAuthCode: [
      {required: true, message: 'google验证码不能为空', trigger: 'blur'},
      {validator: validNumber, trigger: "blur"}
    ],

  }
});

const {
  mobileForm, form, rules, moneydesOptions, queryParams, mobileRules, inviterCodeRules
} = toRefs(data);

const {member_msg} = proxy.useDict("member_msg")

function show(memberId_, vip_, nickName_, phone_) {
  visible.value = true
  memberId.value = memberId_
  mobileForm.value.phone = phone_
  vip.value = vip_
  oldVip.value = vip_
  nickName.value = nickName_
  getList()
}

/** list according to index value */
function getList() {
  switch (index.value) {
    case 1:
      getGameBalance()
      break
    case 2:
      memberWithdrawDetailsReportList()
      break
    case 5:
      cardList()
      break
    case 15:
      memberInfoFun()
      break
  }
}

/** 切换页面 click change tab  */
function change(index_, title_) {
  index.value = index_
  title.value = title_
  reset()
  let hint = '';
  /** 如果是重置密码,保险箱,体现 switch according to index */
  switch (index.value) {
    case 6 :
      hint = '提示?'
      open(hint, 1)
      break
    case 7 :
      hint = '提示'
      open(hint, 2)
      break
    case 8 :
      hint = '请输入您的谷歌验证码'
      open(hint, 3)
      break
    case 9 :
      hint = '请输入Vip等级'
      open(hint, 4)
      break
    case 2 :
      hint = '资金明细'
      funds();
      break
  }
  //其他的就是获取列表
  getList()
}

/** reset */
function reset() {
  total.value = 0
  dbTableList.value = []
}

/**  打开提示框 open prompt box*/
function open(hint, type) {
  if (type === 1) {
    proxy.$modal.confirm(hint, '输入您的谷歌验证码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      proxy.$modal.prompt(hint, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9]{1,10}$/,
        inputErrorMessage: '验证码格式不正确,0-10数字,请重新输入',
      }).then(({value}) => {
        resetBoxPasswd(memberId.value, {googleAuthCode: value}).then((res) => {
          if (res.code === 200) {
            proxy.$modal.msgSuccess('重置保险箱成功')
          } else {
            proxy.$modal.msgError('重置保险箱失败')
          }
        })
      })
    }).catch(() => {
      proxy.$modal.msg({
        type: 'info',
        message: '已取消'
      })
    })
  } else if (type == 2) {
    proxy.$modal.prompt(hint, '请输入您的谷歌验证码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[0-9]{1,10}$/,
      inputErrorMessage: '验证码格式不正确,0-10数字,请重新输入',
    }).then(({value}) => {
      resetWithdrawal(memberId.value, {googleAuthCode: value}).then((res) => {
        if (res.code === 200) {
          proxy.$modal.msgSuccess('重置提现成功')
        } else {
          proxy.$modal.msgError('重置提现失败')
        }
      })
    }).catch(() => {
      proxy.$modal.msg({
        type: 'info',
        message: '取消输入'
      })
    })
  } else if (type == 3) {
    proxy.$prompt(hint, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[0-9]{1,10}$/,
      inputErrorMessage: '验证码格式不正确,0-10数字,请重新输入',
    }).then(({value}) => {
      memberBcodeRepair(memberId.value, {googleAuthCode: value}).then((res) => {
        if (res.code === 200) {
          proxy.$modal.msgSuccess('修复打码数据成功')
        } else {
          proxy.$modal.msgError('修复打码数据失败')
        }
      })
    }).catch(() => {
      proxy.$modal.msg({
        type: 'info',
        message: '取消输入'
      })
    })
  } else if (type == 4) {
    showVip.value = !showVip.value
  }
}

/** fund details */
function funds() {
  memberWithdrawDetailReportById(memberId.value).then((res) => {
    proxy.$refs["tableShow"].show(res.data);
  })
}


/** 获取详细信息 */
function memberInfoFun() {
  loading.value = true
  getMemberInfo(memberId.value).then((res) => {
        if (res.code === 200) {
          if (res.data.linkUrl !== null) {
            dbTableList.value = res.data.linkUrl.split(",")
            registerDomain.value = dbTableList[0]
            LoginDomain.value = dbTableList[1]
            loading.value = false
          }
        }
      }
  )
}

/** 获取积分列表 check game balance*/
function getGameBalance() {
  dbTableList.value = []
  loading.value = true
  gameBalance(memberId.value).then((res) => {
        if (res.code === 200) {
          dbTableList.value = res.data
          loading.value = false
        }
      }
  ).catch(() => {
    proxy.$message({
      type: 'warning',
      message: '获取三方游戏列表失败'
    })
    loading.value = false
  })
}

/** withdraw log */
function memberWithdrawDetailsReportList() {
  dbTableList.value = []
  loading.value = true
  memberWithdrawDetailReportList().then((res) => {
    if (res.code === 200) {
      dbTableList.value = res.data
      total.value = res.count
      loading.value = false
    }
  }).catch(() => {
    proxy.$modal.msgWarning('获取资金明细列表失败')
    loading.value = false
  })
}

/** 重置密码提交接口 */
function resetPasswords() {
  memberResetPassword(memberId.value, form.value.password, form.value.googleAuthCode).then((res) => {
    if (res.code === 200) {
      proxy.resetForm('form')
      visible.value = false
      proxy.$modal.msgSuccess(res.msg)
      proxy.$emit('refMemeberData')
    }
  }).catch((error) => {
    proxy.$modal.msgError(error)
  }).finally(() => {
    loading.value = false
  })
}

/** 重置密码操作 handle reset password*/
function handlePassword() {
  proxy.$refs['passwordResetRef'].validate(valid => {
    if (valid) {
      resetPasswords()
    }
  })
}


/** 导入按钮操作 */
function handleImportTable() {
  proxy.$refs['addPointForm'].validate(valid => {
    if (valid) {
      addScores()
    }
  })
}

/**  加分提交接口 */
function addScores() {
  loading.value = true
  addScore({
    beatNum: form.value.beatNum,
    googleAuthCode: form.value.googleAuthCode,
    id: memberId.value,
    mk: form.value.mk,
    moneydes: form.value.moneydes,
    remarkPay: form.value.remarkPay,
    ordermk: form.value.ordermk,
    score: form.value.score
  }).then((res) => {
    if (res.code === 200) {
      proxy.resetForm('addPointForm')
      visible.value = false
      proxy.$modal.msgSuccess(res.msg)
      proxy.$emit('refMemeberData')
    } else {
      proxy.$modal.msgWarning(res.msg)
    }
  }).finally(() => {
    visible.value = false
    loading.value = false
  })
}

function clickRow(row) {
  proxy.$refs.table.toggleRowSelection(row)
}

function gameEscs(row) {
  loading.value = true
  gameEsc(row.platformId, memberId.value).then((res) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess('下分成功')
      gameBalance(memberId.value)
    } else {
      proxy.$modal.msgError(res.msg)
    }
  }).finally(() => {
    loading.value = false
  })
}

/**  多选框选中数据 */
function handleSelectionChange(selection) {
  tables.value = selection.map(item => item.tableName)
}

/** 银行卡列表接口 */
function cardList() {
  dbTableList.value = []
  loading.value = true
  cardListData({
    memberId: memberId.value,
    pageNum: 1,
    pageSize: 10,
  }).then((res) => {
    if (res.code === 200) {
      dbTableList.value = res.data
      total.value = res.count
      loading.value = false
    }
  }).catch((error) => {
    proxy.$modal.msgWarning('获取银行卡列表失败')
    loading.value = false
  })
  listConfigBankListAll().then(response => {
    bankListOptions.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

/** get full number */
function updateMobile() {
  proxy.$refs['mobileFormRef'].validate(valid => {
    if (valid) {
      // mobileForm.memberId = memberId.value
      // mobileForm.newMobile = newMobile.value
      // mobileForm.googleAuthCode = googleAuthCode.value;
      updateMobileData(memberId.value,mobileForm.value.phone, mobileForm.value.newMobile, mobileForm.value.googleAuthCode).then((res) => {
        proxy.$modal.msgSuccess('手机号修改成功')
        visible.value = false
        proxy.$emit('refMemeberData')
      })
    }
  })
}

/** get full number */
function fullMobile() {
  fullMobileData(memberId.value).then((res) => {
    mobileForm.value = res.data
    if (!mobileForm.value.phone) {
      proxy.$modal.msgError('手机号码不可用')
    } else {
      proxy.$modal.msgSuccess('完整手机号码已展示')
    }
  })
}

/** update vip */
function updateVip() {
  if (vip.value > 50) {
    proxy.$modal.msgError("vip等级最大为50级")
  } else if (vip.value < oldVip.value) {
    proxy.$modal.msgError("vip等级修改不能小于之前的等级")
  } else {
    updateVipData(memberId.value, vip.value).then((res) => {
      if (res.code === 200) {
        oldVip.value = vip.value
        proxy.$modal.msgSuccess("操作成功")
        showVip.value = false
        proxy.$emit('refMemeberData')
      } else if (res.code === 1) {
        proxy.$modal.msgError(res.data)
      } else {
        proxy.$modal.msgError('vip等级修改失败')
      }
    })
  }
}

/** update invitation code */
function updateInviterCode() {
  proxy.$refs['formInviterCode'].validate(valid => {
    if (valid) {
      updateInvitationCode(memberId.value, form.value.inviterCode, form.value.googleAuthCode).then((res) => {
        proxy.$modal.msgSuccess('邀请码修改成功')
        visible.value = false
        proxy.$emit('refMemeberData')
      })
    }
  })
}
function sendMsg() {
  sendMsgs(data.msg, memberId.value).then((res) => {
  if (res.code === 0) {
    proxy.resetForm('form')
    visible.value = false
    proxy.$notify.success('发送短信成功')
    proxy.$emit('refMemeberData')
  }
  }).catch((err) => {
    proxy.$notify.error(error)
  }).finally(() => {
    loading.value = false
  })
}

function unbind(row) {
  loading.value = true
  const id = row.id
  const memberId = row.memberId
  unbindCard(id, memberId).then((res) => {
    proxy.$modal.msgSuccess(res.msg)
    cardList()
  }).finally(() => {
    loading.value = false
  })
}

function changeBank(row) {
  proxy.$modal.confirm('是否修改银行卡信息?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    changeBankData(row).then((res) => {
      proxy.$modal.msgSuccess(res.msg)
      cardList()
    }).finally(() => {
      loading.value = false
    })
  }).catch(() => {
    proxy.$modal.msg({
      type: 'info',
      message: '已取消'
    })
  })
}


/** 计算打码倍数 */
function codeMoney(betMoney, score) {
  if (betMoney != "" && betMoney != null) {
    form.value.beatNum = (betMoney / score).toFixed(2);
  }
}

defineExpose({
  show
});
</script>

<style scoped>

</style>