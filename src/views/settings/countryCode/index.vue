<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['settings:countryCode:add']"
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
            v-hasPermi="['settings:countryCode:delete']"
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
    <el-table v-loading="loading" :data="storeList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="国家" min-width="180" prop="country"/>
      <el-table-column align="center" label="国家代码" min-width="180" prop="code"/>
      <el-table-column align="center" label="排序号" min-width="180" prop="sort"/>
      <el-table-column align="center" label="图标" prop="icon">
        <template #default="scope" >
          <a
              v-if="scope.row.icon !== ''"
              :href="scope.row.icon"
              style="color: #409eff; font-size: 12px"
              target="_blank"
          >
            <el-image
                style="height: 50px;"
                :src="scope.row.icon"
                fit="contain"
                :href="scope.row.icon"
                target="_blank"
            />
          </a>
        </template>
      </el-table-column>
      <el-table-column label="地位" prop="status" align="center" width="180">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @click="toggleSwitch(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['settings:countryCode:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['settings:countryCode:delete']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="600px">
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="国家" prop="country">
          <el-input v-model="form.country" placeholder="国家"/>
        </el-form-item>
        <el-form-item label="国家代码" prop="code" >
          <el-input v-model="form.code" placeholder="国家代码"/>
        </el-form-item>
        <el-form-item label="排序号" prop="sort" >
          <el-input type="number" v-model="form.sort" placeholder="排序号"/>
        </el-form-item>
        <el-form-item label="地位" prop="status">
          <el-switch v-model="form.status"
                     :active-value=1
                     :inactive-value=0
          />
        </el-form-item>
        <el-form-item>
          <el-upload
              v-model:file-list="upload"
              :auto-upload="false"
              :limit="1"
              :multiple="false"
              :on-change="selectFile"
              :on-error="uploadFalse"
              :on-exceed="handleExceed"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="uploadSuccess"
              class="upload-demo"
              drag
              name="countryIcon"
          >
            <!--                  :before-upload="beforeAvatarUpload"-->
            <div class="el-upload__text">Drop file here or <em>点击上传</em></div>
            <div class="el-upload__tip">
              最大文件大小为 100 MB
            </div>
          </el-upload>
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
  countryCodeList,
  deleteCountryCode,
  addCountryCode,
  updateCountryCode,
  getCountryCode,
  fileUpload,
  changeStatus
} from "@/api/settings/countryCode";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();

const storeList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const upload = ref([]);
const formData = new FormData();
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {
    country: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    code: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ],
    sort: [
      {required: true, message: '无效的值', trigger: 'blur'}
    ]
  },

});
const {queryParams, form, rules} = toRefs(data);

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  countryCodeList(queryParams.value).then(response => {
    storeList.value = response.data;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    country: null,
    code: null,
    status: 1
  }
  clearUpload()
  proxy.resetForm('queryForm');
}

function clearUpload(){
  upload.value = [];
  formData.delete("file")
  formData.delete("name")
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
    if (valid) {
      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => {
          form.value.icon = res.data
        });
      }
      if (form.value.id != null) {
        updateCountryCode(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addCountryCode(form.value).then(() => {
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
  clearUpload()
  getCountryCode(row.id).then(response => {
    form.value = response.data;
  });
  open.value = true
  title.value = '更新记录'
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteCountryCode(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}


function selectFile(file) {
  //this.fileToUpload = file;
  formData.append("file", file.raw)
  formData.append("name", file.name)
}

function handleRemove() {
  proxy.$modal.msgSuccess('移除成功')
}

function uploadFalse() {
  proxy.$modal.msgError('上传失败')
}

function uploadSuccess() {
  proxy.$modal.msgSuccess('上传文件成功');
  getList()
}

function handleExceed() {
  proxy.$modal.msgError('只能选择一个文件，如果要更改，请退出并重新选择。')
}

function handlePreview(file) {
  console.info(file.response.status)
  if (file.response.status) {
    proxy.$modal.msgSuccess('此文件导入成功')
  } else {
    proxy.$modal.msgError('此文件导入失败')
  }
}

function toggleSwitch (row) {
  const text = row.status === 1 ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    let status;
    loading.value = true
    status = changeStatus(row.id, row.status);
    if (status) {
      return status
    }
  }).then(() => {
    loading.value = false
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    loading.value = false
    row.status = row.status === 0 ? 1 : 0
  })
}

getList()
</script>
