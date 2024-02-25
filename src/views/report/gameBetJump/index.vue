<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" style="margin-top: 10px" :inline="true" label-width="68px"
                 v-show="showSearch">
            <el-form-item label="日期选择" prop="begindate">
                <el-date-picker type="daterange"
                                v-model="queryParams.dateTimeRange"
                                format="YYYY-MM-DD"
                                value-format="YYYY-MM-DD"
                                :style="{width: '95%'}"
                                start-placeholder="开始时间"
                                end-placeholder="开始时间"
                                range-separator="至"
                                clearable
                                :shortcuts="pickerDateTimeShortcuts">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="子平台名" prop="agentchildname">
                <el-input
                        v-model="queryParams.agentchildname"
                        placeholder="请输入子平台名称"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item prop="gameplame">
                <el-input
                        v-model="queryParams.gameplame"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
<!--                <el-button type="warning" icon="Reset" size="small" @click="resetQuery">搜索</el-button>-->
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table stripe v-loading="loading" :data="gameBetChildList" style="width: 100%;" :stripe="true">
            <el-table-column label="平台编号" align="center" prop="gameagent" :show-overflow-tooltip="true"/>
            <el-table-column label="名称-详情" align="center" prop="gameplame" min-width="120"/>
            <el-table-column label="子平台编号" align="center" prop="agentchild" min-width="120"/>
            <el-table-column label="子平台名称" align="center" prop="agentchildname" min-width="120"/>
            <el-table-column label="投注人数" align="center" prop="gamepepole" min-width="120">
              <template  #default="scope">
                <a style="color: #00afff" @click="handleClickBetCount(scope.row)">{{scope.row.gamepepole}}</a>
              </template>
            </el-table-column>
            <el-table-column label="投注比数" align="center" prop="gametouzhu" min-width="120"/>
            <el-table-column label="总投注金额" align="center" prop="gamecell" min-width="120"/>
            <el-table-column label="有效投注金额" align="center" prop="gamebet" min-width="120"/>
<!--            <el-table-column label="平台抽水" align="center" prop="gamerevenve" min-width="120"/>-->
            <el-table-column label="会员盈利" align="center" prop="gameprofit" min-width="120"/>
            <el-table-column label="比例" align="center" prop="bili" min-width="120"/>
            <el-table-column label="日期" align="center" prop="begindate" min-width="150"/>
        </el-table>
      <tableShow ref="tableShow"></tableShow>
        <pagination
                v-show="total"
                :total="total"
                layout="prev, pager, next"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
        />
    </div>
</template>

<script name="GameBetJump" setup>


import {getCurrentInstance, onActivated, onMounted, reactive, ref, toRefs} from "vue";
import {
    getTodayEndTime,
    getTodayStartTime,
    parseTime,
    pickerDateTimeShortcuts
} from "@/utils/dateUtils";
import {listGameChildBet} from "@/api/report/gameBetJump";
import {useRouter} from "vue-router";
import TableShow from "./tableShow"

const {proxy} = getCurrentInstance();
const router = useRouter();
const gameBetChildList = ref([]);
const showSearch = ref(true);
const loading = ref(false);
const total = ref(0);

/** data reactive */
const data = reactive({
    queryParams: setQueryParams(),
    totalData: {
        total: 0,
        countCur: 0
    },
    backupDateTimeRange: null
});
const {queryParams, backupDateTimeRange} = toRefs(data);

onActivated( () => {
    init()
})

onMounted(() => {
    init();
})


function init() {
    if (proxy.$route.query.gameplame != null) {
        queryParams.value.gameplame = proxy.$route.query.gameplame;
    }
    if (proxy.$route.query.begindate != null) {
        queryParams.value.begindate = proxy.$route.query.begindate;
    }
    getList();
}

init()


/** list data */
function getList() {
  loading.value = true;
  if ( queryParams.value.dateTimeRange ) {
    queryParams.value.begindate = queryParams.value.dateTimeRange[0];
    queryParams.value.endDate   = queryParams.value.dateTimeRange[1];
    backupDateTimeRange.value   = queryParams.value.dateTimeRange
  } else {
    queryParams.value.dateTimeRange = backupDateTimeRange.value;
    proxy.$modal.msgError("日期是必需的")
  }

  listGameChildBet(queryParams.value).then(res => {
    gameBetChildList.value = res.data;
    total.value            = res.total;
  });
  loading.value = false;
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
    queryParams.pageNum = 1;
    getList()
}

/** 重置按钮操作 handle resetQuery*/
function resetQuery() {
    proxy.resetForm('queryForm')
    queryParams.value.dateTimeRange = [parseTime(getTodayStartTime()), parseTime(getTodayEndTime())];
    handleQuery()
    loading.value = false
}

function setQueryParams() {
    let defaultParams =
        {
            pageNum: 1,
            pageSize: 10,
            agentchildname: null,
            gameplame: null
        };

    if (proxy.$route.query.startDate) {
        defaultParams.dateTimeRange = [parseTime(new Date(new Date(proxy.$route.query.startDate).setHours(0,0,0))),
            parseTime(new Date(new Date(proxy.$route.query.endDate).setHours(23,59,59)))];
    }
    return defaultParams;
}

function handleClickBetCount(row) {
console.log("aw", queryParams)
console.log("row", row)
  queryParams.value.begindate  = queryParams.value.dateTimeRange[0];
  queryParams.value.endDate    = queryParams.value.dateTimeRange[1];
  queryParams.value.agentchild = row.agentchild
  queryParams.value.gamepepole = row.gamepepole;
  queryParams.value.gameagent  = row.gameagent;
  queryParams.value.gameUuid   = row.gameUuid;
  proxy.$refs["tableShow"].setParam(queryParams);
}

getList()
</script>

<style scoped>

</style>
