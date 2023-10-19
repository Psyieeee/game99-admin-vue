<template>
  <div class="app-container">
    <el-form label="Activity Mission" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams"
             label-width="98px">
      <el-form-item prop="现状" style="min-width: 50px">
        <el-input
            v-model="queryParams.name"
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
            v-hasPermi="['repeat:activity:add']"
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
            v-hasPermi="['repeat:activity:remove']"
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
            v-hasPermi="['repeat:activity:settings']"
            icon="gear"
            plain
            size="small"
            type="primary"
            @click="handleSettings"
        >Settings
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="activityMissionLists" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="ID" min-width="70" prop="id"/>
      <el-table-column align="center" label="Activity Name" min-width="180" prop="name"/>
      <el-table-column align="center" label="Required Activity Level" min-width="180" prop="requiredActivityLevel"/>
      <el-table-column align="center" label="Reward Type" min-width="180" prop="rewardType"/>
      <el-table-column align="center" label="Reward Amount" min-width="180" prop="rewardAmount"/>
      <el-table-column align="center" min-width="150" label="Active" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Operator" min-width="180" prop="updateBy"/>
      <el-table-column align="center" label="Operating Time" min-width="180" prop="updateDatetime"/>
      <el-table-column align="center" label="Description" min-width="180" prop="description"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['repeat:activity:update']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['repeat:activity:remove']"
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

    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="500px">
      <el-form :inline="true" ref="ref" :model="form" :rules="rules" label-width="200px">
        <el-col>
          <el-form-item label="Name" prop="name" >
            <el-input
                v-model="form.name"
                clearable
                placeholder="name"
            />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="Required Activity Level" prop="requiredActivityLevel" >
            <el-input
              v-model="form.requiredActivityLevel"
              clearable
              placeholder="Please enter Required Activity Level"
          />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="Reward Type" prop="rewardType" >
            <el-input
                v-model="form.rewardType"
                clearable
                placeholder="Enter Reward Type"
            />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="Reward Amount" prop="rewardAmount" >
            <el-input
                v-model="form.rewardAmount"
                clearable
                placeholder="Enter Reward Amount"
            />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="Status" prop="status" style="min-width: 290px">
          <template #default="scope">
            <el-switch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
            ></el-switch>
          </template>
        </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="Description" prop="description" >
          <el-input v-model="form.description" type="textarea" placeholder="Description" :rows="3" />
        </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>


    <el-dialog v-model="settingsOpen" :close-on-click-modal="false" title="汪跃度设署" append-to-body
               style="padding-bottom: 20px"
               width="600px">
      <el-form :inline="true" ref="settingsRef" :model="settingsForm" :rules="rules" label-width="270px">
          <el-col :span="24">
            <el-form-item label="Circular Way" prop="reset"
                          style="min-width: 290px">
              <template #default="scope">
                <el-select v-model="form.region" placeholder="please select your zone">
                  <el-option label="Mission Cycle (每日周期（重置为 0:00）" :value="0" />
                  <el-option label="Weekly Cycle (每周循环（周一0:00重置)" :value="1" />
                </el-select>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Repeat Chest Open Cycle Time" prop="repeatOpenSwitch" style="min-width: 290px">
              <template #default="scope">
                <el-switch
                    v-model="settingsForm.repeatOpenSwitch"
                    :active-value="1"
                    :inactive-value="0"
                ></el-switch>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Audit Multiplier" prop="auditMultiplier" style="min-width: 290px">
              <el-input
                  v-model="settingsForm.auditMultiplier"
                  clearable
                  placeholder="enter audit multiplier"
                  type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Audit Restricted Platform" prop="auditPlatformSwitch" style="min-width: 290px">
              <template #default="scope">
                <el-switch
                    v-model="settingsForm.auditPlatformSwitch"
                    :active-value="1"
                    :inactive-value="0"
                ></el-switch>
              </template>
            </el-form-item>
          </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSettingsForm">确 定</el-button>
        <el-button @click="settingsOpen=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="weeklyTasks" setup>

import {
  activityMissionList,
  getActivityMissionList,
  deleteActivityMission,
  addActivityMission,
  updateActivityMission,
  changeMissionActivityStatus,
  getMissionActivitySettings,
  updateMissionActivitySettings
} from "@/api/activity/activityMission";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {useRouter} from "vue-router";

const router = useRouter();

const activityMissionLists = ref([]);
const ids = ref([]);
const id = ref('');
const status = ref(1);
const updateTime = ref('');
const updateBy = ref('');
const title = ref('');
const total = ref(0);
const open = ref(false);
const settingsOpen = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);
const {proxy} = getCurrentInstance();

const data = reactive({

  showAddButton: false,
  showEditButton: false,
  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    name: null,
  },

  settingsForm: {
    reset: null,
    repeatOpenSwitch: null,
    auditMultiplier: null,
    auditPlatformSwitch: null,
    auditPlatformRestricted: null
  },

  /** 表单参数 form parameter*/
  form: {},

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

});
const {queryParams, settingsForm, form, rules, headers} = toRefs(data);

function handleEffectChange(row) {
  let text = row.status === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const status = changeMissionActivityStatus(row.id, row.status);
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

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  activityMissionList(queryParams.value).then(response => {
    console.log(response.data)
    activityMissionLists.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    name: null,
    requiredActivityLevel: null,
    rewardType: null,
    rewardAmount: null
  }
  proxy.resetForm('ref');
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
  title.value = '添加活动任务'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['ref'].validate(async valid => {
    if (valid) {
      const params = {
        name: form.value.name,
        missionSettingsId: 5,
        requiredActivityLevel: form.value.requiredActivityLevel,
        rewardType: form.value.rewardType,
        rewardAmount: form.value.rewardAmount,
        status: 0,
        description: form.value.description

      }
      if (form.value.id != null) {
        updateActivityMission(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addActivityMission(params).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function submitSettingsForm() {
  proxy.$refs['settingsRef'].validate(async valid => {
    if (valid) {
      console.log( settingsForm.value )
      const params = {
        reset: settingsForm.value.reset,
        repeatOpenSwitch: settingsForm.value.repeatOpenSwitch,
        auditMultiplier: settingsForm.value.auditMultiplier,
        auditPlatformSwitch: settingsForm.value.auditPlatformSwitch,
        missionSettingsId: 'ACTIVITY'
      }
      updateMissionActivitySettings(params).then(response => {
        proxy.$modal.msgSuccess('修改成功')
        settingsOpen.value = false
        getList()
      })
    }
  })
}

/** handle update data */
function handleUpdate(row) {
  reset()
  const id = row.id || this.ids
  getActivityMissionList(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改活动任务'
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
    return deleteActivityMission(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

function handleSettings() {
  getMissionActivitySettings(id).then(response => {
    settingsForm.value = response.data
    settingsOpen.value = true;
  })
}


getList()
</script>

<style>
</style>
