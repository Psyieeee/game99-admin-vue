<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name" class="input-wd25">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
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
            size="small"
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['game:type:add']"
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
            v-hasPermi="['game:type:edit']"
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
            v-hasPermi="['game:type:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="图标" align="center" prop="icon" min-width="100">
        <template #default="scope">
          <el-image :src="scope.row.icon" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <el-table-column label="显示类型" align="center" prop="type">
        <template #default="scope">
          <dict-tag :options="game_show_type" :value="scope.row.type" />
        </template>
      </el-table-column>
<!--      <el-table-column label="洗码比例" align="center" prop="rateClean" width="100"/>-->
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
      <el-table-column label="排序号" align="center" prop="sort"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="180">
        <template #default="scope">
          <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['game:type:edit']"
          >修改
          </el-button>
          <el-button
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['game:type:remove']"
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

    <!-- 添加或修改游戏类型对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="typeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <image-upload v-model="form.icon" path="game"/>
        </el-form-item>

        <el-form-item label="显示类型" prop="type">
          <el-select
              filterable
              v-model="form.type"
              placeholder="请选择激活显示类型"
              clearable
              style="width: 240px">
            <el-option
                v-for="types in game_show_type"
                :key="types.value"
                :label="types.label"
                :value="Number.parseInt(types.value)"/>
          </el-select>
        </el-form-item>
        <!-- Transferred from platform/index.vue        -->
<!--        <el-form-item label="洗码比例" prop="rateClean">
          <el-input type="number" class="no-number" v-model="form.rateClean" placeholder="请输入洗码比例"/>
        </el-form-item>-->

        <el-form-item label="排序号" prop="sort">
          <el-input type="number" class="no-number" v-model="form.sort" placeholder="请输入排序号"/>
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

<script setup name="GameType">
import {
  listType,
  getType,
  delType,
  addType,
  updateType,
  changeEffectStatus
} from "@/api/game/type";
import ImageUpload from "@/components/ImageUpload";
import DictTag from "@/components/DictTag";

const {proxy} = getCurrentInstance();
const {sys_effect_type,game_show_type} = proxy.useDict('sys_effect_type',"game_show_type");

const typeList = ref([]);
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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    name: null,
    effect: null,
    type:null,
    orderByColumn: 'sort',
    isAsc: 'asc'
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询游戏类型列表 */
function getList() {
  loading.value = true;
  listType(queryParams.value).then(response => {
    typeList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
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
    effect: null,
    icon: null,
    sort: null,
    rateClean: null,
    type:null,
  };
  proxy.resetForm("typeRef");
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
  title.value = "添加游戏类型";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getType(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改游戏类型";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["typeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateType(form.value).then(response => {
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
        addType(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除游戏类型编号为"' + _ids + '"的数据项？').then(function () {
    return delType(_ids);
  }).then((response) => {
    getList();
    proxy.$modal.msgSuccess(response.msg);
  }).catch(() => {
  });
}

function handleStatusChange(row) {
  let text = row.effect === true ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"吗?').then(function () {
    return changeEffectStatus(row.id, row.effect);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.effect = !row.effect;
  });
}

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