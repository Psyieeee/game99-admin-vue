<template>
  <div class="app-container">
<!--    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">-->
<!--      <el-form-item label="名称" prop="name">-->
<!--        <el-input-->
<!--            v-model="queryParams.name"-->
<!--            placeholder="请输入名称"-->
<!--            clearable-->
<!--            :step="100"-->
<!--            size="small"-->
<!--            @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item>-->
<!--        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>-->
<!--        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>-->
<!--      </el-form-item>-->
<!--    </el-form>-->

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">

      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="configInviterGameList">
      <el-table-column label="初始金额" align="center" prop="initialAmount"/>
      <el-table-column label="最终金额" align="center" prop="finalAmount"/>
      <el-table-column label="有效时间（小时)" align="center" prop="duration" />

      <el-table-column label="最少邀请人数" align="center" prop="minimumInvites"/>
      <el-table-column label="最多邀请人数" align="center" prop="maximumInvites"/>
      <el-table-column label="每次邀请可获得的次数" align="center" prop="spinsPerInvite" min-width="180"/>
      <el-table-column label="首次免费次数" align="center" prop="initialSpinCount"/>

      <el-table-column label="随机获取最低金额" align="center" prop="minimumPoints"/>
      <el-table-column label="随机获取最高金额" align="center" prop="maximumPoints"/>
      <el-table-column label="步数" align="center" prop="step"/>

      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value="true"
              :inactive-value="false"
              @change="handleEffect(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button
              v-hasPermi="['config:inviterGame:update']"
              icon="Edit"
              link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
              icon="Delete"
              link
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
          >删除
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

    <!-- 添加或修改 bonus 配置对话框 Add or modify bonus configuration dialog -->
    <el-dialog title="编辑游戏配置规则" v-model="open" width="700px" append-to-body>
      <el-steps style="padding-bottom: 50px" :active="activeStep" finish-status="success">
        <el-step title="步骤 1"/>
        <el-step title="步骤 2"/>
        <el-step title="步骤 3"/>
      </el-steps>

      <el-form ref="configRef" :model="form" style="padding-bottom: 50px" label-width="40%">

        <div v-if="activeStep === 0">
          <el-form-item label="初始金额" :error="errors.initialAmount">
            <el-input-number v-model="form.initialAmount" controls-position="right" :min="0"/>
          </el-form-item>
          <el-form-item label="最终金额" :error="errors.finalAmount">
            <el-input-number v-model="form.finalAmount" controls-position="right" :min="0.01"/>
          </el-form-item>
          <el-form-item label="有效时间（小时)" :error="errors.duration">
            <el-input-number v-model="form.duration" controls-position="right" :min="1" step-strictly/>
          </el-form-item>
        </div>
        <div v-else-if="activeStep === 1">
          <el-form-item label="最少邀请人数" :error="errors.minimumInvites">
            <el-input-number v-model="form.minimumInvites" controls-position="right" :min="1" step-strictly/>
          </el-form-item>
          <el-form-item label="最多邀请人数" :error="errors.maximumInvites" :min="2">
            <el-input-number v-model="form.maximumInvites" controls-position="right" step-strictly/>
          </el-form-item>
          <el-form-item label="每次邀请可获得的次数" :error="errors.spinsPerInvite">
            <el-input-number v-model="form.spinsPerInvite" controls-position="right" :min="1" step-strictly/>
          </el-form-item>
          <el-form-item label="首次免费次数" :error="errors.initialSpinCount">
            <el-input-number v-model="form.initialSpinCount" controls-position="right" :min="0" step-strictly/>
          </el-form-item>
        </div>

        <div v-else-if="activeStep === 2">
          <el-form-item label="随机获取最低金额" :error="errors.minimumPoints">
            <el-input-number v-model="form.minimumPoints" controls-position="right" :min="0.01" :step="0.01" step-strictly/>
          </el-form-item>
          <el-form-item label="随机获取最高金额" :error="errors.maximumPoints">
            <el-input-number v-model="form.maximumPoints" controls-position="right" :min="0.02" :step="0.01" step-strictly/>
          </el-form-item>
          <el-form-item label="每次增加金额" :error="errors.step">
            <el-input-number v-model="form.step" controls-position="right" :min="0.01" :step="0.01" step-strictly/>
          </el-form-item>
        </div>

        <div v-else-if="activeStep === 3">
          <el-form-item label="测试奖励顺序" label-width="20%">
            <el-input v-model="sampleList" readonly style="width: 70%"></el-input> <br>
            <el-button @click="test" type="warning" style="margin-left: 10px">测试结果</el-button>
          </el-form-item>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer" style="float: right;margin-top: -20px">
        <el-button @click="previousStep" v-if="activeStep > 0">上一步</el-button>
        <el-button @click="nextStep" v-if="activeStep < 3">下一步</el-button>
        <el-button type="primary" @click="submitForm" v-if="activeStep === 3">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="configInviterGame">
import {
  list,
  get,
  add,
  update,
  changeStatus,
  remove,
  getSampleList
} from '@/api/config/inviterGame.js'
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();
const {proxy} = getCurrentInstance();

// bonus文件存储服务配置表格数据
const configInviterGameList = ref([]);

//signal data type
// 弹出层标题
const title = ref("");
const total = ref(0);
const bonusTestTitle = ref("测试图片上传");

//boolean types
// 遮罩层
const loading = ref(true);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 是否显示弹出层
const open = ref(false);

const openConfig = ref(false);

const activeStep = ref(0)

const sampleList = ref( "" );

const data = reactive({
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    minAmount: null,
    maxAmount: null,
    orderByColumn: 'status',
    isAsc: 'desc'
  },
  // 表单参数
  form: {},
  errors: {}
});
const {queryParams, form, rules, errors} = toRefs(data);

function previousStep() {
  if( activeStep.value > 0 ) {
    activeStep.value--;
  }
}

function test() {
  getSampleList( form.value ).then( response => {
    sampleList.value = response.data;
  } );
}

function isEmpty( value ) {
  return value === null || value === undefined || value === "";
}

function nextStep() {
  resetErrors();

  switch( activeStep.value ) {
    case 0:
      if( isEmpty( form.value.initialAmount ) ) {
        errors.value.initialAmount = "初始金额不能为空";
        return;
      }

      if( isEmpty( form.value.finalAmount ) ) {
        errors.value.finalAmount = "最终金额不能为空";
        return;
      }

      if( isEmpty( form.value.duration ) ) {
        errors.value.duration = "持续时间不能为空";
        return;
      }

      if( form.value.initialAmount >= form.value.finalAmount ) {
        errors.value.finalAmount = "最终金额必须大于初始金额";
        return;
      }

      break;
    case 1:
      if( isEmpty( form.value.minimumInvites ) ) {
        errors.value.minimumInvites = "最小邀请不能为空";
        return;
      }

      if( isEmpty( form.value.maximumInvites ) ) {
        errors.value.maximumInvites = "最大邀请不能为空";
        return;
      }

      if( isEmpty( form.value.spinsPerInvite ) ) {
        errors.value.spinsPerInvite = "每次邀请的旋转次数不能为空";
        return;
      }

      if( isEmpty( form.value.initialSpinCount ) ) {
        errors.value.initialSpinCount = "初始免费旋转不能为空";
        return;
      }

      if( form.value.minimumInvites >= form.value.maximumInvites ) {
        errors.value.maximumInvites = "最大邀请金额必须大于最小邀请金额";
        return;
      }

      break;
    case 2:
      if( isEmpty( form.value.minimumPoints ) ) {
        errors.value.minimumPoints = "最小点数不能为空";
        return;
      }

      if( isEmpty( form.value.maximumPoints ) ) {
        errors.value.maximumPoints = "最高分不能为空";
        return;
      }

      if( isEmpty( form.value.step ) ) {
        errors.value.step = "步骤不能为空";
        return;
      }

      const targetSum = form.value.finalAmount - form.value.initialAmount;
      const minSpins = form.value.initialSpinCount * 1 + form.value.minimumInvites * form.value.spinsPerInvite;
      const maxSpins = form.value.initialSpinCount * 1 + form.value.maximumInvites * form.value.spinsPerInvite;
      let minPossibleChoice = targetSum / maxSpins;
      let maxPossibleChoice = targetSum / minSpins;

      if( Math.floor( minPossibleChoice ) !== minPossibleChoice ) {
        minPossibleChoice = minPossibleChoice.toFixed( 3 ) * 1;
      }

      if( Math.floor( maxPossibleChoice ) !== maxPossibleChoice ) {
        maxPossibleChoice = maxPossibleChoice.toFixed( 3 ) * 1;
      }

      if( form.value.minimumPoints < minPossibleChoice || form.value.minimumPoints >= maxPossibleChoice ) {
        errors.value.minimumPoints = "最小点数超出" + minPossibleChoice + "至" + maxPossibleChoice + "的可能范围";
        return;
      }

      if( form.value.maximumPoints <= minPossibleChoice || form.value.maximumPoints > maxPossibleChoice ) {
        errors.value.maximumPoints = "最高分超出了" + minPossibleChoice + "至" + maxPossibleChoice + "分的可能范围";
        return;
      }

      if( form.value.minimumPoints >= form.value.maximumPoints ) {
        errors.value.maximumPoints = "最高分必须大于最低分";
        return;
      }

      const quotient = ( form.value.maximumPoints - form.value.minimumPoints ).toFixed( 2 ) / form.value.step;

      if( Math.ceil( quotient ) !== quotient ) {
        errors.value.step = "步长必须与最大点完全相加";
        return;
      }
      break;
  }

  if( activeStep.value < 3 ) {
    activeStep.value++;
  }
}

/** 查询bonus服务配置列表 Query the bonus  service configuration list */
function getList() {
  loading.value = true
  list().then(response => {
    configInviterGameList.value = response.data
    if (response.total) {
      total.value = response.total
    }
    loading.value = false
  })
}

/** 取消按钮 cancel button */
function cancel() {
  open.value = false
  reset()
}

function resetErrors() {
  errors.value = { };
}

/** 表单重置 Form reset */
function reset() {
  resetErrors();
  form.value = {
    id: null,
    initialAmount: null,
    finalAmount: null,
    duration: null,
    minimumInvites: null,
    maximumInvites: null,
    spinsPerInvite: null,
    initialSpinCount: null,
    minimumPoints: null,
    maximumPoints: null,
    step: null,
    status: null,
    updatedBy: null,
    updateTime: null
  }
  activeStep.value = 0;
  sampleList.value = null;
  proxy.resetForm('configRef')
}


/** 搜索按钮操作  Search button action*/
function handleQuery() {
  // queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 Reset button action*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value =false
}

/** 新增按钮操作 Add button action*/
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加佣金配置'
}

/** 修改按钮操作 Modify button action*/
function handleUpdate(row) {
  reset()
  get(row.id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '编辑佣金配置'
  })
}

/** 提交按钮 submit button*/
function submitForm() {
  if( isEmpty( sampleList.value ) ) {
    proxy.$modal.msgError( "请在提交前进行测试" );
    return;
  }

  proxy.$refs['configRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        update(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        add(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 delete button action*/
function handleDelete(row) {
  if( row.status === true ) {
    proxy.$modal.msgError( "无法删除活动配置" );
    return;
  }

  const id = row.id;
  proxy.$modal.confirm('您是否确认删除这些数据?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return remove(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}

function handleEffect(row) {
  if( row.status === false ) {
    row.status = true;
    return;
  }

  proxy.$modal.confirm('确保您要激活的配置配置编号为' + row.id + '"的状态吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return changeStatus( row.id, row.status )
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('修改状态成功')
  }).catch(() => {
    row.status = !row.status
  })
}

getList()

</script>
