<template>
  <div class="app-container">

    <div v-loading="totalLoading" ref="totalDataRef">
      <el-button type="primary" @click="copy1">有效下注 {{ totalData.totalSuccessBet || 0 }}</el-button>
      <el-button type="success" @click="copy2">总下注 {{ totalData.totalBet || 0 }}</el-button>
      <el-button type="warning" @click="copy3">盈利 {{ totalData.totalIncome || 0 }}</el-button>

      <el-button type="primary" icon="el-icon-search" @click="listCount()" style="margin-left: 20px">统计查询
      </el-button>
    </div>
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" style="margin-top: 20px">

      <el-form-item label="平台名称" prop="platformId" id="checkbox">
        <el-checkbox-group v-model="queryParams.platformIds" @change="getSubPlatformList">
          <el-checkbox v-for="item in platformList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
        </el-checkbox-group>
        <el-checkbox v-model="checkNodeAll" @change="handleCheckedTreeNodeAll()"
                     class="selection text-info"
                     style="">全选/全不选
        </el-checkbox>
      </el-form-item>

      <el-form-item label="日期范围" prop="selectDate" class="small-layout">
        <el-date-picker type="datetimerange"
                        v-model="queryParams.selectDate"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="proxy.pickerDateTimeShortcuts"/>
      </el-form-item>
      <el-form-item prop="account" style="width: 150px" class="small-layout">
        <el-input
            v-model.trim="queryParams.account"
            placeholder="请输入会员ID"
            clearable
            @keyup.enter="handleQuery"
            :disabled="isNumber( queryParams.tableLast )"
        />
      </el-form-item>

      <el-form-item prop="subPlatformId" style="width: 150px" class="small-layout">
        <el-select v-model.trim="queryParams.subPlatformId"
                   placeholder="请输入您的子平台名称"
                   clearable
                   @keyup.enter="handleQuery"
                   filterable
                   @change="setPlatformAndKindId">
          <el-option
              v-for="subPlatform in subPlatforms"
              :key="subPlatform.id"
              :label="subPlatform.name"
              :value="subPlatform.id" />
        </el-select>
      </el-form-item>

      <el-form-item prop="tableLast" style="width: 150px" class="small-layout" >
        <el-select v-model="queryParams.tableLast" placeholder="请选择表格索引"
                   :disabled="queryParams.account != null && queryParams.account != ''"
                   clearable>
          <el-option v-for="item in tableIndices"
                     :key="item"
                     :label="item"
                     :value="item"/>
        </el-select>
      </el-form-item>

      <el-form-item prop="gameId" class="small-layout" style="width: 200px">
        <el-input
            v-model="queryParams.gameId"
            placeholder="请输入游戏局号"
            clearable
            @keyup.enter="handleQuery"/>
      </el-form-item>

      <el-form-item class="small-layout">
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['member:gameData:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="memberGameList">
      <el-table-column label="会员ID" align="center" prop="account" min-width="120"/>
      <el-table-column label="子平台ID" align="center" prop="agent"/>
      <el-table-column label="游戏ID" align="center" min-width="300px" prop="gameId"/>
      <el-table-column label="游戏局号" align="center" min-width="160px" :show-overflow-tooltip="true" prop="gameRound">
        <template v-slot="{row}">
          <div
              v-if="row.platformId == 1 || row.platformId == 15 || row.platformId == 17 || row.platformId == 50 || row.platformId == 51 ">
            <a style="color: #00afff" @click="handleRecord(row)">{{ row.gameRound }}</a>
          </div>
          <div v-else-if="row.platformId == 5">
            <a style="color: #00afff" @click="handleAgRecord(row)">{{ row.gameRound }}</a>
          </div>
          <div v-else-if="row.platformId == 14">
            <a style="color: #00afff" @click="openRecordLink(row)">{{ row.gameRound }}</a>
          </div>
          <div v-else>
            {{ row.gameRound }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="平台名称" prop="platformId" align="center" :formatter="formatterPlatformName"/>
      <el-table-column label="游戏名称" align="center" prop="kindId"/>
      <el-table-column label="子平台名称" align="center" prop="sonPlatformName" min-width="120"/>
      <el-table-column label="有效下注" align="center" prop="cellScore">
        <template #default="scope">{{ convertStrENotationToNumber(scope.row.cellScore)}}</template>
      </el-table-column>
      <el-table-column label="总下注" align="center" prop="allBet">
        <template #default="scope">{{ convertStrENotationToNumber(scope.row.allBet)}}</template>
      </el-table-column>
      <el-table-column label="盈利" align="center" prop="profit">
        <template #default="scope">{{ convertStrENotationToNumber(scope.row.profit)}}</template>
      </el-table-column>
      <el-table-column label="结算时间" align="center" prop="gameEndTime" min-width="160"/>
    </el-table>

    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,50,100]"
        @pagination="getList"
    />

    <record ref="memberRecord" :game-id="gameId"/>
    <AgRecord ref="agRecord" :game-id="gameId"/>

  </div>
</template>

<script setup name="MemberGameData">

import {getCurrentInstance, onMounted, reactive, ref, toRefs} from "vue";
import {listAllPlatform} from "@/api/game/platform";
import {listSubPlatforms} from "@/api/game/info";
import {
  gameRecordList,
  listMemberGameData,
  memberGameDataCount,
  memberGameDataExport,
} from "@/api/member/memberGameData";
import {getDefaultTime} from "@/utils/dateUtils";
import record from './record'
import AgRecord from './agRecord'
import {handleThemeStyle} from "@/utils/theme";
import useSettingsStore from "@/store/modules/settings";
import {isNumber} from "element-plus/es/utils/index";

const tableIndices = [ 0,1,2,3,4,5,6,7,8,9 ];

const {proxy} = getCurrentInstance();

const memberGameList = ref([]);
const platformList = ref([]);
const checkNodeAll = ref(false);
const showSearch = ref(true);
const loading = ref(false);
const total = ref(0);
const subPlatforms = ref([]);



const data = reactive({

  queryParams: {
    pageNum: 1,
    platformIds: [],
    tableLast: null,
    pageSize: 20,
    subPlatformId: null,
    gameRound: null,
    account: null,
    kindId: null,
    cellScore: null,
    allBet: null,
    profit: null,
    revenue: null,
    platformId: null,
    agent: null,
    platformType: null,
    status: null,
    serverId: null,
    selectDate: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
    orderByColumn: 'game_end_time',
    isAsc: 'desc',
  },
  recordLink: null,
  fundsOpen: false,
  gameId: null,

  totalData: {
    totalSuccessBet: 0,
    totalBet: 0,
    totalIncome: 0
  },

  totalLoading: false,

  selectDate: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],

});
const {totalData, queryParams, gameId, recordLink, fundsOpen, totalLoading} = toRefs(data)

function copy1() {
  proxy.copyCommand(totalData.value.totalSuccessBet, proxy)
}

function copy2() {
  proxy.copyCommand(totalData.value.totalBet, proxy)
}

function copy3() {
  proxy.copyCommand(totalData.value.totalIncome, proxy)
}

function listCount() {
  totalLoading.value = true
  memberGameDataCount(queryParams.value).then((res) => {
    if (res.data != null) {
      totalData.value = res.data;
    } else {
      resetCount();
    }
  }).finally(() => {
    totalLoading.value = false
  })
}

onMounted(() => {
  init()
})

function init() {
  if (proxy.$route.query.createTime) {
    queryParams.value.account = proxy.$route.query.userId
    queryParams.value.selectDate = [proxy.$route.query.createTime, proxy.parseTime(proxy.getTodayEndTime())]
  }
  getList()
  listPlatform()
  listCount()
}

/**list of data */
function getList() {
  loading.value = false

  listMemberGameData( queryParams.value ).then(res => {
    memberGameList.value = res.data
    total.value = res.total
    // getCount()
    loading.value = false
  })
}

/** 查询平台列表 get all platform list*/
function listPlatform() {
  listAllPlatform().then(res => {
    platformList.value = res.data
  })
}

function handleCheckedTreeNodeAll() {
  if (checkNodeAll.value) {
    const arrays = [];
    for (const platform of platformList.value) {
      arrays.push(platform.id)
    }

    queryParams.value.platformIds = arrays
    checkNodeAll.value = true
  } else {
    queryParams.value.platformIds = []
    checkNodeAll.value = false
  }
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageSize = 1
  getList()
}

/** 搜索按钮操作 handle query*/
function resetQuery() {
  queryParams.value.platformId = null;
  queryParams.value.kindId = null;
  proxy.resetForm('queryForm')
  handleQuery()
  resetCount();
}

function resetCount(){
  totalData.value.totalSuccessBet = 0;
  totalData.value.totalBet = 0;
  totalData.value.totalIncome=  0;
}

/** 导出按钮操作 handle export data*/
function handleExport() {
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return memberGameDataExport(queryParams.value);
  }).then(response => {
    proxy.downloadExcel(response, '活动信息')
  }).catch(() => {
  })
}

/** 查询会员注单数据统计 count data */
function getCount() {
  memberGameDataCount(queryParams.value).then((res) => {
    totalData.value = res.data
    loading.value = false
  })
}

/** 平台名称格式化程序 platform name formatter */
function formatterPlatformName(row){
  for(const platform of platformList.value){
    if(platform.id === row.platformId){
      return platform.name
    }
  }
  return ""
}

function handleRecord(row) {
  proxy.$refs["memberRecord"].show(row)
}

function handleAgRecord(row) {
  proxy.$refs["agRecord"].show(row)
}

function openRecordLink(row) {
  queryParams.value.gameId = row.gameId;
  queryParams.value.gameRound = row.gameRound;
  queryParams.value.agent = row.agent;
  queryParams.value.gameStartTime = row.game_start_time
  queryParams.value.gameEndTime = row.game_end_time
  queryParams.value.platformId = row.platformId
  queryParams.value.account = row.account;
  loading.value = true
  gameRecordList(queryParams.value).then(response => {
    recordLink.value = response.data.url
    fundsOpen.value = true
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function convertStrENotationToNumber(strVal){
  if(strVal.toLowerCase().includes('e')){
    const val = Number(strVal)
    return isNaN(val) ? strVal : val;
  }
  return strVal;
}

function setPlatformAndKindId() {
  let gameInfo = subPlatforms.value.find( subPlatform => subPlatform.id === queryParams.value.subPlatformId );

  if( gameInfo ) {
    queryParams.value.platformId = gameInfo.platformId;
    queryParams.value.kindId = gameInfo.kindId;
  } else {
    queryParams.value.platformId = null;
    queryParams.value.kindId = null;
  }
}

function getSubPlatformList() {
  listSubPlatforms( queryParams.value ).then( response => {
    subPlatforms.value = response.data;
  });
}

getSubPlatformList();
getList();

</script>