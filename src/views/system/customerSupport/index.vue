<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['customerSupport:content:add']"
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
            v-hasPermi="['customerSupport:content:delete']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="VIP等级" min-width="180" prop="vipLevel"/>
      <el-table-column align="center" label="链接" min-width="180" prop="supportLink"/>
      <el-table-column label="状态" prop="status" align="center" width="180">
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
              v-hasPermi="['customerSupport:content:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['customerSupport:content:delete']"
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
               width="400px">
      <el-form :inline="true" ref="queryRef" :model="form" :rules="rules" label-width="100px">
        <div class="centered-form">
          <el-form-item label="VIP 水平" prop="vipLevel">
            <el-select v-model="form.vipLevel" clearable placeholder="选择">
              <el-option
                  v-for="item in vipLevels"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="链接" prop="supportLink">
            <el-input type="textarea" v-model="form.supportLink" placeholder="支撑连杆"/>
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
  customerSupportList,
  deleteCustomerSupport,
  addCustomerSupport,
  updateCustomerSupport,
  getCustomerSupport,
  customerSupportVipLevels,
  changeStatus
} from "@/api/system/customerSupport";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();

const tableList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const vipLevels = ref([]);
const data = reactive({

  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    vipLevel: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    supportLink: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ]
  }

});
const {queryParams, form, rules} = toRefs(data);

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  console.log( "selection " + !selection.length)
  multiple.value = !selection.length;
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  customerSupportList(queryParams.value).then(response => {
    tableList.value = response.data;
    //loading.value = false;
  }).then(
      customerSupportVipLevels(queryParams.value).then(response => {
        vipLevels.value = response.data;
        loading.value = false;
      })
  );
}

// 表单重置
function reset() {
  form.value = {
    vipLevel: null,
    supportLink: null,
    status: 1
  }
  proxy.resetForm('queryRef');
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加客户支持'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['queryRef'].validate(async valid => {
    if (valid) {
      const params = {
        vipLevel: form.value.vipLevel,
        supportLink: form.value.supportLink,
        status: form.value.status
      }

      if (form.value.id != null) {
        updateCustomerSupport(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addCustomerSupport(params).then(() => {
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
  getCustomerSupport(row.id).then(response => {
    form.value = response.data;
  });
  console.log(JSON.stringify(form.value) + " @@@@")
  open.value = true
  title.value = '更新信息'
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteCustomerSupport(idss)
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

getList()
</script>

<style>
.centered-form {
  margin-left: 50px;
  max-width: 400px;
}
</style>
