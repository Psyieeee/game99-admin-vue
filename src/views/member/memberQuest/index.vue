<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员ID" prop="memberId">
        <el-input
            v-model.trim="queryParams.memberId"
            placeholder="请输入会员ID"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务标题" prop="title">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入任务标题"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table stripe v-loading="loading" :data="memberQuestList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="会员ID" align="center" prop="memberId"/>
      <el-table-column label="任务标题" align="center" prop="title"/>
      <el-table-column label="当前任务状态" align="center" prop="status" :formatter="formatterType"/>
      <el-table-column label="当前任务数量" align="center" prop="curNum">
        <template v-slot="{row}">
          <span>{{ row.curNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目标任务数量" align="center" prop="target"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width ">

        <template v-slot="{row}">
          <el-button type="primary" icon="Plus" v-if=" row.status === 0 "
                     @click="addMemberScoreClick(row.id, row.curNum, row.target)">补分
          </el-button>
        </template>
      </el-table-column>
    </el-table>
      <pagination
              v-show="total"
              :total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              :page-sizes="[20,30,50]"
              @pagination="getList"/>

      
    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog draggable :close-on-click-modal="false" :title="title" v-model="open"  width="500px"
               append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员ID" prop="memberId">
          <el-input v-model="form.memberId" placeholder="请输入会员ID"/>
        </el-form-item>
        <el-form-item label="任务id" prop="questId">
          <el-input v-model="form.questId" placeholder="请输入任务id"/>
        </el-form-item>
        <el-form-item label="0=进行中1=已经完成2 领奖完成">
          <el-radio-group v-model="form.status">
            <el-radio label="1">请选择字典生成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="当前任务数量" prop="curNum">
          <el-input v-model="form.curnum" placeholder="请输入当前任务数量"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="MemberQuest">
import {getCurrentInstance, reactive, ref, toRefs, onMounted} from "vue";
import {
  listMemberQuest,
  addMemberScore,
  getMemberQuest,
  delMemberQuest,
  addMemberQuest,
  updateMemberQuest,
  exportMemberQuest
} from "@/api/member/memberQuest";
import {resetForm} from "@/utils/common";

const {proxy} = getCurrentInstance()

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
const memberQuestList = ref([]);
// 弹出层标题
const title = ref("");
// 是否显示弹出层
const open = ref(false);

const data = reactive({

      name: "MemberQuest",
      components: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        memberId: null,
        title: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
);

const {queryParams, form, rules} = toRefs(data);

function formatterType(row) {
  if (row.status == 0) {
    return '进行中'
  } else if (row.status == 1) {
    return '待领奖'
  } else if (row.status == 2) {
    return '已领奖'
  } else {
    return ''
  }
}

/** 查询【请填写功能名称】列表 */
function getList() {
  loading.value = true;
  listMemberQuest(queryParams.value).then(response => {
    memberQuestList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

//增加会员任务积分
function addMemberScoreClick(id, curnums, target) {

  proxy.$prompt('请输入需要增加的积分', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[0-9]{1,10}$/,
    inputErrorMessage: '增加的积分为正整数'
  }).then(({value}) => {
    if (!(/(^[1-9]\d*$)/.test(value))) {
      proxy.$modal.warning('请输入正整数')
      return;
    }
    if (value > 100000) {
      proxy.$modal.warning('最多补分10w')
      return;
    }
    loading.value = true;
    let status = 0;
    let curNum = curnums + Number(value);
    if (curNum >= target) {
      curNum = target;
      status = 1;
    }

    addMemberScore(id, status, curNum).then(res => {
      if (res.code === 200) {
        proxy.$modal.msgSuccess(res.msg)
        getList()
      } else {
        proxy.$modal.msgError(res.msg)
      }
      getList();
    })
  }).catch(() => {
    proxy.$message({
      type: 'info',
      message: '取消输入'
    });
  });
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

function
resetQuery() {
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
  title.value = "添加【请填写功能名称】";
}

//No use. Copied from 77. Might be needed in future implementations.
function handleUpdate(row) {
  reset();
  const memberQuestIds = row.id || ids.value;
  getMemberQuest(memberQuestIds).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改【请填写功能名称】";
  });
}

function submitForm() {
  proxy.$refs["queryForm"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMemberQuest(form).then(res => {
          if (res.code === 200) {
            proxy.$modal.msgSuccess(res.msg)
            open.value = false;
            getList()
          } else {
            proxy.$modal.msgError(res.msg)
          }
          getList();
        });
      } else {
        addMemberQuest(form).then(res => {
          if (res.code === 200) {
            proxy.$modal.msgSuccess(res.msg)
            open.value = false;
            getList()
          } else {
            proxy.$modal.msgError(res.msg)
          }
          getList();
        });
      }
    }
  });
}

function handleDelete(row) {
  const memberQuestIds = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + memberQuestIds + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return delMemberQuest(memberQuestIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  })
}

function handleExport() {
  // const queryParams = queryParams;
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', "警告", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return exportMemberQuest(queryParams.value);
  }).then(response => {
    proxy.downloadExcel(response, '【请填写功能名称】');
  }).catch(() => {
  })
}

getList();
</script>
