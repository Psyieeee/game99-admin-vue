<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" >
      <el-form-item label="会员ID" prop="memberId">
        <el-input
            v-model="queryParams.memberId"
            placeholder="请输入会员ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="回调日期" prop="updateTime">
        <el-date-picker type="datetimerange"
                        v-model="updateTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts">
        </el-date-picker>
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
    <el-table v-loading="loading" :data="tableList">
      <el-table-column label="会员ID" prop="memberId" align="center"/>
      <el-table-column label="收集金额" prop="collectAmount" align="center"/>
      <el-table-column label="更新时间" prop="updateTime" align="center"/>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        :page-sizes="[20,40,100]"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />
  </div>
</template>

<script setup>

import {
  collectTestMoneyList
} from "@/api/member/collectTestMoney";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getDefaultTime} from "@/utils/dateUtils.js";
const {proxy} = getCurrentInstance();


const tableList = ref([]);
const loading = ref(true);
const total = ref(0);
const showSearch = ref(true);
const data = reactive({
  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20
  },

  /** 表单参数 form parameter*/
  form: {},

  updateTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
});
const {queryParams, form, updateTime} = toRefs(data);

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  collectTestMoneyList(proxy.addDateRange(queryParams.value, updateTime.value)).then(response => {
    tableList.value = response.data;
    loading.value = false;
    total.value = response.total
  });
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  updateTime.value = []
  proxy.resetForm('queryRef')
  handleQuery()
  loading.value = false
}

getList()
</script>

