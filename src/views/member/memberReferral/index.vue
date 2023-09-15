<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams" label-width="88px">
      <el-form-item class="input-wd25" label="游戏类型" prop="gameType">
        <el-select v-model="queryParams.gameType" clearable placeholder="请选择平台 游戏类型">
          <el-option
              v-for="dict in gameTypeList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="推荐金额 百分比" prop="referralAmountPercentage">
        <el-input
            v-model.trim="queryParams.referralAmountPercentage"
            placeholder="请输入推荐金额百分比"
            clearable
            type="primary"
            link
            style="width: 120px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="推荐投注倍数" prop="referralBetMultiplier">
        <el-input
            v-model.trim="queryParams.referralBetMultiplier"
            placeholder="请输入推荐投注倍数"
            clearable
            type="primary"
            link
            style="width: 120px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['member:memberReferral:add']"
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['member:memberReferral:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['member:memberReferral:export']"
            icon="Download"
            plain
            size="small"
            type="warning"
            @click="handleExport"
        >导出
        </el-button>
        <el-button
            icon="Edit"
            plain
            size="small"
            type="warning"
            @click="handleSetScheduler"
        >
          设置调度程序

        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="memberReferralList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="ID" prop="id"/>
      <el-table-column align="center" label="Game Type" prop="gameType"/>
      <el-table-column align="center" label="Level" prop="level"/>
      <el-table-column align="center" label="Referral Percentage" prop="referralAmountPercentage"/>
      <el-table-column align="center" label="Referral Bet Multiplier" prop="referralBetMultiplier"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button
              v-hasPermi="['member:memberReferral:update']"
              icon="Edit"
              link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
              v-hasPermi="['member:memberReferral:remove']"
              fixed="right"
              icon="Delete"
              link
              size="small"
              style="color: #FF5722"
              type="danger"
              @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50,100]"
        :total="total"
        @pagination="getList"/>

    <el-dialog v-model="open" :title="title" append-to-body style="padding-bottom: 20px"
               width="600px">
      <el-form ref="memberReferralFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item class="input-wd25" label="游戏类型 ID" prop="gameType">
          <el-select v-model="form.gameType" placeholder="请输入平台 ID">
            <el-option
                v-for="dict in gameTypeList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Level" prop="level" style="min-width: 290px">
          <template #default="scope">
            <el-input-number v-model="form.level" :min="1" :max="3"  />
          </template>
        </el-form-item>
        <el-form-item label="referralAmountPercentage" prop="referralAmountPercentage" style="min-width: 290px">
          <el-input
              v-model="form.referralAmountPercentage"
              clearable
              placeholder="referralAmountPercentage"
          />
        </el-form-item>
        <el-form-item label="referralBetMultiplier" prop="referralBetMultiplier" style="min-width: 290px">
          <el-input
              v-model="form.referralBetMultiplier"
              clearable
              placeholder="referralBetMultiplier"
          />
        </el-form-item>
      </el-form>
      <el-form-item label="活跃" label-width="120px" prop="effect" style="min-width: 290px">
        <template #default="scope">
          <el-switch
              v-model="form.effect"
              :active-value="1"
              :inactive-value="0"
          ></el-switch>
        </template>
      </el-form-item>
      <template #footer>
        <div>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>


    <el-dialog v-model="scheduleDialog" title="更新调度程序" append-to-body style="padding-bottom: 20px"
               width="600px">
      <el-form ref="scheduleForm" :model="form" label-width="120px">
        <el-form-item class="input-wd25" label="游戏类型 ID" prop="schedule">
          <template>
            <el-time-select
                v-model="schedule"
                start="00:00"
                step="00:30"
                end="23:59"
                placeholder="Select time"
                format="hh:mm A"
            />
          </template>
        </el-form-item>
      </el-form>
      <el-form-item label="活跃" label-width="120px" prop="effect" style="min-width: 290px">
        <template #default="scope">
          <el-switch
              v-model="form.effect"
              :active-value="1"
              :inactive-value="0"
          ></el-switch>
        </template>
      </el-form-item>
      <template #footer>
        <div>
          <el-button type="primary" @click="editScheduler">确 定</el-button>
          <el-button @click="scheduleDialog=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script name="MemberReferral" setup>
import {
  addMemberReferral,
  changeMemberReferralStatus,
  deleteMemberReferral,
  exportMemberReferral,
  memberReferralListData,
  getMemberReferralData,
  updateMemberReferral
} from "@/api/member/memberReferral";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
// import {listAllPlatform} from "@/api/game/platform";
import {listAllType} from "@/api/game/type";

const {proxy} = getCurrentInstance()
const {
  sys_effect_type,
  game_show_type,
  game_platform_cash_back_level
} = proxy.useDict('sys_effect_type', "game_show_type", "game_platform_cash_back_level");

const platformTypeList = ref([])
const memberReferralList = ref([])
const gameTypeList = ref([])

const loading = ref(false)
const open = ref(false)
const scheduleDialog = ref(false)

const ids = ref([]);
const total = ref(0);
const title = ref('');

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */
const showSearch = ref(true)

let schedule = ref('');


const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    gameType: null,
    referralAmountPercentage: null,
    referralBetMultiplier: null,
    effect: null
  },
  rules: {
    gameType: [
      {required: true, message: 'Game Type is needed', trigger: 'blur'}
    ],
    referralAmountPercentage: [
      {required: true, message: 'Referral Amount Percentage is needed', trigger: 'blur'}
    ],
    referralBetMultiplier: [
      {required: true, message: 'Referral Bet Multiplier is needed', trigger: 'blur'}
    ],
  },
  form: {},
  scheduleForm: {}
});
const {queryParams, rules, form, scheduleForm} = toRefs(data)

/**
 * 查询游戏字典列表 list of data
 */
function getList() {
  loading.value = true
  memberReferralListData(queryParams.value).then(res => {
    loading.value = false
    memberReferralList.value = res.data
    total.value = res.total
  })
}

/** 搜索按钮操作 handle query*/
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    level: 1,
    gameType: null,
    referralAmountPercentage: null,
    referralBetMultiplier: null,
    effect: null
  };
  proxy.resetForm("memberReferralFormRef");
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加";
}

/**
 * 修改游戏字典
 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value
  getMemberReferralData(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改游戏平台回扣百分比";
  });
}

function editScheduler() {

}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["memberReferralFormRef"].validate(valid => {
    if (valid) {
      for (const type of platformTypeList.value) {
        if (type.agent == form.value.agent) {
          form.value.platformName = type.name
        }
      }
      if (form.value.id != null) {
        updateMemberReferral(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMemberReferral(form.value).then(response => {
          proxy.$modal.msgSuccess(response.msg);
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除编号为"' + id + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return deleteMemberReferral(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}

function handleExport() {

}

function handleSetScheduler() {
  scheduleDialog.value = true;

}



function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleEffectChange(row) {
  let text = row.effect === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    const effect = changeMemberReferralStatus(row.id, row.effect);
    loading.value = true
    if (effect) {
      loading.value = false
      return effect
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
  })
}

// function getGamePlatformList() {
//   listAllPlatform().then(res => {
//     platformTypeList.value = res.data
//   })
// }

function getGameTypeList() {
  listAllType().then(response => {
    gameTypeList.value = response.data
  })
}

// getGamePlatformList();
getGameTypeList();
getList();
</script>
