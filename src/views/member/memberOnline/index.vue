<template>
  <div class="app-container">

    <div>
      <el-button type="info"    @click="copy1">在线成员总数 {{ total || 0 }}</el-button>
    </div>

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
    <el-table v-loading="loading" :data="memberOnlineList" @selection-change="handleSelectionChange">
      <el-table-column align="center" label="会员ID" min-width="180" prop="memberId"/>
      <el-table-column align="center" label="手机号" min-width="180" prop="phone"/>
      <el-table-column align="center" label="电子邮件" min-width="180" prop="email"/>
      <el-table-column align="center" label="会员vip" min-width="180" prop="vip"/>
      <el-table-column align="center" label="登录ip" min-width="180" prop="loginIp"/>
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

<script name="memberOnline" setup>

import {
  getMemberOnlineList
} from "@/api/member/memberOnline";
import {reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";

const router = useRouter();
const {proxy} = getCurrentInstance();

const memberOnlineList = ref([]);
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
  getMemberOnlineList(queryParams.value).then(response => {
    memberOnlineList.value = response.data;
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

