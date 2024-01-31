<template>
  <div class="app-container">
    <!--    search form start here-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="40px">
      <el-form-item label="名称" prop="name" class="input-wd20">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="effect">
        <el-select v-model="queryParams.effect" placeholder="状态" clearable>
          <el-option
              v-for="dict in sys_effect_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--  button -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['pay:payType:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['pay:payType:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <!--    display data in the table -->
    <el-table stripe :stripe="true" v-loading="loading" :data="payTypeList">
      <el-table-column label="名称" align="center" prop="name" min-width="100"/>
      <el-table-column label="图标" align="center" prop="iconUrl">
        <template #default="scope">
          <el-image
              style="height: 50px;"
              :src="scope.row.iconUrl"
              fit="contain">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort"/>
      <el-table-column label="支付类型" align="center" prop="type">
        <template #default="scope">
          <dict-tag :options="pay_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="页面显示比例" align="center" prop="rate"/>
      <el-table-column label="是否推荐" align="center" prop="recommend">
        <template #default="scope">
          <el-switch
              v-model="scope.row.recommend"
              :active-value="true"
              :inactive-value="false"
              @change="handleRecommendChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="激活状态" align="center" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @click="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="设备类型" align="center" prop="deviceType" :formatter="deviceTypeFormat"/>
      <el-table-column label="开放层级" align="center" prop="openLevel">
        <template #default="scope">
          <span>{{ scope.row.openLevelMin + '-' + scope.row.openLevelMax }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy"/>
      <el-table-column label="修改人" align="center" prop="updateBy"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="200">
        <template #default="scope">
          <el-button
              size="small"
              type="primary" link
              icon="Edit"
              @click="handleUpdateText(scope.row)"
              v-hasPermi="['pay:payType:edit']"
          >文本
          </el-button>
          <el-button
              size="small"
              type="primary" link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pay:payType:edit']"
          >修改
          </el-button>
          <el-button
              size="small"
              type="danger" link
              icon="Delete"
              style="color: indianred"
              @click="handleDelete(scope.row)"
              v-hasPermi="['pay:payType:remove']"
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

    <!-- 添加或修改【支付类型】对话框 Add or modify the [Payment Type] dialog box-->
    <el-dialog :title="title" v-model="open" width="600px" style="padding-bottom: 20px" append-to-body>
      <el-form ref="payTypeForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" type="number"/>
        </el-form-item>

        <el-form-item label="图标">
          <imageUpload v-model="form.iconUrl" path="payType"/>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-checkbox-group v-model="form.deviceTypes">
            <el-checkbox label="1">ios</el-checkbox>
            <el-checkbox label="2">安卓</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="页面比例显示" prop="rate">
          <el-input v-model="form.rate" placeholder="请输入红利利率"/>
        </el-form-item>

        <el-form-item label="存入类型" prop="type">
          <el-select
              filterable
              v-model="form.type"
              placeholder="请选择存入类型"
              clearable
              style="width: 240px"
              :disabled="form.id != null"
          >
            <el-option v-for="dict in pay_type"
                :key="dict.label"
                :label="dict.label"
                :value="Number.parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开放层级" prop="openLevel">
          <el-col :span="11">
            <el-input type="number" class="no-number" v-model="form.openLevelMin" placeholder="请输入最小开放层级"
                      oninput="if(value>50){value=50}if(value<0){value=0}value=Number.parseInt(value)"/>
          </el-col>
          <el-col :span="2" style="text-align: center;">-</el-col>
          <el-col :span="11">
            <el-input type="number" class="no-number" v-model="form.openLevelMax" placeholder="请输入最大开放层级"
                      oninput="if(value>50){value=50}if(value<0){value=0}value=Number.parseInt(value)"/>
          </el-col>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

    <!--    update text-->
    <el-dialog :title="title" v-model="openText" width="600px" style="padding-bottom: 20px" append-to-body>
      <el-form ref="payTypeForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文本1" prop="tex1">
          <el-input v-model="form.tex1" placeholder="请输入文本1" type="textarea" :rows="4"/>
        </el-form-item>
        <el-form-item label="文本2" prop="tex2">
          <el-input v-model="form.tex2" placeholder="请输入文本2" type="textarea" :rows="4"/>
        </el-form-item>
        <el-form-item label="文本3">
          <el-input v-model="form.tex3" placeholder="请输入文本3" type="textarea" :rows="4"/>
        </el-form-item>
        <el-form-item label="文本4" prop="tex4">
          <el-input v-model="form.tex4" placeholder="请输入文本4" type="textarea" :rows="4"/>
        </el-form-item>
        <el-form-item label="文本5" prop="tex5">
          <el-input v-model="form.tex5" placeholder="请输入文本5" type="textarea" :rows="4"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormText">确 定</el-button>
        <el-button @click="openText=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="PayType" setup>

import {reactive, ref, toRefs} from "vue";
import {
  addPayType,
  changePayTypeEffect,
  changeRecommendStatus,
  delPayType,
  exportPayType, getPayType,
  listPayType, updatePayType, updatePayTypeText
} from "@/api/pay/payType";
import {downloadExcel} from "@/utils/common";
import {changeStatusConfigBankList} from "@/api/pay/configBankList";

const {proxy} = getCurrentInstance();

const {pay_type} = proxy.useDict("pay_type");

const payTypeList = ref([]);


const title = ref('');
const total = ref(0);

const open = ref(false)
const openText = ref(false)
const showSearch = ref(true)
const loading = ref(true)
const single = ref(true)
const multiple = ref(true)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    name: null,
    code: null,
    iconUrl: null,
    indexes: null,
    isRecommend: null,
    status: null,
    isOnline: null,
    type: null,
    rate:null,
    deviceType: null,
    createBy: null,
    updateBy: null,
    orderByColumn: 'sort',
    isAsc: 'asc'
  },
  deviceTypes: ['1', '2'],
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    name: [
      {required: true, message: '名称不能为空', trigger: 'blur'}
    ],
    code: [
      {required: true, message: '编码不能为空', trigger: 'blur'}
    ],
    rate:[
      {required: true, message: '不能为空', trigger: 'blur'}
    ],
    indexes: [
      {required: true, message: '排序不能为空', trigger: 'blur'}
    ],
    type: [
      {required: true, message: '存入类型不能为空', trigger: 'blur'}
    ]
  }
});

const {queryParams, deviceTypes, form, rules} = toRefs(data);
const {sys_effect_type} = proxy.useDict('sys_effect_type')

function getList() {
  loading.value = true;
  listPayType(queryParams.value).then(response => {
    payTypeList.value = response.data
    total.value = response.total
    loading.value = false
  })
}

function reset() {
  form.value = {
    id: null,
    name: null,
    code: null,
    iconUrl: null,
    indexes: null,
    isRecommend: null,
    status: 0,
    isOnline: null,
    type: null,
    rate:null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  deviceTypes.value = ['1', '2']
  proxy.resetForm('payTypeForm')
}

//设备类型
function deviceTypeFormat(row) {
  if (row.deviceType === "1") {
    return 'ios'
  } else if (row.deviceType === "2") {
    return '安卓'
  } else if (row.deviceType === "1,2" || row.deviceType === "2,1") {
    return 'ios/安卓'
  }
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 handle reset query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

/** 新增按钮操作 add payType*/
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加支付类型'
}

function submitForm() {
  proxy.$refs['payTypeForm'].validate(valid => {
    if (form.value.id != null) {
      if (form.value.deviceTypes != null) {
        form.value.deviceType = form.value.deviceTypes.join(',')
        updatePayType(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      }
    } else {
      if (deviceTypes.value != null && deviceTypes.value !== "") {
        form.deviceType = deviceTypes.value.join(',')
      }
      form.value.recommend = false;
      addPayType(form.value).then(response => {
        proxy.$modal.msgSuccess('新增成功')
        open.value = false
        getList()
      })
    }
  })
}

function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportPayType(queryParams.value)
  }).then(response => {
    downloadExcel(response, '支付类型')
  }).catch(() => {
  })
}

function handleRecommendChange(row) {
  let text = row.recommend === true ? "打开" : "关闭";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"推荐吗?').then(function () {
    return changeRecommendStatus(row.id, row.recommend);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.recommend = !row.recommend;
  });
}

function handleEffectChange(row) {
  let text = row.effect === true ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.name + '"吗?').then(function () {
    return changePayTypeEffect(row.id, row.effect);
  }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
  }).catch(function () {
    row.effect = !row.effect;
  });
}

function handleUpdateText(row) {
  reset()
  getPayType(row.id).then(response => {
    form.value = response.data
    openText.value = true
    title.value = '文本编辑'
  })
}

function submitFormText() {
  updatePayTypeText(form.value).then(response => {
    proxy.$modal.msgSuccess('修改成功')
    openText.value = false
    getList()
  })
}

function handleUpdate(row) {
  reset()
  getPayType(row.id).then(response => {
    form.value = response.data
    if (response.data.deviceType !== null && response.data.deviceType !== "") {
      form.value.deviceTypes = response.data.deviceType.split(',')
    }
    open.value = true
    title.value = '修改支付类型'
  })
}

function handleDelete(row) {
  proxy.$confirm('是否确认删除"' + row.name + '"支付类型?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delPayType(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

getList()
</script>