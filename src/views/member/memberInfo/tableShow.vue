<template>
  <el-dialog :close-on-click-modal="false" title="资金明细" v-model="open" width="800px" append-to-body>
    <div class="memberInfo">
      <div class="title">会员基本信息</div>
      <div class="mount" style="width: 12%">
        <div class="font">会员Id</div>
        <div class="font">注册时间</div>
        <!--        <div class="font">电话号码</div>-->
        <div class="font">用户类型</div>
        <div class="font">会员打码</div>
        <div class="font">会员IP</div>
      </div>
      <div class="mount" style="width: 28%">
        <div class="font">{{ dataInfo.会员编号}}</div>
        <div class="font">{{ dataInfo.会员注册时间 }}</div>
        <div class="font">{{ dataInfo.用户类型 }}</div>
        <div class="font">{{ dataInfo.会员打码 }}</div>
        <div class="font">{{ dataInfo.登陆IP }}</div>
      </div>
      <div class="mount" style="width: 12%">
        <div class="font">当前余额</div>
        <div class="font">登录时间</div>
        <div class="font">VIP等级</div>
        <div class="font">会员注单</div>
        <div class="font">登录地址</div>
      </div>
      <div class="mount" style="width: 28%">
        <div class="font">{{ dataInfo.会员积分 }}</div>
        <div class="font">{{ dataInfo.登录时间 }}</div>
        <div class="font">{{ dataInfo.会员VIP }}</div>

        <div style="display: flex;justify-content: flex-start;">
          <div class="mount" style="width: 60%">
            <div class="font">{{ dataInfo.会员注单 }}</div>
          </div>
          <div class="mount" style="width: 40%">
            <el-button type="primary"
                       plain
                       @click="showForm( dataInfo['会员编号'] )"
                       v-hasPermi="['member:memberInfo:editCode']"
                       style="height: 40px" >
                修改
                </el-button>
            <el-dialog :close-on-click-modal="false" v-model="showUpdateForm" width="250px" append-to-body>
              <el-input placeholder="请输入会员打码" v-model="inputValue"></el-input>
              <el-button @click="showUpdateForm = false" style="margin-top: 10px;margin-left: 70px">取 消</el-button>
              <el-button type="primary" @click="updateCodeTotal()" style="margin-top: 10px;">确 定</el-button>
            </el-dialog>
          </div>
        </div>
        <div class="font" @click="showAddress" style="background-color: #cccc77;">{{ address }}</div>
      </div>
    </div>

    <div class="fundsInfo">
      <div class="title">会员资金信息</div>
      <div class="mount" style="width: 80%">
        <div style="display: flex;justify-content: flex-start;">
          <div class="mount" style="width: 43%">
            <div class="font">线上充值金额(一月内): {{ dataInfo.线上金额 }}</div>
          </div>
          <div class="mount" style="width: 45%">
            <div class="font">线上历史充值金额:{{ historyRecharge || 0.00 }}</div>
          </div>
          <div class="mount" style="width: 12%;">
            <el-button type="primary" plain @click="getHistoryRecharge()" style="height: 40px">查询</el-button>
          </div>
        </div>
        <div class="font">线下充值金额: {{ dataInfo.线下充值金额 }}</div>
        <div class="font">USDT充值金额: {{ dataInfo.USDT充值金额 }}</div>
        <div class="font">代充金额: {{ dataInfo.人工代充金额 }}</div>
        <div class="font">手工上分金额: {{ dataInfo.手动增加金额 }}</div>
        <div class="font">平台赠送金额: {{ dataInfo.平台赠送金额 }}</div>
        <div class="font">充值总金额: {{ totalRecharge || 0.00 }}</div>
        <div class="font">提现次数: {{ dataInfo.会员提现次数 }}</div>
        <div class="font">提现金额: {{ dataInfo.会员提现金额 }}</div>
      </div>
    </div>
    <div class="lotteryInfo">
      <div class="title">会员备注</div>
      <div class="mount" style="width: 80%">
        <div class="member-note-field">
          <el-input type="textarea" id="text-area" class="font" style="height: auto" v-model.trim="email" maxlength="50" show-word-limit></el-input>
          <el-button class="renew-btn2" type="primary" plain @click="updateRemark(email,dataInfo['会员编号'])">更新</el-button>
        </div>
      </div>
    </div>
    <div class="lotteryInfo">
      <div class="title">彩票检测</div>
      <div class="mount" style="width: 80%">
        <div class="font">异常投注次数: {{ dataInfo.彩票异常投注次数 }}</div>
      </div>
    </div>
    <div class="playInfo">
      <div class="title" style="border-right:  1px solid rgba(0, 0, 0, 0.10);">游戏盈利(一月内)</div>
      <div class="mount" style="width: 80%">
        <div class="font" v-for="item in playData">{{ item }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script name="TableShow" setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  getHistoryRecharges,
  getMemberInfo,
  getMemberLoginAddress,
  updateMemberCodeTotal,
  updateRemarks
} from "@/api/member/memberInfo";
import { ElMessage } from "element-plus";

const {proxy} = getCurrentInstance();

const historyRecharge = ref('');
const address = ref('');
const email = ref('');
const playData = ref([]);
const totalRechargeOriginal = ref('');
const totalRecharge = ref('');
const open = ref(false);
const dataInfo = {};
const showUpdateForm = ref( false );
const inputValue = ref('');
const queryParams = {
  id: null,
  codeTotal: '',
};



const userId = ref('');

function show(data) {
  address.value = '******'
  dataInfo['会员名称'] = null;
  playData.value = []
  data.forEach((value, index, array) => {
    const classTwoName = value.class_twoname;
    const tValue = value.t_value;
    if (tValue && tValue.indexOf('投注:') >= 0) {
      playData.value.push(classTwoName + tValue)
    } else {
      dataInfo[classTwoName] = tValue
    }
  });
  userId.value = dataInfo.会员编号;
  open.value = true
  historyRecharge.value = ''
  email.value = dataInfo.会员备注;
  totalRechargeOriginal.value = dataInfo.充值总的金额;
  totalRecharge.value = dataInfo.充值总的金额;
}

function validateTextLength(value) {
  /**  中文、中文标点、全角字符按1长度，英文、英文符号、数字按0.5长度计算 */
  let cnReg = /([\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFF60])/g
  let mat = value.match(cnReg)
  let length
  if (mat) {
    length = (mat.length + (value.length - mat.length) * 0.5)
    return length
  } else {
    return value.length * 0.5
  }
}

function showForm( memberCode ) {
  console.log( memberCode )
  queryParams.id = memberCode;
  showUpdateForm.value = true;
}

function updateCodeTotal() {
  queryParams.codeTotal = inputValue.value;
  updateMemberCodeTotal( queryParams );
  showUpdateForm.value = false;
  // refreshDialog();
  ElMessage({
    message: '更新成功',
    type: 'success'
  })
}

function updateRemark(email, id) {
  if (validateTextLength(email) > 50) {
    proxy.$modal.msgError("最多输入50个汉字")
  } else {
    updateRemarks(id, email).then((res) => {
      proxy.$modal.msgSuccess("修改成功")
    })
  }
}

// function refreshDialog() {
//   open.value = false;
//   open.value = true;
//   // this.visible = false; // Hide the dialog
//   //   proxy.$modal.visible = true; // Show the dialog
// }

function showPhone() {
  if (dataInfo['会员名称'] === null) {
    proxy.$modal.msgError("此会员无手机号");
  } else {
      getMemberInfo(dataInfo['会员编号']).then((res) => {
        dataInfo['会员名称'] = res.data.phone
        proxy.$forceUpdate();
      });
  }
}

/** 获取会员的登录地址 display address */
function showAddress() {
  getMemberLoginAddress(dataInfo['会员编号']).then((res) => {
    address.value = res.msg;
  });
}

function getHistoryRecharge() {
  getHistoryRecharges(dataInfo['会员编号']).then((res) => {
    historyRecharge.value = res.data;
    if (historyRecharge.value !== null) {
      totalRecharge.value = (parseFloat(totalRechargeOriginal.value)).toFixed(2)
    }
    proxy.$modal.msgSuccess('更新成功')
  });
}

defineExpose({
  show
});
</script>

<style scoped>
div {
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.10);
  font-size: 14px;
  line-height: 300%;
  text-align: center;
  /*align-items:center; display: flex;*/
}

.member-note-field{
  display: flex;
  justify-content: flex-start;
  height: 57px;
  padding-bottom: 5px;
  overflow: hidden;
}

.font {
  height: 40px;
  text-align: center;
}
#text-area{
  height: 50px;
  width: 100%;
  text-align: center;
}

.renew-btn2{
  height: 55px;
}

.title {
  width: 20%;
  margin: 0 0 0 0;
  border: 0px solid rgba(0, 0, 0, 0.10);
  /*height: 100%;*/
}

.memberInfo {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.memberInfo .font {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.memberInfo .font::-webkit-scrollbar{
  height: 3px;
}

.memberInfo .font::-webkit-scrollbar-track{
  -webkit-box-shadow: inset 0 0 3px rgba(0,0,0,0.3);
}

.memberInfo .font::-webkit-scrollbar-thumb{
  background-color: darkgrey;
  outline: 1px solid slategrey;
}

.fundsInfo {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.lotteryInfo {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.playInfo {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.mount {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
