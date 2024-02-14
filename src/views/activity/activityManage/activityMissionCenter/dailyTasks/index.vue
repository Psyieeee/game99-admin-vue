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
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="missionRepeatLists" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <!--      <el-table-column align="center" label="任务货币" min-width="180" prop="taskCurrency"/>-->
      <el-table-column :show-overflow-tooltip="true" align="center" label="图标" min-width="180" prop="icon">
        <template #default="scope">
          <el-image :src="scope.row.icon" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="任务分类" min-width="180" prop="taskClassificationTranslated"/>
      <el-table-column align="center" label="目标任务量" min-width="180" prop="completionCount"/>
      <el-table-column align="center" label="活动奖励" min-width="180" prop="rewardActivity"/>
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
      <el-table-column align="center" label="操作员" min-width="180" prop="createdBy"/>
      <el-table-column align="center" label="运行时间" min-width="180" prop="updateTime"/>
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
        <el-form-item label="任务分类" prop="taskClassification" style="min-width: 290px">
          <el-select v-model="form.taskClassification" placeholder="任务分类" clearable>
            <el-option
                v-for="dict in taskClassificationList"
                :key="dict.name"
                :label="dict.translatedName"
                :value="dict.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="登录固定次数" prop="completionCount">
          <el-input-number type="number" v-model="form.completionCount" placeholder="请输入任务目标量"/>
        </el-form-item>
        <el-form-item label="活动奖励" prop="rewardActivity">
          <el-input-number type="number" v-model="form.rewardActivity" placeholder="请输入活动奖励"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number type="number" v-model="form.sort" placeholder="请输入排序"/>
        </el-form-item>
        <el-form-item label="说明代码" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="说明代码" :rows="3"/>
        </el-form-item>
        <el-form-item label="图片">
          <!--          :action="uploadFileUrl"-->
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
      <template #footer>
        <div>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </template>
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
  getMissionTrigger
} from "@/api/activity/missionRepeat";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {useRouter} from "vue-router";
import {url} from "@/utils/url";
import {fileUpload} from "@/api/activity/activityQuest";

const router = useRouter();
const {proxy} = getCurrentInstance();

const missionRepeatLists = ref([]);
const ids = ref([]);
const status = ref(1);
const title = ref('');
const total = ref(0);
const open = ref(false);

const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);
const taskClassificationList = ref([]);
const formData = new FormData();
const fileList = ref([])
const data = reactive({
  /** 查询参数 query params*/
  auditRestrictedTabs: [],

  queryParams: {
    missionSettingsId: 'DAILY',
    pageNum: 1,
    pageSize: 20,
    type: null,
    effect: null,
    taskCode: null
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
        ],
    sort:
        [
          {required: true, message: '排序为必填项', trigger: 'blur'}
        ]
  },

  /** 表单参数 form parameter*/
  form: {},

  auditParams: {
    id: 'DAILY',
  },

  headers: {
    Authorization: 'Bearer ' + getToken()
  }
  ,
});
const {queryParams, form, rules, headers} = toRefs(data);


function getMissionTriggerList() {
  getMissionTrigger().then(res => {
    taskClassificationList.value = res.data
  })
}

function handleEffectChange( row ) {
  proxy.$confirm('确认要吗?', '提示', {
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
    proxy.$modal.msgSuccess('任务更新')
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
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    completionCount: null,
    rewardActivity: null,
    reward: null,
    missionIntroduction: null,
    status: null,
    sort: null,
  }
  proxy.resetForm('missionRepeatRef');
  clearUpload();
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
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['missionRepeatRef'].validate(async valid => {
    if (valid) {
      const params = {
        name: form.value.name,
        id: form.value.id,
        taskClassification: form.value.taskClassification,
        missionRepeatType: 'DAILY',
        missionSettingsId: 'DAILY',
        reward: form.value.reward,
        completionCount: form.value.completionCount,
        missionObjectives: form.value.missionObjectives,
        cumulativeRechargeAmount: form.value.cumulativeRechargeAmount,
        rewardActivity: form.value.rewardActivity,
        status: 0,
        sort: form.value.sort,
        description: form.value.description,
        icon: form.value.icon !== null ? form.value.icon : null
      }

      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => {
          console.log("res.data  " + res.data)
          if (form.value.id != null) {
            form.value.icon = res.data

          } else {
            params.icon = res.data
          }
        });
      }

      if (form.value.id != null) {
        console.log("form ", form.value)
        updateMissionRepeat(form.value).then(() => {
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
  if (fileExtension !== 'jpeg' &&
      fileExtension !== 'jpg' &&
      fileExtension !== 'png' &&
      fileExtension !== 'bmp') {
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

function clearUpload() {
  fileList.value = []
  formData.delete("file")
  formData.delete("name")
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

/** handle update data */
function handleUpdate(row) {
  reset()
  const id = row.id || this.ids
  getMissionRepeatList(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '编辑日常积分任务量'
    form.value.icon = null;
  })
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '提示', {
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

getMissionTriggerList();
getList();

</script>

<style>
.centered-form {
  //margin-left: 50px; max-width: 200px;
}
</style>
