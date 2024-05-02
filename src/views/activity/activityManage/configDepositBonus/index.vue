<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <!--      Filter by ID-->
      <el-form-item label="ID" prop="id">
        <el-input
            v-model="queryParams.id"
            placeholder="请输入 ID"
            clearable
            :step="100"
            size="small"
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!--      Filter by multiplier-->
      <el-form-item label="乘数" prop="multiplier">
        <el-input
            v-model="queryParams.multiplier"
            placeholder="请输入 乘数"
            clearable
            :step="100"
            size="small"
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!--      Filter by Bonus multiplier-->
      <el-form-item label="奖金乘数" prop="bonusMultiplier">
        <el-input
            v-model="queryParams.bonusMultiplier"
            placeholder="请输入 奖金乘数"
            clearable
            :step="100"
            size="small"
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!--      Filter by Bonus status-->
      <el-form-item label="地位" prop="status">
        <el-input
            v-model="queryParams.status"
            placeholder="请输入 地位"
            clearable
            :step="100"
            size="small"
            @keyup.enter="handleQuery"
        />
      </el-form-item>


      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    CRUD OPERATION-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['config:depositBonus:add']"
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
            v-hasPermi="['config:depositBonus:delete']"
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


    <!-- Add new config Deposit Bonus -->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="600px" :rules="rules">
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="日程" prop="schedule">
          <el-input type="number" v-model="form.schedule" placeholder="日程"/>
        </el-form-item>
        <el-form-item label="最大奖金" prop="maxBonus">
          <el-input type="number" v-model="form.maxBonus" placeholder="最大奖金"/>
        </el-form-item>
        <el-form-item label="乘数" prop="multiplier">
          <el-input type="number" v-model="form.multiplier" placeholder="乘数"/>
        </el-form-item>
        <el-form-item label="奖金乘数" prop="bonusMultiplier">
          <el-input type="number" v-model="form.bonusMultiplier" placeholder="奖金乘数"/>
        </el-form-item>
        <el-form-item label="限制时间" prop="limitHour">
          <el-input type="number" v-model="form.limitHour" placeholder="限制时间"/>
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

    <!-- display data into table-->
    <el-table :stripe="true" v-loading="loading" :data="configDepositBonusList"
              @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column label="ID" align="center" prop="id" width="150px"/>
      <el-table-column label="日程" align="center" prop="schedule" width="400px"/>
      <el-table-column label="最大奖金" align="center" prop="maxBonus" width="150px"/>
      <el-table-column label="乘数" align="center" prop="multiplier" width="250px"/>
      <el-table-column label="奖金乘数" align="center" prop="bonusMultiplier" width="150px"/>
      <el-table-column label="限制时间" align="center" prop="limitHour" width="150px"/>
      <el-table-column label="地位" align="center" prop="status" width="150px">
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
          <!--      UPDATE config deposit bonus details-->
          <el-button
              v-hasPermi="['settings:loginMethod:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <!--      DELETE config deposit bonus details-->
          <el-button
              v-hasPermi="['settings:loginMethod:delete']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[10,20,50]"
        @pagination="getList"
    />

  </div>
</template>

<script setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getDefaultTime, pickerDateTimeShortcuts} from "@/utils/dateUtils";
import {
  addConfigDepositBonus, changeStatusConfigDepositBonus, deleteConfigDepositBonus, getConfigDepositBonusInfo,
  getConfigDepositBonusList, updateConfigDepositBonus
} from "@/api/activity/configDepositBonus";
import {getRecord} from "@/api/settings/loginMethod.js";
import {changeStatus} from "@/api/activity/configLoginBonus.js";

const {proxy} = getCurrentInstance();

/** 活动信息表格数据 */
const configDepositBonusList = ref([]);

const ids = ref([]);
const total = ref(0);
const title = ref();

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */
const showSearch = ref(true)

const loading = ref(true)
const open = ref(false)

const data = reactive({
  /**查询参数 */
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: null,
    schedule: null,
    maxBonus: null,
    multiplier: null,
    bonusMultiplier: null,
    limitHour: null,
    status: null
  },
  form: {},

  rules: {},
  /** updateTime */
  // updateTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
});
const {queryParams, form, rules} = toRefs(data);

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
}

/**
 * query configDepositBonus list get list of data
 */
function getList() {
  loading.value = true
  getConfigDepositBonusList(queryParams.value).then((res) => {
    configDepositBonusList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

/** 搜索按钮操作 handle query*/
function resetQuery() {
  form.value = {
    id: null,
    schedule: null,
    maxBonus: null,
    multiplier: null,
    bonusMultiplier: null,
    limitHour: null,
    status: null
  }
  proxy.resetForm("queryForm");
  getList();
}

/*** handle ADD button*/
function handleAdd() {
  resetQuery()
  open.value = true
  title.value = "添加配置存款奖金"
}

function toggleSwitch(row) {
  const text = row.status === 1 ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    let status;
    loading.value = true
    status = changeStatusConfigDepositBonus(row.id, row.status);
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

/*** handle UPDATE button*/
function handleUpdate(row) {
  getConfigDepositBonusInfo(row.id).then(response => {
    form.value = response.data;
  });
  open.value = true
  title.value = "更新配置存款奖金 "
}


/** 提交按钮 */
function submitForm() {
  proxy.$refs['queryForm'].validate(async valid => {
    if (valid) {
      if (form.value.id != null) {
        console.log("form id if" + form.value.id)
        updateConfigDepositBonus(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addConfigDepositBonus(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    console.log()
    return deleteConfigDepositBonus(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

getList()
</script>


