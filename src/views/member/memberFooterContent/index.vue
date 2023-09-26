<template>
  <div class="app-container">
    <el-form label="Member Footer" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams" label-width="98px">
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
      <el-form-item prop="分类" style="min-width: 50px">
        <el-input
            v-model="queryParams.sort"
            clearable
            placeholder="分类"
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
            v-hasPermi="['footerContent:menu:add']"
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
            v-hasPermi="['footerContent:menu:remove']"
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
    <el-table v-loading="loading" :data="memberFooterList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="类型" min-width="180" prop="type"/>
      <el-table-column align="center" label="名称" min-width="180" prop="name"/>
      <el-table-column align="center" label="现状" min-width="180" prop="status"/>
      <el-table-column align="center" label="分类" min-width="180" prop="sort"/>
      <el-table-column align="center" label="路径" min-width="180" prop="path"/>
      <el-table-column align="center" label="创建的" min-width="180" prop="createdBy"/>
      <el-table-column align="center" label="创建时间" min-width="180" prop="createdTime"/>
      <el-table-column align="center" label="更新时间" min-width="180" prop="updatedBy"/>
      <el-table-column align="center" label="更新时间" min-width="180" prop="updatedTime"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['footerContent:menu:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['footerContent:menu:remove']"
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
      <el-form :inline="true" ref="addMemberFooter" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="ID" prop="id" style="min-width: 290px">
              <el-input
                  v-model="form.id"
                  clearable
                  placeholder="id"
              />
            </el-form-item>
            <el-form-item label="Content" prop="content" style="min-width: 290px">
              <el-input
                  v-model="form.content"
                  clearable
                  placeholder="content"
              />
            </el-form-item>
            <el-form-item label="Created By" prop="createdBy" style="min-width: 290px">
              <el-input
                  v-model="form.createdBy"
                  clearable
                  placeholder="Created By"
              />
            </el-form-item>
            <el-form-item label="Created At" prop="createdAt" style="min-width: 290px">
              <el-input
                  v-model="form.createdAt"
                  clearable
                  placeholder="Created At"
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

<script name="footerContent" setup>

import {
    footerListData,
    deleteFooter,
    addFooter,
    updateFooter
} from "@/api/member/memberFooterContent";
import {reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";

const router = useRouter();
const {proxy} = getCurrentInstance();

const memberFooterList = ref([]);
const ids = ref([]);
const type = ref('-');
const name = ref('-');
const status = ref('-');
const sort = ref('-');
const path = ref('-');
const createdBy = ref('-');
const createdTime = ref('-');
const updatedBy = ref('-');
const updatedTime = ref('-');
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
  footerListData(queryParams.value).then(response => {
    memberFooterList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    content: null,
    createdBy: null,
    createdAt: null
  }
  proxy.resetForm('addMemberFooter');
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
        id: form.value.id,
        content: form.value.content,
        createdAt: form.value.createdAt,
        createdBy: form.value.createdBy
      }

      if (form.value.id != null) {
        updateFooter(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addFooter(params).then(response => {
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
    return deleteFooter(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}


getList()
</script>

<style>
</style>
