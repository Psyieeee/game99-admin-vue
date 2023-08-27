<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" v-show="showSearch">

      <el-form-item label="日期选择" prop="reporttime">
        <el-date-picker type="date"
                        v-model="queryParams.reporttime"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        clearable
                        :shortcuts="toyesDayshortcuts">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="名称" prop="classTwoname" class="input-wd25">
        <el-input
            v-model="queryParams.classTwoname"
            placeholder="请输入用户名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

<!--export button -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['report:plam-com:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!-- display data -->
    <div ref="container" style="position: relative">
      <el-table v-loading="loading" :data="reportComprehensiveList" style="width: 100%;" :stripe="true">
        <el-table-column label="名称" align="center" prop="classTwoname" :show-overflow-tooltip="true"/>
        <el-table-column label="金额" align="center" prop="tvalue" :show-overflow-tooltip="true"/>
        <el-table-column label="类型" align="center" prop="type"/>
        <el-table-column label="时间" align="center" prop="reporttime" width="180"/>
      </el-table>
    </div>

  </div>
</template>

<script setup name="ReportComprehensivePlam">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import { parseTime,toyesDayshortcuts} from "@/utils/dateUtils";
import {exportReportPlamCom, listCom} from "@/api/report/reportPlanCom";

const {proxy} = getCurrentInstance();

const reportComprehensiveList = ref([]);

const showSearch = ref(true);
const loading = ref(false);
const listLoading = ref(false);
const isDestroyed = ref(false);

const data = reactive({
  queryParams:{
    reporttime: parseTime(new Date(), '{y}-{m}-{d}'),
    classTwoname: undefined
  }
})
const {queryParams} = toRefs(data);

function destroyed() {
  isDestroyed.value = true
  listLoading.value = false
}
/**
 * 查询综合数据报会每天进行前一天数据的生成，如果需要查当天的数据则需手动调用prorep_plamcom报存储过程，传入当天时间列表
 */
function getList(){
  loading.value = true
  listCom(queryParams.value).then(res=>{
    reportComprehensiveList.value = res.rows
    listLoading.value = false
    proxy.$rjLoading.hide()
  }).catch((err) => {
    if (err == 'Error: 报表正在生成，请稍后...') {
      if (!listLoading.value) {
        listLoading.value = true
        proxy.$rjLoading.show('报表正在生成')
      }
      if (!this.isDestroyed) {
        setTimeout(() => {
          getList()
        }, 10000)
      }
    }
  }).finally(() => {
   loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery(){
  getList()
}

/** 重置按钮操作 */
function resetQuery(){
  proxy.resetForm('queryForm')
  handleQuery()
}

/** 导出按钮操作 */
function handleExport(){
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return exportReportPlamCom(queryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '综合数据报表')
  }).catch(() => {
  })
}

getList()
</script>

<style scoped>

</style>