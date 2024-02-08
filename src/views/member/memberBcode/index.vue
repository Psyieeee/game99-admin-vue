<template>
  <div class="app-container">
    <!--    search -->
    <el-button type="primary" @click="copy1">总需打码 {{ totalData.total.toFixed(2) }}</el-button>
    <el-button type="success" @click="copy2">总已打码 {{ totalData.countCur.toFixed(2) }}</el-button>
    <el-button type="warning" @click="copy3">还需打码 {{
        (totalData.total - totalData.countCur).toFixed(2)
      }}
    </el-button>
    <el-button type="success" @click="copy4">总充值 {{ totalData.charge.toFixed(2) }}</el-button>
    <el-form :model="queryParams" ref="queryForm" style="margin-top: 10px" :inline="true" v-show="showSearch"
             label-width="100px">
      <el-form-item label="日期范围" prop="createTime">
        <el-date-picker type="datetimerange"
                        v-model="createTime"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :style="{width: '95%'}"
                        start-placeholder="开始时间"
                        end-placeholder="开始时间"
                        range-separator="至"
                        clearable
                        :default-time="getDefaultTime()"
                        :shortcuts="pickerDateTimeShortcuts"
        ></el-date-picker>
      </el-form-item>
      <el-form-item prop="userId" class="input-wd20">
        <el-input
            v-model.trim="queryParams.userId"
            placeholder="会员ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!--   end search  -->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['member:memberBcode:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--    display data in table -->
    <el-table stripe v-loading="loading" :data="memberBcodeList">
      <el-table-column label="会员ID" align="center" prop="userId"/>
      <el-table-column label="收入" align="center" prop="income"/>
      <el-table-column label="描述" align="center" prop="des"/>
      <el-table-column label="是否打码" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="member_bcode_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="当前打码量" align="center" prop="cur"/>
      <el-table-column label="充值" align="center" prop="charge"/>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="160"/>
      <el-table-column label="操作" width="220" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['member:memberBcode:edit']"
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

    <!--    end table-->

    <!-- 修改会员打码数据对话框 Modify Member Code Data Dialog Box-->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="500px" style="height: 240px"
               append-to-body>
      <el-form ref="memberBRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="当前打码量" prop="cur">
          <el-input v-model="form.cur" placeholder="请输入当前打码量"/>
        </el-form-item>
        <el-form-item label="Google验证码" prop="googleAuthCode">
          <el-input v-model="form.googleAuthCode" placeholder="请输入Google验证码"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script setup name="MemberBcode">

import {reactive, ref, toRefs} from "vue";
import {downloadExcel} from "@/utils/common";
import {
  pickerDateTimeShortcuts,
  getDefaultTime, parseTime, getTodayStartTime, getTodayEndTime
} from "@/utils/dateUtils";
import {
  getMemberBcode,
  listMemberBcode,
  updateMemberBcode,
  exportMemberBcode,
  totalDataGet
} from "@/api/member/memberBcode";

const router = useRouter();
const {proxy} = getCurrentInstance();

const {member_bcode_status} = proxy.useDict('member_bcode_status');

// 选中数组
const ids = ref([]);
// 会员打码数据表格数据
const memberBcodeList = ref([]);

const total = ref(0);
const pageType = ref(0);
// 弹出层标题
const title = ref('');

const showSearch = ref(true);
// 遮罩层 loading
const loading = ref(false);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 是否显示弹出层
const open = ref(false);

const data = reactive({

  queryParams: {
    pageNum: 1,
    pageSize: 20,
    userId: null,
    orderByColumn: 'create_time',
    isAsc: 'desc'
  },
  totalData: {
    total: 0,
    countCur: 0,
    charge:0
  },
  createTime: [parseTime(getTodayStartTime()), parseTime(getTodayEndTime())],

  // 表单参数
  form: {},
  // 表单校验
  rules: {
    cur: [
      {
        required: true,
        message: '当前打码量不能为空,且数值大于等于0',
        trigger: 'blur',
        pattern: '^0\\.\\d+$|^[0-9]+(\\.\\d+)?$'
      }
    ],
    googleAuthCode: [
      {required: true, message: 'google验证码不能为空', trigger: 'blur'}
    ],
  }

});

const {queryParams, totalData,createTime, form, rules} = toRefs(data);

//复制
function copy1() {
  proxy.copyCommand(totalData.value.total,proxy)
}

function copy2() {
  proxy.copyCommand(totalData.value.countCur,proxy)
}

function copy3() {
  proxy.copyCommand((totalData.value.total - totalData.value.countCur),proxy)
}

function copy4() {
  proxy.copyCommand(totalData.value.charge,proxy)
}

/** 查询会员打码数据列表 Query member code data list*/
function getList() {
  loading.value = true
  listMemberBcode(proxy.addDateRange(queryParams.value,createTime.value)).then(response => {
    memberBcodeList.value = response.data
    total.value = response.total
    getTotalData()
    loading.value = false
  })
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    des: null,
    income: null,
    createTime: null,
    status: 0,
    cur: null
  };
  proxy.resetForm('memberBRef')
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

/**  start function from here */
function handleQuery() {
  if (queryParams.userId) {
    const reg = '^[0-9a-zA-Z_]{1,}$'
    let flag = queryParams.userId.match(reg)
    if (!flag) {
      proxy.$modal.msgError("会员ID只能输入数字及下划线")
      return
    }
  }
  queryParams.pageNum = 1
  getList()
  getTotalData()
}

/** 重置按钮操作 Reset button action*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

/** 修改按钮操作 Modify button action*/
function handleUpdate(row) {
  reset();
  pageType.value = 1
  const id = row.id
  getMemberBcode(id).then(response => {
    form.value = response.data;
    form.cur = form.cur + '';
    open.value = true;
    title.value = "修改会员打码数据";
  });

}

/** 提交按钮  submit button*/
function submitForm() {
  proxy.$refs["memberBRef"].validate(valid => {
    if (valid) {
      if (pageType.value == 1) {
        let cur = parseFloat(form.cur);
        if (cur > form.income) {
          proxy.$modal.msgError("当前打码量数值不能大于收入")
          return;
        }
        updateMemberBcode(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 导出按钮操作 Export function*/
function handleExport() {
  proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportMemberBcode(queryParams.value)
  }).then(response => {
    downloadExcel(response, '会员打码数据')
  }).catch(() => {
  })
}

function getTotalData() {
  totalDataGet(proxy.addDateRange(queryParams.value,createTime.value)).then((res) => {
    totalData.value = res.data
  }).catch(() => {
    proxy.$modal.msgError('网络异常')
  })
}

getList()
</script>

<style scoped>
</style>