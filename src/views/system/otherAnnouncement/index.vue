<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['other:announcement:content:add']"
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['other:announcement:content:delete']"
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

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="60"/>
      <el-table-column label="标题" prop="title" align="center"/>
      <el-table-column label="内容" prop="content" align="center">
        <template #default="scope">
          <span v-html="scope.row.content"/>
        </template>
      </el-table-column>
      <el-table-column label="跳跃式" prop="jumpType" align="center"/>
      <el-table-column label="状态" prop="status" align="center">
        <template #default="scope">
          <el-switch
              :disabled="scope.row.title === 'MAINTAIN'"
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @click="toggleSwitch('status', scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="100">
        <template #default="scope">
          <el-button
              v-hasPermi="['other:announcement:content:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['other:announcement:content:delete']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px; padding-right: 20px" width="800px" >
      <el-form ref="formAddUpdate" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="标题"/>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch v-model="form.status"
                       :active-value=1
                       :inactive-value=0
                       @click="toggleStatusForm(form)"
            />
          </el-form-item>
          <el-form-item label="活动详情" prop="content">
            <WangEditor v-model="form.content" style="max-width: 680px" image-path="OtherAnnouncement" />
          </el-form-item>
          <el-form-item label="内部跳转类型">
            <el-select
                filterable
                v-model="form.jumpType"
                style="width: 240px">
              <el-option
                  v-for="jumpType in jumpTypes"
                  :key="jumpType"
                  :label="jumpType"
                  :value="jumpType"/>
            </el-select>
          </el-form-item>
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
} from "@/api/system/otherAnnouncement.js";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import WangEditor from "@/components/WangEditor/index.vue";
const {proxy} = getCurrentInstance();


const tableList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const jumpTypes = [ "VIP", "DAILY_BONUS", "FUND" ,"RECHARGE","BIND_PHONE" , "INVITER"]

const data = reactive({
  queryParams: {},
  form: {},
  rules: {
    title: {required: true, message: '需要标题', trigger: 'blur'},
    content: { validator: (rule, value, callback) => validateContent(rule, value, callback), trigger: "change" }
  }

});
const {queryParams, form, rules} = toRefs(data);

function validateContent(rule, value, callback){
  if (value === "<p><br></p>") {
    callback(new Error("需要内容"));
  }
  callback();
}

function getList() {
  loading.value = true;
  recordList(queryParams.value).then(response => {
    tableList.value = response.data;
    loading.value = false;
  });
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
}

function reset() {
  form.value = {
    title: null,
    content: null,
    status: 1,
    jumpType: jumpTypes[0]
  }
  proxy.resetForm('formAddUpdate');
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '添加客户支持'
}

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

function toggleStatusForm (form) {
  if(form.status === 0){
    form.homePrompt = 0;
  }
}

getList()
</script>

<style>
</style>
