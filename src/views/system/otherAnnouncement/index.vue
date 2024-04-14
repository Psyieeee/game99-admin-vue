<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
      <el-form-item :label="TEXT.LABEL_TITLE" prop="title">
        <el-input
            v-model="queryParams.title"
            :placeholder="TEXT.LABEL_TITLE"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="TEXT.LABEL_DEVICE" prop="device">
        <el-select v-model="queryParams.device" :placeholder="TEXT.LABEL_DEVICE" clearable>
          <el-option :label="TEXT.LABEL_DEVICE_WEB" :value="0"></el-option>
          <el-option :label="TEXT.LABEL_DEVICE_MOBILE" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="status">
        <el-select v-model="queryParams.status" :placeholder="TEXT.PROP_STATUS" clearable>
          <el-option :label="TEXT.LABEL_STATUS_ENABLED" :value="1"></el-option>
          <el-option :label="TEXT.LABEL_STATUS_DISABLED" :value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row style="display: inline">
      <el-button v-for=" button in Object.values(HOME_BUTTON)" :icon="button.icon" :size="button.size" :type="button.type" v-hasPermi="[button.permission]" @click="button.handler">{{ button.label }}</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" :default-sort="{ prop: 'device', order: 'ascending'}">
      <el-table-column :align="TEXT.CENTER" :type="TEXT.SELECTION" width="60"/>
      <template v-for="field in Object.values(TABLE)">
        <el-table-column v-if="field.prop === TEXT.PROP_IMAGE" :label="field.label" :prop="field.prop" :align="field.align">
          <template #default="scope">
            <img :src="scope.row.image" class="image-preview">
          </template>
        </el-table-column>
        <el-table-column v-else-if="field.prop === TEXT.PROP_JUMP_TYPE"   :label="field.label" :prop="field.prop" :align="field.align" :formatter="getTranslatedJumpType"/>
        <el-table-column v-else-if="field.prop === TEXT.PROP_STATUS"   :label="field.label" :prop="field.prop" :align="field.align">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value=1 :inactive-value=0 @click="toggleStatusSwitch(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column v-else-if="field.prop === TEXT.PROP_DEVICE"   :label="field.label" :prop="field.prop" :align="field.align" :formatter="formatterDevice"/>
        <el-table-column v-else                                        :label="field.label" :prop="field.prop" :align="field.align" sortable />
      </template>
      <el-table-column :align="TEXT.CENTER" class-name="small-padding fixed-width" :fixed="TEXT.RIGHT" :label="TEXT.LABEL_ACTION" min-width="100">
        <template #default="scope">
          <el-button v-for=" button in Object.values(ACTION_BUTTON)" :icon="button.icon" link :size="button.size" :type="button.type" v-hasPermi="[button.permission]" @click="button.handler(scope.row)">{{ button.label }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        :total="total"
        :page-sizes="[20,50,100]"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />


    <el-dialog v-model="openForm" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px; padding-right: 20px" width="800px" >
      <el-form :ref="TEXT.REF_NAME" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="TEXT.LABEL_TITLE" :prop="TEXT.PROP_TITLE" v-if="form.jumpType !== 'INVITER'">
          <el-input v-model="form.title" :placeholder="TEXT.PLACEHOLDER_TITLE" />
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_JUMP_TYPE" :prop="TEXT.PROP_JUMP_TYPE">
          <el-select v-model="form.jumpType">
            <el-option v-for="type in jumpTypes" :key="type.value" :label="type.label" :value="type.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_URL" :prop="TEXT.PROP_URL" v-if="form.jumpType === 'EXTERNAL'">
          <el-input v-model="form.url" :placeholder="TEXT.LABEL_URL" />
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_CONTENT" :prop="TEXT.PROP_CONTENT" v-if="form.jumpType !== 'INVITER'">
          <textarea style="height: 100px; width: 640px; margin-top: 5px" v-model="form.content"/>
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_IMAGE" :prop="TEXT.PROP_IMAGE" v-if="form.jumpType !== 'INVITER'">
          <image-upload v-model="form.image" :path="TEXT.IMG_PATH"/>
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_STATUS" :prop="TEXT.PROP_STATUS">
          <el-switch v-model="form.status" :active-value=1 :inactive-value=0 />
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_DEVICE" :prop="TEXT.PROP_DEVICE" >
          <el-select v-model="form.device" width="100px">
            <el-option label="网页端" :value=0></el-option>
            <el-option label="手机端" :value=1></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_SORT" :prop="TEXT.PROP_SORT">
          <el-input v-model="form.sort" style="width: 100px"/>
        </el-form-item>
      </el-form>
      <div :slot="TEXT.FOOTER" class="dialog-footer">
        <el-button v-for=" field in Object.values(FOOTER_BUTTON)" :icon="field.icon" :size="field.size" :type="field.type" @click="field.handler">{{ field.label }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, toRefs } from "vue";
import { recordList, addRecord, updateRecord, changeStatus, getRecord, deleteRecord } from "@/api/system/otherAnnouncement.js";

const jumpTypes =[
  {
    value: 'VIP',
    label: 'VIP'
  },
  {
    value: 'DAILY_BONUS',
    label: '每日奖金'
  },
  {
    value: 'FUND',
    label: '敷援彩金'
  },
  {
    value: 'RECHARGE',
    label: '首次存款'
  },
  {
    value: 'BIND_PHONE',
    label: '绑定手机'
  },
  {
    value: 'INVITER',
    label: '推广'
  },
  {
    value: 'EXTERNAL',
    label: '跳转外部浏览器'
  },
  {
    value: 'PINDUODUO',
    label: '拼多多'
  }
]

const {proxy}   = getCurrentInstance();
const openForm  = ref(false);
const multiple  = ref(true);
const loading   = ref(true);
const tableList = ref([]);
const idList    = ref([]);
const total     = ref(0);
const title     = ref("");
const TEXT      = {
  PERMISSION_DEL:    'other:announcement:content:delete',
  PERMISSION_EDIT:   'other:announcement:content:edit',
  PERMISSION_ADD:    'other:announcement:content:add',
  ANNOUNCEMENT_EDIT: '更新公告',
  ANNOUNCEMENT_ADD:  '添加公告',
  LABEL_ACTION:      '操作',
  LABEL_JUMP_TYPE:   '跳转指向',
  LABEL_URL:         'URL',
  LABEL_CONTENT:     '内容',
  LABEL_STATUS:      '状态',
  LABEL_STATUS_ENABLED:'启用',
  LABEL_STATUS_DISABLED:'禁用',
  LABEL_DEVICE:      '设备类型',
  LABEL_DEVICE_WEB:  '网页端',
  LABEL_DEVICE_MOBILE:'手机端',
  LABEL_CONFIRM:     '确定',
  LABEL_SUBMIT:      '确 定',
  LABEL_CANCEL:      '取 消',
  LABEL_TITLE:       '标题',
  LABEL_IMAGE:       '图片',
  LABEL_ADD:         '新增',
  LABEL_EDIT:        '修改',
  LABEL_SORT:        '排序',
  LABEL_DEL:         '删除',
  PROP_JUMP_TYPE:    'jumpType',
  PROP_URL:          'url',
  PROP_CONTENT:      'content',
  PROP_STATUS:       'status',
  PROP_DEVICE:       'device',
  PROP_TITLE:        'title',
  PROP_IMAGE:        'image',
  PROP_SORT:         'sort',
  PLACEHOLDER_TITLE: '需要标题',
  IMG_PATH:          'otherAnnouncementImage',
  REF_NAME:          'formAddUpdate',
  SELECTION:         'selection',
  WARNING:           'warning',
  PRIMARY:           'primary',
  SUCCESS:           'success',
  CANCEL:            'cancel',
  FOOTER:            'footer',
  DELETE:            'Delete',
  DANGER:            'danger',
  CENTER:            'center',
  TRIG_CHANGE:       'change',
  TRIG_BLUR:         'blur',
  SMALL:             'small',
  RIGHT:             'right',
  PLUS:              'Plus',
  CONFIRM_WARNING:   '你确定要继续吗？',
  DEL_SUCCESS:       '已成功删除',
  EDIT_SUCCESS:      '修改成功',
  ADD_SUCCESS:       '新增成功',
  INVALID_TITLE:     '请填写标题',
  INVALID_CONTENT:   '请填写内容',
  EDIT_FAILED:       '修改',
  ACTIVE:            '启用',
}

const ACTION_BUTTON = {
  EDIT: { label: TEXT.LABEL_EDIT, icon: TEXT.PRIMARY, size: TEXT.SMALL, type: TEXT.PRIMARY, permission: TEXT.PERMISSION_EDIT, handler: handleUpdate },
  DEL:  { label: TEXT.LABEL_DEL,  icon: TEXT.DELETE,  size: TEXT.SMALL, type: TEXT.DANGER,  permission: TEXT.PERMISSION_DEL,  handler: handleDelete },
}
const FOOTER_BUTTON = {
  SUBMIT: { label: TEXT.LABEL_SUBMIT, icon: null,    size: TEXT.SMALL, type: TEXT.PRIMARY, handler: submitForm },
  CANCEL: { label: TEXT.LABEL_CANCEL, icon: null,         size: TEXT.SMALL, handler: () => openForm.value = false },
}
const HOME_BUTTON   = {
  ADD: { label: TEXT.LABEL_ADD, icon: TEXT.PLUS,   size: TEXT.SMALL, type: TEXT.PRIMARY, permission: TEXT.PERMISSION_ADD, handler: handleAdd },
  DEL: { label: TEXT.LABEL_DEL, icon: TEXT.DELETE, size: TEXT.SMALL, type: TEXT.DANGER,  permission: TEXT.PERMISSION_DEL, handler: handleDelete },
}
const TABLE         = {
  IMAGE:     { label: TEXT.LABEL_IMAGE,     prop: TEXT.PROP_IMAGE,     align: TEXT.CENTER },
  TITLE:     { label: TEXT.LABEL_TITLE,     prop: TEXT.PROP_TITLE,     align: TEXT.CENTER },
  CONTENT:   { label: TEXT.LABEL_CONTENT,   prop: TEXT.PROP_CONTENT,   align: TEXT.CENTER },
  JUMP_TYPE: { label: TEXT.LABEL_JUMP_TYPE, prop: TEXT.PROP_JUMP_TYPE, align: TEXT.CENTER },
  STATUS:    { label: TEXT.LABEL_STATUS,    prop: TEXT.PROP_STATUS,    align: TEXT.CENTER },
  DEVICE:    { label: TEXT.LABEL_DEVICE,    prop: TEXT.PROP_DEVICE,    align: TEXT.CENTER },
  SORT:      { label: TEXT.LABEL_SORT,      prop: TEXT.PROP_SORT,      align: TEXT.CENTER },
  URL:       { label: TEXT.LABEL_URL,       prop: TEXT.PROP_URL,          align: TEXT.CENTER }
}
const data          = reactive({
  queryParams: {
    orderByColumn : 'sort',
    pageNum: 1,
    pageSize: 20
  },
  form: {},
  rules: {
    title: { required: true, message: TEXT.INVALID_TITLE, trigger: TEXT.TRIG_BLUR },
    device: { required: true, message: TEXT.INVALID_TITLE, trigger: TEXT.TRIG_BLUR },
  }
});
const { queryParams, form, rules } = toRefs(data);

function getList() {
  loading.value = true;
  recordList(queryParams.value).then(response => {
    total.value = response.total;
    tableList.value = response.data;
    loading.value = false;
  });
}

function handleSelectionChange(selection) {
  idList.value   = selection.map(item => item.id);
  multiple.value = !selection.length;
}

function reset() {
  form.value = {
    id: null,
    title: null,
    image: null,
    imageSize: null,
    content: null,
    status: 0,
    device: null,
    jumpType: jumpTypes[0].value,
    sort: null
  }
  proxy.resetForm(TEXT.REF_NAME);
}

function handleAdd() {
  reset()
  openForm.value = true
  title.value    = TEXT.ANNOUNCEMENT_ADD;
}

function handleUpdate(row) {
  reset();
  openForm.value = true
  title.value    = TEXT.ANNOUNCEMENT_EDIT;
  getRecord(row.id).then(res => form.value = res.data);
}

function submitForm() {
  proxy.$refs[TEXT.REF_NAME].validate(valid => {
    if (!valid) return;
    const isUpdate = form.value.id !== null;
    const message  = isUpdate ? TEXT.EDIT_SUCCESS : TEXT.ADD_SUCCESS;
    const method   = isUpdate ? updateRecord(form.value) : addRecord(form.value);
    method.then(()=>{
      proxy.$modal.msgSuccess(message)
      openForm.value = false
      getList()
    })
  })
}

function handleDelete(row) {
  const ids = row.id || idList.value
  proxy.$confirm(TEXT.CONFIRM_WARNING, {
    confirmButtonText: TEXT.LABEL_CONFIRM,
    cancelButtonText:  TEXT.LABEL_CANCEL,
    type: TEXT.WARNING
  })
      .then(()=> deleteRecord(ids))
      .then(()=> {
        getList();
        proxy.$modal.msgSuccess(TEXT.DEL_SUCCESS)
      })
}

function toggleStatusSwitch(row) {
  try {
    loading.value = true;
    proxy.$confirm(TEXT.CONFIRM_WARNING, {
      confirmButtonText: TEXT.LABEL_CONFIRM,
      cancelButtonText: TEXT.LABEL_CANCEL
    }).then(()=>{
      return changeStatus(row.id, row.status);
    }).then(()=>{
      getList();
      proxy.$modal.msgSuccess(TEXT.EDIT_SUCCESS);
    }).catch(function () {
      row.status = row.status === 0 ? 1 : 0
    });
  } catch (error) {
    if (error !== TEXT.CANCEL) {
      proxy.$modal.msgError(TEXT.EDIT_FAILED);
    }
  } finally {
    loading.value = false;
  }
}

function formatterDevice(row) {
  switch (row.device) {
    case 0 :
      return TEXT.LABEL_DEVICE_WEB;
    case 1 :
      return TEXT.LABEL_DEVICE_MOBILE;
    default  :
      return "";
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  queryParams.orderByColumn = 'sort'
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  getList();
}

function getTranslatedJumpType(row) {
  const type = jumpTypes.find(type => type.value === row.jumpType);
  return type ? type.label : null;
}

getList()
</script>

<style>
.image-preview{
  max-height: 50px;
  max-width:  50px;
  object-fit: contain;
  display:    block;
  margin: 0   auto
}
</style>
