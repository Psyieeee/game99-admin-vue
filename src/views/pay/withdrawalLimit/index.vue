<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['withdrawalLimit:content:add']"
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
            v-hasPermi="['withdrawalLimit:content:delete']"
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
      <el-table-column align="center" label="每日取款限额计数" min-width="180" prop="dailyWithdrawLimitTimes"/>
      <el-table-column align="center" label="取款限额" min-width="180" prop="withdrawLimitAmount"/>
      <el-table-column align="center" label="超过取款限额的费用" min-width="180" prop="exceedWithdrawalFee"/>
      <el-table-column align="center" label="状态" min-width="180" prop="status">
        <template #default="scope">{{scope.row.status===1?"启用":"停用"}}</template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['withdrawalLimit:content:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['withdrawalLimit:content:delete']"
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
            <el-select v-model="form.vipLevel" clearable placeholder="Select">
              <el-option
                  v-for="item in vipLevels"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="每日取款限额计数" prop="dailyWithdrawLimitTimes">
            <el-input type="number" v-model="form.dailyWithdrawLimitTimes" placeholder="每日提现计数"/>
          </el-form-item>
          <el-form-item label="提款限额" prop="withdrawLimitAmount">
            <el-input type="number" v-model="form.withdrawLimitAmount" placeholder="提款限额"/>
          </el-form-item>
          <el-form-item label="超过取款限额" prop="exceedWithdrawalFee">
            <el-input type="number" v-model="form.exceedWithdrawalFee" placeholder="超过提款限额的费用"/>
          </el-form-item>
          <el-form-item label="状态" prop="status">
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
        <el-button type="primary" @click="submitForm">提交</el-button>
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
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();

const tableList = ref([]);
const ids = ref([]);
const title = ref('');
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
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    vipLevel: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    dailyWithdrawLimitTimes: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    withdrawLimitAmount: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    amountLimit: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    oneTimeLimit: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    exceedWithdrawalFee: [
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
  withdrawalLimitList(queryParams.value).then(response => {
    tableList.value = response.data;
    //loading.value = false;
  }).then(
      withdrawalLimitVipLevels().then(response => {
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
    status: 1
  }
  proxy.resetForm('queryRef');
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '新的提现限额'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['queryRef'].validate(async valid => {
    if (valid) {
      if (form.value.id != null) {
        updateWithdrawalLimit(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addWithdrawalLimit(form.value).then(() => {
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
  getWithdrawalLimit(row.id).then(response => {
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
  margin-left: 40px;
  max-width: 400px;
}
</style>
