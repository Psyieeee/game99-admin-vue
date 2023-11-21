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
            v-hasPermi="['mission:newbie:add']"
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
            v-hasPermi="['mission:newbie:delete']"
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
      <el-table-column align="center" label="Completion Points" min-width="180" prop="completionCount"/>
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
      <el-table-column :show-overflow-tooltip="true" align="center" label="URL" min-width="180" prop="icon">
        <template #default="scope">
          <div>
            <a
                v-if="scope.row.icon !== ''"
                :href="scope.row.icon"
                style="color: #409eff; font-size: 12px"
                target="_blank"
            >{{ scope.row.icon }}
            </a>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Description" min-width="180" prop="description"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['mission:newbie:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['mission:newbie:delete']"
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
               width="550px">
      <el-form ref="newbieBenefitsRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="任务分类" prop="taskConditions" >
          <el-select v-model="form.taskConditions" placeholder="请输入奖励金额">
            <el-option label="BET" value="BET" />
            <el-option label="INVITE" value="INVITE" />
            <el-option label="RECHARGE" value="RECHARGE" />
            <el-option label="SIGN UP" value="SIGN_UP" />
          </el-select>
        </el-form-item>
        <el-form-item label="reward奖励金额" prop="reward">
          <el-input type="number" v-model="form.reward" placeholder="请输入奖励金额"/>
        </el-form-item>
        <el-form-item label="Completion Points" prop="completionCount">
          <el-input type="number" v-model="form.completionCount" placeholder="请输入奖励金额"/>
        </el-form-item>
        <el-form-item label="activity奖励活动" prop="rewardActivity">
          <el-input type="number" v-model="form.rewardActivity" placeholder="请输入奖励活动"/>
        </el-form-item>
        <el-form-item label="Status (On/Off)" prop="status">
          <template #default="scope">
            <el-switch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
            ></el-switch>
          </template>
        </el-form-item>
        <el-form-item label="Tip Bubble Switch" prop="tipBubble">
          <template #default="scope">
            <el-switch
                v-model="form.tipBubbleSwitch"
                :active-value="1"
                :inactive-value="0"
            ></el-switch>
          </template>
        </el-form-item>
        <el-form-item label="Mission Introduction" prop="missionIntroduction">
          <el-input v-model="mission" placeholder="输入累计充值金额" disabled/>
        </el-form-item>
        <el-form-item label="Description" prop="description" >
          <el-input v-model="form.description" type="textarea" placeholder="Description" :rows="3" />
        </el-form-item>
        <el-form-item>
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
                  {{ currency.missionSettingsValue }}
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
                  {{ ec.missionSettingsValue }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="More Collection Restrictions">
              <el-checkbox-group
                  v-model="checkedCollectionRestriction">
                <el-checkbox v-for="cc in collectionRestriction" :key="cc.id" :label="cc">
                  {{ cc.missionSettingsValue }}
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
//region
import {
    newbieListData,
    deleteNewbie,
    addMissionNewbie,
    updateMissionNewbie,
    changeNewbieStatus,
    changeNewbiesTipBubble,
    getMissionNewbie,
    getSettings,
    updateSettings,
    getMemberTierList,
    fileUpload
} from "@/api/activity/newbieBenefits";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {useRouter} from "vue-router";
import {url} from "@/utils/url";

const {proxy} = getCurrentInstance();

const settingsId = ref('NEWBIE');
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

const memberTier = ref([]);
const currencyCollection = ref([]);
const checkedCurrency = ref([]);
const eventCollection = ref([]);
const checkedEventCollection = ref([]);
const collectionRestriction = ref([]);
const checkedCollectionRestriction = ref([]);

const settingsForm = ref([]);
const selectAll = ref(true);
const formData = new FormData();
//endregion
const data = reactive({
  auditRestrictedTabs: [],
  memberTierList: [],
  selectedAudit: [],
  /** 查询参数 query params*/

  queryParams: {
    pageNum: 1,
    pageSize: 20,
    type: null,
    effect: null,
    taskCode: null,
    tipBubbleSwitch: null,
    status: null,
  },

  auditParams: {
    id: 'NEWBIE',
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
    reward:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
    rewardActivity:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
    completionCount:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
    taskConditions:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
    description:
        [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
  },

  uploadFileUrl: uploadAdvertisementUrl(),

  form: {},
  headers: {
    Authorization: 'Bearer ' + getToken()
  },
});
const { auditParams, uploadFileUrl, queryParams, form, settingsRules, rules, headers} = toRefs(data);

function handleMemberTierList() {
  getMemberTierList(data.auditParams).then(res => {
    data.memberTierList = res.data
  })
}

function uploadAdvertisementUrl() {
  return url.baseUrl + url.game99PlatformAdminWeb + "/missionNewbie/uploadFile";
}

function beforeAvatarUpload(file) {
  const fileExtension = file.name.split('.')[1]
  const isLt2M = file.size / 1024 / 1024 < 100
  if (fileExtension != 'jpg' &&
      fileExtension != 'png' &&
      fileExtension != 'bmp') {
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

function selectFile( file ) {
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
    completionCount: null,
    status: null,
    tipBubbleSwitch: null,
    missionIntroduction: null,
    upload: null
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
  getMissionNewbie(id).then(response => {
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
        missionSettingsId: 1,
        taskConditions: form.value.taskConditions,
        rewardActivity: form.value.rewardActivity,
        reward: form.value.reward,
        status: form.value.status,
        completionCount: form.value.completionCount,
        tipBubbleSwitch: form.value.tipBubbleSwitch,
        description: form.value.description,
        icon: null,
      }

      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => params.icon = res.data);
      }

      if (form.value.id != null) {
        updateMissionNewbie(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addMissionNewbie(params).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleSelectedAudit(){
  data.auditRestrictedTabs.forEach( x => {
        if( x.selectedCheckboxes != null ){
          x.platforms.forEach( f => {
            f.status = x.selectedCheckboxes.includes(f.platform) ?  '1' : '0'
          })
        }
      }
  )
}
/** handle update data */
function submitSettings() {
  proxy.$refs['settingsRef'].validate(async valid => {

    if (checkedCurrency.value.length <= 0) {
      proxy.$modal.msgError('Currency is required')
      return;
    }
    handleSelectedAudit();
    if (valid) {
      const params = {
        id: 'NEWBIE',
        ruleDescriptionTranslationSwitch: settingsForm.value.ruleDescriptionTranslationSwitch,
        ruleDescription: settingsForm.value.ruleDescription,
        ruleDescriptionTranslated: settingsForm.value.ruleDescriptionTranslated,
        collectionMethodSwitch: settingsForm.value.collectionMethodSwitch,
        taskDurationSwitch: settingsForm.value.taskDurationSwitch,
        taskDuration: settingsForm.value.taskDuration,
        withdrawalLimitReminderSwitch: settingsForm.value.withdrawalLimitReminderSwitch ? 1 : 0,
        auditRestrictedPlatformsSwitch: settingsForm.value.auditRestrictedPlatformsSwitch,
        auditMultiplier: settingsForm.value.auditMultiplier,
        missionSettingsOtherList: checkedCurrency.value.concat(checkedEventCollection.value).concat(checkedCollectionRestriction.value),
        auditRestrictedPlatformsJson: JSON.stringify( data.auditRestrictedTabs )
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
    populateCheckList(currencyCollection,     checkedCurrency,              'CURRENCY');
    populateCheckList(eventCollection,        checkedEventCollection,       'EVENT_COLLECTION_ENTRANCE');
    populateCheckList(collectionRestriction,  checkedCollectionRestriction, 'COLLECTION_RESTRICTION');
    data.auditRestrictedTabs = JSON.parse( response.data.auditRestrictedPlatformsJson  )

    handleCheckedSettingsCurrencyChange();
    settingsOpen.value = true;
  });
}

function populateCheckList(collection, checkedList, key) {
  collection.value = settingsForm.value.missionSettingsOtherList
      .filter(q => q.missionSettingsCode === key)
  checkedList.value = settingsForm.value.missionSettingsOtherList
      .filter(k => k.missionSettingsCode === key && k.status === 1)
}

function handleComposeMission() {
  mission.value = !isNullOrEmpty(form.value.taskConditions)
      ? form.value.taskConditions + ", 您可以收到"
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

handleMemberTierList();
getList();

</script>

<style>
</style>
