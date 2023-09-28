<template>
  <div class="app-container">
    <el-form label="Weekly Tasks" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams" label-width="98px">
      <el-form-item prop="现状" style="min-width: 50px">
        <el-input
            v-model="queryParams.taskCode"
            clearable
            placeholder="现状"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['mission:newbieBenefits:add']"
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
            v-hasPermi="['mission:newbieBenefits:delete']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="questRepeatLists" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="ID" min-width="70" prop="id"/>
      <el-table-column align="center" label="Task Currency"       min-width="180" prop="taskCurrency"/>
      <el-table-column align="center" label="Task Classification" min-width="180" prop="taskClassification"/>
      <el-table-column align="center" label="Reward Amount"       min-width="180" prop="rewardAmount"/>
      <el-table-column align="center" label="Mission Target" min-width="180" prop="missionObjectives"/>
      <el-table-column align="center" label="Reward Activity" min-width="180" prop="rewardActivity"/>
      <el-table-column align="center" label="Mission Introduction" min-width="180" prop="missionObjectives"/>
      <el-table-column align="center" min-width="150" label="Whether to turn on" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Operator" min-width="180" prop="createdBy"/>
      <el-table-column align="center" label="Operating Time" min-width="180" prop="updateTime"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['mission:newbieBenefits:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['mission:newbieBenefits:delete']"
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
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50]"
        :total="total"
        @pagination="getList"
    />

    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="700px">
      <el-form :inline="true" ref="newbieBenefits" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name" style="min-width: 290px">
          <el-input
              v-model="form.name"
              clearable
              placeholder="name"
          />
        </el-form-item>
        <el-form-item label="Created By" prop="updateBy" style="min-width: 290px">
          <el-input
              v-model="form.createdBy"
              clearable
              placeholder="createdBy"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="data.showAddButton" @click="submitForm">提交</el-button>
        <el-button type="primary" v-if="data.showEditButton" @click="handleUpdate">编辑</el-button>
        <el-button @click="open=false">取 消</el-button>

      </div>
    </el-dialog>

  </div>
</template>

<script name="weeklyTasks" setup>

import {
  questRepeatList,
  deleteQuestRepeat,
  addQuestRepeat,
  updateQuestRepeat,
  changeNewbieStatus
} from "@/api/activity/questRepeat";

import {reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";

const router = useRouter();

const questRepeatLists = ref([]);
const ids = ref([]);
const id = ref('');
const taskCode = ref('');
const taskConditions = ref('');
const questSettingsId = ref('');
const rewards = ref('');
const rewardActivity = ref('');
const status = ref(1);
const tipBubbleSwitch = ref('');
const updateTime = ref('');
const updateBy = ref('');
const description = ref('');
const title = ref('');
const total = ref(0);
const open = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);

const data = reactive({

  showAddButton: false,
  showEditButton: false,
  /** 查询参数 query params*/
  queryParams: {
    questRepeatType: 2,
    pageNum: 1,
    pageSize: 20,
    type: null,
    effect: null,
    taskCode: null,
    tipBubbleSwitch: null
  },

  /** 表单参数 form parameter*/
  form: {},

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

});
const {queryParams, form, rules, headers} = toRefs(data);

function handleEffectChange(row) {
  let text = row.tipBubbleSwitch === '1' ? '启用' : '停用'
  console.log("@*)@*)@")
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const tipBubbleSwitch = changeNewbieStatus(row.id, row.tipBubbleSwitch);
    console.log( tipBubbleSwitch + "@@@@");
    loading.value = true
    if (tipBubbleSwitch) {
      loading.value = false
      return tipBubbleSwitch
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
  })
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** fetch all data from back-end as getList */
function getList() {
  console.log(queryParams.value + " &@&(@&$(")
  loading.value = true;
  questRepeatList(queryParams.value).then(response => {
    console.log( response.data )
    questRepeatLists.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {

  }
  proxy.resetForm('newbieBenefits');
}

/** 重置按钮操作 handle reset query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
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
  proxy.$refs['addMemberFooter'].validate(async valid => {
    if (valid) {
      const params = {

      }

      if (form.value.id != null) {
        updateNewbieBenefits(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addNewbieBenefits(params).then(response => {
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
  open.value = true
  title.value = '添加页脚'
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteNewbie(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}


getList()
</script>

<style>
</style>
