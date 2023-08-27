<template>
  <!-- Personal Record popup page -->
  <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="1000px" append-to-body>

    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" style="margin-top: 20px">
      <el-form-item label="日期范围" prop="regTime">
        <el-date-picker type="datetimerange"
                        v-model="date.dateRange"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable="false"
                        :default-time="getDefaultTime()"
                        :shortcuts="pickerDateTimeShortcuts"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="initData()">搜索</el-button>
      </el-form-item>
    </el-form>

    <table style="width:100%;margin-bottom: 40px">

      <tr>
        <th class="bold">会员ID</th>
        <td>{{ memberId }}</td>
        <th class="bold">提款</th>
        <td>{{ data.personalWithdrawRecharge }}</td>
      </tr>
      <tr>
        <th class="bold">线上充值</th>
        <td>{{ onlineRecharge }}</td>
        <th class="bold">线下充值PR</th>
        <td>{{ data.personalRecharge }}</td>
      </tr>
      <tr>
        <th class="bold">合计充值</th>
        <td>{{ totalRechargeCount }}</td>
        <th class="bold">打码量</th>
        <td>{{ aBet.toFixed(2) }}</td>
      </tr>
      <tr>
        <td class="bold">送礼</td>
        <td>{{ data.personalLiverVideoProp }}</td>
        <td class="bold">盈亏</td>
        <td>{{ income }}</td>
      </tr>
      <tr>
        <th class="bold">余额</th>
        <td>{{ totalAccount.account_now}}</td>
        <th class="bold">保险箱余额</th>
        <td>{{ totalAccount.box_account }}</td>
      </tr>
      <tr>
        <td colspan="8"></td>
      </tr>


      <tr>
        <th class="bold" colspan="2">投注游戏</th>
        <th class="bold">有效投注</th>
        <th class="bold">盈亏</th>
      </tr>
      <tr v-for="bcList in bCodeList">
        <td colspan="2">{{ bcList.platformName }}</td>
        <td>{{ (bcList.cellScore).toFixed(2) }}</td>
        <td>{{ (bcList.profit).toFixed(2) }}</td>
      </tr>

    </table>

    <el-button type="primary" plain @click="open= !open" style="float: right;margin-top: -20px">
      关闭
    </el-button>

  </el-dialog>
</template>
<script setup name="PersonalRecordTable">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  getTodayEndTime,
  getTodayStartTime,
  parseTime,
  pickerDateTimeShortcuts,
  getDefaultTime
} from "@/utils/dateUtils";
import {getPersonalReport} from "@/api/member/memberInfo";

const {proxy} = getCurrentInstance();

const title = ref('');
const showSearch = ref(true);
const open = ref(false);

/** recharge data */
const onlineRecharge = ref(0)
const totalRechargeCount = ref(0)
const income = ref(0)
const aBet = ref(0)

const bCodeList = ref([]);

const memberId = ref('')

const datas = reactive({
  queryParams:{

  },
  data: {
    personalOnlineRecharge: 0,
    personalAgentRecharge: 0,
    personalUsdtRecharge: 0,
    personalWithdrawRecharge: 0,
    personalRecharge: 0,
    personalLiverVideoProp: 0,
  },
  date: {
    dateRange: [parseTime(getTodayStartTime()), parseTime(getTodayEndTime())]
  },
  totalAccount:{
    account_now:0,
    box_account:0,
  }
});

const {queryParams,date,data,totalAccount} = toRefs(datas);

/** getting show(id) method from memberInfo */
function show(memberId_, title_) {
  memberId.value = memberId_;
  open.value = true;
  title.value = title_;
  initData();
}

function initData() {
  const time = date.value
  if (!time.dateRange) {
    proxy.$modal.msgError("搜索时间不允许为空");
    return
  }
  getPersonalReport(memberId.value, {date : time.dateRange}).then((res) => {
    showPersonReport(res.data);
  })
}

/** personal report start here 个人报告从这里开始 */
function showPersonReport(data_) {


  /** 线上充值 = personalOnlineRecharge + personalAgentRecharge + personalUsdtRecharge */
  onlineRecharge.value = data_.personalOnlineRecharge + data_.personalUsdtRecharge;

  /** 合计充值 = 线上充值+线下充值 this.onlineRecharge + data.personalRecharge */
  totalRechargeCount.value = onlineRecharge.value + data_.personalRecharge;


  /**  盈亏 = 提款 - 合计充值 income  =  data.personalWithdrawRecharge - this.totalRechargeCount*/

  income.value = (data_.personalWithdrawRecharge - totalRechargeCount.value).toFixed(2);

  totalAccount.value.account_now = data_.totalAccount.account_now;
  totalAccount.value.box_account = data_.totalAccount.box_account;
  data.value.personalRecharge = data_.personalRecharge;
  data.value.personalWithdrawRecharge = data_.personalWithdrawRecharge;

  // data.value = data_.value;
  open.value = true
  bCodeList.value = data_.bCodeList;

  aBet.value = 0;
  bCodeList.value.forEach((currrentItem) => {
    aBet.value += currrentItem.allBet;
  })
}

defineExpose({
 show
});
</script>

<style scoped>

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
