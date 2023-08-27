<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="平台名称" prop="name" class="input-wd25">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入平台名称"
            clearable
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
      <el-form-item>
        <el-button type="primary" size="small" icon="Search" @click="handleQuery">搜索</el-button>
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
            v-hasPermi="['game:platform:add']"
        >新增
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="platformList">
      <el-table-column label="ID" align="center" prop="id" min-width="100"/>
      <el-table-column label="平台名称" align="center" prop="name" min-width="150"/>
      <el-table-column label="代理" align="center" prop="agent" min-width="150"/>
      <el-table-column label="游戏类别" align="center" prop="gameCategory" min-width="150">
        <template #default="scope">
          <span v-for="(item, index) in gameCategoryList">
            <span v-if="item.name === scope.row.gameCategory">{{ item.des }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="小图标" align="center" prop="icon" min-width="100">
        <template #default="scope">
          <el-image :src="scope.row.icon" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <el-table-column label="卡片图标" align="center" prop="cardIcon" min-width="100">
        <template #default="scope">
          <el-image :src="scope.row.cardIcon" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <!--      Transferred to type/index.vue-->
      <el-table-column label="洗码比例" align="center" prop="rateClean" width="100"/>
      <el-table-column label="打码比例" align="center" prop="rateBeat" width="100"/>
      <el-table-column label="激活状态" align="center" prop="effect" width="100">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center" prop="sort" width="80"/>
      <el-table-column label="维护状态" align="center" prop="maintain" width="100">
        <template #default="scope">
          <el-switch
              v-model="scope.row.maintain"
              :active-value="true"
              :inactive-value="false"
              @change="handleMaintainChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160"/>
      <el-table-column label="最后更新时间" align="center" prop="updateTime" width="160"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="160">
        <template #default="scope">
          <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['game:platform:edit']"
          >修改
          </el-button>
          <el-button
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['game:platform:remove']"
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

    <!-- 添加或修改游戏平台对话框 add or modify form -->
    <el-dialog :title="title" v-model="open" width="650px" append-to-body>
      <el-form ref="platformRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="平台名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入平台名称"/>
        </el-form-item>
        <el-form-item label="代理" prop="agent">
          <el-input v-model="form.agent" placeholder="请输入代理"/>
        </el-form-item>
        <el-form-item label="游戏类别" prop="gameCategory">
          <el-select v-model="form.gameCategory" placeholder="请选择游戏类别" :disabled="form.id != null">
            <el-option
                v-for="item in gameCategoryList"
                :key="item.name"
                :label="item.des"
                :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="10" class="mb8">
          <el-col :span="12">
            <el-form-item label="小图标" prop="icon">
              <image-upload v-model="form.icon" path="game"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡片图标" prop="cardIcon">
              <image-upload v-model="form.cardIcon" path="game"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="API接口" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="请输入API接口"/>
        </el-form-item>
        <el-form-item label="查询注单" prop="recordUrl">
          <el-input v-model="form.recordUrl" placeholder="请输入查询注单"/>
        </el-form-item>
        <el-form-item label="DES密钥" prop="des">
          <el-input v-model="form.des" placeholder="请输入DES密钥"/>
        </el-form-item>
        <el-form-item label="MD5密钥" prop="md5">
          <el-input v-model="form.md5" placeholder="请输入MD5密钥"/>
        </el-form-item>
        <el-form-item label="站点标识" prop="linecode">
          <el-input v-model="form.linecode" placeholder="请输入站点标识"/>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序号"/>
        </el-form-item>
        <el-form-item label="洗码比例" prop="rateClean">
          <el-input type="number" class="no-number" v-model="form.rateClean" placeholder="请输入洗码比例"/>
        </el-form-item>
        <el-form-item label="打码比例" prop="rateBeat">
          <el-input type="number" class="no-number" v-model="form.rateBeat" placeholder="请输入打码比例"/>
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

<script setup name="GamePlatform">
import {
  listPlatform,
  getPlatform,
  delPlatform,
  addPlatform,
  updatePlatform,
  changeEffectStatusPlatform, changeMaintainStatusPlatform, gameCategoryAll
} from "@/api/game/platform";

const {proxy} = getCurrentInstance();
const {sys_effect_type} = proxy.useDict('sys_effect_type');

const platformList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const gameCategoryList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    gameCategory: null,
    name: null,
    effect: null,
    sort: null,
    orderByColumn: 'sort',
    isAsc: 'asc'
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询游戏平台列表 */
function getList() {
  loading.value = true;
  listPlatform(queryParams.value).then(response => {
    platformList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

function getGameCategoryList() {
  gameCategoryAll().then(response => {
    gameCategoryList.value = response.data
  })
}

/**  取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    gameCategory: null,
    name: null,
    agent: null,
    apiUrl: null,
    recordUrl: null,
    des: null,
    md5: null,
    icon: null,
    cardIcon: null,
    linecode: null,
    // rateClean: null,
    rateBeat: null,
    effect: null,
    sort: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("platformRef");
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
  loading.value = false
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加游戏平台";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPlatform(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改游戏平台";
  });
}

/** 提交按钮 submit form*/
function submitForm() {
  proxy.$refs["platformRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePlatform(form.value).then(response => {
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
        addPlatform(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除游戏平台编号为"' + _ids + '"的数据项？').then(function () {
    return delPlatform(_ids);
  }).then((response) => {
    getList();
    proxy.$modal.msgSuccess(response.msg);
  }).catch(() => {
  });
}

function handleEffectChange(row) {
  let text = row.effect === true ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"吗?').then(function () {
    return changeEffectStatusPlatform(row.id, row.effect);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.effect = !row.effect;
  });
}

function handleMaintainChange(row) {
  let text = row.maintain === true ? "开始维护" : "停止维护";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"吗?').then(function () {
    return changeMaintainStatusPlatform(row.id, row.maintain);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.maintain = !row.maintain;
  });
}

getGameCategoryList();
getList();
</script>