<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['loja:content:add']"
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
            v-hasPermi="['loja:content:delete']"
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
    <el-table v-loading="loading" :data="storeList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="Amount" min-width="180" prop="amount"/>
      <el-table-column align="center" label="Type" min-width="180" prop="type"/>
      <el-table-column align="center" label="Bonus" min-width="180" prop="bonus"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['loja:content:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['loja:content:delete']"
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
      <el-form :inline="true" ref="addStoreAmount" :model="form" :rules="rules" label-width="100px">
        <div class="centered-form">
          <el-form-item label="Amount" prop="amount">
            <el-input type="number" v-model="form.amount" placeholder="Amount"/>
          </el-form-item>
          <el-form-item label="Type" prop="type">
            <el-select v-model="form.type" clearable placeholder="Select">
              <el-option
                  v-for="type in types"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
              />
            </el-select>
          </el-form-item>
          <el-col>
            <el-form-item label="Bonus" prop="bonus" >
              <el-input type="number" v-model="form.bonus" placeholder="Bonus"/>
            </el-form-item>
          </el-col>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="data.showAddButton" @click="submitForm">提交</el-button>
        <el-button type="primary" v-if="data.showEditButton" @click="handleUpdate">编辑</el-button>
        <el-button @click="open=false">取 消</el-button>

      </div>
    </el-dialog>

  </div>
</template>

<script name="footerMenu" setup>

import {
  lojaList,
  deleteLoja,
  addLoja,
  updateLoja,
  getLoja
} from "@/api/pay/loja";
import {reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
const {proxy} = getCurrentInstance();

const router = useRouter();

const storeList = ref([]);
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
const types = ref([
    {
      value: 1,
      label: 'First Recharge'
    },
    {
      value: 2,
      label: 'Popular'
    },
    {
      value: 3,
      label: 'Regular'
    }])
const data = reactive({

  showAddButton: false,
  showEditButton: false,
  /** 查询参数 query params*/
  queryParams: {
    id: '' ,
    amount: ''
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
  lojaList(queryParams.value).then(response => {
    storeList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    playerCount: null,
    commissionRate: null,
    level: null
  }
  proxy.resetForm('addStoreAmount');
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
  proxy.$refs['addStoreAmount'].validate(async valid => {
    if (valid) {
      const params = {
        type: form.value.type,
        bonus: form.value.bonus,
        amount: form.value.amount
      }

      if (form.value.id != null) {
        updateLoja(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addLoja(params).then(() => {
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
    return deleteLoja(idss)
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
