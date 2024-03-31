<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            :step="100"
            size="small"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
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
            v-hasPermi="['config:commission:add']"
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
            v-hasPermi="['config:commission:edit']"
        >修改
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="configCommissionList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="名称" align="center"      prop="name" sortable="custom" :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="类型" align="center"      prop="dataType" sortable="custom" :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="值" align="center"      prop="value" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template #default="scope">{{getValue(scope.row)}}</template>
      </el-table-column>
      <el-table-column align="center" label="键"     prop="status" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffect(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="更新人" align="center" prop="updatedBy" sortable="custom" :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="更新时间" align="center" prop="updateTime" sortable="custom" :sort-orders="['descending', 'ascending']"/>
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
      <el-form ref="commissionRef" :model="form" :rules="rules" label-width="120px" style="padding-bottom: 50px">
        <el-form-item label="代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入验证码" :disabled="newConfig"/>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名"/>
        </el-form-item>
        <el-form-item label="类型" prop="dataType">
          <el-select v-model="form.dataType" :disabled="newConfig" clearable placeholder="Select">
            <el-option
                v-for="type in dataTypes"
                :key="type.value"
                :label="type.value"
                :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价值" prop="value">
          <template v-if="form.dataType === 'STRING'">
            <el-input v-model="form.value" placeholder="请输入值" type="text"/>
          </template>
          <template v-if="form.dataType === 'BOOLEAN'">
            <el-select v-model="form.value" clearable placeholder="Select">
              <el-option
                  v-for="type in boolVals"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
              />
            </el-select>
          </template>
          <template v-if="form.dataType === 'INTEGER' || form.dataType === 'DECIMAL'">
            <el-input v-model="form.value" placeholder="请输入值" type="number"/>
          </template>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="float: right;margin-top: -20px">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="configCommission">
import {listConfigCommission, getConfigCommission, delConfigCommission, addConfigCommission, updateConfigCommission, changeStatus} from '@/api/config/commission.js'
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();
const {proxy} = getCurrentInstance();

// 选中数组 ids array
const ids = ref([]);
// bonus文件存储服务配置表格数据
const configCommissionList = ref([]);

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

const newConfig = ref(false);

const data = reactive({
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    minAmount: null,
    maxAmount: null,
    orderByColumn: 'update_time',
    isAsc: 'desc'
  },

  bonusTestForm: {},
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
const {queryParams, bonusTestForm, form, rules} = toRefs(data);

const dataTypes = ref([
  {
    value: 'STRING',
    label: 'STRING'
  },
  {
    value: 'BOOLEAN',
    label: 'BOOLEAN'
  },
  {
    value: 'INTEGER',
    label: 'INTEGER'
  },
  {
    value: 'DECIMAL',
    label: 'DECIMAL'
  }])

const boolVals = ref([
  {
    value: 'true',
    label: '真'
  },
  {
    value: 'false',
    label: '假'
  }])

const defaultSort = ref({prop: "update_time", order: "descending"});

/** 查询bonus服务配置列表 Query the bonus  service configuration list */
function getList() {
  loading.value = true
  listConfigCommission(queryParams.value).then(response => {
    configCommissionList.value = response.data
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
    dataType: 'STRING',
    status: 0,
    updatedBy: null,
    updateTime: null
  }
  proxy.resetForm('commissionRef')
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
  newConfig.value = false;
  title.value = '添加佣金配置'
}


/** 修改按钮操作 Modify button action*/
function handleUpdate(row) {
  reset()
  newConfig.value = true;
  const id = row.id || ids.value
  getConfigCommission(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '编辑佣金配置'
  })
}

/** 提交按钮 submit button*/
function submitForm() {
  proxy.$refs['commissionRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateConfigCommission(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addConfigCommission(form.value).then(() => {
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
    return delConfigCommission(id);
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

function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order === 'ascending' ? 'asc' : 'desc';
  getList();
}

function getValue(row) {
  if(row.dataType==='BOOLEAN'){
    if(row.value === 'true') return '真'
    else return '假'
  }
  return row.value;
}



getList()

</script>
