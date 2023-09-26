<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams" label-width="98px">
      <el-form-item label="佣金类型" prop="type" style="min-width: 290px">
        <el-input
            v-model="queryParams.type"
            clearable
            placeholder="请输入佣金类型"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="effect">
        <el-select v-model="queryParams.effect" clearable placeholder="状态">
          <el-option label="激活" value="1"></el-option>
          <el-option label="停用" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['member:memberCommissionFee:add']"
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
            v-hasPermi="['member:memberCommissionFee:remove']"
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
            v-hasPermi="['member:memberCommissionFee:export']"
            icon="Download"
            plain
            size="small"
            type="warning"
            @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="memberCommissionFeeList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="佣金类型" min-width="180" prop="type"/>
      <el-table-column align="center" label="级别" min-width="180" prop="level"/>
      <el-table-column align="center" label="有效投注" min-width="180" prop="validBet"/>
      <el-table-column align="center" label="佣金" min-width="180" prop="commission"/>
      <el-table-column align="center" label="状态" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['member:memberCommissionFee:update']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['member:memberCommissionFee:remove']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50]"
        :total="total"
        @pagination="getList"
    />

    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="700px">
      <el-form ref="memberCommissionFeeRef" :model="form" :rules="rules" label-width="100px">
        <div class="el-row">
          <div class="el-col-lg-12">
            <el-form-item label="佣金类型" prop="type" style="min-width: 290px">
              <el-input
                  v-model="form.type"
                  clearable
                  placeholder="请输入佣金类型"
              />
            </el-form-item>
            <el-form-item label="级别" prop="level" style="min-width: 290px">
              <el-input
                  v-model="form.level"
                  clearable
                  placeholder="请输入级别"
              />
            </el-form-item>
            <el-form-item label="有效投注" prop="validBet" style="min-width: 290px">
              <el-input
                  v-model="form.validBet"
                  clearable
                  placeholder="请输入有效投注的级别"
              />
            </el-form-item>
            <el-form-item label="佣金" prop="commission" style="min-width: 290px">
              <el-input
                  v-model="form.commission"
                  clearable
                  placeholder="请输入级别佣金"
              />
            </el-form-item>
            <el-form-item v-hasPermi="['member:memberCommissionFee:update']" label="活跃" prop="effect">
              <template #default="scope">
                <el-switch
                    v-model="form.effect"
                    :active-value="1"
                    :inactive-value="0"
                ></el-switch>
              </template>
            </el-form-item>
          </div>
        </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="MemberCommissionFee" setup>

import {
  addCommissionFee,
  commissionFeeListData,
  changeCommissionFeeStatus,
  deleteCommissionFee,
  exportMemberCommissionFee,
  getCommissionFeeData,
  updateCommissionFee
} from "@/api/member/memberCommissionFee";
import {url} from "@/utils/url";
import {getToken} from "@/utils/auth";
import DictTag from "@/components/DictTag/index.vue";
import {useRouter} from "vue-router";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";

const router = useRouter();
const {proxy} = getCurrentInstance();

const {commissionFee_type} = proxy.useDict('commissionFee_type');

const memberCommissionFeeList = ref([]);
const ids = ref([]);
const title = ref('');
const total = ref(0);
const open = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);

const data = reactive({

  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    title: null,
    effect: null,
  },

  /** 表单参数 form parameter*/
  form: {},

  /** 表单校验 form validation */
  rules: {
    type: [
      {required: true, message: '类型为必填项', trigger: 'blur'}
    ],
    level: [
      {required: true, message: '级别为必填项', trigger: 'blur'}
    ],
    validBet: [
      {required: true, message: '有效投注为必填项', trigger: 'blur'}
    ],
    commission: [
      {required: true, message: '佣金为必填项', trigger: 'blur'}
    ],
  },

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

});
const {queryParams, form, rules, headers} = toRefs(data);

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  commissionFeeListData(queryParams.value).then(response => {
    memberCommissionFeeList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    type: null,
    effect: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm('memberCommissionFeeRef');
}

function resetFormText() {
  form.value = {
    id: null,
    text2: null
  }
  proxy.resetForm('textFormRef')
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

/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加会员音乐'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['memberCommissionFeeRef'].validate(async valid => {
    if (valid) {
      const params = {
        type: form.value.type,
        level: form.value.level,
        validBet: form.value.validBet,
        commission: form.value.commission,
        effect: form.value.effect,
      }

      if (form.value.id != null) {
        updateCommissionFee(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addCommissionFee(params).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** handle update data */
function handleUpdate(row) {
  reset()
  const id = row.id || this.ids
  getCommissionFeeData(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改音乐列表'
  })
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteCommissionFee(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

/**  导出按钮操作 handle export data as excel query */
function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportMemberCommissionFee(queryParams.value)
  }).then(response => {
    downloadExcel(response, '公司入款银行')
  }).catch(() => {
  })
}

function getTypeLabel(type) {
  // for (commissionFee_type
  console.log("type " + type)
  for (const a of commissionFee_type.data.value) {
    console.log("commissionFee_type.data.value " + commissionFee_type.data.value)
    if (a.dictLabel === type) {
      return a.name;
    }
  }
}

function handleEffectChange(row) {
  let text = row.effect === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    const effect = changeCommissionFeeStatus(row.id, row.effect);
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

/** select multiple option */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

getList()
</script>

<style>
</style>
