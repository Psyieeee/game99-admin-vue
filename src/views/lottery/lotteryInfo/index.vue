<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="彩种名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入彩种名称"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="effect">
        <el-select v-model="queryParams.effect" placeholder="请选择状态" clearable>
          <el-option
              v-for="item in effect"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="彩种类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择所属彩种类型" clearable>
          <el-option
              v-for="item in type"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table stripe v-loading="loading" :data="lotteryInfoList">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="彩票名称" align="center" prop="name"/>
      <el-table-column label="所属彩种类型" align="center" prop="type">
        <template v-slot="{row}">
          <a @click="$router.push({path: '/lottery/lotteryMethod',query: { lotteryType: row.type}})"
             style="color: #00afff"> {{ row.type }}</a>
        </template>
      </el-table-column>
      <el-table-column label="图标" align="center" prop="icon">
        <template #default="scope">
          <el-image
              style="height:50px"
              :src="scope.row.icon"
              fit="contain">
          </el-image>
        </template>
      </el-table-column>
      <!--     effect Handler Switch Button  -->
      <el-table-column label="状态" align="center" prop="effect">
        <template v-slot="{row}">
          <el-switch
              :inactive-value="false"
              :active-value="true"
              inactive-color="#dadde5"
              active-color="#5B7BFA"
              v-model="row.effect"
              @change=handleEffectChange(row)>
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="周期" align="center" prop="cycle"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改活动信息对话框 Add or modify event info dialog-->
    <el-dialog title="修改" v-model="open" width="380px" style="padding-bottom: 25px" v-loading="loading" append-to-body>
      <el-form ref="lotteryFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="图标" prop="icon">
          <imageUpload v-model="form.icon" path="LotteryInfo"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script name="LotteryInfo" setup>
import {
  listLotteryInfo,
  getLotteryInfo,
  updateLotteryInfo,
  lotteryInfoUpdateStatus
} from "@/api/lottery/lotteryInfo";
import ImageUpload from "@/components/ImageUpload";
import {reactive, ref, toRefs} from "vue";

const {proxy} = getCurrentInstance();

const lotteryInfoList = ref([]);

const ids = ref([]);
const total = ref(0);
const title = ref();

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)

const open = ref(false)

const showSearch = ref(true);
const loading = ref(true);


const data = reactive({
  //状态选择栏 status
  effect: [{
    value: '1',
    label: '启用'
  }, {
    value: '0',
    label: '禁用'
  }],
  //开奖形式选择栏
  official: [{
    value: '0',
    label: '官方'
  }, {
    value: '1',
    label: '自开(数据库)'
  }, {
    value: '2',
    label: '自开(程序)'
  }],

  //所属彩种类型下拉框
  type: [{
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
  }],

  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    name: null,
    type: null,
    effect: null,
    icon: null,
    killRate: null,
    minCost: null,
    cycle: null,
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    name: [
      {required: true, message: "彩种名称不能为空", trigger: "blur"}
    ]
  }

});

const {effect, type, queryParams, form, rules} = toRefs(data);


/** 查询彩票名称列表 */
function getList() {
  loading.value = true;
  listLotteryInfo(queryParams.value).then(response => {
    lotteryInfoList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getLotteryInfo(row.id).then(response => {
    form.value = response.data;
    open.value = true;
  });
}

/** 修改图标提交按钮 */
function submitForm() {
  proxy.$refs["lotteryFormRef"].validate(valid => {
    if (valid) {
      updateLotteryInfo(form.value).then(response => {
        proxy.$modal.msgSuccess("修改成功");
        open.value = false;
        getList();
      });
    }
  });
}

/*<<<>>>====================================<<<<<>>>>>>>>>>
       禁用启用 Set effect Active =1 and DeActive = 0
               started function from here
    <<<<<>>>>>=================================<<<<<<>>>>  */

/**  0停用1启用 */
function handleEffectChange(row) {
  let text = row.status === '1' ? '启用' : '停用'
  proxy.$modal.confirm('确认要' + text + '吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return lotteryInfoUpdateStatus(row.id, row.effect)
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.status = row.status === '0' ? '1' : '0'
  })
}

/*<<<>>>====================================<<<<<>>>>>>>>>>
       禁用启用 Set effect Active =1 and DeActive = 0
               function ENDED HERE  here
    <<<<<>>>>>=================================<<<<<<>>>>  */


// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    type: null,
    effect: 0,
    icon: null,
    official: null,
    killRate: null,
    minCost: null,
    cycle: null,
    order: null
  };
  proxy.resetForm("lotteryFormRef");
}


getList()
</script>

<style>
.order-input {
  width: 151px
}
</style>
