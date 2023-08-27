<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-model="showSearch" label-width="86px">
      <el-form-item label="渠道名称" prop="channelName" class="input-wd25">
        <el-input
            v-model="queryParams.channelName"
            placeholder="请输入渠道名称"
            clearable
            @keyup.enter = "handleQuery"
        />
      </el-form-item>
      <el-form-item label="链名称" prop="chainName" class="input-wd25">
        <el-input
            v-model="queryParams.chainName"
            placeholder="请输入链名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充值地址" prop="rechargeAddress" class="input-wd25">
        <el-input
            v-model="queryParams.rechargeAddress"
            placeholder="请输入充值地址"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

<!--  query buttons -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
              type="primary"
              plain
              icon="Plus"
              size="small"
              @click="handleAdd"
              v-hasPermi="['pay:rechargeUsdt:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
              type="success"
              plain
              icon="Edit"
              size="small"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['pay:rechargeUsdt:edit']"
          >修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
              type="danger"
              plain
              icon="Delete"
              size="small"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['pay:rechargeUsdt:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
              type="warning"
              plain
              icon="Download"
              size="small"
              @click="handleExport"
              v-hasPermi="['pay:rechargeUsdt:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

    <el-table stripe v-loading="loading" :data="payUsdtRechargeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="排序" align="center" width="200" prop="sort" />
      <el-table-column label="渠道名称" align="center" width="300" prop="channelName" />
      <el-table-column label="链名称" align="center" width="300" prop="chainName" />
      <el-table-column label="状态" align="center" width="100" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="充值地址" align="center" min-width="400" prop="rechargeAddress" />
      <el-table-column label="优惠比例" align="center" width="100" prop="discountBill" />
      <el-table-column label="usdt汇率" align="center" width="100" prop="exchangeRate" />
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pay:rechargeUsdt:edit']"
          >修改</el-button>
          <el-button
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['pay:rechargeUsdt:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改【请填写功能名称】对话框 add or update form-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="500px" style="padding-bottom: 20px" append-to-body>
      <el-form ref="payRechargeUsdtFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="渠道名称" prop="channelName">
          <el-input v-model="form.channelName" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="链名称" prop="chainName">
          <el-input v-model="form.chainName" placeholder="请输入链名称" />
        </el-form-item>
        <el-form-item label="充值地址" prop="rechargeAddress">
          <el-input v-model="form.rechargeAddress" placeholder="请输入充值地址" />
        </el-form-item>
        <el-form-item label="优惠比例" prop="discountBill">
          <el-input v-model="form.discountBill" placeholder="请输入优惠比例" />
        </el-form-item>
        <el-form-item label="usdt汇率" prop="exchangeRate">
          <el-input v-model="form.exchangeRate" placeholder="请输入usdt汇率" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="PayRechargeUsdt" setup>

import {reactive, ref, toRefs} from "vue";
import {
  addPayRechargeUsdt,
  changePayRechargeUsdtStatus, deletePayRechargeUsdt,
  exportRechargeUsdt,
  listPayRechargeUsdt,
  payRechargeUsdtById, updatePayRechargeUsdt
} from "@/api/pay/payRechargeUsdt";

const router = useRouter();
const {proxy} = getCurrentInstance();

const payUsdtRechargeList = ref([]);

const ids = ref([]);
const total = ref(0);
const title = ref();

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */
const showSearch = ref(true)

const loading = ref(true)
const open = ref(false)


const data = reactive({

  queryParams:{
    pageNum:1,
    pageSize:10,
    channelName:'',
    chainName:'',
    rechargeAddress:''
  },
  form:{

  },
  rules:{
    channelName: [
      {required: true, message: '渠道名称不能为空', trigger: 'blur'}
    ],
    chainName: [
      {required: true, message: '链名称不能为空', trigger: 'blur'}
    ],
    rechargeAddress: [
      {required: true, message: '充值地址不能为空', trigger: 'blur'}
    ],
    discountBill: [
      {required: true, message: '优惠比例不能为空', trigger: 'blur'}
    ],
    exchangeRate: [
      {required: true, message: 'usdt汇率不能为空', trigger: 'blur'}
    ],
    icon: [
      {required: true, message: '钱包二维码不能为空', trigger: 'blur'}
    ]
  }
});

const {queryParams,form,rules} = toRefs(data);

/**  多选框选中数据 select multiple rows*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 查询【请填写功能名称】列表 get list*/
function getList(){
  loading.value = true
  listPayRechargeUsdt(queryParams.value).then(res=>{
    payUsdtRechargeList.value = res.data;
    total.value = res.total
    loading.value =false
  })

}

// 表单重置
function reset() {
  form.value = {
    id: null,
    channelName: null,
    chainName: null,
    rechargeAddress: null,
    discountBill: null,
    exchangeRate: null,
    sort: null,
    icon: null,
    effect: 0,
    openLevel: null,
    openLevelMax: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("payRechargeUsdtFormRef");
}

/** 搜索按钮操作 handle search query*/
function handleQuery(){
  queryParams.pageNum = 1;
  getList()
}

/** 重置按钮操作 reset query*/
function resetQuery(){
  proxy.resetForm("queryForm")
  handleQuery()
  loading.value = false
}

/** 新增按钮操作 */
function handleAdd(){
  reset()
  open.value = true
  title.value = "添加【请填写功能名称】"
}

/** 修改按钮操作 handle update*/
function handleUpdate(row){
  reset();
  const id = row.id || ids.value
  payRechargeUsdtById(id).then(response=>{
    form.value = response.data;
    open.value = true;
    title.value = "修改USDT渠道"
  })
}

/** 删除按钮操作 handle submit form*/
function submitForm(){
  proxy.$refs["payRechargeUsdtFormRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePayRechargeUsdt(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPayRechargeUsdt(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });

}

/** 删除按钮操作 handle delete*/
function handleDelete(row){
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + id + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function() {
    return deletePayRechargeUsdt(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  })
}

/** 导出按钮操作 export data */
function handleExport(){
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', "警告",{
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function (){
    return exportRechargeUsdt(queryParams.value);
  }).then((res)=>{
    proxy.downloadExcel(res, '【请填写功能名称】')
  }).catch(() => {
  })

}

/**  支付类型状态修改 */
function handleStatusChange(row){
  let text = row.effect === '1' ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.channelName + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return changePayRechargeUsdtStatus(row.id, row.effect)
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
  })
}

getList()
</script>

<style scoped>

</style>