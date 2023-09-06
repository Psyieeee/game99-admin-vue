<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="平台名称" prop="gamePlatformId" class="input-wd25">
        <el-select v-model="queryParams.gamePlatformId" placeholder="请选择平台名称" clearable>
          <el-option
              v-for="dict in platformTypeList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="游戏类型" prop="gameTypeId" class="input-wd25">
        <el-select v-model="queryParams.gameTypeId" placeholder="请选择平台 游戏类型" clearable>
          <el-option
              v-for="dict in gameTypeList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="现金返还等级" prop="level" class="input-wd25">
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
            v-hasPermi="['game:gamePlatformCashBack:add']"
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
            v-hasPermi="['game:gamePlatformCashBack:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['game:gamePlatformCashBack:export']"
        >导出
        </el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="gamePlatformCashBackList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="id"/>
      <el-table-column label="平台名称" align="center" prop="gamePlatformId" min-width="120">
        <template #default="scope">
          <div v-for="(item, index) in platformTypeList">
            <span v-if="item.id === scope.row.gamePlatformId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="游戏类型名称" align="center" prop="gameTypeId" min-width="120">
        <template #default="scope">
          <div v-for="(item, index) in gameTypeList">
            <span v-if="item.id === scope.row.gameTypeId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="现金返还级别" align="center" prop="level"/>
      <el-table-column label="状态" align="center" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="投注" align="center" prop="bet"/>
      <el-table-column label="返现百分比" align="center" prop="rebatePercentage"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="120">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['game:gamePlatformCashBack:edit']"
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
              v-hasPermi="['game:gamePlatformCashBack:remove']"
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
      <el-form ref="gamePlatformCashBackFormRef" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="平台名称" prop="platformId">
          <el-select v-model="form.platformId" placeholder="请输入平台 ID">
            <el-option
                v-for="dict in platformTypeList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="游戏类型 ID" prop="gameTypeId" class="input-wd25">
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
              placeholder="请输入返利百分比"
              clearable
          />
        </el-form-item>
        <el-form-item label="歌曲名称" prop="rebatePercentage" style="min-width: 290px">
          <el-input
              v-model="form.rebatePercentage"
              placeholder="请输入投注"
              clearable
          />
        </el-form-item>
      </el-form>
      <el-form-item label="活跃" prop="effect">
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

<script setup name="GamePlatformCashBack">
import {
  gamePlatformCashBackListData,
  getGamePlatformCashBackData,
  exportMemberGamePlatformCashBack,
  addGamePlatformCashBack,
  updateGamePlatformCashBack,
  deleteGamePlatformCashBack,
  changeGamePlatformCashBackStatus
} from "@/api/game/gamePlatformCashBack";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {listAllPlatform} from "@/api/game/platform";
import {listAllType} from "@/api/game/type";

const {proxy} = getCurrentInstance()
const {sys_effect_type, game_show_type, game_platform_cash_back_level} = proxy.useDict('sys_effect_type', "game_show_type", "game_platform_cash_back_level");

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
    money: [
      {required: true, message: '派送金额不能为空', trigger: 'blur'}
    ],
    rebatePercentage: [
      {required: true, message: '需要返还百分比', trigger: 'blur'}
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
    title.value = "修改游戏配置类型";
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
  proxy.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + id + '"的数据项?', "警告", {
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

function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportMemberGamePlatformCashBack(queryParams.value)
  }).then(response => {
    downloadExcel(response, '公司入款银行')
  }).catch(() => {
  })
}

getGamePlatformList();
getGameTypeList();
getList();
</script>
