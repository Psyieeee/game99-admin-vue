<template>
  <div class="app-container">
    <el-form label="Member Withdraw Notice" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams" label-width="98px">
      <el-form-item prop="类型" style="min-width: 50px">
        <el-input
            v-model="queryParams.type"
            clearable
            placeholder="类型"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="名称" style="min-width: 50px">
        <el-input
            v-model="queryParams.name"
            clearable
            placeholder="名称"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="现状" style="min-width: 50px">
        <el-input
            v-model="queryParams.status"
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
            v-hasPermi="['memberWithdrawNotice:menu:add']"
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
            v-hasPermi="['memberWithdrawNotice:menu:remove']"
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
    <el-table v-loading="loading" :data="memberWithdrawNoticeList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="最低金额" min-width="180" prop="minAmount"/>
      <el-table-column align="center" label="Redis TTL" min-width="180" prop="redisTtl"/>
      <el-table-column align="center" label="弹出窗口持续时间" min-width="180" prop="popupDuration"/>
      <el-table-column align="center" label="轮询间隔" min-width="180" prop="pollingInterval"/>
      <el-table-column align="center" label="影响" min-width="180" prop="effect"/>
      <el-table-column align="center" label="创建的" min-width="180" prop="createdBy"/>
      <el-table-column align="center" label="创建时间" min-width="180" prop="createdTime"/>
      <el-table-column align="center" label="更新时间" min-width="180" prop="updatedBy"/>
      <el-table-column align="center" label="更新时间" min-width="180" prop="updatedTime"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['memberWithdrawNotice:menu:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['memberWithdrawNotice:menu:remove']"
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
      <el-form :inline="true" ref="addMemberWithdrawNotice" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="Minimum Amount" prop="minAmount" style="min-width: 290px">
              <el-input
                  v-model="form.minAmount"
                  clearable
                  placeholder="Minimum amount"
              />
            </el-form-item>
            <el-form-item label="Redis TTL" prop="redisTtl" style="min-width: 290px">
              <el-input
                  v-model="form.redisTtl"
                  clearable
                  placeholder="Redis TTL"
              />
            </el-form-item>
            <el-form-item label="Popup Duration" prop="popupDuration" style="min-width: 290px">
              <el-input
                  v-model="form.popupDuration"
                  clearable
                  placeholder="Popup duration"
              />
            </el-form-item>
            <el-form-item label="Polling interval" prop="pollingInterval" style="min-width: 290px">
              <el-input
                  v-model="form.pollingInterval"
                  clearable
                  placeholder="Polling interval"
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

<script name="footerMenu" setup>

import {
    list,
    deleteConfig,
    enanbleConfig,
    add,
    edit
} from "@/api/member/memberWithdrawNotice";
import {reactive, ref, toRefs} from "vue";
import {url} from "@/utils/url";
import {getToken} from "@/utils/auth";

const router = useRouter();
const {proxy} = getCurrentInstance();

const memberWithdrawNoticeList = ref([]);
const ids = ref([]);
// const type = ref('-');
// const name = ref('-');
// const status = ref('-');
// const sort = ref('-');
// const path = ref('-');
// const title = ref('');
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
    pageNum: 1,
    pageSize: 20,
    type: null,
    effect: null,
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
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  list(queryParams.value).then(response => {
    memberWithdrawNoticeList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    minAmount: null,
    redisTtl: null,
    popupDuration: null,
    pollingInterval: null,
  }
  proxy.resetForm('addMemberWithdrawNotice');
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
  proxy.$refs['addMemberWithdrawNotice'].validate(async valid => {
    if (valid) {
      const params = {
        type: form.value.type,
        name: form.value.name,
        status: form.value.status,
        sort: form.value.sort,
        path: form.value.path,
        createdBy: form.value.createdBy
      }

      if (form.value.id != null) {
        edit(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        add(params).then(response => {
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
    return deleteConfig(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}


getList()
</script>

<style>
</style>
