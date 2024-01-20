<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
<!--      <el-form-item label="名称" prop="minAmount">-->
<!--        <el-input-number-->
<!--            v-model="queryParams.minAmount"-->
<!--            placeholder="请输入名称"-->
<!--            clearable-->
<!--            :step="100"-->
<!--            size="small"-->
<!--            @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="名称" prop="maxAmount">-->
<!--        <el-input-number-->
<!--            v-model="queryParams.maxAmount"-->
<!--            placeholder="请输入名称"-->
<!--            clearable-->
<!--            :step="100"-->
<!--            size="small"-->
<!--            @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
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
            v-hasPermi="['config:bonus:add']"
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
            v-hasPermi="['config:bonus:edit']"
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
            v-hasPermi="['config:bonus:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="bonusList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="最小金额" align="center"    prop="minAmount"/>
      <el-table-column label="最大金额" align="center"    prop="maxAmount"/>
      <el-table-column label="积分" align="center" prop="bonus"/>
      <el-table-column label="乘数" align="center" prop="multiplier"/>
      <el-table-column align="center" label="状态"     prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffect(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button
              v-hasPermi="['config:bonus:edit']"
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

    <!-- 添加或修改 bonus 配置对话框 Add or modify bonus configuration dialog -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="bonusRef" :model="form" :rules="rules" label-width="120px" style="padding-bottom: 50px">
        <el-form-item label="最小金额" prop="minAmount">
          <el-input-number max="1000000" :step="100" v-model="form.minAmount" placeholder="请输入最低金额"/>
        </el-form-item>
        <el-form-item label="最大金额" prop="maxAmount">
          <el-input-number max="1000000" :step="100" v-model="form.maxAmount" placeholder="请输入最大金额"/>
        </el-form-item>
        <el-form-item label="积分" prop="bonus">
          <el-input-number max="1000000" :step="1" v-model="form.bonus" placeholder="请输入奖金"/>
        </el-form-item>
        <el-form-item label="乘数" prop="multiplier">
          <el-input-number max="1000000" :step="100" v-model="form.multiplier" placeholder="请输入乘数"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="float: right;margin-top: -20px">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="bonus">
import {listConfigBonus, getConfigBonus, delConfigBonus, addConfigBonus, updateConfigBonus, changeStatus} from '@/api/config/bonus'
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();
const {proxy} = getCurrentInstance();

// 选中数组 ids array
const ids = ref([]);
// bonus文件存储服务配置表格数据
const bonusList = ref([]);

//signal data type
// 弹出层标题
const title = ref("");
const total = ref(0);
const bonusTestTitle = ref("测试图片上传");


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

const bonusTestOpen = ref(false);


const data = reactive({
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    minAmount: null,
    maxAmount: null,
    orderByColumn: 'status',
    isAsc: 'desc'
  },

  bonusTestForm: {},
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    minAmount: [
      {required: true, message: '需要最小金额', trigger: 'blur'}
    ],
    maxAmount: [
      {required: true, message: '最大金额为必填项', trigger: 'blur'}
    ],
    bonus: [
      {required: true, message: '奖金为必填项', trigger: 'blur'}
    ],
    multiplier: [
      {required: true, message: '倍数为必填项', trigger: 'blur'}
    ],
    // vhost: [
    //   { required: true, message: '加速域名不能为空', trigger: 'blur' }
    // ]
  }
});
const {queryParams, bonusTestForm, form, rules} = toRefs(data);


/** 查询bonus服务配置列表 Query the bonus  service configuration list */
function getList() {
  loading.value = true
  listConfigBonus(queryParams.value).then(response => {
    bonusList.value = response.data
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
    minAmount: null,
    maxAmount: null,
    bonus: null,
    multiplier: null,
    status: 0,
    updatedBy: null,
    updateTime: null
  }
  proxy.resetForm('bonusRef')
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
  title.value = '添加奖励配置'
}


/** 修改按钮操作 Modify button action*/
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getConfigBonus(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改奖金配置'
  })
}

/** 提交按钮 submit button*/
function submitForm() {
  proxy.$refs['bonusRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateConfigBonus(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addConfigBonus(form.value).then(response => {
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
    return delConfigBonus(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}

function handleEffect(row) {
  proxy.$modal.confirm('确定要激活bonus文件存储服务配置编号为"' + row.id + '"的状态吗?', '警告', {
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
