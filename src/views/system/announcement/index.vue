<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['announcement:content:add']"
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['announcement:content:delete']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete">删除
        </el-button>
      </el-col>
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column label="标题" prop="title" align="center"/>
      <el-table-column label="内容" prop="content" align="center"/>
      <el-table-column label="弹框开关" prop="homePrompt" align="center" width="80">
        <template #default="scope">
          <el-switch
              v-model="scope.row.homePrompt"
              :active-value=1
              :inactive-value=0
              @click="toggleSwitch('homePrompt', scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="80">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @click="toggleSwitch('status', scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['announcement:content:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['announcement:content:delete']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改记录 Add or modify records-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="400">
      <el-form ref="formAddUpdate" :model="form" :rules="rules" label-width="100px">
        <div class="centered-form">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="标题"/>
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="form.content" placeholder="内容" type="textarea"/>
          </el-form-item>
          <el-form-item label="弹框开关" prop="homePrompt">
            <el-switch v-model="form.homePrompt"
                       :active-value=1
                       :inactive-value=0
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch v-model="form.status"
                       :active-value=1
                       :inactive-value=0
            />
          </el-form-item>

        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script setup>

import {
  recordList,
  addRecord,
  updateRecord,
  changeStatus,
  getRecord,
  deleteRecord,
  changeHomePrompt,
} from "@/api/system/announcement";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();


const tableList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);

const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},
  rules: {
    provideTimesLimit: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    perDayTimesLimit: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    totalAmount: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    perDayAmount: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    memberMinMoney: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    afterRegisterTime: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ]
  }

});
const {queryParams, form, rules} = toRefs(data);

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  recordList(queryParams.value).then(response => {
    tableList.value = response.data;
    loading.value = false;
  });
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  console.log( "selection " + !selection.length)
  multiple.value = !selection.length;
}

// 表单重置
function reset() {
  form.value = {
    title: null,
    content: null,
    author: null,
    status: 1,
    homePrompt: 1,
    displayTime: null
  }
  proxy.resetForm('formAddUpdate');
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加客户支持'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['formAddUpdate'].validate(valid => {
    if (valid) {
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
  reset();
  open.value = true
  title.value = '更新'
  getRecord(row.id).then(response => {
    form.value = response.data;
  });
}

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


function toggleSwitch(label, row) {
  let rowValue = label==="status" ?  row.status : row.homePrompt;
  const text = rowValue === 1 ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    let status;
    loading.value = true
    if(label==="status"){
      status = changeStatus(row.id, row.status);
    }else{
      status = changeHomePrompt(row.id, row.homePrompt);
    }
    if (status) {
      return status
    }
  }).then(() => {
    loading.value = false
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    loading.value = false
    if(label==="status"){
      row.status = row.status === 0 ? 1 : 0
    }else{
      row.homePrompt = row.homePrompt === 0 ? 1 : 0
    }
  })
}


getList()
</script>

<style>
.centered-form {
  margin-left: 40px;
  max-width: 400px;
}
</style>
