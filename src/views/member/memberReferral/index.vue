<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams">
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
        <el-button type ="primary" size="small" @click="showReport">
          Referral Report
        </el-button>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-descriptions :column="3" border>
      <el-descriptions-item label="My ID" align="center">{{ memberReferralList.id }}</el-descriptions-item>
      <el-descriptions-item label="Recommendation ID" align="center" >{{ memberReferralList.inviterId }}</el-descriptions-item>
      <el-descriptions-item label="Today Register" align="center">{{ memberReferralList.todayRegistered }}</el-descriptions-item>
      <el-descriptions-item label="Total Register" align="center">{{ memberReferralList.totalRegistered }}</el-descriptions-item>
      <el-descriptions-item label="Today Bonus" align="center">{{ memberReferralList.referralBonusToday }}</el-descriptions-item>
      <el-descriptions-item label="Total Bonus" align="center">{{ memberReferralList.referralBonusTotal }}</el-descriptions-item>
    </el-descriptions>
    <el-divider/>
    <el-table v-loading="loading" :data="memberReferralList.referralDetails">
      <el-table-column align="center" label="Inviter Id" prop="inviterId"/>
      <el-table-column align="center" label="Level" prop="level"/>
      <el-table-column align="center" label="Bonus" prop="bonus"/>
      <el-table-column align="center" label="Time" prop="time"/>
      <el-table-column align="center" label="Bet" prop="bet"/>
    </el-table>

    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="400px">
      <el-form :inline="true" :model="form" :rules="rules" label-width="100px">
        <div class="centered-form">
          <el-form-item label="Level" prop="playerCount">
            <el-input type="number" v-model="form.level" placeholder="Level"/>
          </el-form-item>
          <el-form-item label="Player Count" prop="playerCount">
            <el-input type="number" v-model="form.playerCount" placeholder="Player Count"/>
          </el-form-item>
          <el-col>
            <el-form-item label="Commission Rate" prop="commissionRate" >
              <el-input type="number" v-model="form.commissionRate" placeholder="Commission Rate"/>
            </el-form-item>
          </el-col>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="data.showAddButton" @click="submitForm">提交</el-button>
        <el-button type="primary" v-if="data.showEditButton" @click="handleUpdate">编辑</el-button>
        <el-button @click="open=false">取 消</el-button>

      </div>
    </el-dialog>
    <pagination
        v-show="total"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50,100]"
        :total="total"
        @pagination="getList"/>

    <el-dialog v-model="scheduleDialog" title="Scheduler更新调度程序" append-to-body style="padding-bottom: 20px"
               width="600px">
      <el-form ref="scheduleTimerForm" :model="scheduleForm" label-width="120px">
        <el-form-item label-width="120px" label="Start Time" prop="schedule">
          <el-col>
            <!--            <el-time-picker v-model="schedule.commissionTimer" type="fixed-time" placeholder="Pick a time"-->
            <!--                            style="width: 100%;"/>-->
            <el-time-select
                v-model="scheduleForm.startTimer"
                start="00:00"
                step="00:30"
                end="23:59"
                placeholder="Select time"
                format="hh:mm"
            />
          </el-col>
        </el-form-item>
        <el-form-item label-width="120px" label="End Time" prop="schedule" >
          <el-col >
            <el-time-select
                v-model="scheduleForm.endTimer"
                start="00:00"
                step="00:30"
                end="23:59"
                placeholder="Select time"
                format="hh:mm"
            />
          </el-col>
        </el-form-item>

      </el-form>
      <el-form-item label="活跃" label-width="120px" prop="effect" style="min-width: 290px">
        <template #default="scope">
          <el-switch
              v-model="scheduleForm.effect"
              :active-value="1"
              :inactive-value="0"
          ></el-switch>
        </template>
      </el-form-item>
      <template #footer>
        <div>
          <el-button type="primary" @click="editScheduler">确 定</el-button>
          <el-button @click="scheduleDialog=false">取 消</el-button>
        </div>
      </template>
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
const referralReport = ref(false)
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
    gameType: [
      {required: true, message: 'Game Type is needed', trigger: 'blur'}
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
    console.log( JSON.stringify(res.data) + " )@#)) ")
    loading.value = false
    memberReferralList.value = res.data
    console.log( JSON.stringify(memberReferralList.value) )
    total.value = res.total
  })
}

function showReport() {
  open.value = true
  memberReferralReport(queryParams.value).then(res => {
    referralReport.value = res.data
  })
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

function resetQuery() {
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

<style>
.example-basic .el-date-editor {
  margin: 8px;
}
</style>
