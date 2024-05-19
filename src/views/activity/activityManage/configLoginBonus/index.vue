<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" >
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="queryParams.deviceType" placeholder="设备类型">
          <el-option label="网站" value=0></el-option>
          <el-option label="手机登录" value=1></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="奖励方式" prop="destination">
        <el-select v-model="queryParams.destination" placeholder="奖励方式">
          <el-option label="账户" value='ACCOUNT'></el-option>
          <el-option label="奖金" value='BONUS'></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="赠送打码倍数" prop="multiplier">
        <el-input
            v-model="queryParams.multiplier"
            placeholder="赠送打码倍数"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地位" prop="status">
        <el-select v-model="queryParams.status" placeholder="地位">
          <el-option label="激活" :value="1"></el-option>
          <el-option label="停用" :value="0"></el-option>
        </el-select>
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
            v-hasPermi="['activity:configLoginBonus:add']"
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
            v-hasPermi="['activity:configLoginBonus:delete']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <right-toolbar @queryTable="getList" v-model:showSearch="showSearch"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column label="最小存款金额" prop="minMoney" align="center" width="180"/>
      <el-table-column label="最大存款金额" prop="maxMoney" align="center" width="180"/>
      <el-table-column label="最小派送金额" prop="minBonus" align="center" width="180"/>
      <el-table-column label="最大派送金额" prop="maxBonus" align="center" width="180"/>
      <el-table-column align="center" label="设备类型" min-width="180" prop="deviceType" :formatter="formatterDev"/>
      <el-table-column label="设备数量限制" prop="limitDeviceNum" align="center" width="180"/>
      <el-table-column label="云163限制" prop="limitYun163" align="center" width="180">
        <template #default="scope">
          <el-switch
              v-model="scope.row.limitYun163"
              :active-value=true
              :inactive-value=false
              @click="toggleYunSwitch(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="过期时间（小时）" prop="limitHour" align="center" width="180"/>
      <el-table-column label="奖励方式" prop="destination" align="center" width="180" :formatter="formatterDestination"/>
      <el-table-column label="赠送打码倍数" prop="multiplier" align="center" width="180"/>
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
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['activity:configLoginBonus:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['activity:configLoginBonus:delete']"
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
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="最小存款金额" prop="minMoney">
          <el-input type="number" v-model="form.minMoney" placeholder="最小存款金额"/>
        </el-form-item>
        <el-form-item label="最大存款金额" prop="maxMoney">
          <el-input type="number" v-model="form.maxMoney" placeholder="最大存款金额"/>
        </el-form-item>
        <el-form-item label="最小派送金额" prop="minBonus">
          <el-input type="number" v-model="form.minBonus" placeholder="最小派送金额"/>
        </el-form-item>
        <el-form-item label="最大派送金额" prop="maxBonus">
          <el-input type="number" v-model="form.maxBonus" placeholder="最大派送金额"/>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="设备类型">
            <el-option label="网站" :value=0></el-option>
            <el-option label="手机登录" :value=1></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备数量限制" prop="limitDeviceNum">
          <el-input type="number" v-model="form.limitDeviceNum" placeholder="设备数量限制"/>
        </el-form-item>
        <el-form-item label="过期时间" prop="limitHour">
          <el-input type="number" v-model="form.limitHour" placeholder="过期时间（小时）"/>
        </el-form-item>
        <el-form-item label="奖励方式">
          <el-radio-group v-model="form.destination" @change="handleDestinationChange()">
            <el-radio label="ACCOUNT">账户</el-radio>
            <el-radio label="BONUS">积分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="赠送打码倍数" prop="multiplier">
          <el-input type="number" v-model="form.multiplier" placeholder="赠送打码倍数" :disabled="isBonus"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="configLoginBonus" setup>

import {
  listRecord,
  deleteRecord,
  addRecord,
  updateRecord,
  getRecord,
  changeStatus, changeLimitYun163
} from "@/api/activity/configLoginBonus";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";

const {proxy} = getCurrentInstance();
const showSearch = ref(true);
const recordList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const isUpdate = ref(false);
const isBonus = ref(false);
const multiplier = ref(0);
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    maxMoney: [
      {
        type: 'number',
        asyncValidator: (rule, value) => {
          return new Promise((resolve, reject) => {
            if (value < form.value.minMoney) {
              reject('应大于最小值');  // reject with error message
            } else {
              resolve();
            }
          });
        },
      }
    ],
    maxBonus: [
      {
        type: 'number',
        asyncValidator: (rule, value) => {
          return new Promise((resolve, reject) => {
            if (value < form.value.minBonus) {
              reject('应大于最小值');
            } else {
              resolve();
            }
          });
        },
      }
    ],
    deviceType: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    destination: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ],
    multiplier: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ]
  },
});
const {queryParams, form, rules} = toRefs(data);

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
    name: null,
    status: 1
  }
  proxy.resetForm('queryForm');
}

/** handle add new data */
function handleAdd() {
  isUpdate.value = false
  reset()
  open.value = true
  title.value = '添加配置登录奖励'
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
  isUpdate.value = true;
  isBonus.value = row.destination === "BONUS";
  getRecord(row.id).then(response => {
    form.value = response.data;
    multiplier.value = response.data.multiplier;
  });
  open.value = true
  title.value = '编辑配置登录奖励'
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
function toggleYunSwitch(row) {
  const text = row.limitYun163 === true ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    let status;
    loading.value = true
    status = changeLimitYun163(row.id, row.limitYun163);
    if (status) {
      return status
    }
  }).then(() => {
    loading.value = false
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    loading.value = false
    row.limitYun163 = row.limitYun163 === false
  })
}

function formatterDev(row) {
  switch (row.deviceType) {
    case 0 :
      return "网站";
    case 1 :
      return "手机登录";
    default  :
      return "";
  }
}

function formatterDestination(row) {
  switch (row.destination) {
    case 'ACCOUNT' :
      return "账户";
    case 'BONUS' :
      return "奖金";
    default  :
      return "";
  }
}

function handleQuery() {
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
  loading.value = false
}

function handleDestinationChange() {
  isBonus.value = form.value.destination === 'BONUS';
  form.value.multiplier = isBonus.value ? 0 : multiplier.value;
}

getList()
</script>
