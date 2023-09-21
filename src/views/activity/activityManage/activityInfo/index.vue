<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item prop="title" class="input-wd20">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入活动标题"
            clearable
            @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item prop="effect">
        <el-select v-model="queryParams.effect" placeholder="状态" clearable>
          <el-option
              v-for="dict in activityInfo_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="活动类型" prop="typeId">
        <el-select
            filterable
            v-model="queryParams.typeId"
            placeholder="请选择活动类型"
            clearable
            style="width: 240px">
          <el-option
              v-for="activityType in activityTypeOptions"
              :key="activityType.id"
              :label="activityType.name"
              :value="activityType.id"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['activity:activityInfo:add']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            size="small"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['activity:activityInfo:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            size="small"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['activity:activityInfo:remove']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['activity:activityInfo:export']">导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!-- display data into table-->
    <el-table v-loading="loading" :data="activityInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="标题" align="center" prop="title" min-width="180"/>
        <el-table-column label="图标" align="center" prop="icon">
          <template #default="scope">
            <el-image
                style="height: 50px;"
                :src="scope.row.icon"
                fit="contain">
            </el-image>
          </template>
        </el-table-column>
      <el-table-column label="活动详情" align="center" prop="content"  min-width="160">
        <template v-slot="{row}">
          <div v-html="row.content" style="max-height: 80px"></div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime"  min-width="160"/>
      <el-table-column label="活动类型" align="center" prop="typeId" :formatter="formatterActivityType"  min-width="160"/>
      <el-table-column label="跳转类型" align="center" prop="type" :formatter="formatterType"  min-width="160"/>
      <el-table-column label="图标跳转链接" align="center" prop="url"  min-width="160"/>
      <el-table-column label="状态" align="center" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :active-value="true"
              :inactive-value="false"
              @click="handleEffectChange(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort"  min-width="160"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="120">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['activity:activityInfo:edit']">修改
          </el-button>
          <el-button
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['activity:activityInfo:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="total"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[10,20,50]"
        @pagination="getList"
    />

    <!-- 添加或修改活动信息对话框  add or update -->
    <el-dialog :title="title" v-model="open" width="80%" style="height: auto;padding-bottom: 20px" append--body>
      <el-form ref="activityForm" :model="form" :rules="rules" label-width="120">
        <div class="el-row">
          <div class="el-col el-col-14">
            <el-form-item label="活动类型" prop="typeId">
              <el-select
                  filterable
                  v-model="form.typeId"
                  placeholder="请选择活动类型"
                  clearable
                  style="width: 350px">
                <el-option
                    v-for="activityType in activityTypeOptions"
                    :key="activityType.id"
                    :label="activityType.name"
                    :value="activityType.id"/>
              </el-select>
            </el-form-item><br>
            <el-form-item label="标题" prop="title">
              <el-input style="width: 350px" v-model="form.title" placeholder="请输入标题"/>
            </el-form-item> <br>

<!--            <el-form-item label="排序" prop="sort">-->
<!--              <el-input v-model="form.sort" placeholder="请输入排序" type="number"/>-->
<!--            </el-form-item>-->

            <el-form-item label="Schedule" prop="schedule">
              <div>
                <el-date-picker type="daterange"
                                v-model="selectDate"
                                start-placeholder="开始时间"
                                end-placeholder="开始时间"
                                range-separator="至"
                                clearable
                />
              </div>
            </el-form-item>
<!--         入款优惠 DEPOSIT TYPE -->
            <div v-if="form.typeId === 1">
              <el-form-item label="Scope" prop="scope">
                <el-select
                    filterable
                    v-model="form.scope"
                    placeholder="Please select deposit type"
                    clearable
                    style="width: 350px">
                  <el-option
                      label="First Deposit"
                      value="firstDeposit"
                  ></el-option>
                  <el-option
                      label="Total Deposit"
                      value="totalDeposit"
                  ></el-option>
                  <el-option
                      label="Single Recharge"
                      value="singleRecharge"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Deposit Method" prop="depositMethod">
                <el-select
                    filterable
                    v-model="form.depositMethod"
                    placeholder="Please select deposit method"
                    clearable
                    style="width: 350px">
                  <el-option
                      label="USDT"
                      value="usdt"
                  ></el-option>
                  <el-option
                      label="BTC"
                      value="btc"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Bonus Method" prop="bonusMethod">
                <el-select
                    filterable
                    v-model="form.bonusMethod"
                    placeholder="Please select bonus method"
                    clearable
                    style="width: 350px">
                  <el-option
                      label="Fixed Amount"
                      value="fixed"
                  ></el-option>
                  <el-option
                      label="Random Amount"
                      value="random"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Home Popup" label-width="120">
                <el-switch
                    v-model="form.notifySwitch"
                    class="ml-2"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                />
              </el-form-item>
              <el-form-item>
                <el-table :data="tableData" style="width: 70%" >
                  <el-table-column label="Deposit Amount" width="150" align="center" prop="depositAmount">
                    <template #default="scope">
                      <el-input v-model="scope.row.depositAmount" placeholder="Deposit Amount"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="Bonus Amount" width="150" align="center"  prop="bonusAmount">
                    <template #default="scope">
                      <el-input v-model="scope.row.bonusAmount" placeholder="Bonus Amount"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="Activity Description" width="150" align="center"  prop="activityDescription">
                    <template #default="scope">
                      <el-input v-model="scope.row.activityDescription" placeholder="Example Example"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="Operation" width="200" align="center" >
                    <template #default="scope">
                      <el-button @click="addDepositConfig">Add</el-button>
                      <el-button :disabled="tableData.length === 1" @click="removeDepositConfig( scope.$index )">Remove</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </div>
            <div v-if="form.typeId === 2">
              <el-form-item label="Sign Method" prop="signMethod">
                <el-select
                    filterable
                    v-model="form.bonusMethod"
                    placeholder="Please select sign method"
                    clearable
                    style="width: 350px">
                  <el-option
                      label="Continuous Check-ins"
                      value="continuous"
                  ></el-option>
                  <el-option
                      label="Cumulative Check-ins"
                      value="cumulative"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Cycle" prop="cycle">
                  <el-input style="width: 350px" v-model="form.cycle" placeholder="Please enter a number of days" @change="signInConfig(form.cycle)"/>
              </el-form-item>
              <el-form-item>
                <el-table :data="signInData" style="width: 70%" >
                  <el-table-column label="Day" width="70" align="center" prop="day">
                    <template #default="scope">
                      {{ scope.row.day }}
                    </template>
                  </el-table-column>
                  <el-table-column label="Type" width="100px" align="center"  prop="type">
                    <template #default="scope">
                      <el-select
                          filterable
                          v-model="scope.row.type"
                          style="width: 100px"
                          @change="handleChangeType(scope)"
                      >
                        <el-option
                            label="Fixed"
                            value="1"
                        ></el-option>
                        <el-option
                            label="Random"
                            value="2"
                        ></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="Reward Amount" width="130" align="center">
                    <template #default="scope">
                      <template v-if="scope.row.type === '1'">
                        <el-input v-model="scope.row.rewardAmount.max"/>
                      </template>
                      <template v-else>
                        <el-input style="width: 50px" v-model="scope.row.rewardAmount.min"/>
                        <el-input style="width: 50px; left: 10px" v-model="scope.row.rewardAmount.max"/>
                      </template>
                    </template>
                  </el-table-column>
                  <el-table-column label="Top-up Requirement" width="160" align="center"  prop="topUpRequirement">
                    <template #default="scope">
                      <el-input v-model="scope.row.topUpRequirement"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="Coding Requirement" width="160" align="center"  prop="codingRequirement">
                    <template #default="scope">
                      <el-input v-model="scope.row.codingRequirement"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="Check-in Icon" width="120px" align="center">
                    <template #default="scope">
                      <div class="demo-image">
                        <el-image style="width: 100px; height: 100px" :src="scope.row.iconUrl" fit="fill" />
                      </div>
                    </template>

                  </el-table-column>
                </el-table>
              </el-form-item>
            </div>

        </div>
          <div class="el-col el-col-8">
            <el-form-item label="图标" prop="icon">
              <imageUpload v-model="form.icon" path="ActivityInfo"/>
            </el-form-item>
          </div>
        </div>

        <el-form-item label="跳转类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="0">活动详情</el-radio>
            <el-radio label="1">跳转链接</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="活动详情" prop="content" v-if="form.type == 0">
          <WangEditor v-model="form.content" image-path="ActivityInfo"/>
        </el-form-item>
        <el-form-item label="跳转链接" prop="url" v-if="form.type == 1">
          <el-input v-model="form.url" placeholder="请输入图标跳转链接"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="ActivityInfo" setup>

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  activityInfoAdd,
  activityInfoDelete,
  activityInfoExport, activityInfoFindById, activityInfoUpdate,
  activityInfoUpdateStatus,
  getActivityInfoList
} from "@/api/activity/ativityInfo";
import {getActivityTypeAllList} from "@/api/activity/activityType";
import WangEditor from "@/components/WangEditor";

const {proxy} = getCurrentInstance();

/** 活动信息表格数据 */
const activityInfoList = ref([]);
/** 活动类型 activity type list */
const activityTypeOptions = ref([]);
const ids = ref([]);
const total = ref(0);
const title = ref();
const tableData = ref([
  {
    depositAmount: null,
    bonusAmount: null,
    activityDescription: null,
  }
]);
const signInData = ref([]);

/** 非单个禁用 */
const single = ref(true)
/** 非多个禁用 */
const multiple = ref(true)
/** 显示搜索条件 */
const showSearch = ref(true)

const loading = ref(true)
const open = ref(false)
const selectDate = ref(false)

const data =  reactive({
  /**查询参数 */
  queryParams:{
    pageNum: 1,
    pageSize: 10,
    title: null,
    createTime: null,
    effect: null,
    icon:null,
    type:null,
    typeId:null
  },
  selectDate: [],
  form:{},

  rules:{
    title: [
      {required: true, message: "标题不能为空", trigger: "blur"}
    ],
    icon: [
      {required: true, message: "图标不能不上传", trigger: "blur"}
    ],
    typeId: [
      {required: true, message: "活动类型不能为空", trigger: "blur"}
    ],
    type: [
      {required: true, message: "跳转类型不能为空", trigger: "blur"}
    ]
  },
  /** updateTime */
  // updateTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
});
const {queryParams,form,rules} = toRefs(data);

const {activityInfo_status} = proxy.useDict("activityInfo_status")


/**
 * 查询活动信息列表 get list of data
 */
function getList(){
  loading.value = true
  getActivityInfoList(proxy.addDateRange(queryParams.value)).then((res)=>{
    activityInfoList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

function signInConfig(days){
  signInData.value = []
  for ( let i = signInData.value.length; i < days; i++ ) {
    signInData.value.push(
        {
          day: i+1,
          type: '1',
          rewardAmount: {
            min: 0.01,
            max: 1
          },
          topUpRequirement: 0,
          codingRequirement: 0,
          iconUrl: 'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdjb1.png'
        }
    )
  }
}

function addDepositConfig(){
  tableData.value.push(
      {
        depositAmount: null,
        bonusAmount: null,
        activityDescription: null,
      }
  )
}

function removeDepositConfig(index){
  console.log( index )
  tableData.value.splice( index, 1 )
}


function activityTypeList(){
  getActivityTypeAllList().then((res)=>{
    activityTypeOptions.value = res
  })
}

function handleChangeType(scope){
  if( scope.row.type === '1' ) {
    scope.row.iconUrl = 'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdjb1.png';
  } else {
    scope.row.iconUrl = 'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx1.png';
  }
}

/**  多选框选中数据 select multiple rows*/
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 0=活动详情 1=跳转链接 */
function formatterType(row) {
  if (row.type == 0) {
    return '活动详情'
  } else if (row.type == 1) {
    return '跳转链接'
  } else {
    return ''
  }
}

function formatterActivityType(row) {
  for (const a of activityTypeOptions.value) {
    if (a.id === row.typeId) {
      return a.name;
    }
  }
  return "";
}


/** 搜索按钮操作 handle query*/
function handleQuery(){
  queryParams.pageNum = 1;
  getList()
}

/** 搜索按钮操作 handle query*/
function resetQuery(){
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false;
}
/** 表单重置 reset form*/
function reset() {
  form.value = {
    title: null,
    createTime: null,
    type: null,
    typeId:null,
    content: '',
    url: null,
    icon:null,
    sort : null,
    scope: null,
    depositMethod: null,
    bonusMethod: null,
    notifySwitch: true,
    signMethod: null,
    cycle: null,
  };
  proxy.resetForm("activityForm");
}

/** 新增按钮操作 handle add button*/
function handleAdd(){
  reset()
  open.value = true
  title.value = "添加活动信息"
}


/** 修改按钮操作 handle update*/
function handleUpdate(row){
  reset();
  const id = row.id ||ids.value
  activityInfoFindById(id).then(response => {
    response.data.type = response.data.type + ""
    form.value = response.data;
    open.value = true;
    title.value = "修改活动信息";
  });
}

/** 提交按钮 submit form*/
function submitForm(){
  proxy.$refs["activityForm"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        activityInfoUpdate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        activityInfoAdd(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}


/** 删除按钮操作 handle delete data */
function handleDelete(row){
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除"' + row.title + '"?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return activityInfoDelete(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  })
}

/** 导出按钮操作 handle export data*/
function handleExport(){
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return activityInfoExport(proxy.addDateRange(queryParams.value,updateTime.value));
  }).then(response => {
    proxy.downloadExcel(response, '活动信息')
  }).catch(() => {
  })
}


/**  0停用1启用 */
function handleEffectChange(row){
  let text = row.status === '1' ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return activityInfoUpdateStatus(row.id, row.effect)
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.status = row.status === '0' ? '1' : '0'
  })
}

getList()
activityTypeList()
</script>

<style scoped>
.dialog-footer{
  float: right;
}
.demo-image {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  display: inline-block;
  width: 20%;
  box-sizing: border-box;
  vertical-align: top;
}
.demo-image {
  border-right: none;
}
.demo-image{
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
</style>