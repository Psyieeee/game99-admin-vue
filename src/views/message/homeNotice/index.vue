<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title" class="input-wd25">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入标题"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="effect">
        <el-select v-model="queryParams.effect" placeholder="请选择状态" clearable>
          <el-option
              v-for="dict in sys_effect_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
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
            v-hasPermi="['message:homeNotice:add']"
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
            v-hasPermi="['message:homeNotice:edit']"
        >修改
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
            v-hasPermi="['message:homeNotice:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['message:homeNotice:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="homeNoticeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="标题" align="center" prop="title"/>
      <el-table-column label="内容" align="center" prop="content" min-width="25">
        <template #default="scope">
          <div v-if="scope.row.content != null" v-html="scope.row.content.replaceAll('\$\{domain\.oss\}', domain)"
               style="max-height: 80px"></div>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort"/>
      <el-table-column label="状态" align="center" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @click="handleEffectChange(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['message:homeNotice:edit']"
          >修改
          </el-button>
          <el-button
              style="color: #FF5722"
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['message:homeNotice:remove']"
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
        :page-sizes="[10,50,100]"
        @pagination="getList"
    />

    <!-- 添加或修改系统公告对话框 add or update form-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="850px" append-to-body>
      <el-form ref="homeNoticeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题"/>
        </el-form-item>
        <el-form-item label="内容">
          <WangEditor v-model="form.content" image-path="message"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=!open">取 消</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script name="HomeNotice" setup>


import {reactive, ref, toRefs} from "vue";
import {
  addHomeNotice,
  deleteHomeNotice,
  exportHomeNotice, getHomeNotice,
  listHomeNotice, messageHomeNoticeStatus,
  updateHomeNotice
} from "@/api/activity/messageManage/homeNotice";

const {proxy} = getCurrentInstance();

const homeNoticeList = ref([]);
const ids = ref([]);


const title = ref('');
const total = ref(0);

const open = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);
const domain = ref(localStorage.getItem('vhostUrl'));

const dataCollection = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: null,
    effect: null,
    type: null,
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {}
});
const {queryParams,form,rules} = toRefs(dataCollection);

const {sys_effect_type} = proxy.useDict("sys_effect_type")

/**
 * 查询首页公告列表
 */
function getList(){
  loading.value = true
  listHomeNotice(queryParams.value).then(response=>{
    homeNoticeList.value = response.data
    total.value = response.total
    loading.value = false
  })

}

/**  多选框选中数据 select multiple rows*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 重置按钮操作 handle query*/
function handleQuery(){
  proxy.resetForm('homeNoticeRef')
  getList()
}

/** 搜索按钮操作 handle reset*/
function resetQuery(){
  queryParams.pageNum = 1
  proxy.resetForm("queryForm")
  handleQuery()
  loading.value = false
}

function reset(){
  form.value = {
    id: null,
    title: null,
    content: null,
    updateTime: null,
    sort: null,
    effect: 0
  }
  proxy.resetForm('homeNoticeRef');
}

/**
 * 新增首页公告 handle add
 */
function handleAdd(){
  reset()
  title.value = "新增首页公告";
  open.value = true
}

/** 修改按钮操作 update*/
function handleUpdate(row){
  reset()
  const id = row.id || ids.value
  getHomeNotice(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改系统公告'
  })
}

/** 提交按钮 submit form*/
function submitForm(){
  proxy.$refs['homeNoticeRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        /**
         * 修改首页公告
         */
        updateHomeNotice(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addHomeNotice(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/**
 * 删除首页公告
 */
function handleDelete(row){
  const id = row.id || ids.value
  proxy.$modal.confirm('是否确认删除系统公告编号为"' + id + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return deleteHomeNotice(id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {
  })
}

/** 导出按钮操作 */
function handleExport(){
  proxy.$modal.confirm('是否确认导出所有系统公告数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return exportHomeNotice(queryParams.value)
  }).then(response => {
    (response.msg)
  }).catch(() => {
  })
}

/**  0停用1启用 */
function handleEffectChange(row){
  let text = row.status === '1' ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return messageHomeNoticeStatus(row.id, row.effect)
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.status = row.status === '0' ? '1' : '0'
  })
}

getList()
</script>

<style scoped>
.dialog-footer{
  float: right;
}
</style>