<template>
  <div class="app-container">
    <!--    search form-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="98px">
      <el-form-item label="歌曲名称" prop="title" style="min-width: 290px">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入歌曲名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="effect">
        <el-select v-model="queryParams.effect" placeholder="状态" clearable>
          <el-option value="true" label="激活"></el-option>
          <el-option value="false" label="停用"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['member:memberAdvertisement:add']"
        >新增
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
            v-hasPermi="['member:memberAdvertisement:remove']"
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
            v-hasPermi="['member:memberAdvertisement:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="memberAdvertisementList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="歌曲名称" align="center" prop="title" min-width="180"/>
      <el-table-column label="网址" :show-overflow-tooltip="true" min-width="180" align="center" prop="url">
        <template #default="scope">
          <div>
            <a
                v-if="scope.row.url !== ''"
                :href="scope.row.url"
                target="_blank"
                style="color: #409eff; font-size: 12px"
            >下载
            </a>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="150">
        <template #default="scope">
          <el-button
              size="small"
              type="primary" link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['member:memberAdvertisement:update']">修改
          </el-button>
          <el-button
              size="small"
              type="danger" link
              style="color: #e05e5e"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['member:memberAdvertisement:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,30,50]"
        @pagination="getList"
    />

    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="700px" style="padding-bottom: 20px"
               append-to-body>
      <el-form ref="memberAdvertisementRef" :model="form" :rules="rules" label-width="100px">
        <div class="el-row">
          <div class="el-col-lg-12">
            <el-form-item label="歌曲名称" prop="title" style="min-width: 290px">
              <el-input
                  v-model="form.title"
                  placeholder="请输入歌曲名称"
                  clearable
              />
            </el-form-item>
            <el-form-item label="活跃" prop="effect"  v-hasPermi="['member:memberAdvertisement:update']" >
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
                  drag

                  :multiple="false"
                  :limit="1"
                  :on-exceed="handleExceed"
                  class="upload-demo"
                  ref="upload"
                  :action="uploadFileUrl"
                  :headers="headers"
                  name="advertisementFile"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-change="selectFile1"
                  :on-error="uploadFalse"
                  :on-success="uploadSuccess"
                  :auto-upload="false"
                  :before-upload="beforeAvatarUpload"
              >
                <!--                <el-button slot="trigger" type="primary" size="default" @click="submitUpload">上传音乐文件</el-button>-->
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

    <el-dialog :title="title" v-model="openText" width="600px" :close-on-click-modal="false" append-to-body>
      <el-form ref="textFormRef" :model="form" :rules="rulesFormText" label-width="80px">
        <el-form-item label="文本2 " prop="text2">
          <el-input v-model="form.text2" placeholder=" 请输入文本2 " type="textarea" rows="4"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormText"> 确 定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script name="MemberAdvertisement" setup>

import {
  addAdvertisement,
  changeAdvertisementStatus,
  deleteAdvertisement,
  exportMemberAdvertisement, fileUpload, getAdvertisementData,
  advertisementListData,
  updateAdvertisement
} from "@/api/member/memberAdvertisement";
// import  {jsmediatags} from "jsmediatags";

const router = useRouter();
const {proxy} = getCurrentInstance();
const formData = new FormData();

import {reactive, ref, toRefs} from "vue";
import {downloadExcel} from "@/utils/common";
import {getToken} from "@/utils/auth";
import {uploadExcelUrl} from "@/api/member/memberMoney";
import {url} from "@/utils/url";

const memberAdvertisementList = ref([]);
// const bankListOptions = ref([]);
const ids = ref([]);


const title = ref('');
const total = ref(0);
// const fileToUpload = ref([]);

const open = ref(false);
// 查询参数
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
const {queryParams, form, rules, rulesFormText, headers, uploadFileUrl, fileToUpload} = toRefs(data);


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
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm('memberAdvertisementRef')
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
      if (form.value.id != null) {
        fileUpload(formData).then(res => {
          console.log("res " + res.data);

          const params = {
            title: form.value.title,
            effect: form.value.effect,
            url: res.data,
          }

          updateAdvertisement(form.value).then(response => {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            getList()
          })
        })
      } else {
        fileUpload(formData).then(res => {
          console.log("res " + res.data);

          const params = {
            title: form.value.title,
            effect: form.value.effect,
            url: res.data,
          }

          addAdvertisement(params).then(response => {
            proxy.$modal.msgSuccess('新增成功')
            open.value = false
            getList()
          })
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


function handleChange(file) {
  // const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const arrayBuffer = e.target.result;
    const buffer = new Uint8Array(arrayBuffer);

    // Parse the MP3 file and retrieve the metadata
    const metadata = this.parseMP3Metadata(buffer);

    // Access the metadata fields (e.g., title, album)
    const title = metadata.title;
    const album = metadata.album;

    // Do something with the metadata
    console.log("Title:", title);
    console.log("Album:", album);
  };

  reader.readAsArrayBuffer(file);
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
  if (fileExtension != 'mp3' &&
      fileExtension != 'mp4' &&
      fileExtension != 'm4a' &&
      fileExtension != 'aac' &&
      fileExtension != 'wma' &&
      fileExtension != 'wav' &&
      fileExtension != 'flac') {
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

function selectFile1(file, fileList) {
  // const fileName = file.name.substring(file.name.lastIndexOf(".") + 1);
  console.log("file, ", file);
  console.log("fileList, ", fileList);
  this.fileToUpload = file;

  formData.append("file", file.raw)
  formData.append("name", file.name)

  // console.log("fileName " + fileName);
  console.log("fileList " + fileList, fileList);
  console.log("file " + file, file);
  console.log("fileToUpload " + fileToUpload, fileToUpload);
  // memberAdvertisementRef.title = fileName;
}


getList()
</script>

<style>
</style>
