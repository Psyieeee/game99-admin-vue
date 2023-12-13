<template>
  <div class="app-container">
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
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="名字" min-width="180" prop="name"/>
      <el-table-column align="center" label="Chinese" min-width="180" prop="chinese"/>
      <el-table-column align="center" label="English" min-width="180" prop="english"/>
      <el-table-column align="center" label="Indonesian" min-width="180" prop="indonesian"/>
      <el-table-column align="center" label="Portuguese - Brazil" min-width="180" prop="portugueseBrazil"/>
      <el-table-column align="center" label="Traditional Chinese" min-width="180" prop="traditionalChinese"/>
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


    <!-- Add or modify list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="500px">
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="150px">
            <el-form-item label="名字" prop="name">
              <el-input v-model="form.name" placeholder="名字"/>
            </el-form-item>
            <el-form-item label="Chinese" prop="chinese">
              <el-input v-model="form.chinese" placeholder="Chinese" type="textarea"/>
            </el-form-item>
            <el-form-item label="English" prop="english">
              <el-input v-model="form.english" placeholder="English" type="textarea"/>
            </el-form-item>
            <el-form-item label="Indonesian" prop="indonesian">
              <el-input v-model="form.indonesian" placeholder="Indonesian" type="textarea"/>
            </el-form-item>
            <el-form-item label="Portuguese - Brazil" prop="portugueseBrazil">
              <el-input v-model="form.portugueseBrazil" placeholder="Portuguese - Brazil" type="textarea"/>
            </el-form-item>
            <el-form-item label="Traditional Chinese" prop="traditionalChinese">
              <el-input v-model="form.traditionalChinese" placeholder="Traditional Chinese" type="textarea"/>
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

const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    downloadLink: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ]
  },

});
const {queryParams, form, rules} = toRefs(data);

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  console.log( "selection " + !selection.length)
  multiple.value = !selection.length;
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  configTranslationList(queryParams.value).then(response => {
    console.log("*******************")
    console.log(response.data)
    recordList.value = response.data;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    name: null,
    chinese: null,
    english: null,
    indonesian: null,
    portugueseBrazil: null,
    traditionalChinese: null
  }
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
    console.log("form value: ");
    console.log(form.value);
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