<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="名称" prop="name" class="input-wd25">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['activity:activityQuestType:add']"
        >新增
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
            v-hasPermi="['activity:activityQuestType:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            size="small"
            icon="Delete"
            :disabled="multiple"
            @click="handleDeleteMultiple"
            v-hasPermi="['activity:activityQuestType:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityQuestTypeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="排序" align="center" prop="sort"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['activity:activityQuestType:edit']"
          >修改
          </el-button>
          <el-button
              size="small"
              type="danger"
              link
              icon="eDelete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['activity:activityQuestType:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改任务类型对话框  added new -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="450px" style="height: 240px"
               append-to-body>
      <el-form ref="activityFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="ActivityQuestType" setup>
import {
  activityQuestTypeByID, activityQuestTypeDelete, activityQuestTypeExport,
  activityQuestTypeListData,
  addActivityQuestType,
  updateActivityQuestType
} from "@/api/activity/activityQuestType";

const {proxy} = getCurrentInstance();

// 遮罩层
const loading = ref(true)
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const title = ref('')


// 选中数组
const ids = ref([])
const activityQuestTypeList = ref([])

const data = reactive({
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    gameId: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    name: [
      {required: true, message: '名称不能为空', trigger: 'blur'}
    ]
  }
});

const {queryParams, form, rules} = toRefs(data)

/** 查询任务类型列表 get data list*/
function getList() {
  loading.value = true;
  activityQuestTypeListData(queryParams.value).then(response => {
    activityQuestTypeList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    name: null,
    sort: null,
    createBy: null,
    createTime: null,
    gameId: null
  };
  proxy.resetForm("activityFormRef");
}


/** 搜索按钮操作 handle query */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 reset query*/
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false;
}

/** 多选框选中数据 handle multiple selection*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 handle add button */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加任务类型";
}

/** 修改按钮操作 handle update */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value
  activityQuestTypeByID(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务类型";
  });
}

/** 提交按钮 submit form*/
function submitForm() {
  proxy.$refs["activityFormRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateActivityQuestType(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addActivityQuestType(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 handle delete*/
function handleDelete(row) {
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除"' + row.name + '"?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return activityQuestTypeDelete(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}

function handleDeleteMultiple() {
  const id = ids.value;
  proxy.$modal.confirm('是否确认删除?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return activityQuestTypeDelete(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}


/** 导出按钮操作 handle export data */
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return activityQuestTypeExport(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, "任务类型")
  }).catch(() => {
  })
}

getList()
</script>

<style>
.dialog-footer {
  float: right;
}
</style>
