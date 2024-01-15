<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="游戏名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入游戏名称"
            @keyup.enter="handleQuery"
        />
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
      <el-form-item label="游戏平台" prop="platformId">
        <el-select v-model="queryParams.platformId" placeholder="请选择游戏平台" clearable>
          <el-option
              v-for="item in gamePlatformList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏类型" prop="typeId">
        <el-select v-model="queryParams.typeId" placeholder="请选择游戏类型" clearable>
          <el-option
              v-for="item in gameTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否热门" prop="recommend">
        <el-select v-model="queryParams.recommend" placeholder="请选择游戏类型" clearable>
          <el-option
              v-for="dict in sys_effect_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否可以自由玩耍" prop="sortChoices">
        <el-select v-model="queryParams.freeToPlay" placeholder="请选择游戏类型" clearable>
          <el-option
              v-for="dict in sys_effect_type"
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
            size="small"
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['game:info:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            size="small"
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['game:info:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            size="small"
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['game:info:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="gameInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="id" min-width="100"/>
      <el-table-column label="游戏名称" align="center" prop="name" min-width="100"/>
      <el-table-column label="图标" align="center" prop="icon" min-width="100">
        <template #default="scope">
          <el-image :src="scope.row.icon" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <el-table-column label="游戏平台" align="center" prop="platformId" min-width="120">
        <template #default="scope">
          <div v-for="(item, index) in gamePlatformList">
            <span v-if="item.id === scope.row.platformId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="游戏类型" align="center" prop="typeId" min-width="120">
        <template #default="scope">
          <div v-for="(item, index) in gameTypeList">
            <span v-if="item.id === scope.row.typeId">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
<!--      <el-table-column label="是否可以自由玩耍" align="center" prop="freeToPlay" min-width="100">-->
<!--        <template #default="scope">-->
<!--          <el-switch-->
<!--              v-model="scope.row.freeToPlay"-->
<!--              :active-value="true"-->
<!--              :inactive-value="false"-->
<!--              @change="handleFreeToPlayChange(scope.row)"-->
<!--          ></el-switch>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="是否热门" align="center" prop="recommend" min-width="100">
        <template #default="scope">
          <el-switch
              v-model="scope.row.recommend"
              :active-value="true"
              :inactive-value="false"
              @change="handleRecommendChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="是否维护" align="center" prop="maintain" min-width="100">
        <template #default="scope">
          <el-switch
              v-model="scope.row.maintain"
              :active-value="true"
              :inactive-value="false"
              @change="handleMaintainChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="激活状态" align="center" prop="effect" min-width="100">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" min-width="80"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="160">
        <template #default="scope">
          <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['game:info:edit']"
          >修改
          </el-button>
          <el-button
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['game:info:remove']"
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
      <el-form ref="gameInfoRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="游戏名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入游戏名称"/>
        </el-form-item>
        <el-form-item label="游戏码" prop="kindId">
          <el-input v-model="form.kindId" placeholder="请输入游戏码"/>
        </el-form-item>
        <el-form-item label="游戏平台" prop="platformId">
          <el-select v-model="form.platformId" placeholder="请选择游戏平台" :disabled="form.id != null">
            <el-option
                v-for="item in gamePlatformList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏类型" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择游戏类型" clearable>
            <el-option
                v-for="item in gameTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图标">
          <image-upload v-model="form.icon" path="game"/>
        </el-form-item>
        <el-form-item label="大图标" prop="largeIcon">
          <el-switch
              v-model="form.largeIcon"
              :active-value="true"
              :inactive-value="false">
          </el-switch>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" type="number" class="no-number" placeholder="请输入排序"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="GameInfo">
import {
  addGameInfo,
  changeEffectStatusInfo,
  changeFreeToPlayStatus,
  changeMaintainStatusInfo,
  changeRecommendStatusInfo,
  delGameInfo,
  getGameInfo,
  listGameInfo,
  updateGameInfo
} from "@/api/game/info";
import {listAllPlatform} from "@/api/game/platform";
import {listAllType} from "@/api/game/type";

const {proxy} = getCurrentInstance();
const {sys_effect_type} = proxy.useDict('sys_effect_type');

const gameInfoList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const gamePlatformList = ref([]);
const gameTypeList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    name: null,
    platformId: null,
    effect: null,
    choice: null,
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询游戏信息列表 */
function getList() {
  loading.value = true;
  listGameInfo(queryParams.value).then(response => {
    gameInfoList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

function getGamePlatformList() {
  listAllPlatform().then(response => {
    gamePlatformList.value = response.data
  })
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
    name: null,
    platformId: null,
    kindId: null,
    icon: null,
    largeIcon: null,
    recommend: null,
    freeToPlay: null,
    maintain: null,
    effect: null,
    createTime: null
  };
  proxy.resetForm("gameInfoRef");
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
  title.value = "添加游戏信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getGameInfo(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改游戏信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["gameInfoRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateGameInfo(form.value).then(response => {
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
        addGameInfo(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除游戏信息编号为"' + _ids + '"的数据项？').then(function () {
    return delGameInfo(_ids);
  }).then((response) => {
    getList();
    proxy.$modal.msgSuccess(response.msg);
  }).catch(() => {
  });
}

function handleEffectChange(row) {
  let text = row.effect === true ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"吗?').then(function () {
    return changeEffectStatusInfo(row.id, row.effect);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.effect = !row.effect;
  });
}

function handleMaintainChange(row) {
  let text = row.maintain === true ? "开始维护" : "停止维护";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"吗?').then(function () {
    return changeMaintainStatusInfo(row.id, row.maintain);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.maintain = !row.maintain;
  });
}

function handleRecommendChange(row) {
  let text = row.recommend === true ? "开始推荐" : "停止推荐";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"吗?').then(function () {
    return changeRecommendStatusInfo(row.id, row.recommend);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.recommend = !row.recommend;
  });
}

function handleFreeToPlayChange(row) {
  let text = row.freeToPlay === true ? "免费游戏" : "付费游戏";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"吗?').then(function () {
    return changeFreeToPlayStatus(row.id, row.freeToPlay);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.freeToPlay = !row.freeToPlay;
  });
}

getGamePlatformList();
getGameTypeList();
getList();
</script>