<template>
  <div class="app-container">

    <el-form v-show="showSearch" :rules="rules"  ref="queryRef" :inline="true" :model="queryParams" style="margin-top: 20px">
      <el-form-item class="input-wd25" label="会员ID" prop="account">
        <el-input
            v-model.trim="queryParams.memberId"
            placeholder="会员 ID 前缀"
            clearable
            type="primary"
            link
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="inviterGameProgressList" @selection-change="handleSelectionChange">
      <el-table-column align="center" label="会员ID" min-width="180" prop="memberId"/>

      <el-table-column align="center" label="初始点" min-width="180" prop="initialPoints"/>
      <el-table-column align="center" label="进步点" min-width="180" prop="progressPoints"/>
      <el-table-column align="center" label="完成点数" min-width="180" prop="completionPoints"/>
      <el-table-column align="center" label="游戏奖" min-width="180" prop="gamePrize"/>

      <el-table-column align="center" label="最低分数" min-width="180" prop="minimumPoints"/>
      <el-table-column align="center" label="最高分" min-width="180" prop="maximumPoints"/>
      <el-table-column align="center" label="增薪点" min-width="180" prop="incrementPoints"/>
      <el-table-column align="center" label="开始日期时间" min-width="180" prop="startDatetime"/>

      <el-table-column align="center" label="截止日期" min-width="180" prop="deadlineDatetime"/>
      <el-table-column align="center" label="计数" min-width="180" prop="playCount"/>
      <el-table-column align="center" label="索引结果" min-width="180" prop="indexResult"/>
      <el-table-column align="center" label="结果" min-width="180" prop="result"/>
    </el-table>

    <pagination
        v-show="total"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50]"
        :total="total"
        @pagination="getList"
    />
  </div>
</template>

<script name="inviterGameProgress" setup>

import {
  getInviterGameProgressList
} from "@/api/member/inviterGameProgress.js";
import {reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";

const router = useRouter();
const {proxy} = getCurrentInstance();

const inviterGameProgressList = ref([]);
const ids = ref([]);
const type = ref('-');
const name = ref('-');
const status = ref('-');
const sort = ref('-');
const path = ref('-');
const title = ref('');
const total = ref(0);
const loading = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const open = ref(false);

const data = reactive({

  showAddButton: false,
  showEditButton: false,
  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    type: null,
    effect: null,
  },

  /** 表单参数 form parameter*/
  form: {},

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

});
const {queryParams, form, rules, headers} = toRefs(data);

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  console.log( "selection " + !selection.length)
  multiple.value = !selection.length;
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  getInviterGameProgressList(queryParams.value).then(response => {
    inviterGameProgressList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

function copy1() {
  copyCommand(total.value)
}

function copyCommand(value) {
  let inputElement = document.createElement('input')
  inputElement.value = value
  document.body.appendChild(inputElement)
  inputElement.select() //选中文本
  document.execCommand('copy') //执行浏览器复制命令
  inputElement.remove()
  proxy.$modal.msgSuccess('复制成功')
}

/** 重置按钮操作 handle reset query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

getList()
</script>

