<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name"  class="input-wd25">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['activity:activityType:add']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            size="small"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['activity:activityType:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            size="small"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['activity:activityType:remove']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['activity:activityType:export']">导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="activityTypeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="系统编号" align="center" prop="id"/>
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="网址" align="center" prop="url"/>
      <el-table-column label="排序" align="center" prop="sort"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['activity:activityType:edit']">修改
          </el-button>
          <el-button
              size="small"
              type="danger"
              link
              icon="Delete"
              style="color:#ec9090"
              @click="handleDelete(scope.row)"
              v-hasPermi="['activity:activityType:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"/>

    <!-- 添加或修改活动类型对话框 added new activity type-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="450px"
               append-to-body>
      <el-form ref="addActivityType" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="网址" prop="url">
          <el-input v-model="form.url" placeholder="输入网址"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" type="number" class="no-number" placeholder="请输入排序"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="open=false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>

</template>

<script name="ActivityType" setup>

import {reactive, ref, toRefs} from "vue";
import {
  activityTypeDataById, activityTypeExport,
  activityTypeListData,
  addActivityTypeData, deleteActivityType,
  updateActivityType
} from "@/api/activity/activityType";

const {proxy} = getCurrentInstance();

const activityTypeList = ref([]);

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

  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    createBy: null
  },
  /** 表单参数 */
  form: {},

  // 表单校验
  rules: {
    name: [
      {required: true, message: '名称不能为空', trigger: 'blur'}
    ]
  },
  /** updateTime */
  createTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],

});
const {queryParams, createTime, form, rules} = toRefs(data);

/**  多选框选中数据 select multiple rows*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function getList() {
  loading.value = true
  activityTypeListData(queryParams.value).then(res => {
    activityTypeList.value = res.data;
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 reset query*/
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false;
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    createBy: null,
    createTime: null
  };
  proxy.resetForm("addActivityType");
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true
  title.value = "添加活动类型"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value
  activityTypeDataById(id).then(res => {
    form.value = res.data;
    open.value = true
    title.value = "修改活动类型"
  })

}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["addActivityType"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateActivityType(form.value).then(res => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false
          getList();
        })
      } else {
        return addActivityTypeData(form.value).then(res => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList();
        })
      }
    }
  })

}

/** 删除按钮操作 delete data */
function handleDelete(row) {
  const id = row.id || ids.value
  proxy.$modal.confirm('是否确认删除"' + row.name + '"?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return deleteActivityType(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功")
  })

}

/** 导出按钮操作 export data*/
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return activityTypeExport(queryParams.value);
  }).then(res => {
    proxy.downloadExcel(res, "活动类型")
  }).catch(() => {
  })
}


getList()
</script>

<style scoped>
.dialog-footer {
  float: right;
  margin-top: -20px
}
</style>