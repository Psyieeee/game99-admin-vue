<template>
  <div class="app-container">
    <el-form label="Newbie Benefits" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams"
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
            v-hasPermi="['mission:questNewbie:add']"
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
            v-hasPermi="['mission:questNewbie:delete']"
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
        >Newbie Settings
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"/>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="newbieBenefitsList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="ID" min-width="70" prop="id"/>
      <el-table-column align="center" label="Task Conditions" min-width="180" prop="taskConditions"/>
      <el-table-column align="center" label="Reward Amount" min-width="180" prop="reward"/>
      <el-table-column align="center" label="Reward Activity" min-width="180" prop="rewardActivity"/>
      <el-table-column align="center" label="Mission Introduction" min-width="180">
        <template #default="scope">
          {{ scope.row.taskConditions }}, 您可以收到{{ scope.row.rewardAmount }}
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="150" label="On/Off" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="150" label="Tip Bubble" prop="tipBubbleSwitch">
        <template #default="scope">
          <el-switch
              v-model="scope.row.tipBubbleSwitch"
              :active-value=1
              :inactive-value=0
              @change="handleTipBubbleChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Operator" min-width="180" prop="updateBy"/>
      <el-table-column align="center" label="Operating Time" min-width="180" prop="updateTime"/>
      <el-table-column align="center" label="Description" min-width="180" prop="description"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['mission:questNewbie:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['mission:questNewbie:delete']"
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

    <!--Add Newbie Benefits-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="700px">
      <el-form ref="newbieBenefitsRef" :model="form" :rules="rules" label-width="300px">
        <el-form-item label="任务分类" prop="taskConditions">
          <el-input v-model="form.taskConditions" placeholder="请输入奖励金额" @change="handleComposeMission"
                    :disabled="editTaskConditions"/>
        </el-form-item>
        <el-form-item label="reward奖励金额" prop="rewardAmount">
          <el-input type="number" v-model="form.reward" placeholder="请输入奖励金额"
                    @change="handleComposeMission"/>
        </el-form-item>
        <el-form-item label="activity奖励活动" prop="rewardActivity">
          <el-input type="number" v-model="form.rewardActivity" placeholder="请输入奖励活动"/>
        </el-form-item>

        <el-form-item label="活跃" prop="status">
          <template #default="scope">
            <el-switch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
            ></el-switch>
          </template>
        </el-form-item>
        <el-form-item label="活跃" prop="tipBubble">
          <template #default="scope">
            <el-switch
                v-model="form.tipBubble"
                :active-value="1"
                :inactive-value="0"
            ></el-switch>
          </template>
        </el-form-item>
        <el-form-item label="missionIntro任务简介" prop="missionIntroduction">
          <el-input v-model="mission" placeholder="输入累计充值金额" disabled/>
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
            <el-form-item label="Currency" prop="currency">
              <el-checkbox
                  v-model="selectAll"
                  @change="handleCheckAllSettingsChange"
              ><b>Check all</b>
              </el-checkbox>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label=" " prop="checkedCurrency">
              <el-checkbox-group
                  v-model="checkedCurrency"
                  @change="handleCheckedSettingsCurrencyChange">
                <el-checkbox v-for="currency in currencyCollection" :key="currency.id" :label="currency">
                  {{ currency.questSettingsValue }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>

          <el-col>
            <el-form-item label="Rule Description">
              <el-input type="textarea" rows="5" cols="100" v-model="settingsForm.ruleDescriptionTranslated"
                        prop="ruleDescriptionTranslated"/>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Collection Method">
              <el-radio-group v-model="settingsForm.collectionMethodSwitch" class="ml-4">
                <el-radio :label="0" size="large">Direct to Account</el-radio>
                <el-radio :label="1" size="large">Manual Collection</el-radio>
              </el-radio-group>
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
          <el-col>
            <el-form-item label="Task Duration">
              <el-radio-group v-model="settingsForm.taskDurationSwitch">
                <el-radio :label="0" size="large">Long</el-radio>
                <el-radio :label="1" size="large">Limited Time</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item prop="taskDuration" label=" ">
              <el-input
                  v-model="settingsForm.taskDuration"
                  class="w-50 m-2"
                  :disabled="settingsForm.taskDurationSwitch === 0"
                  size="large"
                  placeholder="Please Input Task Duration(days)"
                  type="number"
              />
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
            <el-form-item label="Withdrawal limit reminder">
              <el-switch
                  v-model="settingsForm.withdrawalLimitReminderSwitch"
                  :active-value="1"
                  :inactive-value="0"
              />
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

<script name="newbieBenefits" setup>
import {
  newbieListData,
  deleteNewbie,
  addQuestNewbie,
  updateQuestNewbie,
  changeNewbieStatus,
  getGamePlatformGameTypeList,
  changeNewbiesTipBubble,
  getQuestNewbie,
  getSettings,
  updateSettings
} from "@/api/activity/newbieBenefits";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {useRouter} from "vue-router";

const {proxy} = getCurrentInstance();
const {activity_quest_participating_members} = proxy.useDict('activity_quest_participating_members');

const settingsId = ref(1);
const router = useRouter();

const newbieBenefitsList = ref([]);

const ids = ref([]);
const id = ref('');
const status = ref('');
const mission = ref('')
const updateTime = ref('');
const updateBy = ref('');
const title = ref('');
const total = ref(0);
const open = ref(false);
const settingsOpen = ref(false);
const editTaskConditions = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);
const settingsLoading = ref(true);

const currencyCollection = ref([]);
const checkedCurrency = ref([]);
const eventCollection = ref([]);
const checkedEventCollection = ref([]);
const collectionRestriction = ref([]);
const checkedCollectionRestriction = ref([]);

const settingsForm = ref([]);
const selectAll = ref(true);
const data = reactive({
  auditRestrictedTabs: [], //TODO: to delete
  /** 查询参数 query params*/

  queryParams: {
    id:1,
    pageNum: 1,
    pageSize: 20,
    type: null,
    effect: null,
    taskCode: null,
    tipBubbleSwitch: null,
    status: null,
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

  form: {},
  headers: {
    Authorization: 'Bearer ' + getToken()
  },
});
const {queryParams, form, settingsRules, rules, headers} = toRefs(data);

function handleGamePlatformGameTypeList() {
  getGamePlatformGameTypeList(data.queryParams).then(res => {
    data.auditRestrictedTabs = res.data
    data.auditRestrictedTabs = JSON.parse( data.auditRestrictedTabs.map( m => m.auditRestrictedPlatformsJson ) )
    data.auditRestrictedTabs = data.auditRestrictedTabs.auditRestrictedPlatform
    console.log( data.auditRestrictedTabs.auditRestrictedPlatform )
  })
}

function handleEffectChange(row) {
  let text = row.status === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const status = changeNewbieStatus(row.id, row.status);
    loading.value = true
    if (status) {
      loading.value = false
      return status
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
  })
}

function handleTipBubbleChange(row) {
  let text = row.tipBubbleSwitch === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const tipBubbleSwitch = changeNewbiesTipBubble(row.id, row.tipBubbleSwitch);
    loading.value = true
    if (tipBubbleSwitch) {
      loading.value = false
      return tipBubbleSwitch
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
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
  newbieListData(queryParams.value).then(response => {
    newbieBenefitsList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    taskConditions: null,
    rewardActivity: null,
    rewardAmount: null,
    status: null,
    tipBubbleSwitch: null,
    missionIntroduction: null,
  }
  proxy.resetForm('newbieBenefitsRef');
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
  editTaskConditions.value = false;
  open.value = true
  title.value = '添加页脚'
}

function handleUpdate(row) {
  reset()
  editTaskConditions.value = true;
  const id = row.id || this.ids
  getQuestNewbie(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '添加页脚'
  })
  console.log(form.value + " @@@@@@")
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['newbieBenefitsRef'].validate(async valid => {
    if (valid) {
      const params = {
        questSettingsId: 1,
        taskConditions: form.value.taskConditions,
        rewardActivity: form.value.rewardActivity,
        reward: form.value.reward,
        status: form.value.status,
        tipBubbleSwitch: form.value.tipBubbleSwitch,
      }
      if (form.value.id != null) {
        updateQuestNewbie(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addQuestNewbie(params).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** handle update data */
function submitSettings() {
  proxy.$refs['settingsRef'].validate(async valid => {

    if (checkedCurrency.value.length <= 0) {
      proxy.$modal.msgError('Currency is required')
      return;
    }

    if (valid) {
      const params = {
        id: 1,
        ruleDescriptionTranslationSwitch: settingsForm.value.ruleDescriptionTranslationSwitch,
        ruleDescription: settingsForm.value.ruleDescription,
        ruleDescriptionTranslated: settingsForm.value.ruleDescriptionTranslated,
        collectionMethodSwitch: settingsForm.value.collectionMethodSwitch,
        taskDurationSwitch: settingsForm.value.taskDurationSwitch,
        taskDuration: settingsForm.value.taskDuration,
        withdrawalLimitReminderSwitch: settingsForm.value.withdrawalLimitReminderSwitch ? 1 : 0,
        auditRestrictedPlatformsSwitch: settingsForm.value.auditRestrictedPlatformsSwitch,
        auditMultiplier: settingsForm.value.auditMultiplier,
        questSettingsOtherList: checkedCurrency.value.concat(checkedEventCollection.value).concat(checkedCollectionRestriction.value)
      }
      updateSettings(params).then(() => {
        proxy.$modal.msgSuccess('修改成功')
        settingsOpen.value = false;
        getList()
      })
    }
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
    return deleteNewbie(idss)
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

    populateCheckList(currencyCollection, checkedCurrency, 'CURRENCY');
    populateCheckList(eventCollection, checkedEventCollection, 'EVENT_COLLECTION_ENTRANCE');
    populateCheckList(collectionRestriction, checkedCollectionRestriction, 'COLLECTION_RESTRICTION');

    handleCheckedSettingsCurrencyChange();
    settingsOpen.value = true;
  });
}

function populateCheckList(collection, checkedList, key) {
  collection.value = settingsForm.value.questSettingsOtherList
      .filter(q => q.questSettingsCode === key)
  checkedList.value = settingsForm.value.questSettingsOtherList
      .filter(k => k.questSettingsCode === key && k.status === 1)
}

function handleComposeMission() {
  mission.value = !isNullOrEmpty(form.value.taskConditions) && !isNullOrEmpty(form.value.reward)
      ? form.value.taskConditions + ", 您可以收到" + form.value.reward
      : "";
}

function isNullOrEmpty(value) {
  return value === null || value.trim() === '';
}

function handleCheckAllSettingsChange() {
  checkedCurrency.value = selectAll.value ? currencyCollection.value : [];
}

function handleCheckedSettingsCurrencyChange() {
  selectAll.value = checkedCurrency.value.length === currencyCollection.value.length;
}


handleGamePlatformGameTypeList();
getList();

</script>

<style>
</style>
