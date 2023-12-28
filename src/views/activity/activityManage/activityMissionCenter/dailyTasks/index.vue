<template>
  <div class="app-container">
    <el-form label="日常任务" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams"
             label-width="98px">
      <el-form-item prop="现状" style="min-width: 50px">
        <el-input
            v-model="queryParams.taskCode"
            clearable
            placeholder="现状"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['mission:repeat:add']"
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['mission:repeat:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--            v-hasPermi="['mission:repeat:settings']"-->
<!--            icon="Edit"-->
<!--            plain-->
<!--            size="small"-->
<!--            type="primary"-->
<!--            @click="handleSettings"-->
<!--        >日常任务设置-->
<!--        </el-button>-->
<!--      </el-col>-->
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="missionRepeatLists" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="身份证" min-width="70" prop="id"/>
<!--      <el-table-column align="center" label="任务货币" min-width="180" prop="taskCurrency"/>-->
      <el-table-column :show-overflow-tooltip="true" align="center" label="网址" min-width="180" prop="icon">
        <template #default="scope">
          <el-image :src="scope.row.icon" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="任务分类" min-width="180" prop="taskClassification"/>
      <el-table-column align="center" label="奖励金额" min-width="180" prop="reward"/>
      <el-table-column align="center" label="完成次数" min-width="180" prop="completionCount"/>
<!--      <el-table-column align="center" label="任务目标" min-width="180" prop="missionObjectives"/>-->
      <el-table-column align="center" label="奖励活动" min-width="180" prop="rewardActivity"/>
<!--      <el-table-column align="center" label="任务介绍" min-width="180">-->
<!--        <template #default="scope">-->
<!--          &lt;!&ndash; Display both ID and Task Currency in the same cell &ndash;&gt;-->
<!--          累计充值${{ scope.row.cumulativeRechargeAmount }}, 奖励${{ scope.row.reward }}-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column align="center" min-width="150" label="现状" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="分类" min-width="180" prop="sort"/>
      <el-table-column align="center" label="操作员" min-width="180" prop="createdBy"/>
      <el-table-column align="center" label="运行时间" min-width="180" prop="updateTime"/>
      <el-table-column align="center" label="说明" min-width="180" prop="description"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['mission:repeat:update']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['mission:repeat:remove']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50]"
        :total="total"
        @pagination="getList"
    />

    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="600px">
      <el-form ref="missionRepeatRef" :model="form" :rules="rules" label-width="150px">
<!--        <el-form-item label="货币" prop="currency" style=" min-width: 290px">-->
<!--          <el-checkbox-->
<!--              v-model="selectAll"-->
<!--              @change="handleCheckAllChange"-->
<!--          >全部检查-->
<!--          </el-checkbox>-->
<!--        </el-form-item>-->
<!--        <el-form-item prop="currency" style="min-width: 290px">-->
<!--          <el-checkbox-group-->
<!--              v-model="checkedCurrency"-->
<!--              @change="handleCheckedCurrencyChange">-->
<!--            <el-checkbox v-for="item in activity_mission_currency"-->
<!--                         :key="item.value"-->
<!--                         :label="item.label">{{ item.label }}-->
<!--            </el-checkbox>-->
<!--          </el-checkbox-group>-->
<!--        </el-form-item>-->
        <el-form-item label="任务分类" prop="taskClassification" style="min-width: 290px">
          <el-select v-model="form.taskClassification" placeholder="任务分类" clearable>
            <el-option
                v-for="dict in taskClassificationList"
                :key="dict"
                :label="dict"
                :value="dict"
            />
          </el-select>
        </el-form-item>
<!--        <el-form-item label="任务目标" prop="missionObjectives" style="min-width: 290px">-->
<!--          <el-select v-model="form.missionObjectives">-->
<!--            <el-option-->
<!--                v-for="dict in activity_mission_objectives"-->
<!--                :key="dict.value"-->
<!--                :label="dict.label"-->
<!--                :value="dict.value"-->
<!--            />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item v-if="form.missionObjectives === '累计充值'" label="充值类别"-->
<!--                      prop="accumulatedRechargeSource" style="min-width: 290px">-->
<!--          <el-checkbox-group v-model="data.rechargeCategory">-->
<!--            <el-checkbox-button-->
<!--                v-for="dict in pay_online_recharge_category"-->
<!--                :key="dict.value"-->
<!--                :label="dict.label"></el-checkbox-button>-->
<!--          </el-checkbox-group>-->
<!--        </el-form-item>-->
        <div v-if="form.missionObjectives !== '累计充值'">
<!--          <el-form-item label="Game Type" prop="gameType" style="min-width: 290px">-->
<!--            <el-select v-model="form.gameType" @change="handleGameTypeChange">-->
<!--              <el-option-->
<!--                  v-for="dict in gameTypeList"-->
<!--                  :key="dict.id"-->
<!--                  :label="dict.name"-->
<!--                  :value="dict.id"-->
<!--              ></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item-->
<!--              label="Platform Type" prop="platformType" style="min-width: 290px">-->
<!--            <el-select v-model="form.platformType" @change="handleGamePlatformChange">-->
<!--              <el-option-->
<!--                  v-for="dict in platformTypeList"-->
<!--                  :key="dict.id"-->
<!--                  :label="dict.name"-->
<!--                  :value="dict.id"-->
<!--              ></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="Game" prop="gameName" style="min-width: 290px">-->
<!--            <el-select v-model="form.gameName">-->
<!--              <el-option-->
<!--                  v-for="dict in gameList"-->
<!--                  :key="dict.id"-->
<!--                  :label="dict.name"-->
<!--                  :value="dict.id"-->
<!--              ></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
        </div>
        <el-form-item label="累计补给量" prop="cumulativeRechargeAmount">
          <el-input type="number" v-model="form.cumulativeRechargeAmount" placeholder="输入累计充值金额"
                    @change="handleComposeMission"/>
        </el-form-item>
        <el-form-item label="奖励金额" prop="reward">
          <el-input type="number" v-model="form.reward" placeholder="请输入奖励金额"
                    @change="handleComposeMission"/>
        </el-form-item>
        <el-form-item label="完成次数" prop="completionCount">
          <el-input type="number" v-model="form.completionCount" placeholder="请输入奖励金额"/>
        </el-form-item>
        <el-form-item label="奖励活动" prop="rewardActivity">
          <el-input type="number" v-model="form.rewardActivity" placeholder="请输入奖励活动"/>
        </el-form-item>
        <el-form-item label="分类" prop="sort">
          <el-input type="number" v-model="form.sort" placeholder="请输入排序"/>
        </el-form-item>
<!--        <el-form-item label="任务简介" prop="missionIntroduction">-->
<!--          <el-input v-model="mission" placeholder="输入累计充值金额" disabled/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="活跃" prop="status" style="min-width: 290px">-->
<!--          <template #default="scope">-->
<!--            <el-switch-->
<!--                v-model="form.status"-->
<!--                :active-value="1"-->
<!--                :inactive-value="0"-->
<!--            ></el-switch>-->
<!--          </template>-->
<!--        </el-form-item>-->
        <el-form-item label="说明" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="说明" :rows="3"/>
        </el-form-item>
        <el-form-item>
          <div class="centered-form">
            <el-upload
                ref="upload"
                :action="uploadFileUrl"
                :auto-upload="false"
                :before-upload="beforeAvatarUpload"
                :headers="headers"
                :limit="1"
                :multiple="false"
                :on-change="selectFile"
                :on-error="uploadFalse"
                :on-exceed="uploadExceed"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="uploadSuccess"

                class="upload-demo"
                drag
                name="advertisementFile"
            >
              <div class="el-upload__text">Drop file here or <em>点击上传</em></div>
              <div class="el-upload__tip">
                最大文件大小为 100 MB
              </div>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>


    <el-dialog v-model="settingsOpen" v-loading="settingsLoading" :close-on-click-modal="false"
               :title="title"
               style="padding-bottom: 30px; padding-left: 30px"
               width="1200px">

      <el-form :inline="true" ref="settingsRef" :rules="settingsRules" form="settingsForm" :model="settingsForm"
               label-width="250px">
        <el-row>
          <el-col>
            <el-form-item label="规则说明">
              <el-input type="textarea" rows="5" cols="100" v-model="settingsForm.ruleDescriptionTranslated"
                        prop="ruleDescriptionTranslated"/>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="参与成员" disabled="true">
              <el-checkbox disabled
                           label="Select All"
                           v-model="data.selectAll"
                           @change="handleCheckAllSettingsChange"/>
              <el-col>
                <el-checkbox-group v-model="data.participants" disabled>
                  <el-checkbox v-for="i in data.memberTierList"
                               :label="i.levelName"
                               :key="i.status"
                               :checked="i.status === 1"
                               size="large"
                               style="width: auto">
                    {{ i.levelName }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-col>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="收集方法">
              <el-radio-group v-model="settingsForm.collectionMethodSwitch" class="ml-4">
                <el-radio :label="0" size="large">Direct to Account</el-radio>
                <el-radio :label="1" size="large">Manual Collection</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="活动收集入口" prop="eventCollection">
              <el-checkbox-group disabled
                                 v-model="checkedEventCollection">
                <el-checkbox v-for="ec in eventCollection" :key="ec.id" :label="ec">
                  {{ ec.missionSettingsValue }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="更多收藏限制">
              <el-checkbox-group
                  v-model="checkedCollectionRestriction">
                <el-checkbox v-for="cc in collectionRestriction" :key="cc.id" :label="cc">
                  {{ cc.missionSettingsValue }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="主页弹出提示">
              <el-switch v-model="settingsForm.homePagePromptSwitch"
                         :active-value="1"
                         :inactive-value="0"/>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="多重审计">
              <el-input
                  class="w-50 m-2"
                  v-model="settingsForm.auditMultiplier"
                  prop="auditMultiplier"
                  size="large"
                  placeholder="Please Input"
                  type="number"/>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="审计限制平台">
              <el-col>
                <el-radio-group v-model="settingsForm.auditRestrictedPlatformsSwitch" class="ml-4">
                  <el-radio :label="0" size="large">Not Limited</el-radio>
                  <el-radio :label="1" size="large">Only for the following checked platforms</el-radio>
                </el-radio-group>
              </el-col>
              <el-tabs type="border-card" v-if="settingsForm.auditRestrictedPlatformsSwitch === 1">
                <el-tab-pane v-for="tab in data.auditRestrictedTabs" :key="tab.gameType" :label="tab.gameType">
                  <el-checkbox-group v-model="tab.selectedCheckboxes">
                    <el-checkbox v-for="plat in tab.platforms"
                                 :key="plat.status"
                                 :checked="plat.status === 1"
                                 :label="plat.platform"
                                 size="large"
                                 style="width: auto">
                      {{ plat.platform }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-tab-pane>
              </el-tabs>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSettings">编辑</el-button>
        <el-button @click="settingsOpen=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="dailyTask" setup>

import {
  missionRepeatList,
  getMissionRepeatList,
  updateMissionRepeat,
  addMissionRepeat,
  deleteMissionRepeat,
  changeMissionRepeatStatus,
  getPlatformList,
  gameInfoList,
  getSettings,
  updateSettings,
  fileUpload,
  getMissionTrigger
} from "@/api/activity/missionRepeat";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {useRouter} from "vue-router";
import {listAllType} from "@/api/game/type";
import {
  getMemberTierList
} from "@/api/activity/newbieBenefits";
import {url} from "@/utils/url";

const router = useRouter();
const {proxy} = getCurrentInstance();

// const {
//   activity_mission_currency
//   , activity_mission_task_classification
//   , activity_mission_objectives
//   , pay_online_recharge_category
// } = proxy.useDict(
//     'activity_mission_currency'
//     , 'activity_mission_task_classification'
//     , 'activity_mission_objectives'
//     , 'pay_online_recharge_category');

const checkedCurrency = ref([]);
const selectAll = ref(true);
const platformTypeList = ref([])
const gameTypeList = ref([])
const gameList = ref([])
const mission = ref('')

const missionRepeatLists = ref([]);
const ids = ref([]);
const id = ref('');
const status = ref(1);
const updateTime = ref('');
const updateBy = ref('');
const title = ref('');
const total = ref(0);
const open = ref(false);

const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);
const settingsLoading = ref(true);
const settingsForm = ref([]);
const taskClassificationList = ref([]);

// const currencyCollection = ref([]);
// const checkedCurrency = ref([]);
const settingsOpen = ref(false);
const settingsId = ref('DAILY');
const eventCollection = ref([]);
const checkedEventCollection = ref([]);
const collectionRestriction = ref([]);
const checkedCollectionRestriction = ref([]);
const formData = new FormData();
const data = reactive({
  /** 查询参数 query params*/
  auditRestrictedTabs: [],

  rechargeCategory: [],

  queryParams: {
    missionSettingsId: 'DAILY',
    pageNum: 1,
    pageSize: 20,
    type: null,
    effect: null,
    taskCode: null,
    tipBubbleSwitch: null
  },

  settingsRules: {
    ruleDescriptionTranslated:
        [
          {required: true, message: '描述 不得为空', trigger: 'blur'}
        ],
    auditMultiplier:
        [
          {required: true, message: '审计乘数不应为空', trigger: 'blur'}
        ],
    taskDuration:
        [
          {required: true, message: '任务持续时间 不应为空', trigger: 'blur'}
        ]
  },

  rules: {
    cumulativeRechargeAmount:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
    completionCount:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
    reward:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
    rewardActivity:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ]
  },

  /** 表单参数 form parameter*/
  form: {},

  auditParams: {
    id: 'DAILY',
  },

  uploadFileUrl: uploadAdvertisementUrl(),

  headers: {
    Authorization: 'Bearer ' + getToken()
  }
  ,
});
const {uploadFileUrl, queryParams, form, rules, headers, settingsRules} = toRefs(data);

function handleMemberTierList() {
  getMemberTierList(data.auditParams).then(res => {
    data.memberTierList = res.data
  })
}

function getMissionTriggerList(){
  getMissionTrigger().then(res => {
    taskClassificationList.value = res.data
  })
}

function handleSelectedAudit() {
  data.auditRestrictedTabs.forEach(x => {
        if (x.selectedCheckboxes != null) {
          x.platforms.forEach(f => {
            f.status = x.selectedCheckboxes.includes(f.platform) ? '1' : '0'
          })
        }
      }
  )
}

function handleEffectChange(row) {
  let text = row.tipBubbleSwitch === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.taskClassification + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const status = changeMissionRepeatStatus(row.id, row.status);
    loading.value = true
    if (status) {
      loading.value = false
      return status
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.status = row.status === '0' ? '1' : '0'
  })
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  missionRepeatList(queryParams.value).then(response => {
    missionRepeatLists.value = response.data;
    // taskClassificationList.value = missionRepeatLists.value[0];
    // console.log(JSON.stringify(taskClassificationList.value) + " @@")
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    currency: null,
    currencyAll: null,
    // checkedCurrency: activity_mission_currency.value.slice(0, 1),
    // taskClassification: activity_mission_task_classification.value[0].label,
    // missionObjectives: activity_mission_objectives.value[0].label,
    // accumulatedRechargeSource: pay_online_recharge_category,
    // gameType: null,
    // platformType: null,
    completionCount: null,
    gameName: null,
    cumulativeRechargeAmount: null,
    rewardActivity: null,
    reward: null,
    missionIntroduction: null,
    status: null,
    sort: null
  }
  // proxy.$refs.upload.clearFiles();
  proxy.resetForm('missionRepeatRef');
}

/** 重置按钮操作 handle reset query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加每日任务'
  selectAll.value = false;
  data.rechargeCategory = [];
  handleCheckAllChange();
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['missionRepeatRef'].validate(async valid => {
    if (valid) {
      let params = {
        id: form.value.id,
        missionRepeatType: 'DAILY',
        missionSettingsId: 'DAILY',
        taskCurrency: checkedCurrency.value.map((item) => item).join(','),
        taskClassification: form.value.taskClassification,
        reward: form.value.reward,
        completionCount: form.value.completionCount,
        cumulativeRechargeAmount: form.value.cumulativeRechargeAmount,
        missionObjectives: form.value.missionObjectives,
        accumulatedRechargeSource: null,
        platformId: form.value.platformType,
        gameTypeId: form.value.gameType,
        gameId: form.value.gameType,
        rewardActivity: form.value.rewardActivity,
        status: form.value.status,
        sort: form.value.sort,
      }
      if (form.value.missionObjectives === '累计充值') {
        params = {
          accumulatedRechargeSource: data.rechargeCategory.map((item) => item).join(','),
          platformId: null,
          gameTypeId: null,
          gameId: null,

          // id: checkedCurrency.value.id,
          id: form.value.id,
          missionRepeatType: 'DAILY',
          missionSettingsId: 'DAILY',
          // taskCurrency : checkedCurrency.value.toString(),
          taskCurrency: checkedCurrency.value.map((item) => item).join(','),
          taskClassification: form.value.taskClassification,
          reward: form.value.reward,
          completionCount: form.value.completionCount,
          missionObjectives: form.value.missionObjectives,
          cumulativeRechargeAmount: form.value.cumulativeRechargeAmount,
          rewardActivity: form.value.rewardActivity,
          status: form.value.status,
          description: form.value.description,
          sort: form.value.sort,
        }
      }
      //url validator
      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => params.icon = res.data);
      }

      if (form.value.id != null) {
        updateMissionRepeat(params).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addMissionRepeat(params).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function uploadAdvertisementUrl() {
  return url.baseUrl + url.game99PlatformAdminWeb + "/missionNewbie/uploadFile";
}

function beforeAvatarUpload(file) {
  const fileExtension = file.name.split('.')[1]
  const isLt2M = file.size / 1024 / 1024 < 100
  if (fileExtension !== 'jpg' &&
      fileExtension !== 'png' &&
      fileExtension !== 'bmp') {
    proxy.$modal.msgError('无效音乐')
  } else if (!isLt2M) {
    proxy.$modal.msgError('上传模板大小不能超过100MB!')
  }
}

function handleRemove() {
  proxy.$modal.msgSuccess('移除成功')
}

function uploadSuccess() {
  proxy.$modal.msgSuccess('文件上传成功');
  queryParams.memberId = null
  queryParams.pageNum = 1
  getList()
}

function selectFile(file) {
  formData.append("file", file.raw)
  formData.append("name", file.name)
}

function uploadFalse() {
  proxy.$modal.msgError(' 上传音乐文件失败')
}

function uploadExceed() {
  proxy.$modal.msgError('只能选择一个音乐文件，如果要更改，请退出并重新选择。')
}

function handlePreview(file) {
  if (file.response.status) {
    proxy.$modal.msgSuccess('此文件导入成功')
  } else {
    proxy.$modal.msgError('此文件导入失败')
  }
}

/** handle update data */
function handleUpdate(row) {
  reset()
  const id = row.id || this.ids
  getMissionRepeatList(id).then(response => {
    if (response.data.accumulatedRechargeSource != null) {
      data.rechargeCategory = response.data.accumulatedRechargeSource.split(',')
    }
    if (response.data.taskCurrency != null) {
      checkedCurrency.value = response.data.taskCurrency.split(',')
    }
    form.value = response.data
    open.value = true
    title.value = '编辑每日任务'
    handleCheckedCurrencyChange()
  })

}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteMissionRepeat(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

function handleSettings() {
  settingsLoading.value = true
  proxy.resetForm('settingsRef');
  getSettings(settingsId.value).then(response => {
    settingsForm.value = response.data;
    total.value = response.total;
    settingsLoading.value = false;

    // populateCheckList(currencyCollection, checkedCurrency, 'CURRENCY');
    populateCheckList(eventCollection, checkedEventCollection, 'EVENT_COLLECTION_ENTRANCE');
    populateCheckList(collectionRestriction, checkedCollectionRestriction, 'COLLECTION_RESTRICTION');
    data.auditRestrictedTabs = JSON.parse(response.data.auditRestrictedPlatformsJson)
    // handleCheckedSettingsCurrencyChange();
    settingsOpen.value = true;
  });
}

function populateCheckList(collection, checkedList, key) {
  collection.value = settingsForm.value.missionSettingsOtherList
      .filter(q => q.missionSettingsCode === key)
  checkedList.value = settingsForm.value.missionSettingsOtherList
      .filter(k => k.missionSettingsCode === key && k.status === 1)
}

/** handle update data */
function submitSettings() {
  proxy.$refs['settingsRef'].validate(async valid => {
    if (valid) {
      handleSelectedAudit()
      const params = {
        id: 'DAILY',
        ruleDescriptionTranslationSwitch: settingsForm.value.ruleDescriptionTranslationSwitch,
        ruleDescription: settingsForm.value.ruleDescription,
        ruleDescriptionTranslated: settingsForm.value.ruleDescriptionTranslated,
        auditRestrictedPlatformsSwitch: settingsForm.value.auditRestrictedPlatformsSwitch,
        auditMultiplier: settingsForm.value.auditMultiplier,
        homePagePromptSwitch: settingsForm.value.homePagePromptSwitch ? 1 : 0,
        missionSettingsOtherList: checkedEventCollection.value.concat(checkedCollectionRestriction.value),
        auditRestrictedPlatformsJson: JSON.stringify(data.auditRestrictedTabs)
      }

      updateSettings(params).then(() => {
        proxy.$modal.msgSuccess('修改成功')
        data.auditRestrictedTabs = null;
        settingsOpen.value = false;
        getList()
      })
    }
  })
}

function handleCheckAllSettingsChange() {
  checkedCurrency.value = selectAll.value ? currencyCollection.value : [];
}

function handleCheckAllChange() {
  checkedCurrency.value = selectAll.value ? activity_mission_currency.value.map(kek => kek.label) : [];
}

function handleCheckedCurrencyChange() {
  selectAll.value = checkedCurrency.value.length === activity_mission_currency.value.length;
}

function handleComposeMission() {
  if (!isNullOrEmpty(form.value.cumulativeRechargeAmount) && !isNullOrEmpty(form.value.reward)) {
    mission.value = "累计充值" + form.value.cumulativeRechargeAmount + "，奖励" + form.value.reward;
  } else {
    mission.value = "";
  }
}

function isNullOrEmpty(value) {
  return value === null || value.trim() === '';
}

function handleGameTypeChange() {
  getGamePlatformList();
  getGameTypeList();
}

function handleGamePlatformChange() {
  getGameTypeList();
}

function getGameTypeList() {
  listAllType().then(res => {
    const allType = {
      id: 0,
      name: "All",
      icon: ""
    };
    gameTypeList.value = [allType, ...res.data];
  })
}

function getGamePlatformList() {
  const param = {
    id: form.gameType
  }
  getPlatformList(param).then(res => {
    const allPlatform = {
      id: 0,
      name: "All",
      icon: ""
    };
    platformTypeList.value = [allPlatform, ...res.data];
  })
}

function getGameList() {
  const param = {
    id: form.gameType,
    pid: form.platformType,
  }
  gameInfoList(param).then(res => {
    const allGame = {
      id: 0,
      name: "All",
      icon: ""
    };
    gameList.value = [allGame, ...res.data];
  })
}

getMissionTriggerList();
getList();

</script>

<style>
.centered-form {
  //margin-left: 50px;
  max-width: 200px;
}
</style>
