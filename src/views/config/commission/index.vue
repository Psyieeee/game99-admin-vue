<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="代码" prop="code" style="width: 350px">
        <el-input
            v-model="queryParams.code"
            placeholder="请输入代码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name" style="margin-left: 10px; ">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            style="width: 400px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数据类型" prop="dataType" style="margin-left: 10px; width: 180px">
        <el-select v-model="queryParams.dataType" placeholder="请输入数据类型">
          <el-option
              v-for="type in dataTypes"
              :key="type.value"
              :label="type.value"
              :value="type.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status" style="margin-left: 10px; width: 150px">
        <el-select v-model="queryParams.status" placeholder="请选择状态">
          <el-option label="活跃" value="1"/>
          <el-option label="不活跃" value="0"/>
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="updateTime" style="margin-left: 10px; ">
        <el-date-picker type="datetimerange"
                        v-model="updateTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
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

    <el-table stripe v-loading="loading" :data="configCommissionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="代码" align="center"       prop="code"/>
      <el-table-column label="名字" align="center"      prop="name"/>
      <el-table-column label="价值" align="center"      prop="value"/>
      <el-table-column label="数据类型" align="center"      prop="dataType"/>
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
      <el-table-column label="更新人" align="center" prop="updatedBy"/>
      <el-table-column label="更新时间" align="center" prop="updateTime"/>
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
      <el-form ref="commissionRef" :model="form" :rules="rules" label-width="100px" style="padding-bottom: 50px">
        <el-form-item label="代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入验证码"/>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名"/>
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="form.dataType" placeholder="请输入数据类型">
            <el-option
                v-for="type in dataTypes"
                :key="type.value"
                :label="type.value"
                :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价值" prop="value">
          <el-input v-model="form.value" placeholder="请输入值"/>
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
import {getDefaultTime} from "@/utils/dateUtils.js";

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
  }]
)


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
    name: [
      {required: true, message: '需要最小金额', trigger: 'blur'}
    ],
    value: [
      {required: true, message: '最大金额为必填项', trigger: 'blur'}
    ],
  },

  updateTime: []
});
const {queryParams, bonusTestForm, form, rules, updateTime} = toRefs(data);


/** 查询bonus服务配置列表 Query the bonus  service configuration list */
function getList() {
  loading.value = true
  queryParams.value.type = 'inviter'
  listConfigCommission(proxy.addDateRange(queryParams.value, updateTime.value)).then(response => {
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
    minAmount: null,
    maxAmount: null,
    bonus: null,
    multiplier: null,
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
  loading.value =true
  updateTime.value = []
  proxy.resetForm('queryRef')
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
  title.value = '添加佣金配置'
}


/** 修改按钮操作 Modify button action*/
function handleUpdate(row) {
  reset()
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

getList()

</script>
