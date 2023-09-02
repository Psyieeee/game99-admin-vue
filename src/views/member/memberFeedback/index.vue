<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
<!--      DateTimePicker//Coins//Meter//MemberID-->
      <el-form-item label="会员ID" prop="memberId">
        <el-input
            v-model.trim="queryParams.memberId"
            placeholder="请输入会员ID"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-tabs
        type="card"
        class="demo-tabs"
        v-model="defaultTab"
        @tab-click="handleTabClick"
    >
      <el-tab-pane label="待处理" name="pending"></el-tab-pane>
      <el-tab-pane label="己采纳" name="accepted"></el-tab-pane>
      <el-tab-pane label="己忽路" name="declined"></el-tab-pane>
      <el-tab-pane label="全部反馈" name="all"></el-tab-pane>
    </el-tabs>

    <el-table stripe v-loading="loading" :data="memberFeedbackList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="会员ID" align="center" prop="memberId"/>
      <el-table-column label="来源页面" align="center" prop="sourcePage" width="100px"/>
      <el-table-column label="币种" align="center" prop="currency"/>
      <el-table-column label="反馈账号" align="center" prop="feedbackAccount" width="100px"/>
      <el-table-column label="反馈时间" align="center" prop="feedbackTime"/>
      <el-table-column label="反馈内容" align="center" prop="feedbackContent" />
      <el-table-column label="附件(预览）" align="center" prop="attachmentsIcon" width="100px"/>
      <el-table-column label="采纳奖金" align="center" prop="adoptionBonus" v-if="defaultTab === 'accepted' || defaultTab === 'all' "/>
      <el-table-column label="重要程度" align="center" prop="importance" v-if="defaultTab === 'accepted' || defaultTab === 'all' "/>
      <el-table-column label="状态" align="center" prop="states"/>
      <el-table-column label="回复内容" align="center" prop="replyContent" v-if="defaultTab === 'accepted' || defaultTab === 'all' "/>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width ">
        <template #default="scope">
          <el-button
              type="primary"
              plain
              icon="Menu"
              @click="showDetails( scope.row )"
          >详情
          </el-button>
          <el-button
              type="success"
              plain
              icon="plus"
              @click="updateState( 'Accepted' )"
          >采纳
          </el-button>
          <el-button
              type="danger"
              plain
              icon="remove"
              @click="updateState( 'Declined' )"
          >忽略
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center" prop="operator" v-if=" defaultTab !== 'pending' "/>
      <el-table-column label="操作时间" align="center" prop="operatingTime" v-if=" defaultTab !== 'pending' "/>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,30,50]"
        @pagination="getList"/>
    <DetailTable ref="detailTable"/>
  </div>
</template>

<script setup name="memberFeedback">

import {getCurrentInstance, reactive, ref, toRefs, onMounted} from "vue";
import {
  listMemberFeedback,
  updateFeedbackState
} from "@/api/member/memberFeedback";
import {resetForm} from "@/utils/common";
import DetailTable from "@/views/member/memberFeedback/detailTable";

const {proxy} = getCurrentInstance()

const defaultTab = ref('pending');

const loading = ref(false);
// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 会员任务表格数据
const memberFeedbackList = ref([]);
// 是否显示弹出层
const open = ref(false);

const tab = ref(false);

const data = reactive({

      name: "MemberFeedback",
      components: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        memberId: null,
        states: "Pending"
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
);

const {queryParams, form, rules} = toRefs(data);


function getList() {
  loading.value = true;
  listMemberFeedback(queryParams.value).then(response => {
    memberFeedbackList.value = response.data;
    form.value = response.data;
    loading.value = false;
  });
}

function updateState( state ){
  updateFeedbackState( state ).then( res => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess(res.msg)
      open.value = false;
      getList()
    } else {
      proxy.$modal.msgError(res.msg)
    }
    getList();
  })
}

function showDetails( row ){
  console.log("show details function")
  proxy.$refs["detailTable"].show( row.sourcePage, row.currency,
      row.feedbackAccount, row.feedbackTime, row.feedbackContent, row.attachmentsIcon,
      row.adoptionBonus, row.importance, row.states, row.replyContent, row.operator,
      row.operatingTime, row.sourceGroup, row.sourceSite )
}

function handleTabClick( tab ) {
  defaultTab.value = tab.props.name;

  switch (tab.props.name){
    case "all":
      data.queryParams.states = null
      break;
    case "accepted":
      data.queryParams.states = "Accepted"
      console.log("Accepted")
      break;
    case "declined":
      data.queryParams.states = "Declined"
      console.log("Declined")
      break;
    default:
      data.queryParams.states = "Pending"
      console.log("Pending")
  }

  getList();
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value.id = null;
  form.value.memberId = null;
  form.value.questId = null;
  form.value.status = null;
  form.value.curnum = null;
  resetForm("form");
}

function handleQuery() {
  if (queryParams.value.memberId) {
    const reg = '^[0-9a-zA-Z_]{1,}$'
    let flag = queryParams.value.memberId.match(reg)
    if (!flag) {
      proxy.$modal.msgError("会员ID只能输入数字及下划线")
      return
    }
  }
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  resetForm("queryForm");
  handleQuery();
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset();
  open.value = true;
}

getList();
</script>
