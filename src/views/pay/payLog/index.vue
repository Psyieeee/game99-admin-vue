<template>
  <div class="app-container">
<!--    search tab 搜索选项卡-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="选择日期" prop="selectDate">
        <el-date-picker type="datetimerange"
                        v-model="queryParams.selectDate"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        :style="{width: '95%'}"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="success">
        <el-select v-model="queryParams.success" clearable placeholder="请选择状态">
          <el-option label="成功" value="1"></el-option>
          <el-option label="失败" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="支付平台" prop="platformId">
        <el-select
            filterable
            v-model="queryParams.platformId"
            placeholder="支付平台"
            clearable

            style="width: 240px"
        >
          <el-option
              v-for="dict in payPlatformOptions"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="通道编码" prop="channelId" style="width: 235px">
        <el-input
            v-model.trim="queryParams.channelId"
            placeholder="请输入通道编码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员ID" prop="memberId" style="width: 235px">
        <el-input
            v-model.trim="queryParams.memberId"
            placeholder="请输入会员ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="失败原因" prop="failReason">
        <el-select v-model="queryParams.failReason" clearable placeholder="请选择失败原因">
          <el-option label="网络连接失败,下单超时" value="网络连接失败,下单超时"></el-option>
          <el-option label="网络连接失败,下单报错" value="网络连接失败,下单报错"></el-option>
          <el-option label="网络连接失败,下单返回空值" value="网络连接失败,下单返回空值"></el-option>
          <el-option label="首次下单超时,二次下单成功" value="首次下单超时,二次下单成功"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
<!--    end search tab-->

<!--    tab buttons 选项卡按钮-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['pay:payLog:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!--    display data into table 将所有数据列表显示到表格中-->
    <el-table :stripe="true" v-loading="loading" :data="payLogList" @selection-change="handleSelectionChange">
      <el-table-column label="会员ID" align="center" prop="memberId" min-width="80"/>
      <el-table-column label="支付平台名称" align="center" prop="platformName" min-width="120"/>
      <el-table-column label="支付通道名称" align="center" prop="channelName" min-width="130"/>
      <el-table-column label="支付通道编码" align="center" prop="channelId" min-width="130"/>
      <el-table-column label="下单金额" align="center" prop="money"/>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="180"/>
      <el-table-column label="下单状态" align="center" prop="success">
        <template #default="scope">
          <dict-tag :options="success_pay_log" :value="scope.row.success"/>
        </template>
      </el-table-column>
      <el-table-column label="失败原因" :show-overflow-tooltip="true" min-width="600" align="center" prop="failReason" />
    </el-table>

    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,30,50]"
        @pagination="getList"
    />


  </div>
</template>

<script name="PayLog" setup>

import {reactive, ref, toRefs} from "vue";
import {getDefaultTime} from "@/utils/dateUtils";
import {exportPayLog, listPayLog} from "@/api/pay/payLog";
import {useDict} from "@/utils/dict";
import {downloadExcel} from "@/utils/common";
import {getAllPayPlatform} from "@/api/pay/payPlatform";

const router = useRouter();
const {proxy} = getCurrentInstance();

const {success_pay_log} = proxy.useDict("success_pay_log")

const payLogList = ref([]);
/**  选中数组 */
const ids = ref([]);

const total = ref(0);

/**  非单个禁用 */
const single = ref(true);
 /**  非多个禁用 */
const multiple = ref(true);

const showSearch = ref(true);
const loading = ref(true);
const payPlatformOptions = ref([]);

const data = reactive({
  queryParams:{
    selectDate: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
    pageNum: 1,
    pageSize: 20,
    memberId: null,
    platformId: null,
    channelId: null,
    success: '0',
    createTime: null,
    orderByColumn: 'create_time',
    isAsc: 'desc'
  }
});

const {queryParams} = toRefs(data);


function getList(){
  loading.value = true
  listPayLog(queryParams.value).then(response=>{
    payLogList.value = response.data;
    total.value = response.total
    loading.value = false
  })
}

/**  多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 搜索按钮操作 handle search query */
 function handleQuery(){
  if(queryParams.memberId){
    const reg = '^[0-9a-zA-Z_]{1,}$'
    let flag = queryParams.memberId.match(reg)
    if(!flag){
      proxy.$modal.msgError("会员ID只能输入数字及下划线")
      return
    }
  }
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
 function resetQuery(){
   proxy.resetForm('queryForm')
   handleQuery()
}

 /** 导出按钮操作*/
 function handleExport(){
   proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
     confirmButtonText: '确认',
     cancelButtonText: '取消',
     type: 'warning'
   }).then(function() {
     return exportPayLog(queryParams.value)
   }).then(response => {
     downloadExcel(response, '支付信息日志')
   })
}

function platFormListAll() {
  getAllPayPlatform().then(res => {
    payPlatformOptions.value = res.data;
  })
}

getList()
platFormListAll()
</script>

<style scoped>

</style>