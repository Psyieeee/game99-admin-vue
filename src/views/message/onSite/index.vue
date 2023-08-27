<template>
  <div class="app-container">
    <el-form :inline="true" ref="queryForm" v-model="queryParams" v-show="showSearch" label-width="68px">
      <el-form-item label="创建时间" prop="updateTime" label-width="70px">
        <el-date-picker type="datetimerange"
                        v-model="createTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="信息标题" prop="title">
        <el-input v-model="queryParams.title"
                  style="width: 170px"
                  placeholder="请输入信息标题"
                  clearable
                  @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- handler buttons-->
    <el-row :gutter="10" class="mb8">
      <el-button :span="1.5"
                 type="primary"
                 plain
                 icon="Plus"
                 size="small"
                 @click="handleAdd"
                 v-hasPermi="['message:onSite:add']">新增
      </el-button>
      <el-button
          size="small"
          type="danger"
          plain
          @click="handleDelete"
          icon="Delete"
          :disabled="multiple"
          v-hasPermi="['message:onSite:remove']">删除
      </el-button>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['message:onSite:export']">导出
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleSendUserMessage"
            v-hasPermi="['message:onSite:add']"
        >发送会员消息
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <!--      display data in table -->
    <el-table stripe v-loading="loading" :data="messageOnSiteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="信息标题" prop="title" min-width="150" align="center"/>
      <el-table-column label="内容" align="center" prop="content" min-width="290">
        <template #default="scope">
          <div v-if="scope.row.content != null" v-html="scope.row.content.replaceAll('\$\{domain\.oss\}', domain)"
               style="max-height: 80px"></div>
        </template>
      </el-table-column>
      <el-table-column label="发布人" prop="createBy" min-width="100" align="center"/>
      <el-table-column label="接收者ID" prop="receiverUserId" min-width="100" align="center"/>
      <el-table-column label="发布时间" prop="createTime" width="160" align="center"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="180">
        <template #default="scope">
          <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['message:onSite:edit']"
          >修改
          </el-button>
          <el-button
              style="color: #FF5722"
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['message:onSite:remove']"
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

    <!--    添加或修改站内信息对话框  add or update form -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="650px" append-to-body>
      <el-form ref="msgOnsiteFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="信息标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入信息标题"/>
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="form.content" image-path="message" rows="8"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=!open">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog  :close-on-click-modal="false" :title="title" v-model="openUserMessage" width="500px"  style="height: 360px"
               append-to-body>
      <el-form ref="sendSmsPrivate" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员id" prop="receiverUserId">
          <el-input v-model="form.receiverUserId" placeholder="会员id"/>
        </el-form-item>
        <el-form-item label="信息标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入信息标题"/>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" placeholder="请输入内容" rows="5"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormUserMessage">确 定</el-button>
        <el-button @click="openUserMessage=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="MessageOnSite" setup>


import {reactive, ref, toRefs} from "vue";
import {addDateRange, getDefaultTime} from "@/utils/dateUtils";
import {
  addMessageOnSite, addUserMessage, deleteMessageOnSite, exportMessageOnSite,
  getMessageOnSite,
  listMessageOnSite,
  updateMessageOnSite
} from "@/api/activity/messageManage/messageOnSite";

const {proxy} = getCurrentInstance();


const messageOnSiteList = ref([])
const ids = ref([]);


const title = ref('');
const total = ref(0);

const open = ref(false);
const openUserMessage = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);
const domain = ref(localStorage.getItem('vhostUrl'));

const data = reactive({
  /** queryParams */
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: '',
    orderByColumn: 'create_time',
    isAsc: 'desc'
  },
  form: {},
  rules: {
    title: [
      {required: true, message: '信息标题不能为空', trigger: 'blur'}
    ],
    content: [
      {required: true, message: '内容不能为空', trigger: 'blur'}
    ],
    receiverUserId: [
      {required: true, message: '会员id不能为空', trigger: 'blur'}
    ],
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

/** 查询站内信息列表 list all data*/
function getList() {
  loading.value = true
  listMessageOnSite(proxy.addDateRange(queryParams.value, createTime.value)).then(response => {
    messageOnSiteList.value = response.data
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 reset query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

/**   表单重置 */
function reset() {
  form.value = {
    id: null,
    title: null,
    content: null,
  }
  proxy.resetForm('msgOnsiteFormRef')
}

/** 新增按钮操作 handle add data*/
function handleAdd() {
  reset()
  title.value = "添加站内信息"
  open.value = true
}

/** 删除按钮操作 handle delete data*/
function handleDelete(row) {
  const id = row.id || ids.value
  proxy.$modal.confirm('是否确认删除站内信息编号为"' + id + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteMessageOnSite(id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

/** 修改按钮操作 update data*/
function handleUpdate(row) {
  reset();
  getMessageOnSite(row.id).then(res => {
    form.value = res.data;
    open.value = true
    title.value = "修改站内信"
  })

}

/** 提交按钮 submit form*/
function submitForm() {
  proxy.$refs["msgOnsiteFormRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMessageOnSite(form.value).then(res => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList()
        })
      } else {
        addMessageOnSite(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功');
          open.value = false;
          getList()
        })
      }
    }
  })
}

/** 导出按钮操作 export data*/
function handleExport() {
  proxy.$modal.confirm('是否确认导出所有站内信息数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportMessageOnSite(queryParams.value)
  }).then(response => {
    (response.msg)
  })
}

function handleSendUserMessage(){
  reset();
  openUserMessage.value = true
  title.value = '单个会员发送消息'
}

function submitFormUserMessage(){
  proxy.$refs['sendSmsPrivate'].validate(valid => {
    if (valid) {
      addUserMessage(form.value).then(response => {
        proxy.$modal.msgSuccess('发送成功')
        openUserMessage.value = false
        getList()
      })
    }
  })
}

getList()
</script>

<style scoped>
.dialog-footer {
  float: right;
}
</style>