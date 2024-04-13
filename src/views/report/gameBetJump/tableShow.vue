<template>
  <div>
    <el-dialog v-model="open" title="投注详情" style="margin-bottom: 150px; width: 50%" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
              type="warning"
              plain
              icon="Download"
              size="small"
              @click="handleExport"
          > 导出
          </el-button>
        </el-col>
        <!--        <right-toolbar v-model="showSearch" @queryTable="list"></right-toolbar>-->
      </el-row>
      <el-row :gutter="10" class="mb8">
        <el-table :data="tableShowData" style="width: 100%;" v-loading="loading">
          <el-table-column property="agentchild" label="会员ID" header-align="center" align="center"/>
          <el-table-column property="gamecell" label="有效下注" header-align="center" align="center"/>
          <el-table-column property="gameprofit" label="盈利" header-align="center" align="center"/>
        </el-table>
        <pagination
            v-show="tableShowTotal"
            :total="tableShowTotal"
            v-model:page="tableShowQueryParams.pageNum"
            v-model:limit="tableShowQueryParams.pageSize"
            :page-sizes="[100,200,300]"
            @pagination="list"
        />

      </el-row>
    </el-dialog>
  </div>
</template>


<script setup name="TableShow">
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useRouter} from "vue-router";
import {exportReportChildPlamGames, listByGamePepole} from "@/api/report/gameBetJump.js";


const {proxy} = getCurrentInstance();
const router = useRouter();
const tableShowData = ref([]);
const open = ref(false);
const showSearch = ref(true);
const loading = ref(false);
const showPages = ref(false);
const tableShowTotal = ref(0);

/** data reactive */
const data = reactive({
  tableShowQueryParams: {},
  totalData: {
    total: 0,
  },
  pageSize: 100,
  backupDateTimeRange: null
});
const {tableShowQueryParams, totalData} = toRefs(data);


function list() {
  loading.value = true
  listByGamePepole(tableShowQueryParams.value).then((res) => {
    tableShowData.value = res.data;
    tableShowTotal.value = res.total
    loading.value = false;
  })
}

function close() {
  open.value = false;
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$confirm("确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取 消",
    type: 'warning'
  }).then(function () {
    return exportReportChildPlamGames(tableShowQueryParams.value)
  }).then(response => {
    proxy.downloadExcel(response, '出款银行列表')
  }).catch(() => {
  })
}

// list();

defineExpose({
  setParam
});

function setParam(params) {
  open.value = true;
  tableShowQueryParams.value = params;
  list()
}

</script>

<style scoped>

</style>



