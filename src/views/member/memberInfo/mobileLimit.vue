<template>
  <div class="app-container">

    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="600px"
               style="padding-bottom: 30px" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              size="small"
              v-hasPermi="['member:limit:add']"
          >新增
          </el-button>
          <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              size="small"
              v-hasPermi="['member:limit:export']"
          >导出
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="mobileLimitList" v-loading="loading" stripe>
        <el-table-column label="限制手机号" prop="mobile" align="center"/>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button
                type="danger"
                text="danger"
                plain
                icon="delete"
                @click="deleteMobile(scope.row)"
                v-hasPermi="['member:limit:remove']"
            >delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
          v-show="total"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getListMobile"
      />
      <el-button @click="open=false" style="float: right;margin-top: 20px">取 消</el-button>

      <el-dialog :title="title" v-model="openAdd" width="400px" style="padding-bottom: 20px" append-to-body>
        <el-form ref="mobileLimitForm" :model="form" :rules="rules" label-width="90px">
          <el-form-item label="限制手机号" prop="mobile">
            <el-input v-model="form.mobile" type="number" placeholder="限制手机号"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="openAdd=false">取 消</el-button>
        </div>
      </el-dialog>

    </el-dialog>



  </div>

</template>

<script setup name="MobileLimit">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  addMobileLimit,
  deleteMobileLimit,
  mobileLimitListData,
  mobileLimitListDataExport
} from "@/api/member/mobileLimit";
import {downloadExcel} from "@/utils/common";

const {proxy} = getCurrentInstance();

const mobileLimitList = ref([]);
const total = ref(0);
const mobileAvailable = ref(0);

const title = ref('');
const open = ref(false);
const openAdd = ref(false);
const loading= ref(false);



const data = reactive({
  queryParams :{
    pageNum:1,
    pageSize:10
  },
  form:{},
  rules:{}
});
const {queryParams,form,rules} = toRefs(data)

function show(){
  open.value = true;
  title.value = "限制手机号注册"
}

function reset() {
  form.value = {
    mobile:null
  }
  proxy.resetForm('mobileLimitForm')
}

/**
 * 查询列表 list of mobile limit data
 */
function getListMobile(){
  loading.value = true
  mobileLimitListData(queryParams.value).then(res=>{
    mobileLimitList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** 新增 add*/
function handleAdd(){
  openAdd.value = true;
  title.value = "添加手机号"
}

/** submit */
function submitForm(){
  proxy.$refs['mobileLimitForm'].validate(valid => {
    for(const ml of mobileLimitList.value){
      if(ml.mobile === form.value.mobile){
        console.log(form.value.mobile)
        console.log(ml.mobile)
        mobileAvailable.value = ml.mobile
      }
    }
    if(mobileAvailable.value === form.value.mobile){
      proxy.$modal.msgError("手机号码已经可用")
    }else {
      if (form.value.mobile.length === 11) {
        addMobileLimit(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          openAdd.value = false
          reset()
          getListMobile()
        })
      } else {
        proxy.$modal.msgError("电话号码不能超过11位")
      }
    }

  })
}

/** 导出列表 export*/
function handleExport(){
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return mobileLimitListDataExport(queryParams.value)
  }).then(response => {
    downloadExcel(response, '支付类型')
  }).catch(() => {
  })
}

function deleteMobile(row){
  proxy.$confirm('是否确认删除"' + row.mobile + '"支付类型?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteMobileLimit(row.mobile)
  }).then(() => {
    getListMobile()
    proxy.$modal.msgSuccess('删除成功')
  })
}

defineExpose({
  show
});

getListMobile()
</script>

<style scoped>

</style>