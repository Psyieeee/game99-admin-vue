<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryParams" :rules="rules">
      <el-form-item label="会员ID" prop="memberId">
        <el-input v-model="queryParams.memberId" placeholder="请输入会员ID"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    查询佣金领取日志列表 display data in table -->
    <el-table v-loading="loading" :data="commissionRecordList">
      <el-table-column label="会员ID" prop="memberId" align="center"/>
      <el-table-column label="佣金" prop="commission" align="center"/>
      <el-table-column label="创建时间" prop="createTime" align="center"/>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,30,50,100]"
        @pagination="getList"/>
  </div>
</template>

<script name="CommissionRecord" setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {commissionRecordListData} from "@/api/activity/recommend/commissionRecord";

const {proxy} = getCurrentInstance();

const commissionRecordList = ref([]);

const loading = ref(true);
const total = ref(0);

const dataQuery = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    memberId: null,
    commission: null,
    createTime: null
  },
  form: {},
  rules: {}
});

const {queryParams, form, rules} = toRefs(dataQuery);

/**
 * 查询佣金领取日志列表 list all data
 */
function getList() {
  loading.value = true
  commissionRecordListData(queryParams.value).then(response => {
    commissionRecordList.value = response.data;
    loading.value = false
    total.value = response.total
  })
}

/** 表单重置 reset form*/
function reset() {
  form.value = {
    memberId: null
  }
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageSize = 1;
  getList()
}

/** 搜索按钮操作 handle query*/
function resetQuery() {
  reset()
  handleQuery()
}

getList()
</script>

<style scoped>

</style>