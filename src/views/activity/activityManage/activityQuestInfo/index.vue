<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入标题"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="游戏类型" prop="gameTypeId">
        <el-select
            filterable
            v-model="queryParams.gameTypeId"
            placeholder="请选择游戏类型"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        >
          <el-option
              v-for="dict in gameTypeIdOptions"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
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
            v-hasPermi="['activity:activityQuestInfo:add']"
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
            v-hasPermi="['activity:activityQuestInfo:edit']"
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
            v-hasPermi="['activity:activityQuestInfo:remove']"
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
            v-hasPermi="['activity:activityQuestInfo:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="activityQuestInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="标题" align="center" prop="title" min-width="120"/>
      <el-table-column label="图标" align="center" prop="icon">
        <template #default="scope">
          <el-image
              style="height:50px"
              :src="scope.row.icon"
              fit="contain">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="要求打码量" align="center" prop="target"/>
      <el-table-column label="奖励资金" align="center" prop="reward" min-width="100"/>
      <el-table-column label="任务类型" align="center" prop="typeId" min-width="100">
        <template #default="scope">
          <div v-for="(item, index) in activityQuestTypeOptions">
            <span v-if="item.id === scope.row.typeId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="游戏类型" align="center" prop="gameTypeId" min-width="100">
        <template #default="scope">
          <div v-for="(item, index) in gameTypeIdOptions">
            <span v-if="item.id === scope.row.gameTypeId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="任务模式" align="center" prop="taskMode">
        <template #default="scope">
          <dict-tag :options="taskMode" :value="scope.row.taskMode"/>
        </template>
      </el-table-column>
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
      <el-table-column label="排序号" align="center" prop="sort"/>
      <el-table-column label="描述" align="center" prop="content"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="140" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['activity:activityQuestInfo:edit']"
          >修改
          </el-button>
          <el-button
              style="color: #FF5722"
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['activity:activityQuestInfo:remove']"
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

    <!-- 添加任务信息对话框 Add or update Task Info dialog start-->
    <el-dialog :close-on-click-modal="false" style="padding-bottom: 20px" :title="title" v-model="open" width="850px"
               append-to-body>
      <el-form ref="activityQuestFormRef" :model="form" :rules="rules" label-width="130px">
        <el-row>
          <el-col class="col-width-w40">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题"/>
            </el-form-item>
          </el-col>
          <el-col class="col-width-w40">
            <el-form-item label="游戏类型" prop="gameTypeId">
              <el-select
                  filterable
                  v-model="form.gameTypeId"
                  placeholder="请选择游戏类型"
                  clearable
                  style="width: 240px"
                  class="select-type">
                <el-option
                    v-for="dict in gameTypeIdOptions"
                    :key="dict.id"
                    :label="dict.name"
                    :value="dict.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="col-width-w40">
            <el-form-item label="任务类型" prop="typeId">
              <el-select
                  filterable
                  v-model="form.typeId"
                  placeholder="请选择任务类型"
                  clearable
                  style="width: 240px"
                  class="select-type">
                <el-option
                    v-for="dict in activityQuestTypeOptions"
                    :key="dict.id"
                    :label="dict.name"
                    :value="dict.id"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="col-width-w40">
            <el-form-item label="任务模式" prop="taskMode">
              <el-select
                  filterable
                  v-model="form.taskMode"
                  placeholder="请选择任务模式"
                  clearable
                  style="width: 240px">
                <el-option
                    v-for="dict in taskMode"
                    :key="dict.value"
                    :label="dict.label"
                    :value="Number.parseInt(dict.value)"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="col-width-w40">
            <el-form-item label="目标任务量" prop="target">
              <el-input v-model="form.target" type="number" class="no-number" placeholder="请输入目标任务量"/>
            </el-form-item>
          </el-col>
          <el-col class="col-width-w40">
            <el-form-item label="完成后增加资金" prop="reward">
              <el-input v-model="form.reward" type="number" class="no-number" placeholder="请输入完成后增加的资金"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="col-width-w40">
            <el-form-item label="排序号" prop="sort">
              <el-input v-model="form.sort" type="number" class="no-number" placeholder="请输入排序号"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="col-width-w40">
            <el-form-item label="图标" prop="icon">
              <imageUpload v-model="form.icon" path="ActivityQuestInfo"/>
            </el-form-item>
          </el-col>
          <el-col class="col-width-w40">
            <el-form-item label="描述">
              <el-input v-model="form.content" type="textarea" placeholder="请输入内容" rows="8"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="ActivityQuestInfo" setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  activityQuestInfoChangeStatus,
  activityQuestInfoDataById, activityQuestInfoExport,
  activityQuestInfoListData,
  addActivityQuestInfoData, deleteActivityQuestInfo, updateActivityQuestInfo
} from "@/api/activity/activityQuestInfo";
import {activityQuestTypeListDataAll} from "@/api/activity/activityQuestType";
import DictTag from "@/components/DictTag";
import {listAllType} from "@/api/game/type";

const {proxy} = getCurrentInstance();

const activityQuestInfoList = ref([]);
const activityQuestTypeOptions = ref([]);
const gameTypeIdOptions = ref([]);

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
    icon: null,
    title: null,
    ctime: null,
    sort: null,
    typeId: null,
    target: null,
    reward: null,
    detail: null,
    content: null,
    gameTypeId: null,
  },
  form: {},
  // 表单校验
  rules: {
    icon: [
      {required: true, message: "图标不能不上传", trigger: "blur"}
    ],
    title: [
      {required: true, message: "标题不能为空", trigger: "blur"}
    ],
    typeId: [
      {required: true, message: "任务类型不能为空", trigger: "blur"}
    ],
    target: [
      {required: true, message: "目标任务量不能为空", trigger: "blur"}
    ],
    reward: [
      {required: true, message: "完成后增加的资金不能为空", trigger: "blur"}
    ],
    detail: [
      {required: true, message: "任务有效时间不能为空", trigger: "blur"}
    ],
    gameTypeId: [
      {required: true, message: "游戏类型不能为空", trigger: "blur"}
    ],
    taskMode: [
      {required: true, message: "任务模式不能为空", trigger: "blur"}
    ]
  },
});

const {queryParams, form, rules} = toRefs(data);
const {taskMode} = proxy.useDict("taskMode")

/**
 * 查询任务信息列表 list all data
 */
function getList() {
  loading.value = true
  activityQuestInfoListData(queryParams.value).then(response => {
    activityQuestInfoList.value = response.data
    total.value = response.total
    loading.value = false
  })
}

function getListActivityQuestType() {
  activityQuestTypeListDataAll().then(res => {
    activityQuestTypeOptions.value = res.data
  })
}

function getAllListGameType() {
  listAllType().then(res => {
    gameTypeIdOptions.value = res.data
    gameTypeIdOptions.value.push({
      name: '公司入款充值',
      id: -1
    })
    gameTypeIdOptions.value.push({
      name: 'vipPay充值',
      id: -2
    })
  })
}

/**  多选框选中数据 select multiple rows*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
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

/** 表单重置 reset form*/
function reset() {
  form.value = {
    id: null,
    icon: null,
    title: null,
    sort: null,
    typeId: null,
    target: null,
    reward: null,
    detail: null,
    content: null,
    infoId: null,
    platformId: null,
    taskMode: null
  }
  proxy.resetForm("activityQuestFormRef");
}

/** 新增按钮操作 handle add */
function handleAdd() {
  reset();
  open.value = true
  title.value = "添加任务信息"
  getListActivityQuestType();
}

/** 修改按钮操作 handle update*/
function handleUpdate(row) {
  reset()
  const id = row.id || this.ids
  //任务类型
  activityQuestTypeListDataAll().then(res => {
    activityQuestTypeOptions.value = res.data
  })
  activityQuestInfoDataById(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改任务信息'
  })
}

/** 提交按钮 submit form*/
function submitForm() {
  proxy.$refs['activityQuestFormRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateActivityQuestInfo(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addActivityQuestInfoData(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 handle delete data*/
function handleDelete(row) {
  const id = row.id || ids.value
  proxy.$modal.confirm('是否确认删除"' + row.title + '"?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteActivityQuestInfo(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess('删除成功')
  })
}

/** 导出按钮操作 export data*/
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return activityQuestInfoExport(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '任务信息')
  }).catch(() => {
  })
}

/** 任务状态修改 handle change status */
function handleStatusChange(row) {
  let text = row.effect === true ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.title + '"吗?').then(function () {
    return activityQuestInfoChangeStatus(row.id, row.effect);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.effect = !row.effect;
  });
}

getListActivityQuestType()
getAllListGameType()
getList()
</script>

<style scoped>
.col-width-w40 {
  width: 40%;
  flex: none;
}

.select-type {
  width: 240px;
}
</style>