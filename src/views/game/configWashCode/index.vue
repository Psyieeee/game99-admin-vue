<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="游戏类型" prop="gameTypeId">
        <el-select v-model="queryParams.gameTypeId" placeholder="请选择游戏类型" clearable>
          <el-option
              v-for="item in gameTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="激活状态" prop="effect">
        <el-select v-model="queryParams.effect" placeholder="请选择激活状态" clearable>
          <el-option
              v-for="dict in sys_effect_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            size="small"
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['game:configWashCode:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            size="small"
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['game:configWashCode:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            size="small"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['game:configWashCode:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            size="small"
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['game:configWashCode:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configWashCodeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="系统编号" align="center" prop="id"/>
      <el-table-column label="游戏类型" align="center" prop="gameTypeId">
        <template #default="scope">
          <div v-for="item in gameTypeList">
            <span v-if="item.id === scope.row.gameTypeId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="最小打码" align="center" prop="codeMin"/>
      <el-table-column label="最大打码" align="center" prop="codeMax"/>
      <el-table-column label="洗码比例" align="center" prop="washCodeRate"/>
      <el-table-column label="打码倍数" align="center" prop="beat"/>
      <el-table-column label="激活状态" align="center" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="180">
        <template #default="scope">
          <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['game:configWashCode:edit']"
          >修改
          </el-button>
          <el-button
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['game:configWashCode:remove']"
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
        :page-sizes="[20,50,100]"
        @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="configWashCodeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="游戏类型" prop="gameTypeId">
          <el-select v-model="form.gameTypeId" placeholder="请选择游戏类型" clearable>
            <el-option
                v-for="item in gameTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最小打码" prop="codeMin">
          <el-input type="number" class="no-number" v-model="form.codeMin" placeholder="请输入最小打码"/>
        </el-form-item>
        <el-form-item label="最大打码" prop="codeMax">
          <el-input type="number" class="no-number" v-model="form.codeMax" placeholder="请输入最大打码"/>
        </el-form-item>
        <el-form-item label="洗码比例" prop="washCodeRate">
          <el-input type="number" class="no-number" v-model="form.washCodeRate" placeholder="请输入洗码比例"/>
        </el-form-item>
        <el-form-item label="打码倍数" prop="beat">
          <el-input type="number" class="no-number" v-model="form.beat" placeholder="请输入洗码比例"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="margin-top: -30px">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ConfigWashCode">
import {
  listConfigWashCode,
  getConfigWashCodeInfo,
  addConfigWashCode,
  updateConfigWashCode,
  deleteConfigWashCode,
  changeConfigWashCodeEffect,
  exportConfigWashCode
} from "@/api/game/configWashCode";
import {listAllType} from "@/api/game/type";

const {proxy} = getCurrentInstance();
const {sys_effect_type} = proxy.useDict('sys_effect_type');

const configWashCodeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const value = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const pageNum = ref(1);
const pageSize = ref(10);

const gameTypeList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    gameTypeId: null,
    effect: null
  },
  rules: {
    gameTypeId: [{required: true, message: '游戏类型不能为空', trigger: 'blur'}],
    codeMin: [{
      required: true, trigger: 'blur',
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('最小打码不能为空'))
        } else if (Number.parseInt(value) <= 0) {
          callback(new Error('最小打码不能是零或负数'))
        }
        callback()
      }
    }],
    codeMax: [{
      required: true, trigger: 'blur',
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('最大打码不能为空'))
        } else if (Number.parseInt(value) < Number.parseInt(data.form.codeMin)) {
          callback(new Error('最大打码不能小于最小打码'))
        }
        callback()
      }
    }],
    washCodeRate: [{
      required: true, trigger: 'blur',
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('洗码比例不能为空'))
        } else if (Number.parseFloat(value) <= 0) {
          callback(new Error('洗码比例不能是零或负数'))
        }
        callback()
      }
    }],
    beat: [{
      required: true, trigger: 'blur',
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('打码倍数不能为空'))
        } else if (Number.parseFloat(value) < 0) {
          callback(new Error('打码倍数不能是负数'))
        }
        callback()
      }
    }]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询洗码配置列表 */
function getList() {
  loading.value = true;
  listConfigWashCode(queryParams.value).then(response => {
    configWashCodeList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

function getGameTypeList() {
  listAllType().then(response => {
    gameTypeList.value = response.data
  })
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    gameTypeId: null,
    effect: null,
    codeMin: null,
    codeMax: null,
    washCodeRate: null,
    beat: null
  };
  proxy.resetForm("configWashCodeRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加洗码配置";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getConfigWashCodeInfo(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改洗码配置";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configWashCodeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateConfigWashCode(form.value).then(response => {
          if (response.code === 200) {
            proxy.$modal.msgSuccess(response.msg)
            open.value = false;
            getList()
          } else {
            proxy.$modal.msgError(response.msg)
          }
        }).catch(() => {
        });
      } else {
        addConfigWashCode(form.value).then(response => {
          if (response.code === 200) {
            proxy.$modal.msgSuccess(response.msg)
            open.value = false;
            getList()
          } else {
            proxy.$modal.msgError(response.msg)
          }
        }).catch(() => {
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除系统编号编号为"' + _ids + '"的数据项？').then(function () {
    return deleteConfigWashCode(_ids);
  }).then((response) => {
    getList();
    proxy.$modal.msgSuccess(response.msg);
  }).catch(() => {
  });
}

function handleStatusChange(row) {
  let text = row.effect === true ? "启用" : "停用";
  proxy.$modal.confirm('是否确认' + text + '系统编号编号为' + row.id + '"的数据项？').then(function () {
    return changeConfigWashCodeEffect(row.id, row.effect);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.effect = !row.effect;
  });
}

function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...').then(function () {
    return exportConfigWashCode(queryParams);
  }).then(response => {
    proxy.downloadExcel(response, '【请填写功能名称】');
  }).catch(() => {
  })
}

getGameTypeList();
getList();
</script>

<style scoped>
.dialog-footer {
  float: right;
  margin-top: -10px;
}

.checkboxes label {
  display: block;
  margin-left: -100px;
}

.checkboxes el-checkbox {
  vertical-align: middle;
}

.checkboxes label span {
  vertical-align: middle;
}

::-webkit-scrollbar {
  width: 10px;
}

</style>