<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="类型" clearable>
          <el-option
              v-for="type in types"
              :key="type.value"
              :label="type.label"
              :value="type.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排除邀请码" prop="inviterCode">
        <el-input
            v-model="queryParams.inviterCode"
            placeholder="排除掉的邀请码"
            clearable
            @keyup.enter="getList"
        />
      </el-form-item>
      <el-form-item label="设备类型" prop="device">
        <el-select v-model="queryParams.device" placeholder="设备类型" clearable>
          <el-option label="网页端" :value=0></el-option>
          <el-option label="手机端" :value=1></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="派奖状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="派奖状态" clearable>
          <el-option label="激活" :value="1"></el-option>
          <el-option label="停用" :value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="赠送金额" min-width="120" prop="money"/>
      <el-table-column align="center" label="类型" min-width="120" prop="type">
        <template #default="scope">{{ types.find((e) => e.value === scope.row.type).label }}</template>
      </el-table-column>
      <el-table-column align="center" label="奖励方式" width="180" prop="destination"
                       :formatter="formatterDestination"/>
      <el-table-column align="center" label="赠送打码倍数" width="110" prop="multiplier"/>
      <el-table-column align="center" label="安装软件数量" min-width="100" prop="count"/>
      <el-table-column align="center" label="163限制" min-width="100" prop="isLimitYun163">
        <template #default="scope">
          <dict-tag :options="sys_effect_type" :value="scope.row.isLimitYun163"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="安装设备限制" min-width="100" prop="limitDeviceNum"/>
      <el-table-column align="center" label="注册IP限制" min-width="100" prop="limitRegipNum"/>
      <el-table-column align="center" label="注册时间要求" min-width="120" prop="effectiveTime"/>
      <el-table-column label="设备类型" align="center" prop="device" :formatter="formatterDevice"/>
      <el-table-column align="center" label="显示状态" width="90" prop="displayIcon">
        <template #default="scope">
          <el-switch
              v-model="scope.row.displayIcon"
              :active-value=1
              :inactive-value=0
              @click="toggleSwitchDisplay(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="派奖状态" width="180" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @click="toggleSwitchStatus(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="翻译键" width="180" prop="description"/>
      <el-table-column align="center" label="排除邀请码" width="180" prop="inviterCode"/>
      <el-table-column align="center" label="排序" width="90" prop="sort"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['settings:bonus:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              :disabled="btnUpdateEnable"
              @click="handleUpdate(scope.row)">修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="600px" :rules="rules">
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" clearable placeholder="类型" :disabled="true">
            <el-option
                v-for="type in types"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型" prop="device" width="100px">
          <el-select v-model="form.device" width="100px" :disabled="true">
            <el-option label="网页端" :value=0></el-option>
            <el-option label="手机端" :value=1></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="赠送金額" prop="money">
          <el-input type="number" v-model="form.money" placeholder="赠送金額"/>
        </el-form-item>
        <el-form-item label="奖励方式">
          <el-radio-group v-model="form.destination" @change="handleDestinationChange()">
            <el-radio label="ACCOUNT">账户</el-radio>
            <el-radio label="BONUS">积分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="赠送打码倍数" prop="multiplier">
          <el-input type="number" v-model="form.multiplier" placeholder="赠送打码倍数"
                    :disabled="form.destination==='BONUS'"/>
        </el-form-item>
        <el-form-item label="安装软件数量" prop="count">
          <el-input type="number" v-model="form.count" placeholder="安装软件数量"/>
        </el-form-item>
        <el-form-item label="163限制" prop="isLimitYun163">
          <el-select v-model="form.isLimitYun163" placeholder="是否限制163">
            <el-option
                v-for="dict in sys_effect_type"
                :key="dict.value"
                :label="dict.label"
                :value="(/true/).test(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="安装设备限制" prop="limitDeviceNum">
          <el-input type="number" v-model="form.limitDeviceNum" placeholder="安装设备限制"/>
        </el-form-item>
        <el-form-item label="注册IP限制" prop="limitRegipNum">
          <el-input type="number" v-model="form.limitRegipNum" placeholder="注册IP限制"/>
        </el-form-item>
        <el-form-item label="生效日期和时间" prop="effectiveTime">
          <el-date-picker
              v-model="form.effectiveTime"
              type="datetime"
              placeholder="选择生效日期和时间"
              format="YYYY-MM-DD hh:mm:ss"
              value-format="YYYY-MM-DD hh:mm:ss"
          />
        </el-form-item>
        <el-form-item label="翻译键" prop="description">
          <el-input v-model="form.description" placeholder="翻译键" type="textarea"/>
        </el-form-item>
        <el-form-item label="排除邀请码" prop="inviterCode">
          <el-input v-model="form.inviterCode" placeholder="此处填写邀请码,该邀请码不赠送,使用','(英文逗号)分割"
                    type="text"/>
        </el-form-item>
        <el-form-item label="排序" prop="inviterCode">
          <el-input v-model="form.sort" placeholder="排序" type="number"/>
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
  updateDisplayIcon
} from "@/api/settings/bonusSettings.js";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";

const {proxy} = getCurrentInstance();
const {sys_effect_type} = proxy.useDict('sys_effect_type');

console.log(sys_effect_type)

const recordList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const showSearch = ref(true);
const btnUpdateEnable = ref(false);
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    type: [
      {required: true, message: '请选择类型', trigger: 'blur'}
    ],
    money: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ],
    multiplier: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ],
    destination: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ],
    count: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ],
    effectiveTime: [
      {required: true, message: '无效的设备', trigger: 'blur'}
    ]
  },

});
const {queryParams, form, rules} = toRefs(data);

const types = ref([
  {
    value: 'BIND_PHONE_BONUS',
    label: '绑定手机'
  },
  {
    value: 'BIND_EMAIL_BONUS',
    label: '绑电子邮件'
  },
  {
    value: 'BIND_GOOGLE_BONUS',
    label: '绑定谷歌'
  },
  {
    value: 'BIND_GOOGLE_EMAIL_BONUS',
    label: '绑定谷歌和电子邮件'
  },
  {
    value: 'BIND_DEVICE_BONUS',
    label: '绑定设备号(游客登录)'
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
    displayIcon: 1,
    status: 0,
    multiplier: 0,
    destination: 'ACCOUNT'
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
  btnUpdateEnable.value = true
  getRecord(row.id).then(response => {
    form.value = response.data;
    open.value = true
    title.value = '更新奖金设置'
    btnUpdateEnable.value = false
  }).catch(function () {
    btnUpdateEnable.value = false
  });
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


function toggleSwitchStatus(row) {
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

function toggleSwitchDisplay(row) {
  const text = row.displayIcon === 1 ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    let status;
    loading.value = true
    status = updateDisplayIcon(row.id, row.displayIcon);
    if (status) {
      return status
    }
  }).then(() => {
    loading.value = false
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    loading.value = false
    row.displayIcon = row.displayIcon === 0 ? 1 : 0
  })
}

function resetQuery() {
  proxy.resetForm('queryRef')
  getList()
  loading.value = false
}

function formatterDestination(row) {
  switch (row.destination) {
    case "ACCOUNT" :
      return "账户";
    case "BONUS" :
      return "积分";
  }
}

function handleDestinationChange() {
  if (form.value.destination === 'BONUS') {
    form.value.multiplier = 0;
  }
}

function formatterDevice(row) {
  switch (row.device) {
    case 0 :
      return "网页端";
    case 1 :
      return "手机端";
    default  :
      return "";
  }
}

getList()
</script>
