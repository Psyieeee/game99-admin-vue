<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--            icon="Plus"-->
<!--            plain-->
<!--            size="small"-->
<!--            type="primary"-->
<!--            @click="handleAdd"-->
<!--        >新增-->
<!--        </el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
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
    <el-table v-loading="loading" :data="rechargeCommissionList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="Level" min-width="180" prop="level"/>
      <el-table-column align="center" label="Commission Rate" min-width="180" prop="commissionRate"/>
      <el-table-column align="center" label="Audit Multiplier" min-width="180" prop="auditMultiplier"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
<!--          <el-button-->
<!--              icon="Delete" link-->
<!--              size="small"-->
<!--              style="color: #e05e5e"-->
<!--              type="danger"-->
<!--              @click="handleDelete(scope.row)">删除-->
<!--          </el-button>-->
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
               width="500px">
      <el-form :inline="true" ref="addRechargeCommission" :model="form" :rules="rules" label-width="160px">
        <div class="centered-form">
          <el-form-item label="Level" prop="auditMultiplier" >
            <el-input type="number" v-model="form.level" placeholder="Level" disabled />
          </el-form-item>
          <el-form-item label="Audit Multiplier" prop="auditMultiplier">
            <el-input type="number" v-model="form.auditMultiplier" placeholder="Audit Multiplier"/>
          </el-form-item>
          <el-col>
            <el-form-item label="Commission Rate" prop="commissionRate" >
              <el-input type="number" v-model="form.commissionRate" placeholder="Commission Rate"/>
            </el-form-item>
          </el-col>
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

<script name="footerMenu" setup>

import {
    missionRechargeList,
    getMissionRecharge,
    deleteMissionRecharge,
    addMissionRecharge,
    updateMissionRecharge
} from "@/api/activity/missionRecharge";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {useRouter} from "vue-router";

const router = useRouter();
const {proxy} = getCurrentInstance();

const rechargeCommissionList = ref([]);
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
    id: null,
    level: null,
    commissionRate: null,
    auditMultiplier: null,
  },

  /** 表单参数 form parameter*/
  form: {},

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

});
const {queryParams, form, rules, headers} = toRefs(data);

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.level);
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
  missionRechargeList(queryParams.value).then(response => {
    console.log( JSON.stringify(response) + " @@" )
    rechargeCommissionList.value = response.data;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    auditMultiplier: null,
    commissionRate: null,
    level: null
  }
  proxy.resetForm('addRechargeCommission');
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
  proxy.$refs['addRechargeCommission'].validate(async valid => {
    if (valid) {
      const params = {
        commissionRate: form.value.commissionRate,
        auditMultiplier: form.value.auditMultiplier
      }

      console.log("orm.value.level " + form.value.level)
      if (form.value.level != null) {
        updateMissionRecharge(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addMissionRecharge(params).then(() => {
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
  reset()
  data.showEditButton = true
  data.showAddButton = false
  const id = row.level || ids.value
  console.log( id )
  getMissionRecharge(id).then( response => {
    console.log( JSON.stringify( response ))
    form.value = response.data
    open.value = true
    title.value = 'Update Information'
  })
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.level || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteMissionRecharge(idss)
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
