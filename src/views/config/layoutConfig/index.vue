<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" >
      <el-form-item label="代码" prop="code">
        <el-input
            v-model="queryParams.code"
            placeholder="代码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名字" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="名字"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期" prop="createTime">
        <el-date-picker type="datetimerange"
                        v-model="createTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['config:layoutConfig:add']"
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
            v-hasPermi="['config:layoutConfig:delete']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="代码" min-width="180" prop="code"/>
      <el-table-column align="center" label="名字" min-width="180" prop="name"/>
      <el-table-column align="center" label="内容" min-width="180" prop="content"/>
      <el-table-column align="center" label="图像" prop="image">
        <template #default="scope" >
          <a
              v-if="scope.row.image !== ''"
              :href="scope.row.image"
              style="color: #409eff; font-size: 12px"
              target="_blank"
          >
            <el-image
                style="height: 50px;"
                :src="scope.row.image"
                fit="contain"
                :href="scope.row.image"
                target="_blank"
            />
          </a>
        </template>
      </el-table-column>
      <el-table-column label="地位" prop="status" align="center" width="180">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @click="toggleSwitch(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="装置" align="center" prop="device" :formatter="formatterDevice"/>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="180">
        <template #default="scope">{{new Date(scope.row.createTime).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}}</template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['config:layoutConfig:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['config:layoutConfig:delete']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="600px">
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="代码" prop="code">
          <el-select v-model="queryParams.type" placeholder="类型" clearable>
            <el-option
                v-for="type in types"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="姓名"/>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" placeholder="内容" type="textarea"/>
        </el-form-item>
        <el-form-item label="装置" prop="device" width="100px">
          <el-select v-model="form.device" placeholder="选择设备" width="100px">
            <el-option label="网站" :value=0></el-option>
            <el-option label="手机登录" :value=1></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-upload
              v-model:file-list="upload"
              :auto-upload="false"
              :limit="1"
              :multiple="false"
              :on-change="selectFile"
              :on-error="uploadFalse"
              :on-exceed="handleExceed"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="uploadSuccess"
              class="upload-demo"
              drag
              name="countryIcon"
          >
            <div class="el-upload__text">Drop file here or <em>点击上传</em></div>
            <div class="el-upload__tip">
              最大文件大小为 100 MB
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="地位" prop="status">
          <el-switch v-model="form.status"
                     :active-value=1
                     :inactive-value=0
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>

import {
  listRecord,
  deleteRecord,
  addRecord,
  updateRecord,
  getRecord,
  changeStatus,
  fileUpload
} from "@/api/config/layoutConfig";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getDefaultTime} from "@/utils/dateUtils.js";
const {proxy} = getCurrentInstance();
const showSearch = ref(true);
const recordList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const upload = ref([]);
const formData = new FormData();
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    code: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    name: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    content: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ]
  },

  createTime: [],
});
const {queryParams, form, rules, createTime} = toRefs(data);

const types = ref([
  {
    value: 'BIND_PHONE_BONUS',
    label: '绑定手机'
  },
  {
    value: 'LAYOUT_LOGO',
    label: '布局标志'
  }
])

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  listRecord(proxy.addDateRange(queryParams.value, createTime.value)).then(response => {
    recordList.value = response.data;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    code: null,
    name: null,
    content: null,
    status: 1
  }
  clearUpload();
  proxy.resetForm('queryForm');
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加记录'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['queryForm'].validate(async valid => {
    if (valid) {
      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => {
          form.value.image = res.data
        });
      }
      if (form.value.id != null) {
        updateRecord(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addRecord(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** handle update data */
function handleUpdate(row) {
  clearUpload()
  getRecord(row.id).then(response => {
    form.value = response.data;
  });
  open.value = true
  title.value = '更新记录'
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteRecord(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}


function toggleSwitch (row) {
  const text = row.status === 1 ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    let status;
    loading.value = true
    status = changeStatus(row.id, row.status);
    if (status) {
      return status
    }
  }).then(() => {
    loading.value = false
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    loading.value = false
    row.status = row.status === 0 ? 1 : 0
  })
}

function handleQuery() {
  getList()
}

function resetQuery() {
  createTime.value = []
  proxy.resetForm('queryRef')
  handleQuery()
  loading.value = false
}

function selectFile(file) {
  //this.fileToUpload = file;
  formData.append("file", file.raw)
  formData.append("name", file.name)
}

function handleRemove() {
  proxy.$modal.msgSuccess('移除成功')
}

function uploadFalse() {
  proxy.$modal.msgError('上传失败')
}

function uploadSuccess() {
  proxy.$modal.msgSuccess('上传文件成功');
  getList()
}

function handleExceed() {
  proxy.$modal.msgError('只能选择一个文件，如果要更改，请退出并重新选择。')
}

function clearUpload(){
  upload.value = [];
  formData.delete("file")
  formData.delete("name")
}

function handlePreview(file) {
  console.info(file.response.status)
  if (file.response.status) {
    proxy.$modal.msgSuccess('此文件导入成功')
  } else {
    proxy.$modal.msgError('此文件导入失败')
  }
}

function formatterDevice(row) {
  switch (row.device) {
    case 0 :
      return "网站";
    case 1 :
      return "手机登录";
    default  :
      return "";
  }
}

getList()
</script>
