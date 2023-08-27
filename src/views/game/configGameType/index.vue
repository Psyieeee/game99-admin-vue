<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="平台id" prop="platformId" class="input-wd25">
        <el-input
            v-model="queryParams.platformId"
            placeholder="请输入平台id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="平台名称" prop="platformName" class="input-wd25">
        <el-select v-model="queryParams.platformName" placeholder="请选择平台名称" clearable>
          <el-option
              v-for="dict in platformTypeList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.name"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="子平台id" prop="sonPlatformId" class="input-wd25">
        <el-input
            v-model="queryParams.sonPlatformId"
            placeholder="请输入子平台id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="子平台名称" prop="sonPlatformName" class="input-wd25">
        <el-input
            v-model="queryParams.sonPlatformName"
            placeholder="请输入子平台名称"
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
            v-hasPermi="['game:configGametype:add']"
        >新增
        </el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configGameTypeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="平台id-子平台id" align="center" prop="id"/>
      <el-table-column label="平台id" align="center" prop="platformId"/>
      <el-table-column label="平台名称" align="center" prop="agent" :formatter="formatterAgent"/>
      <el-table-column label="子平台id" align="center" prop="sonPlatformId"/>
      <el-table-column label="子平台名称" align="center" prop="sonPlatformName"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="120">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['game:configGametype:edit']"
          >修改
          </el-button>
          <el-button
              fixed="right"
              size="small"
              type="danger"
              link
              icon="Delete"
              style="color: #FF5722"
              @click="handleDelete(scope.row)"
              v-hasPermi="['game:configGametype:remove']"
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
        :page-sizes="[20,30,50,100]"
        @pagination="getList"/>

    <el-dialog :title="title" v-model="open" width="600px" style="padding-bottom: 20px"
               append-to-body>
      <el-form ref="configFormRef" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="平台名称" prop="platformId">
          <el-select v-model="form.platformId" placeholder="请选择">
            <el-option
                v-for="dict in platformTypeList"
                :key="dict.agent"
                :label="dict.name"
                :value="dict.agent"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="子平台id" prop="sonPlatformId">
          <el-input v-model="form.sonPlatformId" placeholder="请输入子平台id"/>
        </el-form-item>
        <el-form-item label="子平台名称" prop="sonPlatformName">
          <el-input v-model="form.sonPlatformName" placeholder="请输入子平台名称"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ConfigGameType">
import {
  addGameConfigType, delGameConfigType,
  GameConfigTypeInfo,
  listGameConfigType,
  updateGameConfigType
} from "@/api/game/gameConfigType";
import {listAllPlatform} from "@/api/game/platform";

const {proxy} = getCurrentInstance()

const platformTypeList = ref([])
const configGameTypeList = ref([])

const loading = ref(false)
const open = ref(false)

const ids = ref([]);
const total = ref(0);
const title = ref('');

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */
const showSearch = ref(true)


const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    platformId: '',
    sonPlatformId: '',
    sonPlatformName: ''
  },
  rules: {},
  form: {}
});
const {queryParams, rules, form} = toRefs(data)

/**
 * 查询游戏字典列表 list of data
 */
function getList() {
  loading.value = false
  listGameConfigType(queryParams.value).then(res => {
    configGameTypeList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

function getGamePlatformList() {
  listAllPlatform().then(res => {
    platformTypeList.value = res.data
  })
}

function formatterAgent(row) {
  for (const pt of platformTypeList.value) {
    if (pt.agent === row.platformId) {
      return pt.name
    }
  }
  return ""
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    platformId: null,
    platformName: null,
    sonPlatformId: null,
    sonPlatformName: null
  };
  proxy.resetForm("configFormRef");
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加";
}

/**
 * 修改游戏字典
 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value
  GameConfigTypeInfo(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改游戏配置类型";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configFormRef"].validate(valid => {
    if (valid) {
      for (const type of platformTypeList.value) {
        if (type.agent == form.value.agent) {
          form.value.platformName = type.name
        }
      }
      if (form.value.id != null) {
        updateGameConfigType(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGameConfigType(form.value).then(response => {
          proxy.$modal.msgSuccess(response.msg);
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + id + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return delGameConfigType(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

getGamePlatformList();
getList();
</script>
