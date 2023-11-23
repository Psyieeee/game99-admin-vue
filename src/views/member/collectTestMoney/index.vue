<template>
  <div class="app-container">
    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="tableList">
      <el-table-column label="会员ID" prop="memberId" align="center"/>
      <el-table-column label="收集金额" prop="collectAmount" align="center"/>
      <el-table-column label="更新时间" prop="updateTime" align="center"/>
    </el-table>

  </div>
</template>

<script setup>

import {
  collectTestMoneyList
} from "@/api/member/collectTestMoney";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
const {proxy} = getCurrentInstance();


const tableList = ref([]);
const loading = ref(true);
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {},

  /** 表单参数 form parameter*/
  form: {},

});
const {queryParams, form} = toRefs(data);

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  collectTestMoneyList(queryParams.value).then(response => {
    tableList.value = response.data;
    loading.value = false;
  });
}

getList()
</script>

