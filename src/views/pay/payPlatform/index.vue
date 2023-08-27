<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="平台名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入平台名称"
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="平台编码" prop="code">
        <el-input
            v-model="queryParams.code"
            placeholder="请输入平台编码"
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="下单地址" prop="platPayUrl">
        <el-input
            v-model="queryParams.payUrl"
            placeholder="请输入下单接口地址"
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <!--    tabs button -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['pay:payPlatform:add']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['pay:payPlatform:export']">导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--  display data into table -->
    <el-table :stripe="true" v-loading="loading" :data="payPlatformNewList">
      <el-table-column label="平台ID" prop="id" align="center" width="100"/>
      <el-table-column label="平台名称" prop="name" align="center" width="150"/>
      <el-table-column label="平台编码" prop="code" align="center" width="150"/>
      <el-table-column label="平台下单接口地址" align="center" min-width="300" prop="payUrl"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="平台订单查询地址" align="center" min-width="300" prop="queryUrl"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center" fixed="right" width="130">
        <template #default="scope">
          <el-button
              size="small"
              type="primary" link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pay:payPlatform:edit']">修改
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

    <!-- 修改【支付平台】对话框 Modify the [Payment Platform] dialog box-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="openEdit" width="770px" style="height: 700px"
               append-to-body>
      <el-form ref="payPlatform" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="请输入平台名称"/>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model.trim="form.code" placeholder="请输入平台编码"/>
        </el-form-item>
        <el-form-item label="商户号/ID" prop="merId">
          <el-input v-model.trim="form.merId" placeholder="请输入商户号/ID"/>
        </el-form-item>
        <el-form-item label="应用ID" prop="appId">
          <el-input v-model.trim="form.appId" placeholder="请输入应用ID"/>
        </el-form-item>
        <el-form-item label="下单地址" prop="payUrl">
          <el-input v-model.trim="form.payUrl" placeholder="请输入平台下单接口地址"/>
        </el-form-item>
        <el-form-item label="查询地址" prop="queryUrl">
          <el-input v-model.trim="form.queryUrl" placeholder="请输入平台订单查询地址"/>
        </el-form-item>
        <el-form-item label="MD5密钥" prop="signMd5">
          <el-input v-model.trim="form.signMd5" placeholder="请输入MD5密钥"/>
        </el-form-item>
        <el-form-item label="加密公钥" prop="signPublicKey">
          <el-input v-model.trim="form.signPublicKey" type="textarea" placeholder="请输入加密公钥"/>
        </el-form-item>
        <el-form-item label="回调私钥" prop="signPrivateKey">
          <el-input v-model.trim="form.signPrivateKey" type="textarea" placeholder="请输入回调私钥"/>
        </el-form-item>
        <el-form-item label="IP白名单" prop="whiteIp">
          <el-input v-model.trim="form.whiteIp" type="textarea" placeholder="请输入IP白名单"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="openEdit=false">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script name="PayPlatform" setup>


import {reactive, ref, toRefs} from "vue";
import {
  addPayPlatform,
  editPayPlatform,
  exportPayPlatform,
  getPayPlatformById,
  listPayPlatform
} from "@/api/pay/payPlatform";
import {downloadExcel} from "@/utils/common";

const router = useRouter();
const {proxy} = getCurrentInstance();

/** 【支付平台】表格数据  pay platform list*/
const payPlatformNewList = ref([]);
/** 选中数组 ids */
const ids = ref([]);
/** 选中数组 total*/
const total = ref(0);
const title = ref('');

/** 是否显示弹出层 Whether to show the popup layer*/
const open = ref(false);
/** 是否显示弹出层 Whether to show the edit form popup layer*/
const openEdit = ref(false);
/** 遮罩层 loading page */
const loading = ref(true);
/** 显示搜索条件 show search form*/
const showSearch = ref(true);

const data = reactive({

  /** 查询参数 queryParams*/
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    name: null,
    code: null,
    merId: null,
    appId: null,
    payUrl: null,
    platUrl: null,
    signMd5: null,
    signPublicKey: null,
    signPrivateKey: null,
    WhiteIp: null,
    createBy: null,
    updateBy: null,
    orderByColumn: 'id',
    isAsc: 'desc'
  },
  /** 表单参数 form */
  form: {},
  /**对接配置表单 */
  configForm: {},
  /** 表单校验 */
  rules: {
    name: [
      {required: true, message: "平台名称不能为空", trigger: "blur"}
    ],
    code: [
      {required: true, message: "平台编码不能为空", trigger: "blur"}
    ],
    merId: [
      {required: true, message: "商户ID不能为空", trigger: "blur"}
    ],
    payUrl: [
      {required: true, message: "平台下单接口地址不能为空", trigger: "blur"}
    ],
  },

  configFormRules: {
    payPlatfrom: [
      {required: true, message: "支付平台名称不能为空", trigger: "blur"}
    ],
    payCode: [
      {required: true, message: "支付平台编码不能为空", trigger: "blur"}
    ]
  }
});

const {queryParams, form, configForm, rules, configFormRules} = toRefs(data)

/** 查询【支付平台】列表 Query the list of [Payment Platforms]*/
function getList() {
  loading.value = true;
  listPayPlatform(queryParams.value).then(response => {
    payPlatformNewList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}


/** 表单重置 Form reset*/
function reset() {
  form.value = {
    id: null,
    name: null,
    code: null,
    merId: null,
    appId: null,
    payUrl: null,
    queryUrl: null,
    signMd5: null,
    signPublicKey: null,
    signPrivateKey: null,
    whiteIp: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("payPlatform");
}


/** 新增按钮操作 handle add button*/
function handleAdd() {
  reset();
  openEdit.value = true
  title.value = "添加【支付平台】"
}

/** 全平台新增按钮操作 handle submit form*/
function submitForm() {
  proxy.$refs["payPlatform"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        editPayPlatform(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          openEdit.value = false;
          getList();
        });
      } else {
        addPayPlatform(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          openEdit.value = false;
          getList();
        });
      }
    }
  });
}

/** 导出按钮操作 handle export query*/
function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportPayPlatform(queryParams.value)
  }).then(response => {
    downloadExcel(response, '支付信息日志')
  })
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
  queryParams.pageNum = 1
  getList();
}

/** 修改按钮操作 handle update*/
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value
  getPayPlatformById(id).then(response => {
    form.value = response.data;
    openEdit.value = true;
    title.value = "修改【支付平台】";
  });
}

/** 重置按钮操作 handle resetQuery*/
function resetQuery() {
  proxy.resetForm("queryForm")
  handleQuery();
  loading.value = false
}


getList();
</script>

<style scoped>
.dialog-footer {
  float: right;
}
</style>