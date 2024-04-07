<template>
   <div class="app-container">
     <el-row :gutter="10" class="mb8">
       <el-col :span="1.5">
         <el-button
             type="primary"
             plain
             icon="Plus"
             size="small"
             @click="handleAdd"
             v-hasPermi="['config:vip:add']"
         >新增</el-button>
       </el-col>
       <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
     </el-row>

<!--     display data in the table -->
     <el-table stripe v-loading="loading" :data="configVipList">
       <el-table-column label="vip等级" prop="level" align="center"/>
       <el-table-column label="晋级彩金" prop="levelBonus" align="center"/>
       <el-table-column label="周俸禄" prop="weekBonus" align="center"/>
       <el-table-column label="月俸禄" prop="monthBonus" align="center"/>
       <el-table-column label="需求打码" prop="bcode" align="center"/>
       <el-table-column label="救援奖金率" prop="rescueBonusRate" align="center"/>
       <el-table-column label="vip奖金类型" prop="missionRewardTypeTranslated" align="center"/>
       <el-table-column label="vip倍数" prop="multiplier" align="center"/>
       <el-table-column label="救援类型" align="center" prop="rescueBonusType">
         <template #default="scope">
           <dict-tag :options="transfer_to" :value="scope.row.rescueBonusType"/>
         </template>
       </el-table-column>
       <el-table-column label="救援彩金倍数" prop="rescueBonusMultiplier" align="center"/>
       <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="120">
         <template #default="scope">
           <el-button
               size="small"
               type="primary"
               link
               icon="Edit"
               @click="handleUpdateRescue(scope.row)"
           >修改救援</el-button>
           <el-button
               size="small"
               type="primary"
               link
               icon="Edit"
               @click="handleUpdate(scope.row)"
               v-hasPermi="['config:vip:edit']"
           >修改</el-button>
           <el-button
               style="color: #FF5722"
               size="small"
               type="danger"
               link
               icon="Delete"
               @click="handleDelete(scope.row)"
               v-hasPermi="['config:vip:remove']"
           >删除</el-button>
         </template>
       </el-table-column>
     </el-table>
     <pagination
         v-show="total"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"/>

     <!-- 添加或修改【请填写功能名称】对话框 -->
     <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="500px" style="height: 500px" append-to-body>
       <el-form ref="configVipRef" :model="form" :rules="rules" label-width="90px">
         <el-form-item label="vip等级" prop="level">
           <el-input v-model="form.level" placeholder="请输入vip等级" type="number"
                     oninput="if(value>100){value=100}if(value<1){value=1}value=Number.parseInt(value)"/>
         </el-form-item>
         <el-form-item label="晋级彩金" prop="levelBonus">
           <el-input v-model="form.levelBonus" placeholder="请输入需求打码量" type="number"/>
         </el-form-item>
         <el-form-item label="周俸禄" prop="weekBonus">
           <el-input v-model="form.weekBonus" placeholder="请输入周俸禄" type="number" />
         </el-form-item>
         <el-form-item label="月俸禄" prop="monthBonus">
           <el-input v-model="form.monthBonus" placeholder="请输入月俸禄" type="number" />
         </el-form-item>
         <el-form-item label="需求打码" prop="bcode">
           <el-input v-model="form.bcode" placeholder="请输入需求打码量" type="number" />
         </el-form-item>
         <el-form-item label="救援奖金率" prop="rescueBonusRate">
           <el-input v-model="form.rescueBonusRate" placeholder="请输入救援奖金率" type="number" />
         </el-form-item>
         <el-form-item label="任务分类" prop="rewardType" style="min-width: 290px">
           <el-select v-model="form.rewardType" placeholder="任务分类" clearable>
             <el-option
                 v-for="dict in rewardTypeList"
                 :key="dict.name"
                 :label="dict.translatedName"
                 :value="dict.name"
             />
           </el-select>
         </el-form-item>
         <el-form-item label="乘法器" prop="multiplier" v-if="form.rewardType === 'ACCOUNT'" >
           <el-input-number
               precision="2"
               step="0.5"
               value-on-clear=0

               v-model="form.multiplier"
               clearable
               placeholder="输入乘数"
           />
         </el-form-item>
       </el-form>
       <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitForm">确 定</el-button>
         <el-button @click="open=!open">取 消</el-button>
       </div>
     </el-dialog>

<!--update vip form-->
     <el-dialog :close-on-click-modal="false" :title="title" v-model="openEdit" width="500px" style="height: 550px" append-to-body>
       <el-form ref="configVipUpdateRef" :model="form" :rules="rules" label-width="90px">
         <el-form-item label="vip等级" prop="level">
           <el-input v-model="form.level" placeholder="请输入vip等级" type="number"
                     oninput="if(value>100){value=100}if(value<1){value=1}value=Number.parseInt(value)"/>
         </el-form-item>
         <el-form-item label="晋级彩金" prop="levelBonus">
           <el-input v-model="form.levelBonus" placeholder="请输入需求打码量" type="number"/>
         </el-form-item>
         <el-form-item label="周俸禄" prop="weekBonus">
           <el-input v-model="form.weekBonus" placeholder="请输入周俸禄" type="number" />
         </el-form-item>
        <el-form-item label="月俸禄" prop="monthBonus">
           <el-input v-model="form.monthBonus" placeholder="请输入月俸禄" type="number" />
         </el-form-item>
         <el-form-item label="需求打码" prop="bcode">
           <el-input v-model="form.bcode" placeholder="请输入需求打码量" type="number" />
         </el-form-item>
         <el-form-item label="任务分类" prop="rewardType" style="min-width: 290px">
           <el-select v-model="form.rewardType" placeholder="任务分类" clearable>
             <el-option
                 v-for="dict in rewardTypeList"
                 :key="dict.name"
                 :label="dict.translatedName"
                 :value="dict.name"
             />
           </el-select>
         </el-form-item>
         <el-form-item label="倍数" prop="multiplier" v-if="form.rewardType === 'ACCOUNT'" >
           <el-input-number
               precision="2"
               step="0.5"
               value-on-clear=0

               v-model="form.multiplier"
               clearable
               placeholder="输入乘数"
           />
         </el-form-item>
       </el-form>
       <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitFormEdit">确 定</el-button>
         <el-button @click="openEdit=!openEdit">取 消</el-button>
       </div>
     </el-dialog>
     <el-dialog :close-on-click-modal="false" :title="title" v-model="openEditRescue" width="600px" style="height: 250px" append-to-body>
       <el-form ref="configVipUpdateRef" :model="form" label-width="120px">
        <el-form-item label="救援奖金率" prop="rescueBonusRate">
          <el-input v-model="form.rescueBonusRate" placeholder="请输入救援奖金率" type="number" />
        </el-form-item>
        <el-form-item label="任务分类" prop="rescueBonusType" style="min-width: 290px">
           <el-select v-model="form.rescueBonusType" placeholder="任务分类" clearable>
             <el-option
                 v-for="dict in rewardTypeList"
                 :key="dict.name"
                 :label="dict.translatedName"
                 :value="dict.name"
             />
           </el-select>
         </el-form-item>
        <el-form-item v-if="form.rescueBonusType === 'ACCOUNT'" label="倍数" prop="rescueBonusMultiplier" >
           <el-input-number precision="2" step="0.5" value-on-clear=0 v-model="form.rescueBonusMultiplier" clearable placeholder="输入乘数"/>
        </el-form-item>
       </el-form>
       <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitFormEdit">确 定</el-button>
         <el-button @click="openEditRescue = false">取 消</el-button>
       </div>
     </el-dialog>

   </div>
</template>

<script name="ConfiVip" setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  addConfigVipData,
  configVipDataById,
  configVipDelete,
  configVipEdit,
  configVpiDataList,
} from "@/api/config/vpi";
import {getMissionRewardTypeList} from "@/api/activity/activityMission";

const {proxy} = getCurrentInstance();
const configVipList = ref([]);
const ids = ref([]);
const total = ref(0);
const title = ref();
const rewardTypeList = ref([]);

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)

const open = ref(false)
const openEdit = ref(false)
const openEditRescue = ref(false)

const showSearch = ref(true);
const loading = ref(true);

const data = reactive({
  queryParams:{
    pageNum:1,
    pageSize:20,
    level:null,
    levelBonus:null,
    weekBonus:null,
    monthBonus:null,
    channel:null,
    bcode:null
  },
  // 表单参数
  form: {},
  rules:{
    level: [
      {required: true, message: "vip等级不能为空只能是数字", trigger: "number"},
    ],
    rewardType:
        [
          {required: true, message: '奖励类型为必填项', trigger: 'blur'}
        ],
  }
});
const {queryParams,form,rules} = toRefs(data);
const {transfer_to} = proxy.useDict("transfer_to");

/**
 * 查询会员VIP配置列表
 */
function getList(){
  loading.value = true
  configVpiDataList(queryParams.value).then(res=>{
    configVipList.value = res.data
    total.value = res.total
    loading.value =false
  })
}

/** 表单重置 reset form*/
function reset() {
  form.valueO = {
    level: null,
    levelBonus: null,
    weekBonus: null,
    monthBonus: null,
    channel: null,
    client: null,
    bcode: null,
    rescueBonusRate: null,
    rescueBonusType: null,
    rescueBonusMultiplier: null,
    rewardType: null,
    multiplier: 0,
  };
  proxy.resetForm("configVipRef");
}

/** 表单重置 reset update form*/
function resetUpdateForm() {
  form.valueO = {
    level: null,
    levelBonus: null,
    weekBonus: null,
    monthBonus: null,
    channel: null,
    client: null,
    bcode: null,
    rescueBonusRate: null,
    rescueBonusType: null,
    rescueBonusMultiplier: null,
    rewardType: null,
    multiplier: 0,
  };
  proxy.resetForm("configVipUpdateRef");
}


/** 新增按钮操作 handle add*/
function handleAdd(){
  reset()
  title.value = "新增会员VIP配置"
  open.value = true
}

/** 修改按钮操作 handle update*/
function handleUpdate(row){
  resetUpdateForm()
  configVipDataById(row.level).then(res=>{
    form.value = res.data
    openEdit.value = true
    title.value = "修改VIP配置"
  })
}
function handleUpdateRescue(row){
  resetUpdateForm()
  configVipDataById(row.level).then(res=>{
    form.value = res.data
    openEditRescue.value = true
    title.value = "修改贵宾救援"
  })
}

/** 提交按钮 submit add new data*/
function submitForm(){
  proxy.$refs['configVipRef'].validate(validation=>{
    if(validation){
      form.value.multiplier = getMultiplier();
        addConfigVipData(form.value).then(() =>{
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
    }
  })
}

/** 提交按钮 submit update data*/
function submitFormEdit(){
  proxy.$refs['configVipUpdateRef'].validate(validation=>{
    if(validation){
      const f = form.value;
      f.multiplier = getMultiplier();
      f.rescueBonusMultiplier = getRescueBonusMultiplier();

      console.log("form.value.multiplier " + form.value.multiplier)

    configVipEdit(form.value).then(()  => {
      proxy.$modal.msgSuccess("修改成功")
      if (openEdit.value) {
        openEdit.value = false
      } else {
        openEditRescue.value = false
      }
      getList()
    })
    }
  })
}
function getRescueBonusMultiplier() {
  const f = form.value;
  return f.rescueBonusType === 'ACCOUNT'
  && f.rescueBonusMultiplier !== undefined
      ? f.rescueBonusMultiplier
      : 0;
}

function getMultiplier() {
  return form.value.rewardType === 'ACCOUNT'
  && form.value.multiplier !== undefined
      ? form.value.multiplier
      : 0;
}

      /** 删除按钮操作 handle delete data*/
function handleDelete(row){
  const id = row.level || ids.value;
  proxy.$modal.confirm('是否确认删除vip"' + id + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function() {
    return configVipDelete(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  })
}

function getRewardTypeList() {
  getMissionRewardTypeList().then(res => {
    rewardTypeList.value = res.data
  })
}

getRewardTypeList();
getList()
</script>

<style scoped>
</style>
