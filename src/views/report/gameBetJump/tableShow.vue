<template>
  <div>
    <el-dialog :visible.sync="open" title="投注详情" style="margin-bottom: 150px" append-to-body>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
          > export
          </el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="list"></right-toolbar>
      </el-row>

      <el-table :data="tableData" style="width: 100%;">
        <el-table-column property="agentchild" label="会员ID"   header-align="center" align="center"/>
        <el-table-column property="gamecell"   label="有效下注"  header-align="center" align="center"/>
        <el-table-column property="gameprofit" label="盈利"     header-align="center" align="center"/>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="list"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useRouter} from "vue-router";
import {exportReportChildPlamGames, listByGamePepole} from "@/api/report/gameBetJump.js";


const {proxy} = getCurrentInstance();
const router = useRouter();
const tableData = ref([]);
const open = ref(true);
const showSearch = ref(true);
const showPages = ref(false);
const total = ref(0);

/** data reactive */
const data = reactive({
  queryParams: {},
  totalData: {
    total: 0,
  },
  backupDateTimeRange: null
});
const {queryParams, totalData} = toRefs(data);


function list(){
  listByGamePepole( queryParams.value ).then((res) =>{
    tableData.value = res.rows;
    total.value = res.total
    open.value = true;
  })
}

function close(){
  open.value = false;
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$confirm( "确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...", "警告" , {
    confirmButtonText: "确定" ,
    cancelButtonText: "取 消" ,
    type: 'warning'
  }).then(function () {
    return exportReportChildPlamGames( queryParams.value)
  }).then(response => {
    this.downloadExcel(response,'出款银行列表')
  }).catch(() => {
  })
}

list();

</script>

<style scoped>

</style>



