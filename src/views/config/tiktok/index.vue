<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="本我" prop="id">
        <el-input
            v-model="queryParams.id"
            placeholder="请输入 ID"
            clearable
            :step="100"
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
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="tiktokList" @selection-change="handleSelectionChange" >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="本我" align="center"      prop="id" sortable="custom"/>
      <el-table-column label="频道编码" align="center"      prop="channelCode" sortable="custom"/>
      <el-table-column label="像素码" align="center"      prop="pixelCode" sortable="custom"/>
      <el-table-column label="授权令牌" align="center"      prop="authToken" sortable="custom"/>
      <el-table-column label="创建时间" align="center"      prop="createTime" sortable="custom"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button
              v-hasPermi="['config:commission:edit']"
              icon="Edit"
              link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
              v-hasPermi="['config:bonus:remove']"
              fixed="right"
              icon="Delete"
              link
              size="small"
              style="color: #FF5722"
              type="danger"
              @click="handleDelete(scope.row)"
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
        @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="tiktokRef" :model="form" :rules="rules" label-width="120px" style="padding-bottom: 50px">
        <el-form-item label="频道编码" prop="channelCode">
          <el-input v-model="form.channelCode" placeholder="频道编码"/>
        </el-form-item>
        <el-form-item label="像素码" prop="pixelCode">
          <el-input v-model="form.pixelCode" placeholder="像素码"/>
        </el-form-item>
        <el-form-item label="授权令牌" prop="authToken">
          <el-input v-model="form.authToken" placeholder="授权令牌"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="float: right;margin-top: -20px">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup name="tiktokAdjust">
import {
  addTiktok,
  adjustTiktokList,
  updateTiktok,
  getTiktokDetails,
  deleteTiktok
} from '@/api/config/tiktok.js'
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();
const {proxy} = getCurrentInstance();

const tiktokList = ref([]);
const title = ref("");
const total = ref(0);
const ids = ref([]);

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

const newConfig = ref(false);

const data = reactive({
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    id: null,
    channelCode: null,
    pixelCode: null,
    authToken: null,
    createTime: null,
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    name: [
      {required: true, message: '需要最小金额', trigger: 'blur'}
    ],
    value: [
      {required: true, message: '最大金额为必填项', trigger: 'blur'}
    ],
  }
});
const {queryParams, form, rules} = toRefs(data);

/** 查询bonus服务配置列表 Query the bonus  service configuration list */
function getList() {
  loading.value = true
  adjustTiktokList(queryParams.value).then(response => {
    tiktokList.value = response.data
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
    status: 0,
    updatedBy: null,
    updateTime: null
  }
  proxy.resetForm('tiktokRef')
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
  multiple.value = !selection.length
}

/** 新增按钮操作 Add button action*/
function handleAdd() {
  reset()
  open.value = true
  newConfig.value = false;
  title.value = '添加 Tiktok 配置'
}


/** 修改按钮操作 Modify button action*/
function handleUpdate(row) {
  reset();
  console.log( "ASHKASJHFASJFHASKJHFSAKJHFSA")
  const id = row.id || ids.value
  getTiktokDetails(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '编辑佣金配置'
  })
}

/** 提交按钮 submit button*/
function submitForm() {
  proxy.$refs['tiktokRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTiktok(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addTiktok(form.value).then(() => {
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
  const id = row.id || ids.value;
  proxy.$modal.confirm('您是否确认删除这些数据?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return deleteTiktok(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}

function handleEffect(row) {
  proxy.$modal.confirm('确保您要激活的配置配置编号为' + row.id + '"的状态吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return changeStatus(row.id, row.status)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('修改状态成功')
  }).catch(() => {
  })
}


getList()

</script>
