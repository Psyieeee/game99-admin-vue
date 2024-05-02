<template>
  <div class="app-container">
    <div v-loading="totalLoading">
      <el-button type="primary" @click="copy1">ID 计数 {{ memberReferralList.referralCount.id || 0 }}</el-button>
      <el-button type="success" @click="copy2">邀请者编号计数 {{ memberReferralList.referralCount.inviterId || 0 }}</el-button>
      <el-button type="warning" @click="copy3">推荐奖金今日计数 {{ memberReferralList.referralCount.referralBonusToday || 0 }}</el-button>
      <el-button type="primary" @click="copy4">推荐奖金总数 {{ memberReferralList.referralCount.referralBonusTotal || 0 }}</el-button>
      <el-button type="success" @click="copy5">今日登记人数 {{ memberReferralList.referralCount.todayRegistered || 0 }}</el-button>
      <el-button type="warning" @click="copy6">注册总数 {{ memberReferralList.referralCount.totalRegistered || 0 }}</el-button>
      <el-button type="primary" icon="Search" size="small" @click="getCount()" style="margin-left: 20px">
        统计查询
      </el-button>
    </div>
    <el-form v-show="showSearch" :rules="rules"  ref="queryRef" :inline="true" :model="queryParams" style="margin-top: 20px">
      <el-form-item class="input-wd25" label="会员ID">
        <el-input
            v-model="queryParams.account"
            placeholder="成员编号"
            clearable
            type="primary"
            link
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期范围" prop="startDate">
        <el-date-picker
            v-model="queryParams.startDate"
            type="startDate"
            placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="app-container">
      <el-table v-loading="loading" :data="memberReferralList.referralDetails">
        <el-table-column align="center" label="成员 ID" prop="inviterId"/>
        <el-table-column align="center" label="级别" prop="level"/>
        <el-table-column align="center" label="奖金" prop="bonus"/>
        <el-table-column align="center" label="描述" prop="inviterId">
          <template #default="scope">
            {{scope.row.inviterId}}_{{scope.row.bonus}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="时间" prop="time"/>
        <el-table-column align="center" label="投注" prop="bet"/>
      </el-table>
      <pagination
          v-show="total"
          v-model:limit="queryParams.pageSize"
          v-model:page="queryParams.pageNum"
          :page-sizes="[20,30,50,100]"
          :total="total"
          @pagination="getList"
      />
    </div>

    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="400px">
      <el-form :inline="true"  label-width="100px">
        <div class="centered-form">
          <el-table v-loading="bonuses" :data="referralReport">
            <el-table-column align="center" label="奖金" prop="bonus"/>
            <el-table-column align="center" label="时间" prop="time"/>
          </el-table>
        </div>
      </el-form>
    </el-dialog>

  </div>
</template>

<script name="MemberReferral" setup>
import {
  memberReferralListData,
  memberReferralReport
} from "@/api/member/memberReferral";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance()

const memberReferralList = ref({
  referralCount:[],
  referralDetails: []
})

const loading = ref(false)
const bonuses = ref(false)
const referralReport = ref([])
const open = ref(false)
const ids = ref([]);
const total = ref(0);
const title = ref('');
/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */
const showSearch = ref(true)

const totalLoading = ref(false);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    orderByColumn: 'time',
    isAsc: 'desc',
    username: '',
    account: '',
    startDate: '',
    endDate:'',
    vip:''
  },
  rules: {
    account: [
      {required: true, message: '需要会员 ID', trigger: 'blur'}
    ]
  },
  form: {},
  scheduleForm: {
    id: null,
    startTimer: '00:00',
    endTimer: '00:00',
    effect: 1
  }
});
const { queryParams, rules, form, scheduleForm, schedule} = toRefs(data)

/**
 * 查询游戏字典列表 list of data
 */

function getList() {
  loading.value = true;

  if (data.queryParams.startDate !== '') {
    toLocalDate();
  }

  memberReferralReport(queryParams.value).then(res2 => {
    memberReferralList.value.referralDetails = res2.data;
    total.value = res2.total;
  });

  memberReferralListData(queryParams.value).then(res => {
    loading.value = false;
    memberReferralList.value.referralCount = res.data;
    console.log( memberReferralList.value.referralCount )
  });
}

function getCount(){
  totalLoading.value = true;
  if (data.queryParams.startDate !== '') {
    toLocalDate();
  }
console.log( queryParams.value )
  memberReferralListData(queryParams.value).then(res => {
    totalLoading.value = false;
    memberReferralList.value.referralCount = res.data;
    console.log( memberReferralList.value.referralCount )
  });
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  proxy.$refs['queryRef'].validate(async valid => {
    if (valid) {
      queryParams.pageNum = 1;
      queryParams.startDate = new Date(queryParams.startDate)
      getList();
    }
  });
}

function resetQuery() {
  queryParams.value.account = null;
  proxy.resetForm("queryRef");
  handleQuery();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    level: 1,
    gameType: null,
    referralAmountPercentage: null,
    referralBetMultiplier: null,
    effect: null
  };
  proxy.resetForm("memberReferralFormRef");
}

function toLocalDate(){
  const date = new Date(data.queryParams.startDate)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  data.queryParams.startDate = year + '-' + month + '-' + day;
}


function copy1() {
  copyCommand(memberReferralList.value.referralCount.id)
}
function copy2() {
  copyCommand(memberReferralList.value.referralCount.inviterId)
}
function copy3() {
  copyCommand(memberReferralList.value.referralCount.referralBonusToday)
}
function copy4() {
  copyCommand(memberReferralList.value.referralCount.referralBonusTotal)
}
function copy5() {
  copyCommand(memberReferralList.value.referralCount.todayRegistered)
}
function copy6() {
  copyCommand(memberReferralList.value.referralCount.totalRegistered)
}

function copyCommand(value) {
  navigator.clipboard.writeText(value)
      .then(() => {
        proxy.$modal.msgSuccess('复制成功');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
}

getList()
</script>
