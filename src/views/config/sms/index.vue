<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="服务商" prop="provider">
        <el-select v-model="queryParams.provider" placeholder="请选择服务商" clearable>
          <el-option
              v-for="dict in provider_options"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="effect">
        <el-select v-model="queryParams.effect" placeholder="请选择状态" clearable>
          <el-option
              v-for="dict in sys_effect_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
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
            v-hasPermi="['config:sms:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            size="small"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['config:sms:edit']"
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
            v-hasPermi="['config:sms:delete']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--  config sms display table-->
    <el-table stripe v-loading="loading" :data="smsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="服务商" align="center" prop="provider">
        <template #default="scope">
          <dict-tag :options="provider_options" :value="scope.row.provider"/>
        </template>
      </el-table-column>
      <el-table-column label="地区" align="center" prop="region"/>
      <el-table-column label="签名" align="center" prop="signature"/>
      <el-table-column label="模板" align="center" prop="template"/>
      <el-table-column label="状态" align="center" prop="effect">
        <template #default="scope">
          <dict-tag :options="sys_effect_type" :value="scope.row.effect"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              style="color: #5FB878"
              v-show="!scope.row.effect"
              @click="handleEffect(scope.row)"
              v-hasPermi="['config:sms:effect']"
          >激活
          </el-button>
          <el-button
              size="small"
              type="primary"
              link
              style="color: #C0C0C0;margin-left: 0px"
              v-show="scope.row.effect"
              @click="handleNoEffect(scope.row)"
              v-hasPermi="['config:sms:effect']"
          >休眠
          </el-button>
          <el-button
              size="small"
              type="primary"
              link
              style="color: #FFB800"
              @click="handleSmsTest(scope.row)"
              v-hasPermi="['config:sms:smsTest']"
          >测试
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />


    <!-- 添加或修改SMS短信服务配置对话框  Add or modify SMS text messaging service configuration dialog-->
    <el-dialog :title="title" v-model="open" width="700px"
               append-to-body>
      <el-form ref="smsRef" :model="form" :rules="rules" label-width="120px" class="form">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="服务商" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择服务商">
            <el-option
                v-for="dict in provider_options"
                :key="dict.value"
                :label="dict.label"
                :value="Number.parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="appKey" prop="appKey">
          <el-input v-model="form.appKey" placeholder="请输入appKey"/>
        </el-form-item>
        <el-form-item label="appAccess" prop="appAccess">
          <el-input v-model="form.appAccess" placeholder="请输入appAccess"/>
        </el-form-item>
        <el-form-item label="签名" prop="signature" v-if="form.provider == 4">
          <el-input v-model="form.signature" placeholder="请输入签名" />
        </el-form-item>
        <el-form-item label="模板" prop="template" v-if="form.provider == 5">
          <el-input v-model="form.template" placeholder="请输入模板"/>
        </el-form-item>
        <el-form-item label="地区" prop="region" v-if="form.provider == 3">
          <el-input v-model="form.region" placeholder="请输入地区"/>
        </el-form-item>
        <el-form-item label="smsSdkAppid" prop="smsSdkAppid" v-if="form.provider == 0 && form.provider !=3">
          <el-input v-model="form.smsSdkAppid" placeholder="请输入smsSdkAppid"/>
        </el-form-item>
<!--        <el-form-item label="请求域名" prop="endpoint" v-if="form.provider == 3">-->
<!--          <el-input v-model="form.endpoint" placeholder="请输入请求域名"/>-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup name="Sms">

import {ref} from "vue";
import {addSms, delSms, effectSms, getSmsById, listSms, noEffectSms, smsTest, updateSms} from "@/api/config/sms";

const router = useRouter();
const {proxy} = getCurrentInstance();

const {sys_effect_type, provider_options} = proxy.useDict("sys_effect_type", "provider_options");

// 选中数组 ids array
const ids = ref([]);

// SMS短信服务配置表格数据
const smsList = ref([]);

const total = ref(0);

const title = ref('');

// 显示搜索条件
const showSearch = ref(true);
// 是否显示弹出层
const open = ref(false);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);

const loading = ref(true);

const data = reactive({

  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    provider: null,
    effect: null,
    orderByColumn: 'is_effect desc, update_time desc',
    isAsc: ''
  },

  // 表单参数
  form: {},

  // 表单校验
  rules: {
    name: [
      {required: true, message: 'SMS名称不能为空', trigger: 'blur'}
    ],
    provider: [
      {required: true, message: '服务商不能为空', trigger: 'change'}
    ],
    appKey: [
      {required: true, message: 'appKey不能为空', trigger: 'blur'}
    ],
    appAccess: [
      {required: true, message: 'appAccess不能为空', trigger: 'blur'}
    ],
    signature: [
      {required: true, message: '签名不能为空', trigger: 'blur'}
    ],
    template: [
      {required: true, message: '模板不能为空', trigger: 'blur'}
    ]
  }

});

const {queryParams, form, rules} = toRefs(data);

/** 表单重置 Form reset */
function reset() {
  form.value = {
    id: null,
    name: null,
    provider: null,
    appKey: null,
    appAccess: null,
    region: null,
    signature: null,
    template: null,
    smsSdkAppid: null,
    identify: null,
    effect: false,
    endpoint: null
  }
  proxy.resetForm('smsRef');
}

/** 搜索按钮操作  Search button action*/
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 Reset button action*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

/** 新增按钮操作 Add button action*/
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加SMS短信服务配置'
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getSmsById(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改SMS短信服务配置'
  })
}


/** 删除按钮操作  delete button action*/
function handleDelete(row) {
  const smsId = row.id || ids.value
  proxy.$modal.confirm('是否确认删除SMS短信服务配置编号为"' + smsId + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delSms(smsId)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {
  })
}

/** 查询SMS短信服务配置列表  Query SMS configuration list*/
function getList() {
  loading.value = true;
  listSms(queryParams.value).then(response => {
    smsList.value = response.data
    if (response.total) {
      total.value = response.total
    }
    loading.value = false
  })
}

/** 多选框选中数据  Multi-select box select data*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleEffect(row) {
  proxy.$modal.confirm('确定要激活SMS短信服务配置编号为"' + row.id + '"的状态吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return effectSms(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('修改状态成功')
  }).catch(() => {
  })
}

function handleNoEffect(row) {
  proxy.$modal.confirm('确定要取消激活SMS短信服务配置编号为"' + row.id + '"的状态吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return noEffectSms(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('修改状态成功')
  }).catch(() => {
  })
}

/** 提交按钮 submit button*/
function submitForm() {
  proxy.$refs['smsRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSms(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addSms(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

// 取消按钮 cancel button
function cancel() {
  open.value = false
  reset()
}

function handleSmsTest(row) {
  proxy.$modal.prompt("短信测试", '请输入测试的国内手机号', "info").then(({value}) => {
    return smsTest(row.id, value).then((res) => {
      if (res.code === 200) {
        proxy.$modal.msgSuccess(res.msg)
      } else {
        proxy.$modal.msgError(res.msg)
      }
    }).catch(() => {
      proxy.$modal.msgError('网络异常')
    })
  }).catch(() => {
  })
}

getList()
</script>

<style>
.form {
  padding-bottom: 40px;
}

.dialog-footer {
  float: right;
  margin-top: -35px;
}
</style>
