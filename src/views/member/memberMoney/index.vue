<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                 style="display: flex; align-items: flex-start;">
          <el-form-item label="会员ID" prop="memberId">
            <el-input
                v-model="queryParams.memberId"
                placeholder="请输入会员ID"
                clearable
                size="default"
                @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" size="default" @click="handleQuery">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-upload
                multiple
                :limit="1"
                :on-exceed="handleExceed"
                class="upload-demo"
                ref="upload"
                :action="uploadFileUrl"
                :headers="headers"
                name="excelFile"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-error="uploadFalse"
                :on-success="uploadSuccess"
                :auto-upload="true"
                :before-upload="beforeAvatarUpload"
            >
              <el-button slot="trigger" type="primary" size="default" @click="submitUpload">上传excel</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="success" size="default" @click="starSendOpen">开始派送</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="default" @click="handleClean">清除数据</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" size="default" style="margin-left: 20px;">
              总派送金额 : {{ totalMoney || 0 }}
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
                       icon="Search"
                       size="default"
                       @click="getTotalMoney">统计派送金额
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            size="small"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['member:money:edit']"
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
            v-hasPermi="['member:money:remove']"
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
            v-hasPermi="['member:money:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="memberMoneyList" v-loading="loading" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" min-width="150"/>
      <el-table-column align="center" label="会员id" prop="id"/>
      <el-table-column align="center" label="派送金额" prop="money"/>
      <el-table-column align="center" label="打码倍数" prop="beat"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="150">
        <template #default="scope">
          <el-button
              size="default"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['member:money:edit']"
          >修改
          </el-button>
          <el-button
              size="default"
              type="primary"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['member:money:remove']"
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
        :page-sizes="[20,30,50]"
        @pagination="getList"
    />

    <!-- 添加或修改派送彩金暂存表对话框 update data -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="500px"
               append-to-body>
      <el-form ref="formUpdate" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="派送金额" prop="money">
          <el-input v-model="form.money" placeholder="请输入派送金额"/>
        </el-form-item>
        <el-form-item label="打码倍数" prop="beat">
          <el-input v-model="form.beat" placeholder="请输入打码倍数"/>
        </el-form-item>
        <el-form-item label="谷歌验证码" prop="googleAuthCode">
          <el-input v-model="form.googleAuthCode" placeholder="请输入谷歌验证码"/>
        </el-form-item>
        <el-footer height="10px" slot="footer" style="text-align: right;">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open=!open">取 消</el-button>
        </el-footer>
      </el-form>
    </el-dialog>

    <!-- Star Send -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open_" width="400px"
               append-to-body>
      <el-form ref="formUpdate" :model="form" :rules="uploadStarRules" label-width="100px">
        <el-form-item label="入款备注" prop="moneydes">
          <el-input v-model="form.moneydes" placeholder="请输入入款备注"/>
        </el-form-item>
        <el-form-item label="谷歌验证码" prop="googleAuthCode">
          <el-input v-model="form.googleAuthCode" placeholder="请输入谷歌验证码"/>
        </el-form-item>
      </el-form>
      <el-footer height="10px" slot="footer" style="text-align: right;">
        <el-button type="primary" @click="submitFormStarSend">开始派送</el-button>
        <el-button @click="open_=!open_">取 消</el-button>
      </el-footer>
    </el-dialog>

  </div>
</template>

<script setup name="MemberMoney">

import {getCurrentInstance, reactive, ref, toRefs, onMounted} from "vue";
import {
  addMemberMoney, count, delMemberMoney,
  exportMemberMoney,
  getMemberMoney,
  handleCleanData,
  listMemberMoneyData,
  updateMemberMoney,
  uploadExcelUrl,
  starSend
} from "@/api/member/memberMoney";
import {getToken} from "@/utils/auth";

const {proxy} = getCurrentInstance();

const memberMoneyList = ref([]);
const showSearch = ref(true);
const loading = ref(false);
const open = ref(false);
const open_ = ref(false);
const total = ref(0);
const totalMoney = ref(0);

const ids = ref([]);

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */

const fileList = ref('');
const title = ref('');


const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    money: null
  },
  headers: {
    Authorization: 'Bearer ' + getToken()
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    money: [
      {required: true, message: '派送金额不能为空', trigger: 'blur'}
    ],
    beat: [
      {required: true, message: '打码倍数不能为空', trigger: 'blur'}
    ],
  },
  uploadStarRules: {
    moneydes: [
      {required: true, message: '入款备注不能为空', trigger: 'blur'}
    ],
    googleAuthCode: [
      {required: true, message: '谷歌验证码不能为空', trigger: 'blur'}
    ]
  },
  uploadFileUrl: uploadExcelUrl()
});

const {queryParams, headers, form, rules, uploadFileUrl, uploadStarRules} = toRefs(data)

/**  表单重置 */
function reset() {
  form.value = {
    memberId: null,
    money: null,
    beat: null,
    moneydes: null,
    googleAuthCode: null
  }
  proxy.resetForm('formUpdate')
}

/**
 * 查询派送彩金暂存表列表 list
 */
function getList() {
  loading.value = true
  listMemberMoneyData(queryParams.value).then(response => {
    memberMoneyList.value = response.data;
    total.value = response.total
    loading.value = false
  })
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const memberId = row.id || ids.value
  getMemberMoney(memberId).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改派送彩金暂存表'
  })
}

function submitFormStarSend() {
  open_.value = false;
  loading.value = true;
  starSend(form.value.moneydes, form.value.googleAuthCode).then(response => {
    loading.value = false;
    if (response.code === 200) {
      getList();
      proxy.$modal.msgSuccess('派送成功');
    } else {
      proxy.$modal.msgError('运送失败');
    }
  }).catch(
      loading.value = false
  )
}

/** 删除按钮操作 handle delete*/
function handleDelete(row) {
  const memberIds = row.id || ids.value
  proxy.$modal.confirm('是否确认删除派送彩金暂存表编号为"' + memberIds + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delMemberMoney(memberIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {
  })
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 reset query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
}

function handleExceed() {
  proxy.$modal.msgError('只能选取一个excel,如需更换请x掉再选取')
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
  proxy.$modal.msgError('excel上传失败')
}

function uploadSuccess() {
  proxy.$modal.msgSuccess('excel上传成功');
  queryParams.memberId = null
  queryParams.pageNum = 1
  getList()
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formUpdate'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMemberMoney(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addMemberMoney(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function beforeAvatarUpload(file) {
  const extension = file.name.split('.')[1] === 'xlsx'
  const extensionXls = file.name.split('.')[1] === 'xls' //added this new extensionsXsl
  const isLt2M = file.size / 1024 / 1024 < 10
  if (!extension && !extensionXls) {
    proxy.$modal.msgError('上传模板只能是xlsx or xls 格式的excel文件!')
  } else if (!isLt2M) {
    proxy.$modal.msgError('上传模板大小不能超过10MB!')
  }
}

/** 触发组件的action */
function submitUpload() {
  proxy.$refs.upload.submit()
}

function starSendOpen() {
  reset();
  open_.value = true
  title.value = '开始派送'
}

function handleClean() {
  handleCleanData().then(() => {
    proxy.$modal.msgSuccess('数据清理成功')
    queryParams.memberId = null
    queryParams.pageNum = 1
    getList()
  });
}

function getTotalMoney() {
  count().then(res => {
    totalMoney.value = res;
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportMemberMoney(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '派送彩金暂存表')
  }).catch(() => {
  })
}

getList();
</script>

<style scoped>

</style>
