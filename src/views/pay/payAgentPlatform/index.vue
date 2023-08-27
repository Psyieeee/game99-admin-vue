<template>
  <div class="app-container">
    <!--    search form-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="代付平台" prop="name" style="width: 240px">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入代付平台名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下单地址" prop="orderUrl" style="width: 240px">
        <el-input
            v-model="queryParams.orderUrl"
            placeholder="请输入代付下单地址"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['pay:payAgentPlatform:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="small"
            @click="handleExport"
            v-hasPermi="['pay:payAgentPlatform:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :stripe="true" v-loading="loading" :data="payAgentPlatformList">
      <el-table-column label="ID" align="center" prop="id" width="120"/>
      <el-table-column label="编码" align="center" prop="code" width="120"/>
      <el-table-column label="代付平台名称" align="center" prop="name" width="120"/>
      <el-table-column label="代付下单地址" :show-overflow-tooltip="true" align="center" prop="orderUrl"/>
      <el-table-column label="代付查询地址" :show-overflow-tooltip="true" align="center" prop="orderQueryUrl"/>
      <el-table-column label="创建时间" width="160" align="center" prop="createTime"/>
      <el-table-column label="修改时间" width="160" align="center" prop="updateTime"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="120px">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pay:payAgentPlatform:edit']">修改
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


    <!-- 添加或修改代付平台列表对话框 -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="770px" style="padding-bottom: 20px" append-to-body>
      <el-form ref="payAgentPForm" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="编码" prop="code">
          <el-input v-model.trim="form.code" placeholder="请输入自定义编码" :disabled="form.id != null"/>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="请输入代付平台名称"/>
        </el-form-item>
        <el-form-item label="代付下单地址" prop="orderUrl">
          <el-input v-model.trim="form.orderUrl" placeholder="请输入代付下单地址"/>
        </el-form-item>
        <el-form-item label="代付查询地址" prop="orderQueryUrl">
          <el-input v-model.trim="form.orderQueryUrl" placeholder="请输入代付查询地址"/>
        </el-form-item>
        <el-form-item label="是否配置头部值" prop="headerValue">
          <el-switch
              v-model="form.headerValue"
              :active-value="true"
              :inactive-value="false"
              @click="">
          </el-switch>
        </el-form-item>
        <el-form-item label="头部值配置说明" prop="headerValueExplain">
          <el-input v-model.trim="form.headerValueExplain" placeholder="请输入头部值配置说明"
                    :disabled="!form.headerValue"/>
        </el-form-item>
        <el-form-item label="是否配置MD5密钥" prop="signMd5">
          <el-switch
              v-model="form.signMd5"
              :active-value="true"
              :inactive-value="false"
              @click="">
          </el-switch>
        </el-form-item>
        <el-form-item label="MD5密钥配置说明" prop="signMd5Explain">
          <el-input v-model.trim="form.signMd5Explain" placeholder="请输入MD5密钥配置说明" :disabled="!form.signMd5"/>
        </el-form-item>
        <el-form-item label="是否配置代付公钥" prop="signPublicKey">
          <el-switch
              v-model="form.signPublicKey"
              :active-value="true"
              :inactive-value="false"
              @click="">
          </el-switch>
        </el-form-item>
        <el-form-item label="代付公钥配置说明" prop="signPublicKeyExplain">
          <el-input v-model.trim="form.signPublicKeyExplain" placeholder="请输入代付公钥配置说明"
                    :disabled="!form.signPublicKey"/>
        </el-form-item>
        <el-form-item label="是否配置回调私钥" prop="signPrivateKey">
          <el-switch
              v-model="form.signPrivateKey"
              :active-value="true"
              :inactive-value="false"
              @click="">
          </el-switch>
        </el-form-item>
        <el-form-item label="回调私钥配置说明" prop="signPrivateKeyExplain">
          <el-input v-model.trim="form.signPrivateKeyExplain" placeholder="请输入回调私钥配置说明"
                    :disabled="!form.signPrivateKey"/>
        </el-form-item>
        <el-form-item label="IP白名单" prop="whiteIp">
          <el-input v-model.trim="form.whiteIp" type="textarea" placeholder="多个IP使用英文逗号','分割"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="PayAgentPlatform" setup>

import {reactive, ref, toRefs} from "vue";
import {
  addPayAgentPlatform, payAgentPlatformById,
  payAgentPlatformExport,
  payAgentPlatformLists,
  updatePayAgentPlatform
} from "@/api/pay/payAgentPlatform";

const router = useRouter();
const {proxy} = getCurrentInstance();

const payAgentPlatformList = ref([]);
const total = ref(0);

const title = ref('');
const open = ref(false);
const showSearch = ref(true);
const loading = ref(false);

const data = reactive({
  queryParams: {
    name: null,
    orderUrl: null,
    pageNum: 1,
    pageSize: 15
  },
  /** 表单参数 */
  form: {},

  rules: {
    code: [
      {required: true, message: "自定义编码不能为空", trigger: "blur"}
    ],
    name: [
      {required: true, message: "代付平台名称不能为空", trigger: "blur"}
    ],
    merId: [
      {required: true, message: "商户ID不能为空", trigger: "blur"}
    ],
    orderUrl: [
      {required: true, message: "代付下单地址不能为空", trigger: "blur"}
    ],
  }
});
const {queryParams, form, rules} = toRefs(data)


function getList() {
  loading.value = true
  payAgentPlatformLists(queryParams.value).then(res => {
    payAgentPlatformList.value = res.data;
    total.value = res.total
    loading.value = false
  })

}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList()
}

/** 重置按钮操作 handle reset query*/
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    code: null,
    name: null,
    orderUrl: null,
    orderQueryUrl: null,
    signMd5: null,
    signPublicKey: null,
    signPrivateKey: null,
    whiteIp: null,
  };
  proxy.resetForm("payAgentPForm");
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加代付平台列表";
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["payAgentPForm"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePayAgentPlatform(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPayAgentPlatform(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 导出按钮操作 export data*/
function handleExport() {
  proxy.$modal.confirm('是否确认导出所有代付平台列表数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return payAgentPlatformExport(queryParams.value);
  }).then(response => {
    proxy.downloadExcel(response, '代付平台')
  }).catch(() => {
  })
}

function handleUpdate(row) {
  reset();
  const id = row.id || this.ids
  payAgentPlatformById(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改代付平台列表";
  });
}


getList()
</script>

<style scoped>
</style>