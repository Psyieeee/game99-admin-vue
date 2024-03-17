<template>
 <div class="app-container">
   <el-form ref="queryForm" :inline="true" v-show="showSearch" v-model="queryParams">
     <el-form-item label="选择日期" prop="createTime">
       <el-date-picker type="datetimerange"
                       v-model="createTime"
                       format="YYYY-MM-DD HH:mm:ss"
                       value-format="YYYY-MM-DD HH:mm:ss"
                       :style="{width: '95%'}"
                       start-placeholder="开始时间"
                       end-placeholder="开始时间"
                       range-separator="至"
                       clearable
                       :default-time="getDefaultTime()"
                       :shortcuts="pickerDateTimeShortcuts"/>
     </el-form-item>
     <el-form-item prop="memberId">
       <el-input
           style="width: 200px"
           v-model="queryParams.memberId"
           placeholder="玩家ID"
           clearable
           @keyup.enter="handleQuery"/>
     </el-form-item>
     <el-form-item prop="platformId">
       <el-select
           filterable
           v-model="queryParams.platformId"
           placeholder="请选择游戏平台"
           clearable>
         <el-option
             v-for="Platform in platformOptions"
             :key="Platform.id"
             :label="Platform.name"
             :value="Platform.id"/>
       </el-select>
     </el-form-item>
     <el-form-item prop="status">
       <el-select
           v-model="queryParams.status"
           placeholder="请选择状态"
           clearable
           style="width: 150px">
         <el-option
             v-for="dict in member_game_money_status"
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

   <el-table :data="memberGameMoneyList" :stripe="true" v-loading="loading">
<!--     <el-table-column label="订单ID" prop="orderId"/>-->
     <el-table-column label="玩家ID" prop="memberId" align="center"/>
     <el-table-column label="游戏平台" prop="platformId" align="center" :formatter="formatterPlatformId"/>
     <el-table-column label="状态" prop="status" align="center">
       <template #default="scope">
         <dict-tag :options="member_game_money_status" :value="scope.row.status"/>
       </template>
     </el-table-column>
     <el-table-column label="上分金额" prop="money" align="center"/>
     <el-table-column label="转钱" align="center">
       <template #default="scope">
         <el-button type="primary" size="small"
                    :disabled="scope.row.status !== 0 || scope.row.money <= 0"
                    @click="transferPlatformMoney( scope.row )">补分</el-button>
       </template>
     </el-table-column>
     <el-table-column label="创建时间" prop="createTime" align="center"/>
     <el-table-column label="更新时间" prop="updateTime" align="center"/>
   </el-table>
   <pagination
       v-show="total"
       :total="total"
       :page-sizes="[20,30,50,100]"
       v-model:page="queryParams.pageNum"
       v-model:limit="queryParams.pageSize"
       @pagination="getList"/>
 </div>
</template>

<script setup name="MemberGameMoney">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {memberGameMoneyListData} from "@/api/member/memberGameMoney";
import DictTag from "@/components/DictTag";
import {listAllPlatform} from "@/api/game/platform";
import {
  pickerDateTimeShortcuts,
  getDefaultTime
} from "@/utils/dateUtils";
import {transferMoney} from "@/api/game/base";
import {changeWithdrawStatus} from "@/api/member/memberInfo.js";

const {proxy} = getCurrentInstance();
const memberGameMoneyList = ref([]);
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const platformOptions = ref([]);

const data  = reactive({
  queryParams:{
    pageNum:1,
    pageSize:20,
    platformId:null,
    memberId:null,
    status:null,
    orderByColumn:'create_time',
    isAsc: 'desc'
  },
  form:{},
  createTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],

});
const {queryParams,form,createTime} = toRefs(data);

const {member_game_money_status} = proxy.useDict("member_game_money_status")

/** member game list */
function getList(){
  loading.value = true;
  memberGameMoneyListData(proxy.addDateRange(queryParams.value,createTime.value)).then(res=>{
    memberGameMoneyList.value  = res.data
    total.value = res.total
    loading.value = false
  })
}

/**  get all platform list */
function platFormListAll() {
  loading.value = true
  listAllPlatform().then(res => {
    platformOptions.value = res.data;
    loading.value = false
  })
}

function formatterPlatformId(row) {
  for (const a of platformOptions.value) {
    if (a.id === row.platformId) {
      return a.name;
    }
  }
  return "";
}

/** handle search query */
function handleQuery(){
  queryParams.pageNum = 1;
  getList()
}

function transferPlatformMoney( row ) {
  const platform = formatterPlatformId( row );

  proxy.$modal.confirm('您确定要从 ' +platform+ ' 转账 ' + row.memberId + ' 吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return transferMoney( row.orderId );
  }).then((resp) => {
    getList();

    if( resp.code == 200 ) {
      proxy.$modal.msgSuccess("成功");

    } else {
      proxy.$modal.msgError( "fail" );
    }

  })
}

function reset(){
  form.value = {
    pageNum:1,
    pageSize:20,
    platformId:null,
    memberId:null,
    status:null
  }
  proxy.resetForm("memberMoneyQuery")
}

function resetQuery(){
  proxy.resetForm('queryForm')
  handleQuery();
}

platFormListAll()
getList()
</script>