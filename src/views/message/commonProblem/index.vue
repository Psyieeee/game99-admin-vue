<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title" class="input-wd25">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入标题"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="激活状态" prop="effect">
        <el-select v-model="queryParams.effect" placeholder="请选择激活状态" clearable>
          <el-option
              v-for="dict in sys_effect_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            size="small"
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['message:commonProblem:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            size="small"
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['message:commonProblem:edit']"
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
            @click="handleDelete"
            v-hasPermi="['message:commonProblem:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            size="small"
            icon="Download"
            @click="handleExport"
            v-hasPermi="['message:commonProblem:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commonProblemList">
      <el-table-column label="标题" align="center" prop="title" min-width="150"/>
      <el-table-column label="内容" align="center" prop="content" min-width="290">
        <template #default="scope">
          <div v-if="scope.row.content != null" v-html="scope.row.content.replaceAll('\$\{domain\.oss\}', domain)"
               style="max-height: 80px"></div>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" width="120"/>
      <el-table-column label="激活状态" align="center" prop="effect" width="90">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="createTime" width="160"/>
      <el-table-column label="发布人" align="center" prop="createBy" width="120"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="160">
        <template #default="scope">
          <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['message:commonProblem:edit']"
          >修改
          </el-button>
          <el-button
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['message:commonProblem:remove']"
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
        :page-sizes="[20,50,100]"
        @pagination="getList"
    />

    <!-- 添加或修改常见问题对话框 -->
    <el-dialog :title="title" v-model="open" width="850px" append-to-body>
      <el-form ref="commonProblemRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input type="number" class="no-number" v-model="form.sort" placeholder="请输入排序"/>
        </el-form-item>
        <el-form-item label="内容">
          <WangEditor v-model="form.content" image-path="message"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MessageCommonProblem">
import {
  listCommonProblem,
  getCommonProblem,
  delCommonProblem,
  addCommonProblem,
  updateCommonProblem,
  changeStatusCommonProblem, exportCommonProblem
} from "@/api/message/commonProblem";

const {proxy} = getCurrentInstance();
const {sys_effect_type} = proxy.useDict('sys_effect_type');

const commonProblemList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const domain = ref(localStorage.getItem('vhostUrl'));

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    title: null,
    effect: null,
    orderByColumn: 'sort',
    isAsc: 'asc'
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询常见问题列表 */
function getList() {
  loading.value = true;
  listCommonProblem(queryParams.value).then(response => {
    commonProblemList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

/**  取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/**  表单重置 */
function reset() {
  form.value = {
    id: null,
    title: null,
    content: null,
    sort: null,
    effect: null,
    createTime: null,
    createBy: null
  };
  proxy.resetForm("commonProblemRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/**  多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加常见问题";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCommonProblem(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改常见问题";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["commonProblemRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCommonProblem(form.value).then(response => {
          if (response.code === 200) {
            proxy.$modal.msgSuccess(response.msg)
            open.value = false;
            getList()
          } else {
            proxy.$modal.msgError(response.msg)
          }
        }).catch(() => {
        });
      } else {
        addCommonProblem(form.value).then(response => {
          if (response.code === 200) {
            proxy.$modal.msgSuccess(response.msg)
            open.value = false;
            getList()
          } else {
            proxy.$modal.msgError(response.msg)
          }
        }).catch(() => {
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除常见问题编号为"' + _ids + '"的数据项？').then(function () {
    return delCommonProblem(_ids);
  }).then((response) => {
    getList();
    proxy.$modal.msgSuccess(response.msg);
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportCommonProblem(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '常见问题列表')
  })
}

/** 任务状态修改 handle change status */
function handleStatusChange(row) {
  let text = row.effect === true ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.title + '"吗?').then(function () {
    return changeStatusCommonProblem(row.id, row.effect);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.effect = !row.effect;
  });
}

getList();
</script>