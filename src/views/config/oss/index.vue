<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            size="small"
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
            v-hasPermi="['config:oss:add']"
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
            v-hasPermi="['config:oss:edit']"
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
            v-hasPermi="['config:oss:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="ossList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="访问域名" align="center" prop="endpoint"/>
      <el-table-column label="文件存储" align="center" prop="bucket"/>
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
              v-hasPermi="['config:oss:effect']"
          >激活
          </el-button>
          <el-button
              size="small"
              type="primary"
              link
              style="color: #FFB800"
              @click="handleOssTest(scope.row)"
              v-hasPermi="['config:oss:ossTest']"
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

    <!-- 添加或修改 oss 配置对话框 Add or modify oss configuration dialog -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="ossRef" :model="form" :rules="rules" label-width="120px" style="padding-bottom: 50px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="accessKey" prop="accessKey">
          <el-input v-model="form.accessKey" placeholder="请输入accessKey"/>
        </el-form-item>
        <el-form-item label="accessSecret" prop="accessSecret">
          <el-input v-model="form.accessSecret" placeholder="请输入accessSecret"/>
        </el-form-item>
        <el-form-item label="访问域名" prop="endpoint">
          <el-input v-model="form.endpoint" placeholder="请输入访问域名"/>
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-input v-model="form.region" placeholder="请输入地区"/>
        </el-form-item>
        <el-form-item label="文件存储" prop="bucket">
          <el-input v-model="form.bucket" placeholder="请输入文件存储"/>
        </el-form-item>
        <el-form-item label="服务商" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择服务商">
            <el-option
                v-for="dict in config_oss_provider"
                :key="dict.value"
                :label="dict.label"
                :value="Number.parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="加速域名" prop="doMain">
          <el-input v-model="form.doMain" placeholder="请输入加速域名"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="float: right;margin-top: -20px">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="ossTestTitle" v-model="ossTestOpen" width="500px" append-to-body>
      <el-form ref="ossTestFormRef" :model="ossTestForm" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="ossTestForm.name" placeholder="请输入名称" readonly/>
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <imageUpload v-model="ossTestForm.image" :mode-id="ossTestForm.id"/>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup name="Oss">
import {listOss, getOss, delOss, addOss, updateOss, effectOss} from '@/api/config/oss'
import ImageUpload from '@/components/ImageUpload'


const router = useRouter();
const {proxy} = getCurrentInstance();
const {sys_effect_type, config_oss_provider} = proxy.useDict("sys_effect_type", "config_oss_provider");

//lists types
// 选中数组 ids array
const ids = ref([]);
// oss文件存储服务配置表格数据
const ossList = ref([]);

//signal data type
// 弹出层标题
const title = ref("");
const total = ref(0);
const ossTestTitle = ref("测试图片上传");


//boolean types
// 遮罩层
const loading = ref(true);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 是否显示弹出层
const open = ref(false);

const ossTestOpen = ref(false);


const data = reactive({
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    name: null,
    orderByColumn: 'is_effect',
    isAsc: 'desc'
  },

  ossTestForm: {},
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    name: [
      {required: true, message: '名称不能为空', trigger: 'blur'}
    ],
    accessKey: [
      {required: true, message: 'accessKey不能为空', trigger: 'blur'}
    ],
    accessSecret: [
      {required: true, message: 'accessSecret不能为空', trigger: 'blur'}
    ],
    endpoint: [
      {required: true, message: '访问域名不能为空', trigger: 'blur'}
    ],
    bucket: [
      {required: true, message: '文件存储不能为空', trigger: 'blur'}
    ],
    // vhost: [
    //   { required: true, message: '加速域名不能为空', trigger: 'blur' }
    // ]
  }
});
const {queryParams, ossTestForm, form, rules} = toRefs(data);


/** 查询oss服务配置列表 Query the oss  service configuration list */
function getList() {
  loading.value = true
  listOss(queryParams.value).then(response => {
    ossList.value = response.data
    if (response.total) {
      total.value = response.total
    }
    loading.value = false
  })
}

/** 取消按钮 cancel button */
function cancel() {
  open.value = false
  reset()
}


/** 表单重置 Form reset */
function reset() {
  form.value = {
    id: null,
    name: null,
    accessKey: null,
    accessSecret: null,
    endpoint: null,
    bucket: null,
    //vhost: null,
    effect: 0,
    createBy: null,
    createTime: null,
    updateBy: null,
    provider: null,
    updateTime: null
  }
  proxy.resetForm('ossRef')
}


/** 搜索按钮操作  Search button action*/
function handleQuery() {
  // queryParams.pageNum = 1
  getList()
}


/** 重置按钮操作 Reset button action*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value =false
}


/**  多选框选中数据 Multi-select box select data */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 Add button action*/
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加oss配置'
}


/** 修改按钮操作 Modify button action*/
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getOss(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改oss配置'
  })
}


/** 提交按钮 submit button*/
function submitForm() {
  proxy.$refs['ossRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOss(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addOss(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 delete button action*/
function handleDelete(row) {
  const ossId = row.id || ids.value
  for (const item of ossList.value) {
    for (const id of ossId) {
      if (id === item.id && item.effect) {
        proxy.$modal.msgWarning(item.name + ' 已激活，请勿删除')
        return
      }
    }
  }
  proxy.$modal.confirm('是否确认删除oss文件存储服务配置编号为"' + ossId + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delOss(ossId)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {
  })
}


function handleEffect(row) {
  proxy.$modal.confirm('确定要激活oss文件存储服务配置编号为"' + row.id + '"的状态吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return effectOss(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('修改状态成功')
  }).catch(() => {
  })
}

function handleOssTest(row) {
  ossTestForm.value.name = row.name
  ossTestForm.value.id = row.id
  ossTestOpen.value = true
}

getList()

</script>
