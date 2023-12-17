<template>
  <div class="app-container">

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" >
      <el-form-item label="键" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="键"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="语言" prop="language">
        <el-select v-model="queryParams.language" placeholder="语言" clearable>
          <el-option
              v-for="language in languages"
              :key="language.value"
              :label="language.label"
              :value="language.value"
          />
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
            v-hasPermi="['settings:configTranslation:add']"
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
            v-hasPermi="['settings:configTranslation:delete']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="键" min-width="180" prop="name"/>
      <el-table-column align="center" label="语言" min-width="180" prop="language">
        <template #default="scope">{{languages.find((e) => e.value === scope.row.language).label}}</template>
      </el-table-column>
      <el-table-column align="center" label="值" min-width="180" prop="value"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['settings:configTranslation:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['settings:configTranslation:delete']"
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
        :page-sizes="[20,40,100]"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- Add or modify list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="500px">
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="键" prop="name">
          <el-input v-model="form.name" placeholder="键"/>
        </el-form-item>
        <el-form-item label="语言" prop="language">
          <el-select v-model="form.language" clearable placeholder="选择">
            <el-option
                v-for="language in languages"
                :key="language.value"
                :label="language.label"
                :value="language.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="form.value" placeholder="值" type="textarea"/>
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
  configTranslationList,
  deleteConfigTranslation,
  addConfigTranslation,
  updateConfigTranslation,
  getConfigTranslation,
} from "@/api/config/configTranslation.js";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();

const recordList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const showSearch = ref(true);
const total = ref(0);

const languages = ref([
  {
    value: 'en',
    label: '英语 - 美国'
  },
  {
    value: 'hk',
    label: '中文（香港）'
  },
  {
    value: 'in',
    label: '印尼语'
  },
  {
    value: 'pt',
    label: '葡萄牙语 - 巴西'
  }
  ])


const data = reactive({
  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20
  },

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    name: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    language: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    value: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ]
  },

});
const {queryParams, form, rules} = toRefs(data);

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
  loading.value = false
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  console.log( "selection " + !selection.length)
  multiple.value = !selection.length;
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  configTranslationList(queryParams.value).then(response => {
    recordList.value = response.data;
    total.value = response.total
    loading.value = false;
  });
}

// 表单重置
function reset() {
  proxy.resetForm('queryForm');
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加记录'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['queryForm'].validate(async valid => {
    if (valid) {
      if (form.value.id != null) {
        updateConfigTranslation(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addConfigTranslation(form.value).then(() => {
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
  getConfigTranslation(row.id).then(response => {
    form.value = response.data;
  });
  console.log(JSON.stringify(form.value) + " @@@@")
  open.value = true
  title.value = '更新记录'
}

/**  删除按钮操作 handle delete */
function handleDelete(row ) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteConfigTranslation(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

getList()
</script>