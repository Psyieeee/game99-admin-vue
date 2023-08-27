<template>
   <div class="app-container">
     <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
       <el-form-item  prop="userId">
         <el-input
             v-model.trim="queryParams.userId"
             placeholder="请输入会员ID"
             clearable
             @keyup.enter="handleQuery"
         />
       </el-form-item>
       <el-form-item  prop="platformId">
         <el-select v-model="queryParams.platformId" clearable placeholder="游戏平台">
           <el-option
               v-for="dict in platformList"
               :key="dict.id"
               :label="dict.name"
               :value="dict.id"
           ></el-option>
         </el-select>
       </el-form-item>
       <el-form-item  prop="status">
         <el-select v-model="queryParams.status" placeholder="全部状态" clearable >
           <el-option
               v-for="dict in fixdata_status"
               :key="dict.value"
               :label="dict.label"
               :value="dict.value"
           />
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
             v-hasPermi="['game:memberGameDatafix:add']"
         >新增</el-button>
       </el-col>
       <el-col :span="1.5">
         <el-button
             type="danger"
             plain
             icon="Delete"
             size="small"
             :disabled="multiple"
             @click="handleDelete"
             v-hasPermi="['game:memberGameDatafix:remove']"
         >删除</el-button>
       </el-col>
       <el-col :span="1.5">
         <el-button
             type="warning"
             plain
             icon="Download"
             size="small"
             @click="handleExport"
             v-hasPermi="['game:memberGameDatafix:export']"
         >导出</el-button>
       </el-col>
       <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
     </el-row>

     <el-table stripe v-loading="loading" :data="memberGameDatafixList" @selection-change="handleSelectionChange">
       <el-table-column type="selection" width="55" align="center" />
       <el-table-column label="会员ID" align="center" prop="memberId" min-width="120"/>
       <el-table-column label="游戏开始时间" align="center" prop="gameStartTime" width="180"/>
       <el-table-column label="游戏结束时间" align="center" prop="gameEndTime" width="180"/>
       <el-table-column label="游戏平台" align="center" prop="platformName"/>
       <el-table-column label="状态" align="center" prop="status"  >
         <template #default="scope">
            <dict-tag :options="fixdata_status" :value="scope.row.status"/>
         </template>
       </el-table-column>
       <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
         <template #default="scope">
           <el-button
               type="danger"
               link
               icon="Delete"
               @click="handleDelete(scope.row)"
               v-hasPermi="['game:memberGameDatafix:remove']"
           >删除</el-button>
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

     <!-- 添加或修改游戏注单修复对话框 add or update form-->
     <el-dialog  :close-on-click-modal="false" :title="title" v-model="open" width="470px" style="padding-bottom: 20px" append-to-body>
       <el-form ref="gameDataFixRef" :model="form" :rules="rules" label-width="130px">
         <el-form-item label="会员ID" prop="userId">
           <el-input v-model="form.userId" placeholder="请输入会员ID"/>
         </el-form-item>
         <el-form-item label="游戏开始时间" prop="dateRange">
         <el-date-picker type="datetimerange"
                         v-model="form.dateRange"
                         format="YYYY-MM-DD HH:mm:ss"
                         value-format="YYYY-MM-DD HH:mm:ss"
                         :style="{width: '95%'}"
                         start-placeholder="开始时间"
                         end-placeholder="开始时间"
                         range-separator="至"
                         clearable
                         :default-time="getDefaultTime()"
                         :shortcuts="pickerDateTimeShortcuts"></el-date-picker>
         </el-form-item>
         <el-form-item label="游戏平台" prop="platformName">
           <el-select v-model="form.platformId"
                      filterable
                      clearable
                      placeholder="请选择">
             <el-option
                 v-for="dict in platformList"
                 :key="dict.id"
                 :label="dict.name"
                 :value="dict.id"
             ></el-option>
           </el-select>
         </el-form-item>
       </el-form>
       <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitForm">确 定</el-button>
         <el-button @click="open=false">取 消</el-button>
       </div>
     </el-dialog>


   </div>
</template>

<script setup name="MemberGameDataFix">
import {listAllPlatform} from "@/api/game/platform";
import {
  addMemberGameDatafix,
  delMemberGameDatafix,
  exportMemberGameDatafix,
  listMemberGameDatafix
} from "@/api/game/memberGameDateFix";
import DictTag from "@/components/DictTag";
import {getTodayEndTime, getTodayStartTime, parseTime,pickerDateTimeShortcuts,getDefaultTime} from "@/utils/dateUtils";

const {proxy} = getCurrentInstance()

const memberGameDatafixList = ref([]);
const platformList = ref([]);
const ids = ref([]);
const total = ref(0);
const title = ref();

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */
const showSearch = ref(true)

const open = ref(false)

const loading = ref(false);

const data = reactive({
  queryParams:{
    pageNum: 1,
    pageSize: 20,
    userId: null,
    gameStartTime: null,
    gameEndTime: null,
    platformId: null,
    status: null,
    orderByColumn: 'status',
    isAsc: 'asc'
  },
  dateRange: [parseTime(getTodayStartTime()), parseTime(getTodayEndTime())],
  form:{},
  rules:{}
});
const {queryParams,form,rules,dateRange} = toRefs(data)
const {fixdata_status} = proxy.useDict("fixdata_status")

function listPlatform(){
  listAllPlatform().then(res=>{
    platformList.value = res.data
  })
}

function getList(){
  loading.value =true
  listMemberGameDatafix(queryParams.value).then(res=>{
    memberGameDatafixList.value  = res.data
    total.value = res.total
    loading.value = false
  })
}


/**  多选框选中数据 select multiple rows*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    gameStartTime: null,
    gameEndTime: null,
    platformId: null,
    status: null
  };
  proxy.resetForm("gameDataFixRef");
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery(){
  proxy.resetForm("queryForm");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(){
  reset();
  open.value = true;
  title.value = "添加游戏注单修复";
}

/** 删除按钮操作 handle delete */
function handleDelete(row){
  const id = row.id || ids.vip;
  proxy.$modal.confirm('是否确认删除游戏注单修复编号为"' + id + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function() {
    return delMemberGameDatafix(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  })
}

/** 导出按钮操作 handle export*/
function handleExport(){
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', "警告", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function() {
    return exportMemberGameDatafix(queryParams);
  }).then(response => {
    proxy.downloadExcel(response, '游戏注单修复');
  }).catch(() => {
  })
}

/** 提交按钮 */
function submitForm() {
  const startTime = form.value.dateRange[0];
  const endTime = form.value.dateRange[1];
  form.value.gameStartTime = startTime
  form.value.gameEndTime = endTime

    proxy.$refs["gameDataFixRef"].validate(valid => {
      if (valid) {
        addMemberGameDatafix(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    });
}

listPlatform()
getList()
</script>