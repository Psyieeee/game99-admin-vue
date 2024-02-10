<template>
  <div class="app-container">
    <el-form label="活动任务" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams"
             label-width="98px">
      <el-form-item prop="活动名称" style="min-width: 50px">
        <el-input
            v-model="queryParams.name"
            clearable
            placeholder="活动名称"
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
            v-hasPermi="['mission:activity:add']"
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
            v-hasPermi="['mission:activity:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="activityMissionLists" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="活动名称" min-width="180" prop="name"/>
      <el-table-column :show-overflow-tooltip="true" align="center" label="网址" min-width="180" prop="icon">
        <template #default="scope">
          <el-image :src="scope.row.icon" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="登录领取积分" min-width="180" prop="completionCount"/>
      <el-table-column align="center" label="任务重复类型" min-width="180" prop="missionRepeatTypeTranslated"/>
      <el-table-column align="center" label="奖励金额" min-width="180" prop="reward"/>
      <el-table-column align="center" label="奖励类型" min-width="180" prop="missionRewardTypeTranslated"/>
      <el-table-column align="center" label="倍数" min-width="180" prop="multiplier"/>
      <el-table-column align="center" min-width="150" label="状态" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" min-width="180" prop="sort"/>
      <el-table-column align="center" label="说明" min-width="180" prop="description"/>
      <el-table-column align="center" label="操作员" min-width="180" prop="updateBy"/>
      <el-table-column align="center" label="运行时间" min-width="180" prop="updateTime"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['mission:activity:update']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['mission:activity:remove']"
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
               width="600px">
      <el-form ref="ref" :model="form" :rules="rules" label-width="200px">
        <el-form-item label="名称" prop="name">
          <el-input
              v-model="form.name"
              clearable
              placeholder="名称"
          />
        </el-form-item>
        <el-form-item label="登录领取积分" prop="completionCount">
          <el-input-number
              v-model="form.completionCount"
              clearable
              placeholder="插入完成计数"
          />
        </el-form-item>
        <el-form-item label="任务重复类型" prop="missionRepeatType">
          <el-select v-model="form.missionRepeatType" clearable placeholder="游戏平台">
            <el-option
                v-for="dict in missionRepeatTypeList"
                :key="dict.name"
                :label="dict.translatedName"
                :value="dict.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="奖励金额" prop="reward">
          <el-input-number
              v-model="form.reward"
              clearable
              placeholder="输入奖励金额"
          />
        </el-form-item>
        <el-form-item label="任务分类" prop="rewardType" style="min-width: 290px">
          <el-select v-model="form.rewardType" placeholder="任务分类" clearable>
            <el-option
                v-for="dict in rewardTypeList"
                :key="dict.name"
                :label="dict.translatedName"
                :value="dict.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="倍数" prop="multiplier" v-if="form.rewardType === 'ACCOUNT'" >
          <el-input-number
              precision="2"
              step="0.5"
              value-on-clear=0

              v-model="form.multiplier"
              clearable
              placeholder="输入乘数"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number type="number" v-model="form.sort" placeholder="请输入排序"/>
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="说明" :rows="3"/>
        </el-form-item>
        <el-form-item label="图片">
          <div class="centered-form">
            <el-upload
                ref="upload"
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
                :file-list="fileList"
                :auto-upload="false"

                class="upload-demo"
                drag
                name="file"
            >
              <div class="el-upload__text">Drop file here or <em>点击上传</em></div>
              <div class="el-upload__tip">
                最大文件大小为 100 MB
              </div>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="activityTasks" setup>

import {
  activityMissionList,
  getMissionRepeatTypeList,
  getActivityMissionList,
  deleteActivityMission,
  addActivityMission,
  updateActivityMission,
  changeMissionActivityStatus,
  getMissionRewardTypeList
} from "@/api/activity/activityMission";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {useRouter} from "vue-router";
import {fileUpload} from "@/api/activity/activityQuest";

const router = useRouter();

const activityMissionLists = ref([]);
const missionRepeatTypeList = ref([]);
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
const formData = new FormData();
const fileList = ref([])
const rewardTypeList = ref([]);
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

  /** 表单参数 form parameter*/
  form: {},

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

  rules: {
    name:
        [
          {required: true, message: '名称为必填项', trigger: 'blur'}
        ],
    completionCount:
        [
          {required: true, message: '完成次数', trigger: 'blur'}
        ],
    missionRepeatType:
        [
          {required: true, message: '任务重复类型为必填项', trigger: 'blur'}
        ],
    reward:
        [
          {required: true, message: '奖励为必填项', trigger: 'blur'}
        ],
    rewardType:
        [
          {required: true, message: '奖励类型为必填项', trigger: 'blur'}
        ],
    sort:
        [
          {required: true, message: '排序为必填项', trigger: 'blur'}
        ]
  }
});
const {queryParams, form, rules, headers} = toRefs(data);

function beforeAvatarUpload(file) {
  const fileExtension = file.name.split('.')[1]
  const isLt2M = file.size / 1024 / 1024 < 100
  if (fileExtension !== 'jpg' &&
      fileExtension !== 'jpeg' &&
      fileExtension !== 'bmp' &&
      fileExtension !== 'png') {
    proxy.$modal.msgError('图片类型错误')
    return false;
  } else if (!isLt2M) {
    proxy.$modal.msgError('上传模板大小不能超过100MB!')
    return false;
  } else {
    proxy.$modal.msgSuccess('上传成功')
  }
}

function handleRemove() {
  form.value.icon = null;
  clearUpload()
  proxy.$modal.msgSuccess('移除成功')
}

function uploadSuccess(res) {
  form.value.icon = res.data
}

function selectFile(file) {
  formData.append("file", file.raw)
  formData.append("name", file.name)
}

function uploadFalse() {
  proxy.$modal.msgError(' 上传文件失败')
}

function uploadExceed() {
  proxy.$modal.msgError('只能选择一个文件，如果要更改，请退出并重新选择')
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
  // proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
  proxy.$confirm('确认要' + text + '吗?', '警告', {
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
    getList()
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
  activityMissionList(queryParams.value).then(response => {
    activityMissionLists.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

function getRepeatTypeList() {
  getMissionRepeatTypeList().then(response => {
    loading.value = false;
    missionRepeatTypeList.value = response.data;
  });
}

function getRewardTypeList() {
  getMissionRewardTypeList().then(res => {
    rewardTypeList.value = res.data
  })
}

// 表单重置
function reset() {
  form.value = {
    name: null,
    requiredActivityLevel: null,
    completionCount: null,
    missionRepeatType: null,
    rewardType: null,
    multiplier: 0,
    reward: null,
    sort: null
  }

  clearUpload();
  proxy.resetForm('ref');
}

function clearUpload() {
  fileList.value = []
  formData.delete("file")
  formData.delete("name")
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
        missionSettingsId: 'ACTIVITY',
        requiredActivityLevel: form.value.requiredActivityLevel,
        completionCount: form.value.completionCount,
        missionRepeatType: form.value.missionRepeatType,
        rewardType: form.value.rewardType,
        multiplier: getMultiplier(),
        reward: form.value.reward,
        status: 0,
        sort: form.value.sort,
        description: form.value.description,
      }

      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => {
          // console.log("res.data  " + res.data)
          if (form.value.id != null) {
            form.value.icon = res.data
          } else {
            params.icon = res.data
          }
        });
      }

      if (form.value.id != null) {
        form.value.multiplier = getMultiplier();
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

function getMultiplier(){
  return  form.value.rewardType === 'ACCOUNT'
  && form.value.multiplier !== undefined
      ? form.value.multiplier
      : 0;
}

/** handle update data */
function handleUpdate(row) {
  reset()
  const id = row.id || this.ids
  getActivityMissionList(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改活动任务'
    form.value.icon = null;
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

getList();
getRepeatTypeList();
getRewardTypeList();

</script>

<style>
</style>
