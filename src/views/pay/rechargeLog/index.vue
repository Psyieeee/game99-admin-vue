<template>
  <div class="app-container">
<!--    search tab 搜索选项卡-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Select Date" prop="selectDate" label-width="100px">
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

      <el-form-item label="Member ID" prop="memberId" style="width: 235px" label-width="100px">
        <el-input
            v-model.trim="queryParams.memberId"
            placeholder="Please enter Member ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Bank Card" prop="bankCard" style="width: 235px" label-width="100px">
        <el-input
            v-model.trim="queryParams.bankCard"
            placeholder="Please enter your bank card number"
            clearable
            @keyup.enter="handleQuery"
        />
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
    <el-table :stripe="true" v-loading="loading" :data="rechargeLogList" @selection-change="handleSelectionChange">
      <el-table-column label="Member Id" align="center" prop="memberId" min-width="80"/>
      <el-table-column label="Member Ip" align="center" prop="ip" min-width="120"/>
      <el-table-column label="Member VIP" align="center" prop="vip" min-width="130"/>
      <el-table-column label="Bank Card" align="center" prop="card" min-width="130"/>
      <el-table-column label="Created Time" align="center" prop="createTime" min-width="180"/>
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

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getDefaultTime} from "@/utils/dateUtils";
import {exportPayLog, listPayLog} from "@/api/pay/rechargeLog";
import {downloadExcel} from "@/utils/common";
import {getAllPayPlatform} from "@/api/pay/payPlatform";
import {useRouter} from "vue-router";

const router = useRouter();
const {proxy} = getCurrentInstance();

const {success_pay_log} = proxy.useDict("success_pay_log")

const rechargeLogList = ref([]);
/**  选中数组 */
const ids = ref([]);

const total = ref(0);

/**  非单个禁用 */
const single = ref(true);
 /**  非多个禁用 */
const multiple = ref(true);

const showSearch = ref(true);
const loading = ref(true);

const data = reactive({
  queryParams:{
    selectDate: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
    pageNum: 1,
    pageSize: 20,
    memberId: null,
    card: null,
    createTime: null,
    orderByColumn: 'create_time',
    isAsc: 'desc'
  }
});

const {queryParams} = toRefs(data);


function getList(){
  loading.value = true
  listPayLog(queryParams.value).then(response=>{
    rechargeLogList.value = response.data;
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

getList()
</script>

<style scoped>

</style>