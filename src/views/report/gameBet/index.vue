<template>
    <div class="app-container">
        <el-button type="primary" @click="copy1">总投注金额: {{ totalData.countBetMoney || 0 }}</el-button>
        <el-button type="success" @click="copy2">总投注人数: {{ totalData.countBetPeople || 0 }}</el-button>
        <el-button type="success">会员盈利: {{ totalData.memberProfit || 0 }}</el-button>

        <!--search form -->
        <el-form :model="queryParams" ref="queryForm" style="margin-top: 10px" :inline="true" label-width="68px"
                 v-show="showSearch"
        >
            <el-form-item label="日期选择" prop="selectDateTime">
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
            <el-form-item label="平台名称" prop="gameplame" style="width: 250px">
                <el-input
                        v-model="queryParams.gameplame"
                        placeholder="请输入平台名称"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item>
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
                        v-hasPermi="['report:plamGames:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <div ref="container" style="position: relative">
            <el-table stripe v-loading="loading" :data="gameBetList">
                <el-table-column label="平台编号" align="center" prop="gameagent" :show-overflow-tooltip="true"/>
                <el-table-column label="名称-详情" align="center" prop="gameplame">
                    <template #default="scope">
                        <a style="color: #00afff"
                           @click="jump(scope.row.begindate,scope.row.gameplame)">{{ scope.row.gameplame }}</a>
                    </template>
                </el-table-column>
                <el-table-column label="投注人数" align="center" prop="gamepepole" min-width="120"/>
                <el-table-column label="投注比数" align="center" prop="gametouzhu" min-width="120"/>
                <el-table-column label="总投注金额" align="center" prop="gamecell" min-width="120"/>
                <el-table-column label="有效投注金额" align="center" prop="gamebet" min-width="120"/>
                <el-table-column label="会员盈利" align="center" prop="gameprofit" min-width="120"/>
                <el-table-column label="比例" align="center" prop="bili" min-width="120"/>
                <el-table-column label="日期" align="center" prop="begindate" min-width="160"/>
            </el-table>
            <pagination
                    v-show="total"
                    :total="total"
                    layout="prev, pager, next"
                    v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize"
                    @pagination="getList"
            />
        </div>

    </div>
</template>

<script setup name="GameBet">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
    getTodayEndTime,
    getTodayStartTime,
    parseTime,
    pickerDateTimeShortcuts
} from "@/utils/dateUtils";
import {
    exportReportPlamGames,
    listGameBet,
    reportPlamGamesCount
} from "@/api/report/gameBet";

const {proxy} = getCurrentInstance();

const gameBetList = ref([]);
const total = ref(0);
const showSearch = ref(true);
const loading = ref(false);

const dataInfo = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 20,
        data: [],
        dateTimeRange: [parseTime((new Date() - 3600 * 1000 * 24), '{y}-{m}-{d}'), parseTime(new Date(), '{y}-{m}-{d}')],
        gameplame: null
    },
    totalData: {
        total: 0,
        countCur: 0,
        countBetMoney: 0,
        countBetPeople: 0,
        memberProfit: 0
    },
    backupDateTimeRange: null
});
const {queryParams, totalData, backupDateTimeRange} = toRefs(dataInfo)

function copy1() {

}

function copy2() {

}

/** get data list */
function getList() {
    loading.value = true;

    if (queryParams.value.dateTimeRange) {
        queryParams.value.begindate = queryParams.value.dateTimeRange[0];
        queryParams.value.endDate = queryParams.value.dateTimeRange[1];
        backupDateTimeRange.value = queryParams.value.dateTimeRange
    } else {
        queryParams.value.dateTimeRange = backupDateTimeRange.value;
        proxy.$modal.msgError("日期是必需的")
    }
    listGameBet(queryParams.value).then(res => {
        gameBetList.value = res.data;
        total.value = res.total;
    });
    loading.value = false;

    count()
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
    queryParams.pageNum = 1;
    getList();
}

/** 重置按钮操作 handle resetQuery*/
function resetQuery() {
    proxy.resetForm("queryForm");
    queryParams.value.dateTimeRange = [parseTime(getTodayStartTime()), parseTime(getTodayEndTime())];
    handleQuery();
    loading.value = false;
}

/** count data */
function count() {
    reportPlamGamesCount(queryParams.value).then(response => {
        if (response.data) {
            totalData.value = response.data;
        }
    })
}

/** 导出按钮操作 export data*/
function handleExport() {
    proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return exportReportPlamGames(queryParams.value);
    }).then(response => {
        proxy.downloadExcel(response, '平台资金报表');
    }).catch(() => {
    })
}

function jump(begindate, gameplame) {
    let startDate = queryParams.value.dateTimeRange ? queryParams.value.dateTimeRange[0] : null;
    let endDate = queryParams.value.dateTimeRange ? queryParams.value.dateTimeRange[1] : null;
    proxy.$router.push({
        path: '/report/gameBetJump', query: {
            startDate: startDate, endDate: endDate,
            begindate: begindate, gameplame: gameplame
        }
    });
}

getList()
</script>

<style scoped>

</style>