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
      <el-table-column align="center" label="VIP Level" min-width="180" prop="vipLevel"/>
      <el-table-column align="center" label="Daily Withdraw Count" min-width="180" prop="dailyWithdrawCount"/>
      <el-table-column align="center" label="Daily Amount Limit" min-width="180" prop="amountLimit"/>
      <el-table-column align="center" label="One-Time Limit" min-width="180" prop="oneTimeLimit"/>
      <el-table-column align="center" label="Exceed Withdrawal Fee" min-width="180" prop="exceedWithdrawalFee"/>
      <el-table-column align="center" label="Status" min-width="180" prop="status"/>
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


    <!-- 添加或修改公司入款银行列表对话框 Add or modify withdrawal limit-->
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
          <el-form-item label="Daily count" prop="dailyWithdrawCount">
            <el-input type="number" v-model="form.dailyWithdrawCount" placeholder="Daily Withdraw Count"/>
          </el-form-item>
          <el-form-item label="Amount limit" prop="amountLimit">
            <el-input type="number" v-model="form.amountLimit" placeholder="Daily Amount Limit"/>
          </el-form-item>
          <el-form-item label="One-Time" prop="oneTimeLimit">
            <el-input type="number" v-model="form.oneTimeLimit" placeholder="One-Time Limit"/>
          </el-form-item>
          <el-form-item label="Exceed Fee" prop="exceedWithdrawalFee">
            <el-input type="number" v-model="form.exceedWithdrawalFee" placeholder="Exceed Withdrawal Fee"/>
          </el-form-item>
          <el-form-item label="Status" prop="status">
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
  withdrawalLimitList,
  deleteWithdrawalLimit,
  addWithdrawalLimit,
  updateWithdrawalLimit,
  getWithdrawalLimit, withdrawalLimitVipLevels
} from "@/api/pay/withdrawalLimit";
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
  withdrawalLimitList(queryParams.value).then(response => {
    tableList.value = response.data;
    total.value = response.total;
    //loading.value = false;
  }).then(
      withdrawalLimitVipLevels(queryParams.value).then(response => {
        vipLevels.value = response.data;
        loading.value = false;
      })
  );
}

// 表单重置
function reset() {
  form.value = {
    vipLevel: null,
    dailyWithdrawCount: null,
    amountLimit: null,
    oneTimeLimit: null,
    exceedWithdrawalFee: null,
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
  title.value = '新的提现限额'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['queryRef'].validate(async valid => {
    if (valid) {
      const params = {
        vipLevel: form.value.vipLevel,
        dailyWithdrawCount: form.value.dailyWithdrawCount,
        amountLimit: form.value.amountLimit,
        oneTimeLimit: form.value.oneTimeLimit,
        exceedWithdrawalFee: form.value.exceedWithdrawalFee,
        status: form.value.status
      }

      if (form.value.id != null) {
        updateWithdrawalLimit(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addWithdrawalLimit(params).then(() => {
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
    return deleteWithdrawalLimit(idss)
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
