<template>

  <div>
    <el-dropdown>
    <span class="el-dropdown-link">通知
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
      <template #dropdown>
        <el-dropdown-menu>

          <div class="switch-container" v-if="data.onlineRecharge.hasPermission">
            <el-dropdown-item>线上充值信息</el-dropdown-item>
            <el-switch v-model="data.onlineRecharge.switchValue"
                       @change="scheduleReminder(data.onlineRecharge)"></el-switch>
          </div>

          <div class="switch-container" v-if="data.companyDeposit.hasPermission">
            <el-dropdown-item>公司入款信息</el-dropdown-item>
            <el-switch v-model="data.companyDeposit.switchValue"
                       @change="scheduleReminder(data.companyDeposit)"></el-switch>
          </div>

          <div class="switch-container" v-if="data.usdtDeposit.hasPermission">
            <el-dropdown-item>USDT充值信息</el-dropdown-item>
            <el-switch v-model="data.usdtDeposit.switchValue"
                       @change="scheduleReminder(data.usdtDeposit)"></el-switch>
          </div>

          <div class="switch-container" v-if="data.memberWithdrawal.hasPermission">
            <el-dropdown-item>会员提现信息</el-dropdown-item>
            <el-switch v-model="data.memberWithdrawal.switchValue"
                       @change="scheduleReminder(data.memberWithdrawal)"></el-switch>
          </div>

        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>

</template>

<script setup>

//COUNTER
import { memberRechargeOnlineCount      } from "@/api/pay/memberRechargeOnline";
import { memberRechargeBankCount        } from "@/api/pay/memberRechargeBank";
import { memberRechargeUsdtListCount    } from "@/api/pay/memberRechargeUsdt";
import { memberWithdrawDetailCountTotal } from "@/api/pay/memberWithdrawDetail";

//AUDIOS
import ringtone_onlineRecharge   from '@/assets/audio/online_deposit_zh.mp3';
import ringtone_companyDeposit   from '@/assets/audio/company_deposit_zh.mp3';
import ringtone_usdtDeposit      from '@/assets/audio/usdt_deposit_zh.mp3';
import ringtone_memberWithdrawal from '@/assets/audio/withdraw_zh.mp3';

//CACHING & LOOP
import { startInterval, killInterval } from "@/utils/scheduledTask";
import { getToken                    } from "@/utils/auth";
import { checkPath                   } from "@/api/login";

//PATH
const path_onlineRecharge   = ref('memberRechargeOnline');
const path_companyDeposit   = ref('memberRechargeBank');
const path_usdtDeposit      = ref('memberRechargeUsdt');
const path_memberWithdrawal = ref('memberWithdrawDetails');

//STORAGE KEY
const key_onlineRecharge    = ref('onlineRecharge');
const key_companyDeposit    = ref('companyDeposit');
const key_usdtDeposit       = ref('usdtTopUp');
const key_memberWithdrawal  = ref('memberWithdrawal');

//ETC
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
const {proxy}        = getCurrentInstance();
const IntervalMillis = ref(5000);

const data = reactive({
  onlineRecharge: {
    ringtone      : new Audio(ringtone_onlineRecharge),
    countMethod   : memberRechargeOnlineCount,
    path          : path_onlineRecharge.value,
    storageKey    : key_onlineRecharge.value,
    hasPermission : true,
    switchValue   : false,
    interval      : null,
    totalCount    : 0
  },
  companyDeposit: {
    ringtone      : new Audio(ringtone_companyDeposit),
    countMethod   : memberRechargeBankCount,
    path          : path_companyDeposit.value,
    storageKey    : key_companyDeposit.value,
    hasPermission : true,
    switchValue   : false,
    interval      : null,
    totalCount    : 0
  },
  usdtDeposit: {
    ringtone      : new Audio(ringtone_usdtDeposit),
    countMethod   : memberRechargeUsdtListCount,
    path          : path_usdtDeposit.value,
    storageKey    : key_usdtDeposit.value,
    hasPermission : true,
    switchValue   : false,
    interval      : null,
    totalCount    : 0
  },
  memberWithdrawal: {
    ringtone      : new Audio(ringtone_memberWithdrawal),
    countMethod   : memberWithdrawDetailCountTotal,
    path          : path_memberWithdrawal.value,
    storageKey    : key_memberWithdrawal.value,
    hasPermission : true,
    switchValue   : false,
    interval      : null,
    totalCount    : 0
  },
  query : {
    selectDate: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())]
  }
})

onMounted(() => {
  getCurrentCount(data.onlineRecharge, data.companyDeposit, data.usdtDeposit, data.memberWithdrawal)
})

function getCurrentCount(...types){
  for (let type of types){
    checkPath(type.path).then(hasPermission => {
      if (!hasPermission){
        type.hasPermission = false;
        return;
      }
      if (!type.switchValue){
        return;
      }
      let storedSwitchValue = localStorage.getItem(type.storageKey)
      if (storedSwitchValue !== null){
        type.switchValue = storedSwitchValue === "true";
      }
      type.countMethod(data.query).then(res => {
        type.totalCount = type !== data.memberWithdrawal ? res.total : res.data;
      })
      scheduleReminder(type);
    })
  }
}

function scheduleReminder(type){
  localStorage.setItem(type.storageKey, type.switchValue);
  if (type.switchValue) {
    type.interval = startInterval(() => {
      if(!getToken()) {
        return;
      }
      type.countMethod(data.query).then(res => {
            let total = type !== data.memberWithdrawal ? res.total : res.data;
            if(total > type.totalCount) {
              type.totalCount = total;
              type.ringtone.play();
            }
          }
      );

    }, IntervalMillis.value);
  } else {
    killInterval(type.interval);
  }

}
</script>

<style scoped>

.switch-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: 10px;
}
</style>