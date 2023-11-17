<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <!--            v-hasPermi="['loja:content:add']"-->
        <el-button
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <!--            v-hasPermi="['loja:content:delete']"-->
        <el-button
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
      <el-table-column align="center" label="VIP Level" min-width="180" prop="vipLevel"/>
      <el-table-column align="center" label="Support Link" min-width="180" prop="supportLink"/>
      <el-table-column align="center" label="Status" min-width="180" prop="status"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
<!--          v-hasPermi="['loja:content:edit']"-->
          <el-button
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
<!--          v-hasPermi="['loja:content:delete']"-->
          <el-button
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
               width="400px">
      <el-form :inline="true" ref="queryRef" :model="form" :rules="rules" label-width="100px">
        <div class="centered-form">
          <el-form-item label="VIP Level" prop="vipLevel">
            <el-select v-model="form.vipLevel" clearable placeholder="Select">
              <el-option
                  v-for="item in vipLevels"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Support Link" prop="supportLink">
            <el-input type="textarea" v-model="form.supportLink" placeholder="Support Link"/>
          </el-form-item>
          <el-form-item label="Type" prop="type">
            <el-select v-model="form.status" clearable placeholder="Select">
              <el-option
                  v-for="item in statuses"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="data.showAddButton" @click="submitForm">提交</el-button>
        <el-button type="primary" v-if="data.showEditButton" @click="submitForm">编辑</el-button>
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
  getCustomerSupport, customerSupportVipLevels
} from "@/api/system/customerSupport";
import {reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
const {proxy} = getCurrentInstance();

const router = useRouter();

const tableList = ref([]);
const ids = ref([]);
const type = ref('-');
const name = ref('-');
const status = ref('-');
const sort = ref('-');
const path = ref('-');
const title = ref('');
const total = ref(0);
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const vipLevels = ref([]);
const statuses = ref([
  {
    value: 1,
    label: 'Active'
  },
  {
    value: 0,
    label: 'Inactive'
  }])
const data = reactive({

  showAddButton: false,
  showEditButton: false,
  /** 查询参数 query params*/
  queryParams: {
    id: ''
  },

  /** 表单参数 form parameter*/
  form: {},

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

});
const {queryParams, form, rules, headers} = toRefs(data);

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  console.log( "selection " + !selection.length)
  multiple.value = !selection.length;
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  customerSupportList(queryParams.value).then(response => {
    tableList.value = response.data;
    total.value = response.total;
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
    status: null
  }
  proxy.resetForm('queryRef');
}

/** handle add new data */
function handleAdd() {
  data.showAddButton = true
  data.showEditButton = false
  reset()
  open.value = true
  title.value = '添加页脚'
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
  data.showEditButton = true
  data.showAddButton = false
  form.value = row
  console.log(JSON.stringify(form.value) + " @@@@")
  open.value = true
  title.value = 'Update Information'
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


getList()
</script>

<style>
.centered-form {
  margin-left: 50px;
  max-width: 400px;
}
</style>
