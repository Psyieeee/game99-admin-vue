<template>
 <div class="app-container">

   <el-row :gutter="2" class="mb8">
     <el-col :span="1">
        <el-button
            plain
            size="small"
            type="primary"
            @click="handleAdd"
            v-hasPermi="['config:recommend:add']"
        >新增
        </el-button>
     </el-col>
   </el-row>

<!--  table-->
   <el-table v-loading="loading" :data="configRecommendList">
     <el-table-column label="级别" align="center" prop="level"/>
     <el-table-column label="名称" align="center" prop="name"/>
     <el-table-column label="比例" align="center" prop="bill"/>
     <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
       <template #default="scope">
         <el-button
             size="small"
             type="primary"
             link
             icon="Edit"
             @click="handleUpdate(scope.row)"
             v-hasPermi="['config:recommend:edit']">修改
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
       @pagination="getList"/>

<!-- 添加或修改推广设置对话框  add or update form -->
   <el-dialog v-model="open" :close-on-click-modal="false" :title="title" width="450px" style="height: 300px;" append-to-body>
     <el-form :model="form" ref="cRAForm" :rules="rules" label-width="80px">
       <el-form-item label="名称" prop="name">
         <el-input v-model="form.name" placeholder="请输入名称"/>
       </el-form-item>
       <el-form-item label="级别" prop="level">
         <el-input v-model="form.level" placeholder="请输入级别"/>
       </el-form-item>
       <el-form-item label="比例" prop="bill">
         <el-input v-model="form.bill" placeholder="请输入比例"/>
       </el-form-item>
     </el-form>
     <template #footer>
     <div slot="footer" class="form-footer">
       <el-button
           plain
           type="primary"
           @click="submitForm">确 定
       </el-button>
       <el-button
           plain
           type="warning"
           @click="open=!open">取 消
       </el-button>
     </div>
     </template>
   </el-dialog>


 </div>
</template>

<script name="ConfigRecommend" setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  addConfigRecommend,
  configRecommendById,
  configRecommendListData,
  updateConfigRecommend
} from "@/api/activity/recommend/configRecommend";

const {proxy} = getCurrentInstance();

const configRecommendList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const dataConfig = reactive({
  /** 查询参数 */
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    level: null,
    name: null,
    bill: null
  },
/**  表单参数 */
  form: {},
 /** 表单校验 */
  rules: {}
});

const {queryParams,form,rules} = toRefs(dataConfig);


/** 查询推广设置列表 get all data list*/
function getList() {
  loading.value = true;
  configRecommendListData(queryParams.value).then(response => {
    configRecommendList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

/** 表单重置 reset form */
function reset(){
  form.value = {
    level:null,
    name:null,
    bill: null
  };
  proxy.resetForm("cRAForm");
}

/** 新增推广设置 handle add */
function handleAdd(){
  reset()
  open.value = true
  title.value = "新增推广设置"
}

/**  修改推广设置 handle update */
function handleUpdate(row){
  reset()
  configRecommendById(row.id).then(res=>{
    form.value = res.data
    open.value = true
    title.value = "修改推广设置"
  })
}

/**  提交按钮 handle submit form */
function submitForm(){
  proxy.$refs['cRAForm'].validate(validation=>{
    if(validation){
      if(form.value.id !=null){
        updateConfigRecommend(form.value).then(res=>{
          proxy.$modal.msgSuccess("updated done")
          open.value = false
          getList()
        })
      }else{
        addConfigRecommend(form.value).then(res=>{
          proxy.$modal.msgSuccess("added done")
          open.value = false
          getList()
        })
      }
    }
  })
}

getList()
</script>

<style scoped>
.form-footer{
  float: right;
  margin-top: -25px;
}
</style>