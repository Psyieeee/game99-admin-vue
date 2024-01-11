<template>
  <div class="app-container">
    <!--    search form-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="98px">
      <el-form-item label="银行编码" prop="code"  style="min-width: 290px">
        <el-input
            v-model="queryParams.code"
            placeholder="请输入银行编码"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="银行名称" prop="name" style="min-width: 290px">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入银行名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="effect">
        <el-select v-model="queryParams.effect" placeholder="状态" clearable>
          <el-option value="true" label="激活"></el-option>
          <el-option value="false" label="停用"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['pay:payRechargeBank:add']"
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
            v-hasPermi="['pay:payRechargeBank:remove']"
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
            v-hasPermi="['pay:payRechargeBank:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="configBankList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="银行名称" align="center" prop="bankAccount" min-width="120"
                       :formatter="getBankName"/>
<!--      <el-table-column label="银行名称" align="center" prop="bankName" min-width="120"/>-->
      <el-table-column label="银行账号" align="center" prop="bankAccount" min-width="180"/>
      <el-table-column label="排序" align="center" prop="sort"/>
<!--      <el-table-column label="开户地" :show-overflow-tooltip="true" min-width="180" align="center" prop="bankAddress"/>-->
      <el-table-column label="状态" align="center" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="开户人" align="center" prop="accountName" min-width="120"/>
      <el-table-column label="开放层级" align="center" prop="openLevel" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.openLevelMin + '-' + scope.row.openLevelMax }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值金额" align="center" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.rechargeLimitMin + '-' + scope.row.rechargeLimitMax }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column label="最大充值金额" align="center" prop="rechargeLimitMax"/>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="150">
        <template #default="scope">
<!--            <el-button-->
<!--                    size="small"-->
<!--                    type="primary" link-->
<!--                    icon="Edit"-->
<!--                    @click="handleUpdateText(scope.row)">文本-->
<!--            </el-button>-->
          <el-button
              size="small"
              type="primary" link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pay:payRechargeBank:edit']">修改
          </el-button>
          <el-button
              size="small"
              type="danger" link
              style="color: #e05e5e"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['pay:payRechargeBank:remove']">删除
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

    <!-- 添加或修改公司入款银行列表对话框 Add or modify company deposit bank list dialog-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="700px" style="padding-bottom: 20px"
               append-to-body>
      <el-form ref="configBankRef" :model="form" :rules="rules" label-width="100px">
        <div class="el-row">
          <div class="el-col-lg-12">
            <el-form-item label="银行名称" prop="bankName">
              <el-select filterable
                         v-model="form.bankId"
                         placeholder="请选择银行名称"
                         clearable

                         style="width: 240px">
                <el-option v-for="dict in bankListOptions"
                           :key="dict.id"
                           :label="dict.bankName"
                           :value="dict.id"/>
              </el-select>
            </el-form-item>
          </div>
          <div class="el-col-lg-12">
            <el-form-item label="开户人" prop="accountName">
              <el-input v-model="form.accountName" placeholder="请输入开户人"/>
            </el-form-item>
          </div>
        </div>

        <el-form-item label="银行账号" prop="bankAccount">
          <el-input v-model="form.bankAccount" placeholder="请输入银行账号"/>
        </el-form-item>

        <div class="el-row">
<!--          <div class="el-col-lg-12">-->
<!--            <el-form-item label="开户地址" prop="bankAddress">-->
<!--              <el-input v-model="form.bankAddress" placeholder="请输入开户地址"/>-->
<!--            </el-form-item>-->
<!--          </div>-->
          <div class="el-col-lg-12">
            <el-form-item label="优惠比例" prop="discountBill">
              <el-input v-model="form.discountBill" placeholder="请输入优惠比例"/>
            </el-form-item>
          </div>
        </div>

        <el-row :gutter="10">
          <el-col :md="12" :lg="12" :xl="12">
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
          </el-col>

          <el-col :md="12" :lg="12" :xl="12">
            <el-form-item label="金额限制" prop="openLevel">
              <el-col :span="11">
                <el-input type="number" class="no-number" v-model="form.rechargeLimitMin"
                          placeholder="请输入最小充值金额"/>
              </el-col>
              <el-col :span="2" style="text-align: center;">-</el-col>
              <el-col :span="11">
                <el-input type="number" class="no-number" v-model="form.rechargeLimitMax"
                          placeholder="请输入最大充值金额"/>
              </el-col>
            </el-form-item>

          </el-col>
        </el-row>

        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注信息"/>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" type="number"/>
        </el-form-item>

        <el-form-item label="MFA验证" prop="googleAuthCode">
          <el-input v-model="form.googleAuthCode" placeholder="请输入MFA验证码" type="number" class="no-number"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

      <el-dialog :title="title" v-model="openText" width="600px" :close-on-click-modal="false" append-to-body>
          <el-form ref="textFormRef" :model="form" :rules="rulesFormText" label-width="80px">
              <el-form-item label="文本2 " prop="text2">
                  <el-input v-model="form.text2" placeholder=" 请输入文本2 " type="textarea" rows="4"/>
              </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitFormText"> 确 定</el-button>
          </div>
      </el-dialog>


  </div>
</template>

<script name="ConfigBank" setup>

import {listConfigBankListAll} from "@/api/pay/configBankList";

const router = useRouter();
const {proxy} = getCurrentInstance();

import {reactive, ref} from "vue";
import {
    addPayRechargeBank, changeConfigBankText,
    changePayRechargeBankStatus,
    delPayRechargeBank,
    exportPayRechargeBank, getPayRechargeBank,
    listPayRechargeBank,
    updatePayRechargeBank
} from "@/api/pay/payRechargeBank";
import {downloadExcel} from "@/utils/common";
import DictTag from "@/components/DictTag/index.vue";

const configBankList = ref([]);
const bankListOptions = ref([]);
const ids = ref([]);


const title = ref('');
const total = ref(0);

const open = ref(false);
// 查询参数
const openText = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);

const data = reactive({

  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    code: null,
    name: null,
  },

  /** 表单参数 form parameter*/
  form: {},

  /** 表单校验 form validation */
  rules: {
    name: [
      {required: true, message: '银行名称不能为空', trigger: 'blur'}
    ],
    bankAccount: [
      {required: true, message: '银行账号地址不能为空', trigger: 'blur'}
    ],
    googleAuthCode: [
      {required: true, message: 'MFA验证码不能为空', trigger: 'blur'}
    ]
  },

    /** 表单校验 form validation */
 rulesFormText: {
     text2: [
            {required: true, message: 'can not be empty, trigger', trigger: 'blur'}
     ],
   }

});
const {queryParams, form, rules,rulesFormText} = toRefs(data);


/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  listPayRechargeBank(queryParams.value).then(response => {
    configBankList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}


// 表单重置
function reset() {
  form.value = {
    id: null,
    code: null,
    bankName: null,
    icon: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    bankAccount: null,
    remark: null,
    status: null,
    accountName: null,
    // bankAddress: null,
    discountBill: null,
    openLevelMin: null,
    openLevelMax: null,
    rechargeLimitMin: null,
    rechargeLimitMax: null,
    sort:null
  }
  proxy.resetForm('configBankRef')
}

function resetFormText(){
    form.value = {
        id: null,
        text2 : null
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

/** 查询银行字典列表列表 */
function bankList() {
  loading.value = true;
  listConfigBankListAll().then(response => {
    bankListOptions.value = response.data;
    if(response.total != null){
      total.value = response.total;
    }
    loading.value = false;
  });
}

function formatterBank(row) {
    for (const pt of bankListOptions.value) {
        if (pt.id === row.bankId) {
            return pt.BankName
        }
    }
    return ""
}


/** handle add new data */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加公司入款银行列表'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['configBankRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePayRechargeBank(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addPayRechargeBank(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleUpdateText(row){
    resetFormText()
    const id = row.id
    getPayRechargeBank(id).then(response => {
        form.value = response.data
        openText.value = true
        title.value = '文本编辑'
    })
}

function submitFormText() {
    if(form.value.id != null){
        console.log("form.value.id")
        proxy.$refs['textFormRef'].validate(valid => {
            changeConfigBankText(form.value).then(response => {
                proxy.$modal.msgSuccess('修改成功')
                openText.value = false
                getList()
            })
        })
    }
}

/** handle update data */
function handleUpdate(row) {
  reset()
  const id = row.id || this.ids
  getPayRechargeBank(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改公司入款银行列表'
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
    return delPayRechargeBank(idss)
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
    return exportPayRechargeBank(queryParams.value)
  }).then(response => {
    downloadExcel(response, '公司入款银行')
  }).catch(() => {
  })
}

function handleEffectChange(row) {
  let text = row.effect === '1' ? '启用' : '停用'
  proxy.$confirm('确认要"' + text + '""' + row.bankName + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    const effect = changePayRechargeBankStatus(row.id, row.effect);
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

function getBankName( row ) {
  return bankListOptions.value.find(bank => bank.id === row.bankId).bankName;
}

bankList()
getList()
</script>

<style>
</style>
