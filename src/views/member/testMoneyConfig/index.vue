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
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--            v-hasPermi="['customerSupport:content:delete']"-->
<!--            :disabled="multiple"-->
<!--            icon="Delete"-->
<!--            plain-->
<!--            size="small"-->
<!--            type="danger"-->
<!--            @click="handleDelete"-->
<!--        >删除-->
<!--        </el-button>-->
<!--      </el-col>-->
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column label="提供时间限制" prop="provideTimesLimit" align="center"/>
      <el-table-column label="每日次数限制" prop="perDayTimesLimit" align="center"/>
      <el-table-column label="总金额" prop="totalAmount" align="center"/>
      <el-table-column label="每日合计" prop="perDayAmount" align="center"/>
      <el-table-column label="最低金额" prop="memberMinMoney" align="center"/>
      <el-table-column label="注册时间后" prop="afterRegisterTime" align="center"/>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @click="effectStatusChange(scope.row)">
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
<!--          <el-button-->
<!--              v-hasPermi="['customerSupport:content:delete']"-->
<!--              icon="Delete" link-->
<!--              size="small"-->
<!--              style="color: #e05e5e"-->
<!--              type="danger"-->
<!--              @click="handleDelete(scope.row)">删除-->
<!--          </el-button>-->
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改公司入款银行列表对话框 Add or modify customer support-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="400px">
      <el-form ref="formSupport" :model="form" :rules="rules" label-width="100px">
<!--        <div class="centered-form">-->
          <el-form-item label="提供时间限制" prop="provideTimesLimit">
            <el-input v-model="form.provideTimesLimit" placeholder="提供时间限制" type="number"/>
          </el-form-item>
          <el-form-item label="每日次数限制" prop="perDayTimesLimit">
            <el-input v-model="form.perDayTimesLimit" placeholder="每日次数限制" type="number"/>
          </el-form-item>
          <el-form-item label="总金额" prop="totalAmount">
            <el-input v-model="form.totalAmount" placeholder="总金额" type="number" />
          </el-form-item>
          <el-form-item label="每日合计" prop="perDayAmount">
            <el-input v-model="form.perDayAmount" placeholder="每日合计" type="number" />
          </el-form-item>
          <el-form-item label="最低金额" prop="memberMinMoney">
            <el-input v-model="form.memberMinMoney" placeholder="最低金额" type="number" />
          </el-form-item>
          <el-form-item label="注册时间后" prop="afterRegisterTime">
            <el-date-picker v-model="form.afterRegisterTime" placeholder="注册时间后" type="datetime" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
<!--            <el-input v-model="form.status" placeholder="状态" type="number" />-->
            <el-switch v-model="form.status"
                       :active-value=1
                       :inactive-value=0
            />
          </el-form-item>
<!--        </div>-->
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
  testMoneyConfigList,
  //deleteTestMoneyConfig,
  addTestMoneyConfig,
  updateTestMoneyConfig,
  changeEffectStatus,
  getTestMoneyConfig
} from "@/api/member/testMoneyConfig";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {addPayAgentChannel, updatePayAgentChannel} from "@/api/pay/payAgentChannel";
const {proxy} = getCurrentInstance();


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

const data = reactive({

  showAddButton: false,
  showEditButton: false,
  /** 查询参数 query params*/
  queryParams: {
    id: ''
  },

  /** 表单参数 form parameter*/
  form: {},
  rules:{}

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
  testMoneyConfigList(queryParams.value).then(response => {
    tableList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    provideTimesLimit: null,
    perDayTimesLimit: null,
    totalAmount: null,
    perDayAmount: null,
    memberMinMoney: null,
    afterRegisterTime: null,
    status: null
  }
  proxy.resetForm('formSupport');
}

/** handle add new data */
function handleAdd() {
  data.showAddButton = true
  data.showEditButton = false
  reset()
  open.value = true
  title.value = '添加客户支持'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['formSupport'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTestMoneyConfig(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addTestMoneyConfig(form.value).then(() => {
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
// function handleDelete(row) {
//   const idss = row.id || ids.value
//   proxy.$confirm('是否确认删除?', '警告', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   }).then(function () {
//     return deleteTestMoneyConfig(idss)
//   }).then(() => {
//     getList()
//     proxy.$modal.msgSuccess('删除成功')
//   })
// }

// function effectStatusChange(row) {
//   let text = row.status ? "启用" : "停用";
//   proxy.$modal.confirm('确认要"' + text + '?', "警告", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning"
//   }).then(function () {
//     return changeEffectStatus(row.id, row.effect);
//   }).then(() => {
//     proxy.$modal.msgSuccess(text + "成功");
//   }).catch(function () {
//     row.effect = !row.effect
//   });
//
// }

function effectStatusChange(row) {
  let text = row.status == '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const status = changeEffectStatus(row.id, row.status);
    loading.value = true
    if (status) {
      loading.value = false
      return status
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
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
