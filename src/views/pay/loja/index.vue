<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['loja:content:add']"
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
            v-hasPermi="['loja:content:delete']"
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
      <el-table-column align="center" label="Amount" min-width="180" prop="amount"/>
      <el-table-column align="center" label="Type" min-width="180" prop="type"/>
      <el-table-column align="center" label="Bonus" min-width="180" prop="bonus"/>
      <el-table-column align="center" label="Image" prop="image">
        <template #default="scope" >
          <a
              v-if="scope.row.image !== ''"
              :href="scope.row.image"
              style="color: #409eff; font-size: 12px"
              target="_blank"
          >
            <el-image
                style="height: 50px;"
                :src="scope.row.image"
                fit="contain"
                :href="scope.row.image"
                target="_blank"
            />
          </a>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['loja:content:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['loja:content:delete']"
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
               width="700px">
      <el-form ref="queryForm" :model="form" :rules="rules" label-width="120px">
        <div class="el-row">
          <div class="el-col-lg-12">
            <el-form-item label="Amount" prop="amount">
              <el-input type="number" v-model="form.amount" placeholder="Amount"/>
            </el-form-item>
            <el-form-item label="Type" prop="type">
              <el-select v-model="form.type" clearable placeholder="Select">
                <el-option
                    v-for="type in types"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Bonus" prop="bonus" >
              <el-input type="number" v-model="form.bonus" placeholder="Bonus"/>
            </el-form-item>
            <el-form-item>
              <el-upload
                  ref="upload"
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
                  name="lojaImage"
              >
                <!--                  :before-upload="beforeAvatarUpload"-->
                <div class="el-upload__text">Drop file here or <em>点击上传</em></div>
                <div class="el-upload__tip">
                  最大文件大小为 100 MB
                </div>
              </el-upload>
            </el-form-item>
          </div>
        </div>
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
  lojaList,
  deleteLoja,
  addLoja,
  updateLoja,
  getLoja,
  fileUpload
} from "@/api/pay/loja";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();

const storeList = ref([]);
const ids = ref([]);
const title = ref('');
const loading = ref(true);
const multiple = ref(true);
const open = ref(false);
const formData = new FormData();
const types = ref([
    {
      value: 1,
      label: 'First Recharge'
    },
    {
      value: 2,
      label: 'Popular'
    },
    {
      value: 3,
      label: 'Regular'
    }])
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

  rules: {},

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
  lojaList(queryParams.value).then(response => {
    storeList.value = response.data;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    amount: null,
    type: null,
    bonus: null,
    image: null
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
    if (valid) {
      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => {
          form.value.image = res.data
        });
      }
      if (form.value.id != null) {
        updateLoja(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addLoja(form.value).then(() => {
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
  getLoja(row.id).then(response => {
    form.value = response.data;
  });
  console.log(JSON.stringify(form.value) + " @@@@")
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
    return deleteLoja(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}


function selectFile(file) {
  this.fileToUpload = file;
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

getList()
</script>
