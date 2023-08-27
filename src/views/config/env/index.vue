<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="参数名称" prop="envTitle">
        <el-select
            v-model="titleCode.envTitle"
            @change="changeType"
            filterable
            placeholder="请选择参数名称">
          <el-option
              v-for="(item,index) in titleCodeList"
              :key="index"
              :label="item.envTitle"
              :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="参数编码" prop="envCode">
        <el-select v-model="titleCode.envCode" @change="changeType" filterable placeholder="请选择参数编码">
          <el-option
              v-for="(item,index) in titleCodeList"
              :key="index"
              :label="item.envCode"
              :value="item"
          >
          </el-option>
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
            icon="plus"
            @click="handleAdd"
            v-hasPermi="['config:env:add']"
        >新增
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="item in config_environment_group"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"
                   :name="item.value">
        <el-table :stripe="true" v-loading="loading" :data="configEnvironmentList" width="150px"
                  @selection-change="handleSelectionChange">
          <el-table-column label="参数名称" align="center" min-width="100">
            <template #default="scope">
              <el-input
                  :class="scope.row.envStatus === 0  ? 'ban' : ''"
                  v-model="scope.row.envTitle"
                  placeholder="请输入参数名称"
                  size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="参数编码" align="center">
            <template v-slot="{row}">
              <span>{{ row.envCode }}</span>
            </template>
          </el-table-column>

          <el-table-column label="参数值" min-width="100" align="center">
            <template v-slot="{row}">
              <el-input
                  :class="row.envStatus == 0  ? 'ban' : ''"
                  v-model="row.envValue"
                  :type="row.envCode == 'level_2_password' ? 'password' : 'text'"
                  placeholder="请输入参数值"
                  size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="序列号" width="100" align="center">
            <template v-slot="{row}">
              <el-input
                  type="number"
                  :class="row.envStatus == 0  ? 'ban' : ''"
                  v-model="row.envSort"
                  placeholder="请输入序列号"
                  size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template v-slot="{row}">
              <el-select :class="row.envStatus == 0  ? 'ban' : ''"
                         v-model="row.envStatus" placeholder="请选择状态" size="small"
                         @change="changeStatusButton(row)">
                <el-option label="激活" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="所属参数组" align="center" min-width="100">
            <template v-slot="{row}">
              <el-select v-model="row.envGroup" placeholder="请选择状态" size="small">
                <el-option
                    v-for="(dict,i) in config_environment_group"
                    :key="'A'+ i"
                    :label="dict.label"
                    :value="parseInt(dict.value)"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="备注" min-width="100" align="center">
            <template v-slot="{row}">
              <el-input
                  :class="row.envStatus == 0  ? 'ban' : ''"
                  v-model="row.envDes"
                  size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template v-slot="{row}">
              <!--                <el-input
                                :class="row.envStatus == 0  ? 'ban' : ''"
                                v-model="row.envDes"
                                size="small"
                              />-->
              <el-button type="primary"
                         @click="updateConfigEnvironment(row)">确认修改
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--          <el-button type="primary" v-show="configEnvironmentList.length>0" style="float: right;margin-top: 20px"
                             @click="handleConfirm">确定
                  </el-button>-->
      </el-tab-pane>

    </el-tabs>
    <!--    tabs enfd here -->


    <!-- 添加或修改会员上下分对话框  Add or Modify Membership Dialog Box-->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="C">属性</el-radio>
                <el-radio label="M">类型</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="所属参数组" prop="envGroup" label-width="130px">
              <el-select v-model="form.envGroup" filterable placeholder="请选择参数组">
                <el-option
                    v-for="item in config_environment_group"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="名称" prop="envTitle">
              <el-input v-model="form.envTitle" placeholder="请输入名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="编码" prop="envCode">
              <el-input v-model="form.envCode" placeholder="请输入编码"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="envSort">
              <el-input-number v-model="form.envSort" controls-position="right" :min="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="参数值" prop="envValue">
              <el-input v-model="form.envValue" placeholder="请输入参数值"/>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="状态" prop="envStatus">
              <el-select v-model="titleCode.envStatus" filterable placeholder="请选择状态">
                <el-option
                    v-for="(item,index) in types"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="参数说明" prop="envDes">
              <el-input v-model="form.envDes" placeholder="请参数说明" maxlength="50"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="margin-top: -25px">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="ConfigEnvironment">
import {
  addConfigEnvironment,
  changeStatus,
  delConfigEnvironment,
  exportConfigEnvironment,
  getTitleIndex,
  listConfigEnvironment,
  updateConfigEnvironmentApi,
} from '@/api/config/env'

const {proxy} = getCurrentInstance();
const {config_environment_group} = proxy.useDict("config_environment_group");

const titleCodeList = ref([]);
const ids = ref([]);
// 环境参数表格数据
const configEnvironmentList = ref([]);

//tab的选中
const activeName = ref('1');
// 弹出层标题
const title = ref("");

const loading = ref(false);
const single = ref(true);
const multiple = ref(false);
const showSearch = ref(true);
// 是否显示弹出层
const open = ref(false);


const data = reactive({

  titleCode: {
    envTitle: '',
    envCode: ''
  },

  types: [{label: '启用', value: 1}, {label: '禁用', value: 0}],

  // 查询参数
  queryParams: {
    envValue: null,
    envDes: null,
    envGroup: null,
    envSort: null,
    envStatus: null
  },
  // 表单参数
  form: {
    menuType: 'C'
  },
  // 表单校验
  rules: {
    envGroup: [
      {required: true, message: '参数组不能为空', trigger: 'blur'}
    ],
    envSort: [
      {required: true, message: '排序不能为空', trigger: 'blur'}
    ],
    envStatus: [
      {required: true, message: '状态 1启用 0禁用不能为空', trigger: 'blur'}
    ]
  }
});

const {queryParams, form, rules, types, titleCode} = toRefs(data);


//修改环境变量状态
function changeStatusButton(data) {
  loading.value = true
  changeStatus(data).then(res => {
    proxy.$modal.msgSuccess(res.msg)
    getList()
    loading.value = false
  })
}

/*选中值之后调用的事件*/
function changeType(item) {
  titleCode.envCode = item.envCode
  titleCode.envTitle = item.envTitle
}

/*切换调用的方法*/
function handleClick(tab, event) {
  activeName.value = tab.props.name
  getList()
}


/** 查询环境参数列表 Query environment parameter list */
function getList() {
  loading.value = true
  queryParams.value.envGroup = activeName.value
  listConfigEnvironment(queryParams.value).then(response => {
    configEnvironmentList.value = response.data
    loading.value = false
  })
}

function getTitleCodeList() {
  listConfigEnvironment({}).then(response => {
    titleCodeList.value = response.data
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    menuType: 'C',
    envCode: null,
    envValue: null,
    envDes: null,
    envGroup: null,
    envSort: null,
    envStatus: 1
  }
  proxy.resetForm("formRef");

}

function handleQueryTitle() {
  queryParams.pageNum.value = 1
  getList()
}

/** 搜索按钮操作 */
function handleQuery() {
  if (!titleCode.envTitle && !titleCode.envCode) {
    this.$notify.warning('参数标题和参数编码不能同时为空')
    return
  }
  // this.queryParams.pageNum = 1;
  getTitleIndex({title: titleCode.envTitle, code: titleCode.envCode}).then((res) => {
    if (res.code === 200) {
      if (res.data) {
        activeName.value = res.data + ''
        getList()
      } else {
        proxy.$modal.msgWarning('没有对应的功能')
      }
    }
  }).catch(() => {
  })
}


/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery()
  loading.value = false
}


// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.envCode)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function updateConfigEnvironment(data) {
  proxy.$modal.confirm('确认修改' + data.envTitle + '吗?').then(function () {
    return updateConfigEnvironmentApi(data);
  }).then((res) => {
    if (res.code == 200) {
      proxy.$modal.msgSuccess(res.msg)
      getList();
    }
  }).catch(() => {
  });
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加环境参数'
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      addConfigEnvironment(form.value).then(response => {
        if (response.code == 200) {
          open.value = false
          if (form.value.menuType == 'M') {
            activeName.value = "1"
            proxy.$modal.msgSuccess("新增成功,重新刷新页面加载分组");
          } else {
            activeName.value = form.value.envGroup
            proxy.$modal.msgSuccess(response.msg);
          }
          getList()
        }
      })
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const envCodes = row.envCode
  proxy.$modal.confirm('是否确认删除环境参数编号为"' + envCodes + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delConfigEnvironment(envCodes)
  }).then(() => {
    if (res.code == 200) {
      proxy.$modal.msgSuccess(res.msg)
      getList();
    }
  })
}


getTitleCodeList();
getList()
</script>
<style>
.ban {
  -webkit-text-fill-color: #ededed !important;
}
</style>