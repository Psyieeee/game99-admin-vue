<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item prop="title" class="input-wd20">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入活动标题"
            clearable
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item prop="effect">
        <el-select v-model="queryParams.effect" placeholder="状态" clearable>
          <el-option
              v-for="dict in activityInfo_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="活动类型" prop="typeId">
        <el-select
            filterable
            v-model="queryParams.typeId"
            placeholder="请选择活动类型"
            clearable
            style="width: 240px">
          <el-option
              v-for="activityType in activityTypeOptions"
              :key="activityType.id"
              :label="activityType.name"
              :value="activityType.id"/>
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
            v-hasPermi="['activity:activityInfo:add']">新增
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
            v-hasPermi="['activity:activityInfo:edit']">修改
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
            v-hasPermi="['activity:activityInfo:remove']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['activity:activityInfo:export']">导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!-- display data into table-->
    <el-table v-loading="loading" :data="activityInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="标题" align="center" prop="title" min-width="180"/>
        <el-table-column label="图标" align="center" prop="icon">
          <template #default="scope">
            <el-image
                style="height: 50px;"
                :src="scope.row.icon"
                fit="contain">
            </el-image>
          </template>
        </el-table-column>
      <el-table-column label="活动详情" align="center" prop="content"  min-width="160">
        <template v-slot="{row}">
          <div v-html="row.content" style="max-height: 80px"></div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime"  min-width="160"/>
      <el-table-column label="活动类型" align="center" prop="typeId" :formatter="formatterActivityType"  min-width="160"/>
      <el-table-column label="跳转类型" align="center" prop="type" :formatter="formatterType"  min-width="160"/>
      <el-table-column label="图标跳转链接" align="center" prop="url"  min-width="160"/>
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
      <el-table-column label="排序" align="center" prop="sort"  min-width="160"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="120">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['activity:activityInfo:edit']">修改
          </el-button>
          <el-button
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['activity:activityInfo:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[10,20,50]"
        @pagination="getList"
    />

    <!-- 添加或修改活动信息对话框  add or update -->
    <el-dialog :title="title" v-model="open" width="700px" style="height: auto;padding-bottom: 20px" append-to-body>
      <el-form ref="activityForm" :model="form" :rules="rules" label-width="90px">
        <div class="el-row">
          <div class="el-col el-col-12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题"/>
            </el-form-item> <br>
            <el-form-item label="活动类型" prop="typeId">
              <el-select
                  filterable
                  v-model="form.typeId"
                  placeholder="请选择活动类型"
                  clearable
                  style="width: 240px">
                <el-option
                    v-for="activityType in activityTypeOptions"
                    :key="activityType.id"
                    :label="activityType.name"
                    :value="activityType.id"/>
              </el-select>
            </el-form-item><br>
            <el-form-item label="排序" prop="sort">
              <el-input v-model="form.sort" placeholder="请输入排序" type="number"/>
            </el-form-item>
          </div>
          <div class="el-col el-col-8">
            <el-form-item label="图标" prop="icon">
              <imageUpload v-model="form.icon" path="ActivityInfo"/>
            </el-form-item>
          </div>
        </div>

        <el-form-item label="跳转类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="0">活动详情</el-radio>
            <el-radio label="1">跳转链接</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="活动详情" prop="content" v-if="form.type == 0">
          <WangEditor v-model="form.content" image-path="ActivityInfo"/>
        </el-form-item>
        <el-form-item label="跳转链接" prop="url" v-if="form.type == 1">
          <el-input v-model="form.url" placeholder="请输入图标跳转链接"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="ActivityInfo" setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getDefaultTime, pickerDateTimeShortcuts} from "@/utils/dateUtils";
import {
  activityInfoAdd,
  activityInfoDelete,
  activityInfoExport, activityInfoFindById, activityInfoUpdate,
  activityInfoUpdateStatus,
  getActivityInfoList
} from "@/api/activity/ativityInfo";
import {getActivityTypeAllList} from "@/api/activity/activityType";
import WangEditor from "@/components/WangEditor";

const {proxy} = getCurrentInstance();

/** 活动信息表格数据 */
const activityInfoList = ref([]);
/** 活动类型 activity type list */
const activityTypeOptions = ref([]);

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

const data =  reactive({
  /**查询参数 */
  queryParams:{
    pageNum: 1,
    pageSize: 10,
    title: null,
    createTime: null,
    effect: null,
    icon:null,
    type:null,
    typeId:null
  },
  form:{},

  rules:{
    title: [
      {required: true, message: "标题不能为空", trigger: "blur"}
    ],
    icon: [
      {required: true, message: "图标不能不上传", trigger: "blur"}
    ],
    typeId: [
      {required: true, message: "活动类型不能为空", trigger: "blur"}
    ],
    type: [
      {required: true, message: "跳转类型不能为空", trigger: "blur"}
    ]
  },
  /** updateTime */
  // updateTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
});
const {queryParams,form,rules} = toRefs(data);

const {activityInfo_status} = proxy.useDict("activityInfo_status")


/**
 * 查询活动信息列表 get list of data
 */
function getList(){
  loading.value = true
  getActivityInfoList(proxy.addDateRange(queryParams.value)).then((res)=>{
    activityInfoList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

function activityTypeList(){
  getActivityTypeAllList().then((res)=>{
    activityTypeOptions.value = res
  })
}

/**  多选框选中数据 select multiple rows*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 0=活动详情 1=跳转链接 */
function formatterType(row) {
  if (row.type == 0) {
    return '活动详情'
  } else if (row.type == 1) {
    return '跳转链接'
  } else {
    return ''
  }
}

function formatterActivityType(row) {
  for (const a of activityTypeOptions.value) {
    if (a.id === row.typeId) {
      return a.name;
    }
  }
  return "";
}


/** 搜索按钮操作 handle query*/
function handleQuery(){
  queryParams.pageNum = 1;
  getList()
}

/** 搜索按钮操作 handle query*/
function resetQuery(){
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false;
}
/** 表单重置 reset form*/
function reset() {
  form.value = {
    title: null,
    createTime: null,
    type: null,
    typeId:null,
    content: '',
    url: null,
    icon:null,
    sort : null
  };
  proxy.resetForm("activityForm");
}

/** 新增按钮操作 handle add button*/
function handleAdd(){
  reset()
  open.value = true
  title.value = "添加活动信息"
}


/** 修改按钮操作 handle update*/
function handleUpdate(row){
  reset();
  const id = row.id ||ids.value
  activityInfoFindById(id).then(response => {
    response.data.type = response.data.type + ""
    form.value = response.data;
    open.value = true;
    title.value = "修改活动信息";
  });
}

/** 提交按钮 submit form*/
function submitForm(){
  proxy.$refs["activityForm"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        activityInfoUpdate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        activityInfoAdd(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}


/** 删除按钮操作 handle delete data */
function handleDelete(row){
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除"' + row.title + '"?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return activityInfoDelete(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}

/** 导出按钮操作 handle export data*/
function handleExport(){
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return activityInfoExport(proxy.addDateRange(queryParams.value,updateTime.value));
  }).then(response => {
    proxy.downloadExcel(response, '活动信息')
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
    return activityInfoUpdateStatus(row.id, row.effect)
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.status = row.status === '0' ? '1' : '0'
  })
}

getList()
activityTypeList()
</script>

<style scoped>
.dialog-footer{
  float: right;
}
</style>