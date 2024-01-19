<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" >
      <el-form-item label="语言" prop="type">
        <el-select v-model="queryParams.type" placeholder="语言" clearable>
          <el-option
              v-for="type in types"
              :key="type.value"
              :label="type.label"
              :value="type.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="地位" prop="status">
        <el-select v-model="queryParams.status" placeholder="语言" clearable>
          <el-option label="不活跃的" :value=0></el-option>
          <el-option label="积极的" :value=1></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['settings:bonus:add']"
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
            v-hasPermi="['settings:bonus:delete']"
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
      <el-table-column align="center" label="赠送金额" width="180" prop="money" />
      <el-table-column align="center" label="类型" min-width="180" prop="type">
        <template #default="scope">{{types.find((e) => e.value === scope.row.type).label}}</template>
      </el-table-column>
      <el-table-column align="center" label="倍数" width="180" prop="multiplier" />
      <el-table-column align="center" label="描述" width="180" prop="description" />
      <el-table-column align="center" label="地位" width="180" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @click="toggleSwitch(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['settings:bonus:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['settings:bonus:delete']"
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
               width="600px" :rules="rules">
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="钱" prop="money">
          <el-input type="number" v-model="form.money" placeholder="钱"/>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" clearable placeholder="类型">
            <el-option
                v-for="type in types"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="乘数" prop="multiplier">
          <el-input type="number" v-model="form.multiplier" placeholder="乘数"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="描述" type="textarea"/>
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
  changeStatus
} from "@/api/settings/bonusSettings.js";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";

const {proxy} = getCurrentInstance();

const recordList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const showSearch = ref(true);
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    type: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    money: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ],
    multiplier: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ]
  },

});
const {queryParams, form, rules} = toRefs(data);

const types = ref([
  {
    value: 'BIND_PHONE',
    label: '绑定手机'
  }
])

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  listRecord(queryParams.value).then(response => {
    recordList.value = response.data;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    status: 1
  }
  proxy.resetForm('queryForm');
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '新的奖金设置'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['queryForm'].validate(async valid => {
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
  getRecord(row.id).then(response => {
    form.value = response.data;
  });
  open.value = true
  title.value = '更新奖金设置'
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


function toggleSwitch(row) {
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

function resetQuery() {
  proxy.resetForm('queryRef')
  getList()
  loading.value = false
}

getList()
</script>
