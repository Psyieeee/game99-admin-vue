<template>
  <div class="app-container">
    <!--    search form-->
    <el-form v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams" label-width="98px">
      <el-form-item label="歌曲名称" prop="title" style="min-width: 290px">
        <el-input
            v-model="queryParams.name"
            clearable
            placeholder="请输入歌曲名称"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="effect">
        <el-select v-model="queryParams.effect" clearable placeholder="状态">
          <el-option label="激活" value="true"></el-option>
          <el-option label="停用" value="false"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['config:otherOssFile:add']"
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
            v-hasPermi="['config:otherOssFile:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--            v-hasPermi="['config:otherOssFile:export']"-->
<!--            icon="Download"-->
<!--            plain-->
<!--            size="small"-->
<!--            type="warning"-->
<!--            @click="handleExport"-->
<!--        >导出-->
<!--        </el-button>-->
<!--      </el-col>-->
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="otherOssFileList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="艺术家" min-width="120" prop="name"/>
      <el-table-column align="center" label="艺术家" min-width="120" prop="code"/>
      <el-table-column :show-overflow-tooltip="true" align="center" label="网址" min-width="180" prop="url">
<!--        <template #default="scope">-->
<!--          <div>-->
<!--            <a-->
<!--                v-if="scope.row.url !== ''"-->
<!--                :href="scope.row.url"-->
<!--                style="color: #409eff; font-size: 12px"-->
<!--                target="_blank"-->
<!--            >下载-->
<!--            </a>-->
<!--          </div>-->
<!--        </template>-->
        <template #default="scope">
          <el-image :src="scope.row.url" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="艺术家" min-width="120" prop="updatedBy"/>
      <el-table-column align="center" label="艺术家" min-width="120" prop="updatedTime"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['config:otherOssFile:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['config:otherOssFile:remove']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50]"
        :total="total"
        @pagination="getList"
    />

    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="700px">
      <el-form ref="otherOssFileRef" :model="form" :rules="rules" label-width="120px">
        <div class="el-row">
          <div class="el-col-lg-12">
            <el-form-item label="代码" prop="code" style="min-width: 290px">
              <el-input
                  v-model="form.code"
                  clearable
                  placeholder="请输入歌曲名称"
              />
            </el-form-item>
            <el-form-item label="名称" prop="name" style="min-width: 290px">
              <el-input
                  v-model="form.name"
                  clearable
                  placeholder="请输入歌曲名称"
              />
            </el-form-item>
            <el-form-item  label="文件">
              <el-upload
                  ref="upload"
                  :action="uploadFileUrl"
                  :auto-upload="false"
                  :before-upload="beforeAvatarUpload"
                  :headers="headers"
                  :limit="1"
                  :multiple="false"
                  :on-change="selectFile1"
                  :on-error="uploadFalse"
                  :on-exceed="handleExceed"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-success="uploadSuccess"
                  class="upload-demo"
                  drag
                  name="otherOssFile"
              >
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

    <el-dialog v-model="openText" :close-on-click-modal="false" :title="title" append-to-body width="600px">
      <el-form ref="textFormRef" :model="form" :rules="rulesFormText" label-width="80px">
        <el-form-item label="文本2 " prop="text2">
          <el-input v-model="form.text2" placeholder=" 请输入文本2 " rows="4" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormText"> 确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="MemberMusic" setup>

import {
  fileUpload,
  otherOssFileListData,
  getOtherOssFileData,
  updateOtherOssFile,
  changeOtherOssFileStatus,
  deleteOtherOssFile,
  addOtherOssFile
} from "@/api/member/otherOssFile";
import {reactive, ref, toRefs} from "vue";
import {url} from "@/utils/url";
import {getToken} from "@/utils/auth";

const router = useRouter();
const {proxy} = getCurrentInstance();
const formData = new FormData();

const otherOssFileList = ref([]);
const ids = ref([]);
const title = ref('');
const total = ref(0);
const open = ref(false);
const openText = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);

const data = reactive({

  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    title: null,
    artist: null,
    effect: null,
  },
  fileToUpload: null,

  /** 表单参数 form parameter*/
  form: {},

  /** 表单校验 form validation */
  rules: {
    title: [
      {required: true, message: '银行名称不能为空', trigger: 'blur'}
    ],
  },

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

  uploadFileUrl: uploadMusicUrl(),

  DialogForm: {
    name: null,
    url: null,
    effect: null,
  }

});
const {queryParams, form, rules, rulesFormText, headers, uploadFileUrl, fileToUpload} = toRefs(data);


/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  otherOssFileListData(queryParams.value).then(response => {
    otherOssFileList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    code: null,
    name: null,
    upload: null,
    url: null,
    effect: null,
    updatedBy: null,
    updatedTime: null
  }
  // proxy.$refs.upload.clearFiles();
  proxy.resetForm('otherOssFileRef')
}

function resetFormText() {
  form.value = {
    id: null,
    text2: null
  }
  proxy.resetForm('textFormRef')
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 handle reset query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加会员音乐'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['otherOssFileRef'].validate(async valid => {
    if (valid) {
      const params = {
        name: form.value.name,
        code: form.value.code,
        effect: form.value.effect === 1 ? 1 : 0,
        url: null
      }

      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => {
          console.log(" params.url " + params.url)
          if (form.value.id != null) {
            form.value.url = res.data
          } else {
            params.url = res.data
          }
        });
      }
      if (form.value.id != null) {
        updateOtherOssFile(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addOtherOssFile(params).then(() => {
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
  reset()
  const id = row.id || this.ids
  getOtherOssFileData(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改其他 Oss 文件'
  })
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteOtherOssFile(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

/**  导出按钮操作 handle export data as excel query */
function handleExport() {
  // proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
  //   confirmButtonText: '确认',
  //   cancelButtonText: '取消',
  //   type: 'warning'
  // }).then(function () {
  //   return exportMemberMusic(queryParams.value)
  // }).then(response => {
  //   downloadExcel(response, '公司入款银行')
  // }).catch(() => {
  // })
}

function handleEffectChange(row) {
  let text = row.effect === '1' ? '启用' : '停用'
  proxy.$confirm('确认要吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    const effect = changeOtherOssFileStatus(row.id, row.effect);
    loading.value = true
    if (effect) {
      loading.value = false
      return effect
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
  })
}

/** select multiple option */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

function handleExceed() {
  proxy.$modal.msgError('只能选择一个音乐文件，如果要更改，请退出并重新选择。')
}

function handlePreview(file) {
  console.info(file.response.status)
  if (file.response.status) {
    proxy.$modal.msgSuccess('此文件导入成功')
  } else {
    proxy.$modal.msgError('此文件导入失败')
  }
}

function handleRemove() {
  proxy.$modal.msgSuccess('移除成功')
}

function uploadFalse() {
  proxy.$modal.msgError('音乐文件 上传音乐文件失败')
}

function uploadSuccess() {
  proxy.$modal.msgSuccess('音乐文件上传成功');
  queryParams.memberId = null
  queryParams.pageNum = 1
  getList()
}

function beforeAvatarUpload(file) {
  const fileExtension = file.name.split('.')[1]
  const isLt2M = file.size / 1024 / 1024 < 100
  if (fileExtension !== 'mp3' &&
      fileExtension !== 'mp4' &&
      fileExtension !== 'm4a' &&
      fileExtension !== 'aac' &&
      fileExtension !== 'wma' &&
      fileExtension !== 'wav' &&
      fileExtension !== 'flac') {
    proxy.$modal.msgError('无效音乐')
  } else if (!isLt2M) {
    proxy.$modal.msgError('上传模板大小不能超过100MB!')
  }
}

function uploadMusicUrl() {
  return url.baseUrl + url.game99PlatformAdminWeb + "/member/music/upload";
}

function submitUpload() {
  proxy.$refs.upload.submit()
}

function selectFile1(file, fileList) {
  this.fileToUpload = file;
  formData.append("file", file.raw)
  formData.append("name", file.name)
}

getList()
</script>

<style>
</style>
