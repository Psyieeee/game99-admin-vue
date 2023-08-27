<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" v-show="showSearch" v-model="queryParams">
      <el-form-item label="通道名称" prop="name">
        <el-input
            style="width: 200px"
            v-model="queryParams.name"
            placeholder="代付通道名称"
            clearable
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="代付平台" prop="platformId">
        <el-select
            filterable
            v-model="queryParams.platformId"
            placeholder="请选择代付平台"
            clearable>
          <el-option
              v-for="Platform in payAgentPlatformOptions"
              :key="Platform.id"
              :label="Platform.name"
              :value="Platform.id"/>
        </el-select>
      </el-form-item>
      <el-form-item label="激活状态" prop="effect">
        <el-select
            v-model="queryParams.effect"
            placeholder="请选择激活状态"
            clearable
            style="width: 150px">
          <el-option
              v-for="dict in sys_effect_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    handle buttons -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['pay:agentChannel:add']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['pay:agentChannel:export']">导出
        </el-button>
      </el-col>
      <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table stripe v-loading="loading" :data="payAgentChannelList">
      <el-table-column label="代付通道名称" align="center" prop="name" min-width="120"/>
      <el-table-column label="代付平台" align="center" prop="platformId" :formatter="formatterPlatformId"/>
      <el-table-column label="商户ID" align="center" prop="merId" min-width="120"/>
      <el-table-column label="激活状态" align="center" prop="effect" min-width="120">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @click="statusChange(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="140"/>
      <el-table-column label="修改人" align="center" prop="updateBy"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" min-width="140"/>
      <el-table-column label="操作" min-width="200" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pay:agentChannel:edit']">修改
          </el-button>
          <el-button
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['pay:agentChannel:remove']">删除
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

    <!--      add or update form-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="620px"
              style="padding-bottom: 20px" append-to-body>
      <el-form ref="payAgentChannelForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="代付平台" prop="platformId">
          <el-select
              filterable
              v-model="form.platformId"
              placeholder="请选择代付平台"
              clearable
              @change="selectPlatform"
              :disabled="form.id != null"
              class="col-w240">
            <el-option
                v-for="item in payAgentPlatformOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="通道名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="请输入通道名称"/>
        </el-form-item>
        <el-form-item label="商户ID" prop="merId">
          <el-input v-model.trim="form.merId" placeholder="请输入商户ID"/>
        </el-form-item>
        <el-form-item label="头部值" prop="headerValue" :required="platform.headerValue">
          <el-input v-model.trim="form.headerValue" :placeholder="platform.headerValueExplain"
                    :disabled="!platform.headerValue"/>
        </el-form-item>
        <el-form-item label="加密密钥" prop="signMd5" :required="platform.signMd5">
          <el-input v-model.trim="form.signMd5" :placeholder="platform.signMd5Explain" :disabled="!platform.signMd5"/>
        </el-form-item>
        <el-form-item label="加密公钥" prop="signPublicKey" :required="platform.signPublicKey">
          <el-input type="textarea" v-model.trim="form.signPublicKey" :placeholder="platform.signPublicKeyExplain"
                    rows="5" :disabled="!platform.signPublicKey"/>
        </el-form-item>
        <el-form-item label="解密私钥" prop="signPrivateKey" :required="platform.signPrivateKey">
          <el-input type="textarea" v-model.trim="form.signPrivateKey" :placeholder="platform.signPrivateKeyExplain"
                    rows="5" :disabled="!platform.signPrivateKey"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script name="PayAgentChannel" setup>
import {reactive, ref, toRefs} from "vue";
import {
  addPayAgentChannel,
  changeStatusPayAgentChannel, payAgentChannelById, payAgentChannelExport,
  payAgentChannelListData,
  removePayAgentChannel,
  updatePayAgentChannel
} from "@/api/pay/payAgentChannel";
import {downloadExcel} from "@/utils/common";
import {payAgentPlatformListAll} from "@/api/pay/payAgentPlatform";

const router = useRouter();
const {proxy} = getCurrentInstance();

const payAgentChannelList = ref([])
const payAgentPlatformOptions = ref([]);


const open = ref(false)
const showSearch = ref(true)
const loading = ref(false)
const total = ref(0)
const title = ref('')

const data = reactive({

  /** queryParams */
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    name: '',
    platformId: '',
    merId: '',
    effect: '',
  },
  form: {},
  platform: {},
  rules: {
    name: [
      {required: true, message: '请输入名称', trigger: 'blur'}
    ],
    merId: [
      {required: true, message: '请输入名称', trigger: 'blur'}
    ],
    platformId: [
      {required: true, message: '请选择代付平台', trigger: 'blur'}
    ],
    headerValue: [
      {required: true, message: '请输入头部值', trigger: 'blur'}
    ],
    signMd5: [
      {required: true, message: '请输入md5加密密钥', trigger: 'blur'}
    ],
    signPublicKey: [
      {required: true, message: '请输入加密公钥', trigger: 'blur'}
    ],
    signPrivateKey: [
      {required: true, message: '请输入解密私钥', trigger: 'blur'}
    ],
  }
});
const {queryParams, form, platform, rules} = toRefs(data);

const {sys_effect_type} = proxy.useDict("sys_effect_type")


/**
 * 查询代付通道列表 list payAgent channel
 */
function getList() {
  loading.value = true
  payAgentChannelListData(queryParams.value).then(response => {
    payAgentChannelList.value = response.data;
    total.value = response.total
    loading.value = false
  })
}

/**  handle list all data query */
function platFormListAll() {
  loading.value = true
  payAgentPlatformListAll().then(res => {
    payAgentPlatformOptions.value = res.data;
    loading.value = false
  })
}

/** 表单重置 Form reset*/
function reset() {
  form.value = {
    id: null,
    name: null,
    effect: null,
    headerValue: null,
    signMd5: null,
    signPublicKey: null,
    signPrivateKey: null,
  }
  proxy.resetForm("payAgentChannelForm");
}

/**  handle search query */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 handle resetQuery*/
function resetQuery() {
  proxy.resetForm("queryForm")
  handleQuery()
}

/**新增代付通道 handle add button*/
function handleAdd() {
  reset()
  open.value = true
  title.value = "新增代付通道"
  platform.value = {}
}

/** 修改代付通道 handle update button form */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value
  /**
   * 获取代付通道详细信息
   */
  payAgentChannelById(id).then(res => {
    form.value = res.data
    open.value = true
    title.value = "修改代付通道"
    selectPlatform()
  })
}

/**  handle submit form */
function handleSubmit() {
  proxy.$refs["payAgentChannelForm"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePayAgentChannel(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPayAgentChannel(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 导出代付通道列表 handle export data as excel query */
function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return payAgentChannelExport(queryParams.value)
  }).then(response => {
    downloadExcel(response, '支付类型')
  }).catch(() => {
  })
}


function handleDelete(row) {
  const id = row.id || ids.value
  proxy.$modal.confirm('是否确认删除编号为"' + id + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return removePayAgentChannel(id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {
  })
}

/**  handle effect change status query */
function statusChange(row) {
  let text = row.effect ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return changeStatusPayAgentChannel(row.id, row.effect);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.effect = !row.effect
  });
}

function formatterPlatformId(row) {
  for (const a of payAgentPlatformOptions.value) {
    if (a.id === row.platformId) {
      return a.name;
    }
  }
  return "";
}

function selectPlatform() {
  if (form.value.platformId) {
    for (const a of payAgentPlatformOptions.value) {
      if (form.value.platformId === a.id) {
        platform.value = {
          signMd5: a.signMd5,
          signMd5Explain: a.signMd5Explain,
          signPrivateKey: a.signPrivateKey,
          signPrivateKeyExplain: a.signPrivateKeyExplain,
          signPublicKey: a.signPublicKey,
          signPublicKeyExplain: a.signPublicKeyExplain,
          headerValue: a.headerValue,
          headerValueExplain: a.headerValueExplain
        }
      }
    }
  } else {
    platform.value = {}
  }
}


getList()
platFormListAll()
</script>

<style scoped>

</style>