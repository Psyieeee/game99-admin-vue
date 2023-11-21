<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams" label-width="98px">
      <el-form-item label="广告标题" prop="title" style="min-width: 290px">
        <el-input
            v-model="queryParams.title"
            clearable
            placeholder="请输入广告标题"
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
            v-hasPermi="['member:memberAdvertisement:add']"
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
            v-hasPermi="['member:memberAdvertisement:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['member:memberAdvertisement:export']"
            icon="Download"
            plain
            size="small"
            type="warning"
            @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="memberAdvertisementList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="广告标题" min-width="180" prop="title"/>
      <el-table-column :show-overflow-tooltip="true" align="center" label="网址" min-width="180" prop="url">
        <template #default="scope">
          <div>
            <a
                v-if="scope.row.url !== ''"
                :href="scope.row.url"
                style="color: #409eff; font-size: 12px"
                target="_blank"
            >下载
            </a>
          </div>
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
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['member:memberAdvertisement:update']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['member:memberAdvertisement:remove']"
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
      <el-form ref="memberAdvertisementRef" :model="form" :rules="rules" label-width="100px">
        <div class="el-row">
          <div class="el-col-lg-24">
            <el-form-item label="广告标题" prop="title" style="min-width: 290px">
              <el-input
                  v-model="form.title"
                  clearable
                  placeholder="请输入广告标题"
              />
            </el-form-item>
            <el-form-item v-hasPermi="['member:memberAdvertisement:update']" label="活跃" prop="effect">
              <template #default="scope">
                <el-switch
                    v-model="form.effect"
                    :active-value="1"
                    :inactive-value="0"
                ></el-switch>
              </template>
            </el-form-item>
            <el-form-item>
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
                  name="advertisementFile"
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
  </div>
</template>

<script name="MemberAdvertisement" setup>

import {
  addAdvertisement,
  advertisementListData,
  changeAdvertisementStatus,
  deleteAdvertisement,
  exportMemberAdvertisement,
  fileUpload,
  getAdvertisementData,
  updateAdvertisement
} from "@/api/member/memberAdvertisement";
import {reactive, ref, toRefs} from "vue";
import {url} from "@/utils/url";
import {getToken} from "@/utils/auth";

const router = useRouter();
const {proxy} = getCurrentInstance();
const formData = new FormData();

const memberAdvertisementList = ref([]);
const ids = ref([]);
const title = ref('');
const total = ref(0);
const open = ref(false);
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

  uploadFileUrl: uploadAdvertisementUrl(),

  DialogForm: {
    title: null,
    effect: null,
  }

});
const {queryParams, form, rules, rulesFormText, headers, uploadFileUrl} = toRefs(data);


/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  advertisementListData(queryParams.value).then(response => {
    memberAdvertisementList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    title: null,
    size: null,
    upload: null,
    url: null,
    effect: null,
    createTime: null,
    updateTime: null
  }
  proxy.$refs.upload.clearFiles();
  proxy.resetForm('memberAdvertisementRef');
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
  proxy.$refs['memberAdvertisementRef'].validate(async valid => {
    if (valid) {
      const params = {
        title: form.value.title,
        artist: form.value.artist,
        effect: form.value.effect,
        url: null
      }

      if (formData.get("file") != null) {
        await fileUpload(formData).then(res => params.url = res.data);
      }

      if (form.value.id != null) {
        updateAdvertisement(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addAdvertisement(params).then(() => {
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
  getAdvertisementData(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改音乐列表'
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
    return deleteAdvertisement(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

/**  导出按钮操作 handle export data as excel query */
function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportMemberAdvertisement(queryParams.value)
  }).then(response => {
    downloadExcel(response, '公司入款银行')
  }).catch(() => {
  })
}

function handleEffectChange(row) {
  let text = row.effect === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    const effect = changeAdvertisementStatus(row.id, row.effect);
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
  single.value = selection.length != 1;
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
  proxy.$modal.msgError(' 上传音乐文件失败')
}

function uploadSuccess() {
  proxy.$modal.msgSuccess('文件上传成功');
  queryParams.memberId = null
  queryParams.pageNum = 1
  getList()
}

function beforeAvatarUpload(file) {
  const fileExtension = file.name.split('.')[1]
  const isLt2M = file.size / 1024 / 1024 < 100
  if (fileExtension !== 'jpg' &&
      fileExtension !== 'png' &&
      fileExtension !== 'bmp') {
    proxy.$modal.msgError('无效音乐')
  } else if (!isLt2M) {
    proxy.$modal.msgError('上传模板大小不能超过100MB!')
  }
}

function uploadAdvertisementUrl() {
  return url.baseUrl + url.game99PlatformAdminWeb + "/member/advertisement/upload";
}

function submitUpload() {
  proxy.$refs.upload.submit()
}

function parseMP3Metadata(buffer) {
  return new Promise((resolve, reject) => {
    jsmediatags.read(buffer, {
      onSuccess: (tag) => {
        const metadata = {
          title: tag.tags.title,
          album: tag.tags.album,
          // Add more metadata fields as needed
        };
        // console.log("title "  + tag.tags.title);
        resolve(metadata);
      },
      onError: (error) => {
        reject(error);
      }
    });
  });
}

function selectFile1(file) {
  formData.append("file", file.raw)
  formData.append("name", file.name)
}


getList()
</script>

<style>
</style>
