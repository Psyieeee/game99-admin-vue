<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" >
      <el-form-item label="用户编号" prop="memberId">
        <el-input
            v-model="queryParams.memberId"
            placeholder="用户编号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="recordList">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="成员" min-width="180" prop="memberId"/>
      <el-table-column align="center" label="任务类型" min-width="140" prop="missionType"/>
      <!--      <el-table-column align="center" label="取款账户" min-width="140" prop="missionRepeatType"/>-->
      <!--      <el-table-column align="center" label="银行卡充值" min-width="150" prop="reward"/>-->
      <el-table-column align="center" label="奖励活动" min-width="140" prop="rewardActivity"/>
      <el-table-column align="center" label="进度计数器" min-width="140" prop="progressCounter"/>
      <el-table-column align="center" label="完成次数" min-width="140" prop="completionCount"/>
      <el-table-column align="center" label="开始日期 时间" min-width="140" prop="startDatetime"/>
    </el-table>

    <pagination
        v-show="total"
        :total="total"
        :page-sizes="[20,50,100]"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />
  </div>
</template>

<script setup>

import {
  listRecord,
} from "@/api/member/missionOnGoing.js";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();

const recordList = ref([]);
const loading = ref(true);
const total = ref(0);
const showSearch = ref(true);
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20
  }

});
const {queryParams} = toRefs(data);

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  listRecord(queryParams.value).then(response => {
    recordList.value = response.data;
    loading.value = false;
    total.value = response.total
  });
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
  loading.value = false
}

getList()
</script>
