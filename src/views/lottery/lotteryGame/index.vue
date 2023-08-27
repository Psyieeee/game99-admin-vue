<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="菜单id" prop="methodId" class="input-wd25">
        <el-input
            v-model="queryParams.methodId"
            placeholder="请输入菜单id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择所属彩种类型" clearable>
          <el-option
              v-for="item in lotteryType"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="简介" prop="info" class="input-wd25">
        <el-input
            v-model="queryParams.info"
            placeholder="请输入简介"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table stripe v-loading="loading" :data="lotteryGameList">
      <el-table-column label="菜单id" align="center" prop="methodId"/>
      <el-table-column label="类型" align="center" prop="type"/>
      <el-table-column label="简介" align="center" prop="info"/>
      <el-table-column label="赔率" align="center" prop="odds"/>
      <el-table-column label="排序" align="center" prop="sort"/>
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
<!--        <template #default="scope">-->
<!--          <el-button-->
<!--              size="small"-->
<!--              type="text"-->
<!--              icon="Edit"-->
<!--              @click="handleUpdate(scope.row)"-->
<!--              v-hasPermi="['lottery:game:edit']"-->
<!--          >修改赔率-->
<!--          </el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[20,30,50]"
        @pagination="getList"
    />

    <!-- 修改赔率对话框 -->
    <el-dialog  :close-on-click-modal="false" :title="title" v-model="open" style="height: 200px" width="300px"
               append-to-body>
      <el-form ref="updateLotteryRef" :model="form" :rules="rules" label-width="40px">
        <el-form-item label="赔率" prop="odds">
          <el-input v-model="form.odds" placeholder="请输入赔率"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=!open">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup name="LotteryGame">
import {editLotteryGame, listLotteryGameData, lotteryGameByIdData} from "@/api/lottery/lotteryGame";

const {proxy} = getCurrentInstance();

const lotteryGameList = ref([]);
const showSearch = ref(true);
const loading = ref(false);
const open = ref(false);
const total = ref(0);
const title = ref('');

const data = reactive({
  queryParams:{
    pageNum:1,
    pageSize:15,
    methodId: null,
    type: null,
    info: null,
    odds: null,
  },
  form:{},
  rules:{},
  lotteryType: [{
    value: '时时彩',
    label: '时时彩'
  }, {
    value: '11选5',
    label: '11选5'
  }, {
    value: '快三',
    label: '快三'
  }, {
    value: '赛车',
    label: '赛车'
  }, {
    value: '六合彩',
    label: '六合彩'
  }, {
    value: 'baccarat',
    label: '百家乐'
  }, {
    value: '百人牛牛',
    label: '百人牛牛'
  }],
});

const {queryParams,form,rules,lotteryType} = toRefs(data);


onMounted(() => {
  init()
})

function init() {
  if (proxy.$route.query.type) {
    queryParams.value.type = proxy.$route.query.type
  }
  getList()
}
init()

/**查询下注列表 list all data*/
function getList(){
  loading.value = true;
  listLotteryGameData(queryParams.value).then(res=>{
    lotteryGameList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery(){
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery(){
  proxy.resetForm("queryForm");
  handleQuery();
}

function handleUpdate(row){
  reset()
  lotteryGameByIdData(row.id).then(res=>{
    form.value = res.data;
    title.value = "editGameType";
    open.value = true
  })
}

function reset() {
  form.value = {
    id: null,
    methodId: null,
    type: null,
    index: null,
    info: null,
    odds: null,
  };
  proxy.resetForm("updateLotteryRef");
}

/** 提交按钮 */
function submitForm(){
  proxy.$refs["updateLotteryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        editLotteryGame(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

getList()
</script>

<style scoped>

</style>