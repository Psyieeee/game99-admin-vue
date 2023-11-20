<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['member:testMoney:add']"
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="tableList">
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
              v-hasPermi="['member:testMoney:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改记录 Add or modify records-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="400">
      <el-form ref="testMoney" :model="form" :rules="rules" label-width="100px">
        <div class="centered-form">
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
    testMoneyConfigList,
    addTestMoneyConfig,
    updateTestMoneyConfig,
    changeEffectStatus, getTestMoneyConfig,
} from "@/api/member/testMoneyConfig";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();


const tableList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);

const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},
  rules: {
    provideTimesLimit: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    perDayTimesLimit: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    totalAmount: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    perDayAmount: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    memberMinMoney: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    afterRegisterTime: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ]
  }

});
const {queryParams, form, rules} = toRefs(data);

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  testMoneyConfigList(queryParams.value).then(response => {
    tableList.value = response.data;
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
    status: 1
  }
  proxy.resetForm('testMoney');
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加客户支持'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['testMoney'].validate(valid => {
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
  reset();
  open.value = true
  title.value = '更新信息'
  getTestMoneyConfig(row.id).then(response => {
    form.value = response.data;
  });
}


function effectStatusChange(row) {
  let text = row.status === 1 ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const status = changeEffectStatus(row.id, row.status);
    loading.value = true
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
  margin-left: 40px;
  max-width: 400px;
}
</style>
