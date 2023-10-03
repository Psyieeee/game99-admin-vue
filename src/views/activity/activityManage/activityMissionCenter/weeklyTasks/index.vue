<template>
  <div class="app-container">
    <el-form label="Weekly Tasks" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams"
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
            v-hasPermi="['mission:questRepeat:add']"
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
            v-hasPermi="['mission:questRepeat:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['mission:questNewbie:settings']"
            icon="Edit"
            plain
            size="small"
            type="primary"
            @click="handleSettings"
        >Weekly Task Settings
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="questRepeatLists" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="ID" min-width="70" prop="id"/>
      <el-table-column align="center" label="Task Currency" min-width="180" prop="taskCurrency"/>
      <el-table-column align="center" label="Task Classification" min-width="180" prop="taskClassification"/>
      <el-table-column align="center" label="Reward Amount" min-width="180" prop="rewardAmount"/>
      <el-table-column align="center" label="Mission Target" min-width="180" prop="missionObjectives"/>
      <el-table-column align="center" label="Reward Activity" min-width="180" prop="rewardActivity"/>
      <el-table-column align="center" label="Mission Introduction" min-width="180">
        <template #default="scope">
          <!-- Display both ID and Task Currency in the same cell -->
          累计充值${{ scope.row.cumulativeRechargeAmount }}, 奖励${{ scope.row.rewardAmount }}
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="150" label="Status" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Operator" min-width="180" prop="createdBy"/>
      <el-table-column align="center" label="Operating Time" min-width="180" prop="updateTime"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['mission:questRepeat:delete']"
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
               width="700px">
      <el-form ref="questRepeatRef" :model="form" :rules="rules" label-width="300px">
        <el-form-item label="Currency" prop="currency" style=" min-width: 290px">
          <el-checkbox
              v-model="selectAll"
              @change="handleCheckAllChange"
          >Check all
          </el-checkbox>
        </el-form-item>
        <el-form-item label="Currency" prop="currency" style="min-width: 290px">
          <el-checkbox-group
              v-model="checkedCurrency"
              @change="handleCheckedCurrencyChange">
            <el-checkbox v-for="item in activity_quest_currency"
                         :key="item.value"
                         :label="item.label">{{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="任务分类" prop="taskClassification" style="min-width: 290px">
          <el-select v-model="form.taskClassification" placeholder="任务分类" clearable>
            <el-option
                v-for="dict in activity_quest_task_classification"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Mission Objectives" prop="missionObjectives" style="min-width: 290px">
          <el-select v-model="form.missionObjectives">
            <el-option
                v-for="dict in activity_quest_mission_objectives"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.missionObjectives === '累计充值'" label="Recharge Category"
                      prop="accumulatedRechargeSource" style="min-width: 290px">
          <el-select v-model="form.accumulatedRechargeSource" multiple>
            <el-option
                v-for="dict in pay_online_recharge_category"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <div v-if="form.missionObjectives !== '累计充值'">
          <el-form-item label="Game Type" prop="gameType" style="min-width: 290px">
            <el-select v-model="form.gameType" @change="handleGameTypeChange">
              <el-option
                  v-for="dict in gameTypeList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
              label="Platform Type" prop="platformType" style="min-width: 290px">
            <el-select v-model="form.platformType" @change="handleGamePlatformChange">
              <el-option
                  v-for="dict in platformTypeList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Game" prop="gameName" style="min-width: 290px">
            <el-select v-model="form.gameName">
              <el-option
                  v-for="dict in gameList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="累计补给量Cumulative Recharge Amount" prop="cumulativeRechargeAmount">
          <el-input type="number" v-model="form.cumulativeRechargeAmount" placeholder="输入累计充值金额"
                    @change="handleComposeMission"/>
        </el-form-item>
        <el-form-item label="reward奖励金额" prop="rewardAmount">
          <el-input type="number" v-model="form.rewardAmount" placeholder="请输入奖励金额"
                    @change="handleComposeMission"/>
        </el-form-item>
        <el-form-item label="activity奖励活动" prop="rewardActivity">
          <el-input type="number" v-model="form.rewardActivity" placeholder="请输入奖励活动"/>
        </el-form-item>
        <el-form-item label="missionIntro任务简介" prop="missionIntroduction">
          <el-input v-model="mission" placeholder="输入累计充值金额" disabled/>
        </el-form-item>
        <el-form-item label="活跃" prop="status" style="min-width: 290px">
          <template #default="scope">
            <el-switch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
            ></el-switch>
          </template>
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
            <el-form-item label="Rule Description">
              <el-input type="textarea" rows="5" cols="100" v-model="settingsForm.ruleDescriptionTranslated"
                        prop="ruleDescriptionTranslated"/>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Participating Members" disabled="true">
              <el-checkbox disabled
                           label="Select All"
                           v-model="data.selectAll"
                           @change="handleCheckAllSettingsChange"/>
              <el-checkbox-group v-model="data.participants" disabled>
                <el-checkbox v-for="i in activity_quest_participating_members"
                             :label="i.label"
                             size="large"
                             style="width: auto">
                  {{ i.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Event Collection Entrance" prop="eventCollection">
              <el-checkbox-group disabled
                                 v-model="checkedEventCollection">
                <el-checkbox v-for="ec in eventCollection" :key="ec.id" :label="ec">
                  {{ ec.questSettingsValue }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="More Collection Restrictions">
              <el-checkbox-group
                  v-model="checkedCollectionRestriction">
                <el-checkbox v-for="cc in collectionRestriction" :key="cc.id" :label="cc">
                  {{ cc.questSettingsValue }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Homepage pop-up prompt">
              <el-switch v-model="settingsForm.homePagePromptSwitch"
                         :active-value="1"
                         :inactive-value="0"/>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Audit Multiple">
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
            <el-form-item label="Audit Restricted Platform">
              <el-radio-group v-model="settingsForm.auditRestrictedPlatformsSwitch" class="ml-4">
                <el-radio :label="0" size="large">Not Limited</el-radio>
                <el-radio :label="1" size="large">Only for the following checked platforms</el-radio>
              </el-radio-group>
              <el-col>
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
              </el-col>
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

<script name="weeklyTask" setup>

import {
  questRepeatList,
  getQuestRepeatList,
  updateQuestRepeat,
  addQuestRepeat,
  deleteQuestRepeat,
  changeQuestRepeatStatus,
  getPlatformList,
  gameInfoList,
  getSettings,
  updateSettings,
  getGamePlatformGameTypeList
} from "@/api/activity/questRepeat";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {useRouter} from "vue-router";
import {listAllType} from "@/api/game/type";

const router = useRouter();
const {proxy} = getCurrentInstance();

const {
  activity_quest_currency
  , activity_quest_task_classification
  , activity_quest_mission_objectives
  , pay_online_recharge_category
} = proxy.useDict(
    'activity_quest_currency'
    , 'activity_quest_task_classification'
    , 'activity_quest_mission_objectives'
    , 'pay_online_recharge_category');
const checkedCurrency = ref([]);
const selectAll = ref(true);
const platformTypeList = ref([])
const gameTypeList = ref([])
const gameList = ref([])
const mission = ref('')


const questRepeatLists = ref([]);
const ids = ref([]);
const id = ref('');
const rewards = ref('');
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

// const currencyCollection = ref([]);
// const checkedCurrency = ref([]);
const settingsOpen = ref(false);
const settingsId = ref(3);
const eventCollection = ref([]);
const checkedEventCollection = ref([]);
const collectionRestriction = ref([]);
const checkedCollectionRestriction = ref([]);

const data = reactive({

      showAddButton: false,
      showEditButton: false,
      /** 查询参数 query params*/
      queryParams: {
        questRepeatType: 2,
        pageNum: 1,
        pageSize: 20,
        type: null,
        effect: null,
        taskCode: null,
        tipBubbleSwitch: null
      },

      auditParams: {
        id:3
      },

      settingsRules: {
        ruleDescriptionTranslated:
            [
              {required: true, message: 'Description Should not be empty', trigger: 'blur'}
            ],
        auditMultiplier:
            [
              {required: true, message: 'Audit Multiplier Should not be empty', trigger: 'blur'}
            ],
        taskDuration:
            [
              {required: true, message: 'Task Duration Should not be empty', trigger: 'blur'}
            ]
      },

      rules: {
        cumulativeRechargeAmount:
            [
              {required: true, message: '不能为空', trigger: 'blur'}
            ],
        rewardAmount:
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

      headers: {
        Authorization: 'Bearer ' + getToken()
      }
      ,
    })
;
const {queryParams, form, rules, headers, settingsRules, auditParams} = toRefs(data);

function handleGamePlatformGameTypeList() {
  getGamePlatformGameTypeList(data.auditParams).then(res => {
    data.auditRestrictedTabs = res.data
    data.auditRestrictedTabs = JSON.parse( data.auditRestrictedTabs.map( m => m.auditRestrictedPlatformsJson ) )

    data.auditRestrictedTabs = data.auditRestrictedTabs.auditRestrictedPlatform
    console.log( JSON.stringify(data.auditRestrictedTabs) + " 23232" )
  })
}

function handleEffectChange(row) {
  let text = row.tipBubbleSwitch === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.taskClassification + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const status = changeQuestRepeatStatus(row.id, row.status);
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
  questRepeatList(queryParams.value).then(response => {
    questRepeatLists.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    currency: null,
    currencyAll: null,
    selectAll: null,
    checkedCurrency: activity_quest_currency.value.slice(0, 1),
    taskClassification: activity_quest_task_classification.value[0].label,
    missionObjectives: activity_quest_mission_objectives.value[0].label,
    accumulatedRechargeSource: pay_online_recharge_category,
    gameType: null,
    platformType: null,
    gameName: null,
    cumulativeRechargeAmount: null,
    rewardActivity: null,
    rewardAmount: null,
    missionIntroduction: null,
    status: null
  }
  proxy.resetForm('questRepeatRef');
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
  selectAll.value = true;
  handleCheckAllChange();
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['questRepeatRef'].validate(async valid => {
    if (valid) {
      let params = {
      }
      console.log("1121 " + form.value.missionObjectives)

      if (form.value.missionObjectives === '累计充值') {
        console.log("aa " + form.value.accumulatedRechargeSource.map((item) => item.label).join(','))
        params = {
          accumulatedRechargeSource: form.value.accumulatedRechargeSource.map((item) => item.label).join(','),
          platformId: null,
          gameTypeId: null,
          gameId: null,

          id: checkedCurrency.value.id,
          questRepeatType: 2,
          questSettingsId: 3,
          // taskCurrency : checkedCurrency.value.toString(),
          taskCurrency: checkedCurrency.value.map((item) => item).join(','),
          taskClassification: form.value.taskClassification,
          rewardAmount: form.value.rewardAmount,
          missionObjectives: form.value.missionObjectives,
          cumulativeRechargeAmount: form.value.cumulativeRechargeAmount,
          rewardActivity: form.value.rewardActivity,
          status: form.value.status,
        }
      } else {
        params = {
          accumulatedRechargeSource: null,
          platformId: form.value.platformType,
          gameTypeId: form.value.gameType,
          gameId: form.value.gameType,

          id: checkedCurrency.value.id,
          questRepeatType: 2,
          questSettingsId: 3,
          // taskCurrency : checkedCurrency.value.toString(),
          taskCurrency: checkedCurrency.value.map((item) => item).join(','),
          taskClassification: form.value.taskClassification,
          rewardAmount: form.value.rewardAmount,
          missionObjectives: form.value.missionObjectives,
          cumulativeRechargeAmount: form.value.cumulativeRechargeAmount,
          rewardActivity: form.value.rewardActivity,
          status: form.value.status,
        }
      }

      if (form.value.id != null) {
        updateQuestRepeat(params).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
        })
      } else {
        addQuestRepeat(params).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
        })
      }
      getList()
    }
  })
}

/** handle update data */
function handleUpdate(row) {
  reset()
  const id = row.id || this.ids
  getQuestRepeatList(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '编辑每日任务'
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
    return deleteQuestRepeat(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

function handleCheckAllChange() {
  if (selectAll.value) {
    checkedCurrency.value = activity_quest_currency.value.map(kek => kek.label)
  } else {
    checkedCurrency.value = [];
  }
}

function handleCheckedCurrencyChange() {
  selectAll.value = checkedCurrency.value.length === activity_quest_currency.value.length;
}

function handleComposeMission() {
  if (!isNullOrEmpty(form.value.cumulativeRechargeAmount) && !isNullOrEmpty(form.value.rewardAmount)) {
    mission.value = "累计充值" + form.value.cumulativeRechargeAmount + "，奖励" + form.value.rewardAmount;
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

    // handleCheckedSettingsCurrencyChange();
    settingsOpen.value = true;
  });
}

function populateCheckList(collection, checkedList, key) {
  collection.value = settingsForm.value.questSettingsOtherList
      .filter(q => q.questSettingsCode === key)
  checkedList.value = settingsForm.value.questSettingsOtherList
      .filter(k => k.questSettingsCode === key && k.status === 1)
}

/** handle update data */
function submitSettings() {
  proxy.$refs['settingsRef'].validate(async valid => {
    if (valid) {
      const params = {
        id: settingsId.value,
        ruleDescriptionTranslationSwitch: settingsForm.value.ruleDescriptionTranslationSwitch,
        ruleDescription: settingsForm.value.ruleDescription,
        ruleDescriptionTranslated: settingsForm.value.ruleDescriptionTranslated,
        auditRestrictedPlatformsSwitch: settingsForm.value.auditRestrictedPlatformsSwitch,
        auditRestrictedPlatformsJson: settingsForm.value.auditRestrictedPlatformsJson,
        homePagePromptSwitch: settingsForm.value.homePagePromptSwitch ? 1 : 0,
        auditMultiplier: settingsForm.value.auditMultiplier,
        questSettingsOtherList: checkedEventCollection.value.concat(checkedCollectionRestriction.value)
      }
      updateSettings(params).then(() => {
        proxy.$modal.msgSuccess('修改成功')
        settingsOpen.value = false;
        getList()
      })
    }
  })
}

function handleCheckAllSettingsChange() {
  checkedCurrency.value = selectAll.value ? currencyCollection.value : [];
}

function handleCheckedSettingsCurrencyChange() {
  selectAll.value = checkedCurrency.value.length === currencyCollection.value.length;
}

handleGamePlatformGameTypeList();
getGameTypeList();
getGamePlatformList();
getGameList();
getList();

</script>

<style>
</style>
