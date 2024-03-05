<template>
<!-- fund popup page -->
  <el-dialog :close-on-click-modal="false" title="资金明细" v-model="open" width="800px" append-to-body>
    <div class="memberInfo">
      <div class="title">会员基本信息</div>
      <div class="mount" style="width: 12%">
        <div class="font">会员Id</div>
        <div class="font">注册时间</div>
        <!--        <div class="font">电话号码</div>-->
<!--        <div class="font">用户类型</div>-->
<!--        <div class="font">会员打码</div>-->
        <div class="font">会员IP</div>
      </div>
      <div class="mount" style="width: 28%">
        <div class="font">{{ dataInfo.会员编号 }}</div>
        <div class="font">{{ dataInfo.会员注册时间 }}</div>
        <!--        <div class="font" @click="showPhone" style="background-color: #cccc77">{{ data.会员名称 }}</div>-->
<!--        <div class="font">{{ dataInfo.用户类型 }}</div>-->
<!--        <div class="font">{{ dataInfo.会员打码 }}</div>-->
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
        <div class="font">{{dataInfo.会员VIP  }}</div>
        <div class="font">{{  parseFloat( dataInfo.会员注单).toFixed() }}</div>
        <div class="font" @click="showAddress" style="background-color: #cccc77">{{ address }}</div>
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
        <div class="font">线下充值金额: {{ parseFloat( dataInfo.线下充值金额).toFixed(0) }}</div>
        <div class="font">USDT充值金额: {{ parseFloat(dataInfo.USDT充值金额).toFixed(0) }}</div>
        <div class="font">代充金额: {{ dataInfo.人工代充金额 }}</div>
        <div class="font">手工上分金额: {{ parseFloat(dataInfo.手动增加金额).toFixed(0) }}</div>
        <div class="font">平台赠送金额: {{ parseFloat( dataInfo.平台赠送金额 ).toFixed(0)}}</div>
        <div class="font">充值总金额: {{ parseFloat(totalRecharge).toFixed(0) || 0 }}</div>
        <div class="font">提现次数: {{ parseFloat(dataInfo.会员提现次数).toFixed(0) }}</div>
        <div class="font">提现金额: {{ parseFloat(dataInfo.会员提现金额).toFixed(0) }}</div>
      </div>
    </div>
    <div class="lotteryInfo">
      <div class="title">会员备注</div>
      <div class="mount" style="width: 80%">
        <div class="member-note-field">
          <el-input type="textarea" id="text-area" class="font" style="height: auto" v-model.trim="email" maxlength="50" show-word-limit></el-input>
          <el-button class="renew-btn2" type="primary" plain @click="updateRemarks(dataInfo['会员编号'],email)">更新</el-button>
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
member
<script setup name="TableShow">
import {
  getHistoryRecharges,
  getMemberLoginAddress, updateRemarks
} from '@/api/member/memberInfo'
import {getCurrentInstance, ref} from "vue";

const {proxy} = getCurrentInstance();

const open = ref(false);
const address = ref('******');
const historyRecharge = ref('');
const totalRecharge = ref('');
const email = ref('');
const dataInfo = {};
const playData = ref([]);


function validateTextLength(value) {
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


function updateEmail(email, id) {
  if (validateTextLength(email.value) > 50) {
    proxy.$modal.msgError("最多输入50个汉字")
  } else {
    updateEmail({id: id, email: email}).then((res) => {
      proxy.$modal.msgSuccess("修改成功")
    })
  }
}

function showPhone() {
  // if (this.data['会员名称'] === null) {
  //   proxy.$modal.msgError("此会员无手机号");
  // } else {
  //   if (checkTwoLogin()) {
  //     //获取会员的手机号
  //     getMemberInfo(this.data['会员编号']).then((res) => {
  //       data['会员名称'] = res.data.phone
  //       $forceUpdate();
  //     });
  //   }
  // }
}
function showAddress() {
  getMemberLoginAddress(dataInfo['会员编号']).then((res) => {
    address.value = res.msg;
  });
}

function getHistoryRecharge(){
  getHistoryRecharges(dataInfo['会员编号']).then((res) => {
    historyRecharge.value = res.data;
    if (historyRecharge.value !== null) {
      totalRecharge.value = (parseFloat(totalRechargeOriginal.value) + parseFloat(historyRecharge.value)).toFixed(2)
    }
    proxy.$modal.msgSuccess('更新成功')
  });
}

function show(data) {
  address.value = '******'
  dataInfo['会员名称'] = null;
  playData.value = []
  data.forEach((value, index, array) => {
    const classTwoname = value.class_twoname;
    const tValue = value.t_value;
    if (tValue && tValue.indexOf('投注:') >= 0) {
      playData.value.push(classTwoname + tValue)
    } else {
      dataInfo[classTwoname] = tValue
    }
  });
  open.value = true
  historyRecharge.value = ''
  // this.data = data;
  email.value = dataInfo.会员备注;
  // totalRechargeOriginal.value = data.充值总的金额;
  totalRecharge.value = dataInfo.充值总的金额;
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
