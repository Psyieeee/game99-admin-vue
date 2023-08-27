<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="日期范围" prop="selectDate">
        <el-date-picker type="datetimerange"
                        v-model="selectDate"
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
      <el-form-item label="邀请码" prop="inviterCode" class="input-wd25">
        <el-input
            v-model="queryParams.inviterCode"
            placeholder="请输入邀请码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录ip" prop="loginIp" class="input-wd25">
        <el-input
            v-model="queryParams.loginIp"
            placeholder="请输入登录ip"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="Search" size="small" @click="handleQueryIp">ip重复检查</el-button>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery(1)">手机序列号检查</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['activity:memberInfo:export']"
        >导出
        </el-button>
        <el-button
            type="info"
            plain
            icon="Plus"
            size="small"
            @click="handlePhone"
            v-hasPermi="['activity:memberInfo:showPhone']"
        >显示手机号
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityMemberInfoList" @selection-change="handleSelectionChange" stripe>
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="系统编号" align="center" prop="id"/>
      <el-table-column label="注册时间" align="center" prop="registerTime" width="180"/>
      <el-table-column label="上次登录时间" align="center" prop="loginTime" width="180"/>
      <el-table-column label="手机" align="center" prop="phone"/>
      <el-table-column label="登录ip" align="center" prop="loginIp"/>
      <el-table-column label="会员vip" align="center" prop="vip"/>
      <el-table-column label="邀请码" align="center" prop="inviterCode"/>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,30,50]"
        @pagination="getList"
    />


    <el-dialog  :close-on-click-modal="false" :title="title" v-model="ipOpen" width="500px"
               append-to-body>
      <h3>重复次数超过两次</h3>
      <div style="max-height: 600px; overflow-y: scroll">
        <el-table stripe v-loading="loading" :data="ipList" @selection-change="handleSelectionChange">
          <el-table-column label="邀请码" align="center" prop="inviterCode"/>
          <el-table-column label="登录ip" align="center" prop="loginIp"/>
          <el-table-column label="重复次数" align="center" prop="count"/>
        </el-table>
      </div>
    </el-dialog>

  </div>

</template>

<script setup name="ActivityMemberInfo">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  exportActivityMemberInfo,
  ipListData,
  listActivityMemberInfo
} from "@/api/activity/activityMemberInfo";
import {getDefaultTime, pickerDateTimeShortcuts} from "@/utils/dateUtils";

const {proxy} = getCurrentInstance();
const showSearch = ref(true);
const loading = ref(false);
const ipOpen = ref(false);
const isTwoPw = ref(false);

const total = ref(0);
const title = ref('');

const activityMemberInfoList = ref([]);
const ipList = ref([]);
const ids = ref([]);

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */

const data = reactive({
  queryParams:{
    pageNum : 1,
    pageSize :15,
  },
  /** updateTime */
  selectDate : [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
})
const {queryParams,selectDate} = toRefs(data)

/** get list of data */
function getList(){
  loading.value = true
  listActivityMemberInfo(proxy.addDateRange(queryParams.value,selectDate.value)).then(res=>{
    activityMemberInfoList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 handle query*/
function handleQuery(type){
  queryParams.pageNum = 1;
  if (type) {
       queryParams.value.orderByColumn = 'phone';
        queryParams.value.isAsc = 'asc'
  } else {
        queryParams.value.orderByColumn = 'register_time';
        queryParams.value.isAsc = 'desc'
  }
  getList()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 显示手机号 display full number*/
function handlePhone() {
  isTwoPw.value = true
  // listActivityMemberInfo(proxy.addDateRange({isTwoPw:isTwoPw.value,pageNum:1,pageSize:15},selectDate.value)).then(res=>{
  listActivityMemberInfo(proxy.addDateRange({isTwoPw:isTwoPw.value,pageNum:1,pageSize:15,inviterCode:queryParams.value.inviterCode,loginIp:queryParams.value.loginIp},selectDate.value)).then(res=>{
    activityMemberInfoList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 handle query*/
function resetQuery(){
  proxy.resetForm("queryForm")
  handleQuery()
}

function handleQueryIp() {
  loading.value = true;
  ipOpen.value = true;
  ipListData(queryParams.value).then(response => {
    console.log(response.data, response.data);
    ipList.value = response.data;
    loading.value = false;
  });
}

/** 导出按钮操作 export data*/
function handleExport(){
  console.log(isTwoPw.value)
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportActivityMemberInfo(proxy.addDateRange(queryParams.value,selectDate.value))
  }).then(response => {
    proxy.downloadExcel(response, '平台资金报表')
  }).catch(() => {
  })
}

getList()
</script>

<style scoped>

</style>
