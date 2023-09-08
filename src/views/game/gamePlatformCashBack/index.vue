<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams" label-width="88px">
      <el-form-item class="input-wd25" label="平台名称" prop="gamePlatformId">
        <el-select v-model="queryParams.gamePlatformId" clearable placeholder="请选择平台名称">
          <el-option
              v-for="dict in platformTypeList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="input-wd25" label="游戏类型" prop="gameTypeId">
        <el-select v-model="queryParams.gameTypeId" clearable placeholder="请选择平台 游戏类型">
          <el-option
              v-for="dict in gameTypeList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="input-wd20" label="现金返还等级" prop="level">
        <el-select v-model.trim="queryParams.level" placeholder="请输入现金返还等级">
          <el-option
              v-for="dict in game_platform_cash_back_level"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['game:gamePlatformCashBack:add']"
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['game:gamePlatformCashBack:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['game:gamePlatformCashBack:export']"
            icon="Download"
            plain
            size="small"
            type="warning"
            @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="gamePlatformCashBackList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="ID" prop="id"/>
      <el-table-column align="center" label="平台名称" min-width="120" prop="gamePlatformId">
        <template #default="scope">
          <div v-for="(item, index) in platformTypeList">
            <span v-if="item.id === scope.row.gamePlatformId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="游戏类型名称" min-width="120" prop="gameTypeId">
        <template #default="scope">
          <div v-for="(item, index) in gameTypeList">
            <span v-if="item.id === scope.row.gameTypeId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="现金返还级别" prop="level"/>
      <el-table-column align="center" label="状态" prop="effect" width="120">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="投注" prop="bet"/>
      <el-table-column align="center" label="返现百分比" prop="rebatePercentage"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button
              v-hasPermi="['game:gamePlatformCashBack:edit']"
              icon="Edit"
              link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
              v-hasPermi="['game:gamePlatformCashBack:remove']"
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
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50,100]"
        :total="total"
        @pagination="getList"/>

    <el-dialog v-model="open" :title="title" append-to-body style="padding-bottom: 20px"
               width="600px">
      <el-form ref="gamePlatformCashBackFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="平台名称" prop="gamePlatformId">
          <el-select v-model="form.gamePlatformId" placeholder="请输入平台 ID">
            <el-option
                v-for="dict in platformTypeList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="input-wd25" label="游戏类型 ID" prop="gameTypeId">
          <el-select v-model="form.gameTypeId" placeholder="请输入平台 ID">
            <el-option
                v-for="dict in gameTypeList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="现金返还等级" prop="level" style="min-width: 290px">
          <el-select v-model="form.level" placeholder="请输入平台 ID">
            <el-option
                v-for="dict in game_platform_cash_back_level"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="投注" prop="bet" style="min-width: 290px">
          <el-input
              v-model="form.bet"
              clearable
              placeholder="请输入返利百分比"
          />
        </el-form-item>
        <el-form-item label="歌曲名称" prop="rebatePercentage" style="min-width: 290px">
          <el-input
              v-model="form.rebatePercentage"
              clearable
              placeholder="请输入投注"
          />
        </el-form-item>
      </el-form>
      <el-form-item label="活跃" label-width="120px" prop="effect" style="min-width: 290px">
        <template #default="scope">
          <el-switch
              v-model="form.effect"
              :active-value="1"
              :inactive-value="0"
          ></el-switch>
        </template>
      </el-form-item>
      <template #footer>
        <div>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script name="GamePlatformCashBack" setup>
import {
  addGamePlatformCashBack,
  changeGamePlatformCashBackStatus,
  deleteGamePlatformCashBack,
  exportMemberGamePlatformCashBack,
  gamePlatformCashBackListData,
  getGamePlatformCashBackData,
  updateGamePlatformCashBack
} from "@/api/game/gamePlatformCashBack";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {listAllPlatform} from "@/api/game/platform";
import {listAllType} from "@/api/game/type";

const {proxy} = getCurrentInstance()
const {
  sys_effect_type,
  game_show_type,
  game_platform_cash_back_level
} = proxy.useDict('sys_effect_type', "game_show_type", "game_platform_cash_back_level");

const platformTypeList = ref([])
const gamePlatformCashBackList = ref([])
const gameTypeList = ref([])

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
    gamePlatformId: null,
    gameTypeId: null,
    level: null,
    effect: null
  },
  rules: {
    bet: [
      {required: true, message: '投注不能为空', trigger: 'blur'}
    ],
    rebatePercentage: [
      {required: true, message: '退还百分比 为必填项', trigger: 'blur'}
    ],
    gameTypeId: [
      {required: true, message: '游戏类型 ID 为必填项', trigger: 'blur'}
    ],
    platformId: [
      {required: true, message: '需要平台 ID', trigger: 'blur'}
    ],
    level: [
      {required: true, message: '需要投注水平', trigger: 'blur'}
    ],
  },
  form: {}
});
const {queryParams, rules, form} = toRefs(data)

/**
 * 查询游戏字典列表 list of data
 */
function getList() {
  loading.value = false
  gamePlatformCashBackListData(queryParams.value).then(res => {
    gamePlatformCashBackList.value = res.data
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

// 表单重置
function reset() {
  form.value = {
    id: null,
    gamePlatformId: null,
    gameTypeId: null,
    level: null,
    effect: null
  };
  proxy.resetForm("gamePlatformCashBackFormRef");
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
  getGamePlatformCashBackData(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改游戏平台回扣百分比";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["gamePlatformCashBackFormRef"].validate(valid => {
    if (valid) {
      for (const type of platformTypeList.value) {
        if (type.agent == form.value.agent) {
          form.value.platformName = type.name
        }
      }
      if (form.value.id != null) {
        updateGamePlatformCashBack(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGamePlatformCashBack(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除编号为"' + id + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return deleteGamePlatformCashBack(id);
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

function handleEffectChange(row) {
  let text = row.effect === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    const effect = changeGamePlatformCashBackStatus(row.id, row.effect);
    loading.value = true
    if (effect) {
      loading.value = false
      return effect
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
  })
}

function getGamePlatformList() {
  listAllPlatform().then(res => {
    platformTypeList.value = res.data
  })
}

function getGameTypeList() {
  listAllType().then(response => {
    gameTypeList.value = response.data
  })
}

getGamePlatformList();
getGameTypeList();
getList();
</script>
