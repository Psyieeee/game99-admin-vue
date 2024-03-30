<template>
  <div class="app-container">
    <el-row style="display: inline">
        <el-button v-for=" button in Object.values(HOME_BUTTON)" :icon="button.icon" :size="button.size" :type="button.type" v-hasPermi="[button.permission]" @click="button.handler">{{ button.label }}</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column :align="TEXT.CENTER" :type="TEXT.SELECTION" width="60"/>
      <template v-for="field in Object.values(TABLE)">
        <el-table-column v-if="field.prop === TEXT.PROP_IMAGE" :label="field.label" :prop="field.prop" :align="field.align">
          <template #default="scope">
            <img :src="scope.row.image" class="image-preview">
          </template>
        </el-table-column>
        <el-table-column v-else-if="field.prop === TEXT.PROP_STATUS"   :label="field.label" :prop="field.prop" :align="field.align">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value=1 :inactive-value=0 @click="toggleStatusSwitch(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column v-else                                        :label="field.label" :prop="field.prop" :align="field.align"/>
      </template>
      <el-table-column :align="TEXT.CENTER" class-name="small-padding fixed-width" :fixed="TEXT.RIGHT" :label="TEXT.LABEL_ACTION" min-width="100">
        <template #default="scope">
          <el-button v-for=" button in Object.values(ACTION_BUTTON)" :icon="button.icon" link :size="button.size" :type="button.type" v-hasPermi="[button.permission]" @click="button.handler(scope.row)">{{ button.label }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="openForm" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px; padding-right: 20px" width="800px" >
      <el-form :ref="TEXT.REF_NAME" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="TEXT.LABEL_TITLE" :prop="TEXT.PROP_TITLE">
            <el-input v-model="form.title" :placeholder="TEXT.PLACEHOLDER_TITLE" />
          </el-form-item>
        <el-form-item :label="TEXT.LABEL_JUMP_TYPE">
          <el-select v-model="form.jumpType">
            <el-option v-for="type in jumpTypes" :key="type" :label="type" :value="type"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_CONTENT" :prop="TEXT.PROP_CONTENT">
          <textarea style="height: 100px; width: 640px; margin-top: 5px" v-model="form.content"/>
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_IMAGE" :prop="TEXT.PROP_IMAGE">
          <image-upload v-model="form.image" :path="TEXT.IMG_PATH"/>
        </el-form-item>
        <el-form-item :label="TEXT.LABEL_STATUS" :prop="TEXT.PROP_STATUS">
          <el-switch v-model="form.status" :active-value=1 :inactive-value=0 />
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

const jumpTypes = ["VIP", "DAILY_BONUS", "FUND" ,"RECHARGE","BIND_PHONE" , "INVITER", "EXTERNAL"]
const {proxy}   = getCurrentInstance();
const openForm  = ref(false);
const multiple  = ref(true);
const loading   = ref(true);
const tableList = ref([]);
const idList    = ref([]);
const title     = ref('');
const TEXT      = {
  PERMISSION_DEL:    'other:announcement:content:delete',
  PERMISSION_EDIT:   'other:announcement:content:edit',
  PERMISSION_ADD:    'other:announcement:content:add',
  ANNOUNCEMENT_EDIT: '更新公告',
  ANNOUNCEMENT_ADD:  '添加公告',
  LABEL_ACTION:      'action',
  LABEL_JUMP_TYPE:   '跳跃式',
  LABEL_CONTENT:     '内容',
  LABEL_STATUS:      '状态',
  LABEL_CONFIRM:     '确定',
  LABEL_SUBMIT:      '提交',
  LABEL_CANCEL:      '取消',
  LABEL_TITLE:       '标题',
  LABEL_IMAGE:       '照片',
  LABEL_ADD:         '新增',
  LABEL_EDIT:        '新增',
  LABEL_SORT:        '分类',
  LABEL_DEL:         '删除',
  PROP_JUMP_TYPE:    'jumpType',
  PROP_CONTENT:      'content',
  PROP_STATUS:       'status',
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
  INVALID_TITLE:     '需要标题',
  INVALID_CONTENT:   '所需内容',
  EDIT_FAILED:       '修改',
  ACTIVE:            '启用',
}

const ACTION_BUTTON = {
  EDIT: { label: TEXT.LABEL_EDIT, icon: TEXT.PRIMARY, size: TEXT.SMALL, type: TEXT.PRIMARY, permission: TEXT.PERMISSION_EDIT, handler: handleUpdate },
  DEL:  { label: TEXT.LABEL_DEL,  icon: TEXT.DELETE,  size: TEXT.SMALL, type: TEXT.DANGER,  permission: TEXT.PERMISSION_DEL,  handler: handleDelete },
}
const FOOTER_BUTTON = {
  SUBMIT: { label: TEXT.LABEL_SUBMIT, icon: null,    size: TEXT.SMALL, type: TEXT.SUCCESS, handler: submitForm },
  CANCEL: { label: TEXT.LABEL_CANCEL, icon: null,         size: TEXT.SMALL, type: TEXT.PRIMARY, handler: () => openForm.value = false },
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
  SORT:      { label: TEXT.LABEL_SORT,      prop: TEXT.PROP_SORT,      align: TEXT.CENTER },
}
const data          = reactive({
  queryParams: {},
  form: {},
  rules: {
    title: { required: true, message: TEXT.INVALID_TITLE, trigger: TEXT.TRIG_BLUR },
  }
});
const { queryParams, form, rules } = toRefs(data);

function getList() {
  loading.value = true;
  recordList(queryParams.value).then(response => {
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
    content: null,
    status: 0,
    jumpType: jumpTypes[0],
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
    proxy.$confirm(TEXT.CONFIRM_WARNING, {
      confirmButtonText: TEXT.LABEL_CONFIRM,
      cancelButtonText: TEXT.LABEL_CANCEL
    }).then(()=>{
      loading.value = true;
      changeStatus(row.id, row.status);
      proxy.$modal.msgSuccess(TEXT.EDIT_SUCCESS);
      getList();
    }).catch(()=> row.status = !row.status);
  } catch (error) {
    if (error !== TEXT.CANCEL) {
      proxy.$modal.msgError(TEXT.EDIT_FAILED);
    }
  } finally {
    loading.value = false;
  }
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
