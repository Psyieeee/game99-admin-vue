<template>
   <div class="app-container">
     <el-form ref="queryForm" :model="queryParams" v-show="searchShow" :inline="true" label-width="100px">
       <el-form-item label="彩票类型名称" prop="name">
         <el-input
             style="width: 190px"
             v-model="queryParams.name"
             placeholder="请输入彩种名称"
             @keyup.enter="handleQuery"
             clearable/>
       </el-form-item>
       <el-form-item label="彩种类型" prop="kind">
         <el-select
             v-model="queryParams.kind"
             placeholder="请选择彩种类型"
             clearable>
           <el-option
           v-for="kind in lotteryRule_Kind"
           :key="kind.value"
           :label="kind.label"
           :value="kind.value">
           </el-option>
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
             icon="Plus"
             size="small"
             @click="handleAdd"
             v-hasPermi="['lottery:rule:add']">新增
         </el-button>
       </el-col>
       <el-col :span="1.5">
         <el-button
             type="warning"
             plain
             icon="Download"
             size="small"
             @click="handleExport"
             v-hasPermi="['lottery:rule:export']">导出
         </el-button>
       </el-col>
       <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
     </el-row>

<!--    display lottery rules in table table -->
     <el-table :data="lotteryInfoList" v-loading="loading" @selection-change="handleSelectionChange" stripe>
       <el-table-column type="selection" width="55" align="center"/>
       <el-table-column label="彩票类型名称" prop="name" min-width="160"/>
       <el-table-column label="彩种类型" prop="kind" min-width="160">
         <template #default="scope">
           <dict-tag :options="lotteryRule_Kind" :value="scope.row.kind"/>
         </template>
       </el-table-column>
       <el-table-column label="开奖说明" prop="des" min-width="400"/>
       <el-table-column fixed="right" min-width="160">
         <template #default="scope">
           <el-button
               type="primary"
               link
               plain
               icon="Edit"
               size="small"
               @click="handleUpdate(scope.row)"
               v-hasPermi="['lottery:rule:edit']">修改
           </el-button>
           <el-button
               type="danger"
               link
               plain
               icon="Delete"
               size="small"
               @click="handleDelete(scope.row)"
               v-hasPermi="['lottery:rule:remove']">删除
           </el-button>
         </template>
       </el-table-column>

     </el-table>
     <pagination
         v-show="total"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
     />

     <!-- 添加或修改开奖规则说明对话框 Add or modify lottery rules description dialog-->
     <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="650px"
                append-to-body>
       <el-form ref="lotteryRuleForm" :model="form" :rules="rules" label-width="100px" style="padding-bottom: 10px">
         <el-form-item label="彩票类型名称" prop="name">
           <el-input v-model="form.name" placeholder="请输入彩票类型名称"/>
         </el-form-item>
         <el-form-item label="所属彩种类型" prop="kind" v-if="form.id == null">
           <el-select
               filterable
               v-model="form.kind"
               placeholder="请选择所属彩种类型"
               clearable
               >
             <el-option
                 v-for="dict in lotteryRule_Kind"
                 :key="dict.value"
                 :label="dict.label"
                 :value="dict.value"/>
           </el-select>
         </el-form-item>
         <el-form-item label="开奖说明" prop="des">
           <el-input
               v-model="form.des"
               :autosize="{minRows: 10, maxRows: 30}"
               type="textarea"
               placeholder="请输入开奖说明"/>
         </el-form-item>
       </el-form>
       <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitForm">确 定</el-button>
         <el-button @click="open=!open">取 消</el-button>
       </div>
     </el-dialog>

   </div>
</template>

<script name="LotteryRule" setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  addLotteryRule, deleteLotteryRule,
  ExportLotteryRule,
  listLotteryRule,
  lotteryRuleById,
  updateLotteryRule
} from "@/api/lottery/lotteryRule";
import DictTag from "@/components/DictTag";

const {proxy} = getCurrentInstance();

const lotteryInfoList = ref([]);
const showSearch = ref(true);
const open = ref(false);
const loading = ref(true);
const searchShow = ref(true);
const total = ref(0);
const title = ref('');
const ids = ref([]);

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)

const data = reactive({
  queryParams:{
    pageNum:1,
    pageSize:10,
    id:null,
    kind:null,
    name:null,
    des:null
  },
  form:{},
  rules:{}
});

const {queryParams,form,rules} = toRefs(data);

const {lotteryRule_Kind} = proxy.useDict("lotteryRule_Kind")

/** 查询开奖规则说明列表 get list of data*/
function getList(){
  loading.value = true
  listLotteryRule(queryParams.value).then(res=>{
    lotteryInfoList.value = res.data;
    total.value = res.total
    loading.value = false
  })
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    name: null,
    des: null
  };
  proxy.resetForm("lotteryRuleForm");
}

/** 重置按钮操作 */
function handleQuery(){
  queryParams.pageNum = 1;
  getList()
}
/** 重置按钮操作 reset query*/
function resetQuery(){
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false
}

/** 新增按钮操作 add new lottery rule*/
function handleAdd(){
  reset();
  open.value = true;
  title.value = "添加开奖规则说明";
}

/** 修改按钮操作 update lottery rule*/
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value
  lotteryRuleById(id).then(response => {
    form.value = response.data;
    form.kind = form.value.kind + ''
    open.value = true;
    title.value = "修改开奖规则说明";
  });
}

/** 提交按钮 handle submit form*/
function submitForm() {
  proxy.$refs['lotteryRuleForm'].validate(validation=>{
    if(validation){
      if(form.value.id == null){
        addLotteryRule(form.value).then(res=>{
          if(res.code === 200 || res.code === "200") {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false
            getList();
          }else{
            proxy.$modal.msgError("错误")
          }
        })
      }else{
        updateLotteryRule(form.value).then(res=>{
          console.log(res.status)
          if(res.code === 200 || res.code === "200"){
            proxy.$modal.msgSuccess("修改成功");
            open.value = false
            getList();
          }else{
            proxy.$modal.msgError("错误")
          }

        })
      }
    }
  })
}

/** 导出按钮操作 handle export data*/
function handleExport(){
  proxy.$modal.confirm('是否确认导出所有开奖规则说明数据项?', '警告',{
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type:'warning'
  }).then(function (){
    return ExportLotteryRule(queryParams.value)
  }).then((res)=>{
    proxy.downloadExcel(res,"彩票规则说明")
  }).catch(() => {
  })
}

/** 删除按钮操作 handle delete*/
function handleDelete(row){
   const  id = row.id || ids.value
  proxy.$modal.confirm('是否确认删除开奖规则说明编号为"' + id + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function (){
    return deleteLotteryRule(id);
  }).then(()=>{
    proxy.$modal.msgSuccess("删除按钮");
    getList();
  }).catch(()=>{

  })
}


getList()
</script>

<style scoped>
.dialog-footer{
  float: right;margin-top: -20px;
}
</style>