<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="系统编号" prop="id" class="input-wd25">
        <el-input
            v-model="queryParams.id"
            placeholder="请输入系统编号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="银行名称" prop="bankName" class="input-wd25">
        <el-input
            v-model="queryParams.bankName"
            placeholder="请输入银行名称"
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
            @click="handleAdd"
            v-hasPermi="['pay:configBankList:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['pay:configBankList:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['pay:configBankList:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configBankListList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="系统编号" align="center" prop="id"/>
      <el-table-column label="银行编码(选填)" align="center" prop="bankCode"/>
      <el-table-column label="银行名称" align="center" prop="bankName"/>
      <el-table-column label="银行图标" align="center" prop="bankIcon">
        <template #default="scope">
          <el-image :src="scope.row.bankIcon" lazy fit="contain" style="width: 60px;"/>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="type"/>
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
      <el-table-column label="排序" align="center" prop="sort"/>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  fixed="right" min-width="150">
        <template #default="scope">
          <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pay:configBankList:edit']"
          >修改
          </el-button>
          <el-button
              type="danger"
              link
              icon="Delete"
              style="color: #e05e5e"
              @click="handleDelete(scope.row)"
              v-hasPermi="['pay:configBankList:remove']"
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
        :page-sizes="[20,30,50]"
        @pagination="getList"
    />

    <!-- 添加或修改银行字典列表对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body style="padding-bottom: 25px" :close-on-click-modal="false">
      <el-form ref="configBankListRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="银行名称" prop="bankName">
            <el-input v-model="form.bankName" placeholder="请输入银行名称"/>
        </el-form-item>
        <el-form-item label="银行编码" prop="bankCode">
          <el-input v-model="form.bankCode" placeholder="请输入银行编码(选填)"/>
        </el-form-item>
        <el-form-item label="银行图标" prop="bankIcon">
          <imageUpload v-model="form.bankIcon" path="bank"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" type="number"/>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select
              filterable
              v-model="form.type"
              style="width: 240px">
            <el-option
                v-for="configBankListType in configBankListTypes"
                :value="configBankListType"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ConfigBankList">
import {
  listConfigBankList,
  getConfigBankList,
  delConfigBankList,
  addConfigBankList,
  updateConfigBankList, changeStatusConfigBankList
} from "@/api/pay/configBankList";
import ImageUpload from "@/components/ImageUpload";

const {proxy} = getCurrentInstance();
const {sys_effect_type} = proxy.useDict('sys_effect_type');

const configBankListList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    id: null,
    bankName: null,
    effect: null,
  },
  rules: {
    bankName: [
      {required: true, message: "银行名称不能为空", trigger: "blur"}
    ],
    bankIcon: [
      {required: true, message: "银行图标不能为空", trigger: "blur"}
    ],
    effect: [
      {required: true, message: "激活状态不能为空", trigger: "change"}
    ],
  }
});

const configBankListTypes = ["BANK", "WALLET"];

const {queryParams, form, rules} = toRefs(data);

/** 查询银行字典列表列表 */
function getList() {
  loading.value = true;
  listConfigBankList(queryParams.value).then(response => {
    configBankListList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

 /** 表单重置 */
function reset() {
  form.value = {
    id: null,
    bankCode: null,
    bankName: null,
    bankIcon: null,
    effect: null,
    sort: null,
    type: configBankListTypes[0]
  };
  proxy.resetForm("configBankListRef");
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

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加银行字典列表";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getConfigBankList(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改银行字典列表";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configBankListRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateConfigBankList(form.value).then(response => {
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
        addConfigBankList(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除银行字典列表编号为"' + _ids + '"的数据项？').then(function () {
    return delConfigBankList(_ids);
  }).then((response) => {
    getList();
    proxy.$modal.msgSuccess(response.msg);
  }).catch(() => {
  });
}

/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.effect === true ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.bankName + '"吗?').then(function () {
    return changeStatusConfigBankList(row.id, row.effect);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.effect = !row.effect;
  });
}

getList();
</script>