<template>
  <div class="app-container">
    <el-form v-show="showSearch" :rules="rules"  ref="queryRef" :inline="true" :model="queryParams">
      <el-form-item class="input-wd25" label="成员编号" prop="account">
        <el-input
            v-model.trim="queryParams.account"
            placeholder="成员编号"
            clearable
            type="primary"
            link
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="推荐投注倍数" prop="referralBetMultiplier">
        <el-date-picker
            v-model="queryParams.startTime"
            type="datetime"
            placeholder="Pick a day"
            :size="size"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-descriptions :column="3" border>
      <el-descriptions-item label="我的身份证" align="center">{{ memberReferralList.id }}</el-descriptions-item>
      <el-descriptions-item label="推荐" align="center" >{{ memberReferralList.inviterId }}</el-descriptions-item>
      <el-descriptions-item label="今日注册" align="center">{{ memberReferralList.todayRegistered }}</el-descriptions-item>
      <el-descriptions-item label="注册总数" align="center">{{ memberReferralList.totalRegistered }}</el-descriptions-item>
      <el-descriptions-item label="今日奖金" align="center">{{ memberReferralList.referralBonusToday }}</el-descriptions-item>
      <el-descriptions-item label="奖金总额" align="center">{{ memberReferralList.referralBonusTotal }}</el-descriptions-item>
    </el-descriptions>
    <el-divider/>
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

const platformTypeList = ref([])
const memberReferralList = ref({
  id: null,
  inviterId: null,
  todayRegistered: null,
  totalRegistered: null,
  referralBonusToday: null,
  referralBonusTotal: null,
  referralDetails: []
})
const gameTypeList = ref([])

const loading = ref(false)
const bonuses = ref(false)
const referralReport = ref([])
const open = ref(false)
const scheduleDialog = ref(false)

const ids = ref([]);
const total = ref(0);
const title = ref('');

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */
const showSearch = ref(true)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    account: '',
    startTime: '',
    endTime: '',
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
const {queryParams, rules, form, scheduleForm, schedule} = toRefs(data)

/**
 * 查询游戏字典列表 list of data
 */
function getList() {
  loading.value = true
  memberReferralListData(queryParams.value).then(res => {
    loading.value = false
    memberReferralList.value = res.data
    memberReferralReport(queryParams.value).then(res2 => {
      memberReferralList.value.referralDetails = res2.data
      total.value = res2.total
    })
  })
}

function showReport() {
  if( queryParams.account != null && queryParams.startTime != null ) {
    open.value = true
    bonuses.value = true
    memberReferralReport(queryParams.value).then(res => {
      bonuses.value = true
      referralReport.value = res.data
    })
  } else {
    console.warn("Insert a member ID and datetime first")
  }
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  proxy.$refs['queryRef'].validate(async valid => {
    if (valid) {
      queryParams.pageNum = 1;
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

</script>
