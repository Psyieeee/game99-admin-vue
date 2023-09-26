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
            <el-form-item label="Schedule" prop="schedule">
              <div>
                <el-date-picker type="daterange"
                                v-model="form.selectDate"
                                start-placeholder="开始时间"
                                end-placeholder="开始时间"
                                range-separator="至"
                                clearable
                />
              </div>
            </el-form-item>
<!--         入款优惠 DEPOSIT TYPE -->
            <div v-if="form.typeId === 1">
              <el-form-item label="Reset Cycle" prop="resetCycle" @change="handleResetCycleChange(events.deposit.resetCycle)">
                <el-radio-group v-model="events.deposit.resetCycle">
                  <el-radio label="1">Single</el-radio>
                  <el-radio label="2">Daily</el-radio>
                  <el-radio label="3">Weekly</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="events.deposit.resetCycle !== '1'" label="Limited Recharge" label-width="160">
                <el-switch
                    v-model="events.deposit.limitedRechargeSwitch"
                    class="ml-2"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                />
              </el-form-item>
              <el-form-item label="Activity Condition" prop="activityCondition">
                <el-radio-group v-model="events.deposit.activityCondition">
                  <el-radio v-if="events.deposit.resetCycle === '1'" label="1">First Deposit</el-radio>
                  <el-radio label="2">Total Deposit</el-radio>
                  <el-radio label="3">Single Recharge</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item v-if="events.deposit.activityCondition !== '1'" label-width="120" label="Deposit Method" prop="depositMethod">
                <el-checkbox v-model="selectAllDepositMethod" @change="handleDepositSelectAll" style="padding-right: 10px">Select All</el-checkbox>
                  <el-checkbox-group v-model="events.deposit.depositMethod">
                    <el-checkbox v-for="item in depositOptions"
                                 :label="item.value"
                                 size="large"
                                 style="width: auto"
                    >
                      {{ item.name }}
                    </el-checkbox>
                  </el-checkbox-group>
              </el-form-item>
              <el-form-item v-if="events.deposit.activityCondition === '1' " label="Home Popup" label-width="120">
                <el-switch
                    v-model="events.deposit.notifySwitch"
                    class="ml-2"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                />
              </el-form-item>
              <el-form-item label="Bonus Method" prop="bonusMethod">
                <el-radio-group v-model="events.deposit.bonusMethod">
                  <el-radio label="1">Fixed Amount</el-radio>
                  <el-radio label="2">Random Amount</el-radio>
                  <el-radio label="3">Ratio Amount</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-table :data="depositData" style="width: 70%" >
                  <el-table-column label="Deposit Amount" width="150" align="center" prop="depositAmount">
                    <template #default="scope">
                      <el-input v-model="scope.row.depositAmount" placeholder="Deposit Amount"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="Bonus Amount" width="150" align="center">
                    <template #default="scope">
                      <template v-if="events.deposit.bonusMethod === '1'">
                        <el-input v-model="scope.row.bonusAmount.max"/>
                      </template>
                      <template v-else-if="events.deposit.bonusMethod === '2'">
                        <el-input style="width: 50px; right: 5px" v-model="scope.row.bonusAmount.min"/>
                        -
                        <el-input style="width: 50px; left: 5px" v-model="scope.row.bonusAmount.max"/>
                      </template>
                      <template v-else>
                        <el-input style="width: 65px" v-model="scope.row.bonusAmount.max"/>
                        <el-input :disabled="true" placeholder="%" style="width: 35px"/>
                      </template>
                    </template>
                  </el-table-column>
                    <el-table-column v-if="events.deposit.bonusMethod === '3'" label="Reward Limit" width="110px" align="center" prop="rewardLimit">
                      <template #default="scope">
                        <el-input v-model="scope.row.rewardLimit"/>
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
                      <el-button :disabled="depositData.length === 1" @click="removeDepositConfig( scope.$index )">Remove</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </div>
<!--         SIGN IN -->
            <div v-if="form.typeId === 2">
              <el-form-item label="Sign Method" prop="signMethod">
                <el-radio-group v-model="events.signIn.signMethod">
                  <el-radio label="1">Continuous</el-radio>
                  <el-radio label="2">Cumulative</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Cycle" prop="cycle">
                  <el-input style="width: 350px" v-model="events.signIn.cycle" placeholder="Please enter a number of days" @change="signInConfig(events.signIn.cycle)"/>
              </el-form-item>
              <el-form-item>
                <el-table :data="signInData" style="width: 80%" >
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
                  <el-table-column label="Reward Amount" width="150" align="center">
                    <template #default="scope">
                      <template v-if="scope.row.type === '1'">
                        <el-input v-model="scope.row.rewardAmount.max"/>
                      </template>
                      <template v-else>
                        <el-input style="width: 50px; right: 5px" v-model="scope.row.rewardAmount.min"/>
                        -
                        <el-input style="width: 50px; left: 5px" v-model="scope.row.rewardAmount.max"/>
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
                  <el-table-column label="Check-in Icon" align="center" width="180">
                    <template #default="scope">
                      <el-select
                          filterable
                          v-model="scope.row.iconUrl"
                          style="width: 120px"
                      >
                        <template #prefix>
                          <el-image style="width: 80px; height: 80px; margin-left: 10px" :src="scope.row.iconUrl"/>
                        </template>
                        <el-option
                            label=" "
                            v-for="icon in ( scope.row.type === '1' ? coinIcons : treasureIcons)"
                            :value="icon"
                            style="width: 120px; height: 100px; margin-left: -15px"
                        >
                          <el-image style="width: 100px; height: 100px" :src="icon" fit="fill" />
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
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

        </div>
          <div class="el-col el-col-8">
            <div>
              <label style="font-size: 25px; text-align: left">Create Banner</label>
              <el-radio-group style="float: right;" v-model="createBanner.type">
                <el-radio style="width: 120px" label="1" border>Customize</el-radio>
                <el-radio style="width: 120px" label="2" border>Pre-Made</el-radio>
              </el-radio-group><hr style="margin-top: 20px; margin-bottom: 20px">
            </div>
            <label style="font-size: 20px">Preview</label>

            <div v-loading="loading" v-if="createBanner.type === '1'">
              <div class="preview" style="position: relative" id="original">
                <div :style="`background-color: ${createBanner.customImage.background}`">
                  <div style="display: inline-flex; justify-content: center; height: 250px; align-items: center">
                    <img :src="createBanner.customImage.icon" style=" margin-right: 10px;width: 230px; height: 230px"/>
                  </div>
                  <pre :style="`display: inline-block; margin-top: 20px; position: absolute; color: ${createBanner.textStyle.color}; font-family: ${createBanner.textStyle.font}; font-size: ${createBanner.textStyle.size}px`">{{createBanner.customImage.text}}</pre>
                </div>
              </div><hr style="margin-top: 20px">
              <div id="canvas">
              </div>
              <button @click="convert">Convert</button>
              <div class="form-group">
                <label for="background">Background Color:</label>
                <input style="margin-left: 10px; width: 100px; border: 2px solid #000000"
                       v-model="createBanner.customImage.background" type="color" id="background"/>
              </div>
              <div class="form-group">
                <label>Select Icon:</label><hr>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr);">
                  <div v-for="(icon, index) in createBanner.iconCollection"
                       :key="index"
                       @click="selectIcon(icon)"
                       :class="{ 'selected-image' : icon === createBanner.selectedIcon }"
                       style="cursor: pointer;">
                    <img :src="icon" alt="Icon" style="max-height: 70px; max-width: 70px;" />
                  </div>
                </div>
                <div class="pagination" style="margin-top: 10px">
                  <button @click="prevPage(1)">Previous</button>
                  <button style="margin-left: 10px" @click="nextPage(1)">Next</button>
                  <span> Page:  {{ createBanner.icon_currentPage  }} / {{Math.ceil(icons.length / createBanner.iconsPerPage)}}</span>
                  <input style="float: right" type="file" id="imageUpload" accept="image/* " @change="populateForm">
                  <button style="float: right; margin-right: 10px" class="upload-button" @click="removeImage(1)">Remove</button>
                </div>
              </div><hr>

              <div class="form-group">
                <p>Event Description:</p>
                <label for="font">Font: </label>
                <el-select style="width: 200px" v-model="createBanner.textStyle.font">
                  <el-option v-for="font in fontOptions" :key="font" :label="font" :value="font"></el-option>
                </el-select>
                <label for="text" style="margin-left: 20px">Font Color:</label>
                <input style="margin-left: 10px; width: 100px; border: 2px solid #000000" v-model="createBanner.textStyle.color" type="color" id="text"/>
                <div style="margin-top: 10px">
                  <label for="text">Text Size: </label>
                  <el-slider
                      v-model="createBanner.textStyle.size"
                      :min="8"
                      :max="48"
                      style="width: 300px"
                  >
                  </el-slider>
                </div>
                <div>
                  <textarea style="height: 100px;width: 300px; margin-top: 5px" v-model="createBanner.customImage.text">
                  </textarea>
                </div>
              </div>
            </div>

            <div v-if="createBanner.type === '2'">
              <div class="preview">
                <img :src="banner" style="width: 560px "/>
              </div><hr style="margin-top: 20px; margin-bottom: 20px" >

              <div class="form-group">
                <label style="margin-bottom: 20px">Select Banner:</label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 10px">
                  <div v-for="(image, index) in createBanner.bannerCollection"
                       :key="index"
                       @click="selectBanner(image)"
                       :class="{ 'selected-image': image === createBanner.selectedBanner }"
                       style="cursor: pointer;">
                    <img :src="image" alt="Banner" style="max-height: 250px; max-width: 300px" />
                  </div>
                </div>
                <div class="pagination" style="margin-top: 10px">
                  <button @click="prevPage(2)">Previous</button>
                  <button style="margin-left: 10px" @click="nextPage(2)">Next</button>
                  <span> Page:  {{ createBanner.banner_currentPage  }} / {{Math.ceil(banners.length / createBanner.bannersPerPage)}}</span>
                  <input style="float: right" type="file" id="imageUpload" accept="image/* " @change="populateForm">
                  <button style="float: right; margin-right: 10px" class="upload-button" @click="removeImage">Remove</button>
                </div>
              </div><hr>
              <imageUpload v-model="form.icon" path="ActivityInfo"/>
            </div>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="ActivityInfo" setup>
import {url} from "@/utils/url";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {
  activityInfoAdd,
  activityInfoDelete,
  activityInfoExport,
  activityInfoFindById,
  activityInfoUpdate,
  activityInfoUpdateStatus,
  getActivityInfoList,
  getAllEventsBanner,
  getAllEventsIcon,
  removeEventsBanner,
  removeEventsIcon,
  uploadEventsBanner,
  uploadEventsIcon
} from "@/api/activity/ativityInfo";
import html2canvas from 'html2canvas';
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

const coinIcons = ref([
    'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdjb1.png',
    'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdjb2.png',
    'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdjb3.png',
    'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdjb4.png',
    'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdjb5.png',
    'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdjb6.png'
])
const treasureIcons = ref([
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx1.png',
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx2.png',
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx3.png',
])

const banners = ref([])
const icons = ref( [])

const fontOptions = ref([
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Georgia, serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
  "Trebuchet MS, sans-serif",
  "Arial Black, sans-serif",
  "Impact, sans-serif",
  "Comic Sans MS, cursive",
  "Palatino, serif",
  "Garamond, serif",
  "Book Antiqua, serif",
  "Lucida Sans Unicode, sans-serif",
  "Lucida Console, monospace",
  "Tahoma, sans-serif",
  "Geneva, sans-serif",
  "Courier, monospace",
  "MS Sans Serif, sans-serif",
  "MS Serif, serif",
])


const depositOptions = ref([
  {
    name: 'PIX',
    value: 2
  },
  {
    name: 'USDT-Trc20',
    value: 3
  },
  {
    name: 'BRL',
    value: 4
  },
  {
    name: 'USDC-Trc20',
    value: 5
  },
  {
    name: 'BTC-Bitcoin',
    value: 6
  }
])

const depositData = ref([
  {
    depositAmount: null,
    bonusAmount: {
      min: null,
      max: null
    },
    activityDescription: null,
    rewardLimit: null
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
const selectAllDepositMethod = ref(false)

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
  events: {
    deposit: {
      resetCycle: '1',
      limitedRechargeSwitch: false,
      activityCondition: '1',
      depositMethod: [],
      notifySwitch: false,
      bonusMethod: '1',
      tableData: depositData,
    },
    signIn:{
      signMethod: '1',
      cycle: null,
      signInData: signInData
    }
  },
  createBanner: {
    type: '1',
    iconCollection: icons.value.slice(0,10),
    icon_currentPage: 1,
    iconsPerPage: 10,
    selectedIcon: null,
    bannerCollection: null,
    banner_currentPage: 1,
    bannersPerPage: 6,
    selectedBanner: null,
    textStyle: {
      font: "Arial, sans-serif",
      size: 30,
      color: '#ffffff'
    },
    customImage: {
      background: '#030303',
      icon: null,
      text: 'PUT TEXT HERE',
    },
  },
  banner: null,
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
const {queryParams,form,rules, banner, events, createBanner} = toRefs(data);
const {activityInfo_status} = proxy.useDict("activityInfo_status")
const formData = new FormData();

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
          iconUrl: coinIcons.value[0]
        }
    )
  }
}

function addDepositConfig(){
  depositData.value.push(
      {
        depositAmount: null,
        bonusAmount: {
          min: null,
          max: null
        },
        activityDescription: null,
        rewardLimit: null
      }
  )
}

function removeDepositConfig(index){
  depositData.value.splice( index, 1 )
}


function activityTypeList(){
  getActivityTypeAllList().then((res)=>{
    activityTypeOptions.value = res
  })
}

function handleChangeType(scope){
  scope.row.iconUrl = ( scope.row.type === '1' ? coinIcons : treasureIcons ).value[0]
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
    selectDate: [],
    type: null,
    content: '',
    url: null,
    typeId: 1,
    event: null,
    configString: '',
    icon: null,
    sort : null,
    creationType: '1'
  };
  proxy.resetForm("activityForm");
}

/** 新增按钮操作 handle add button*/
function handleAdd(){
  reset()
  open.value = true
  title.value = "添加活动信息"
  getAllEventsIcon().then(res => {
    res.data = res.data.map( img => prependActivityInfoImageBaseURI( img ) )
    icons.value = res.data;
    createBanner.value.customImage.icon = icons.value[0]
    createBanner.value.iconCollection = icons.value.slice(0,10)
  })

  getAllEventsBanner().then(res => {
    banners.value = res.data;
    banner.value = banners.value[0];
    createBanner.value.bannerCollection = banners.value.slice(0,6);
  })
}

function prependActivityInfoImageBaseURI(img) {
  return url.baseUrl + url.game99PlatformAdminWeb + "/activity/activityInfo/image?url=" + img;
}

function handleResetCycleChange(resetCycle) {
  if ( resetCycle === '2') {
    events.value.deposit.activityCondition = '2'
  }
}

function handleDepositSelectAll(){
  if (selectAllDepositMethod.value) {
    events.value.deposit.depositMethod = depositOptions.value.map(item => item.value)
  } else {
    events.value.deposit.depositMethod = []
  }
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

function prevPage(actionType){
  event.preventDefault();
  let imagesPerPage = actionType === 1 ? createBanner.value.iconsPerPage : createBanner.value.bannersPerPage;
  let currentPage   = actionType === 1 ? createBanner.value.icon_currentPage : createBanner.value.banner_currentPage;
  if ( currentPage > 1){
    currentPage--;
    let start = ( currentPage * imagesPerPage) - imagesPerPage;
    let end = start + imagesPerPage;
    if ( actionType === 1 ) {
      createBanner.value.icon_currentPage = currentPage;
      createBanner.value.iconCollection = icons.value.slice(start,end)
    } else {
      createBanner.value.banner_currentPage = currentPage;
      createBanner.value.bannerCollection = banners.value.slice(start,end)
    }
  }
}

function nextPage(actionType) {
  event.preventDefault();
  let currPage   = actionType === 1 ? createBanner.value.icon_currentPage : createBanner.value.banner_currentPage;
  let imgPerPage = actionType === 1 ? createBanner.value.iconsPerPage : createBanner.value.bannersPerPage;
  let images     = actionType === 1 ? icons.value : banners.value;
  let maxPage    = Math.ceil(images.length / imgPerPage );

  if (currPage >= maxPage){
    return
  }
  currPage++;

  let start = ( currPage * imgPerPage) - imgPerPage;
  let end = start + imgPerPage;

  if ( actionType === 1 ) {
    createBanner.value.icon_currentPage = currPage;
    createBanner.value.iconCollection = icons.value.slice(start,end)
  } else {
    createBanner.value.banner_currentPage= currPage;
    createBanner.value.bannerCollection = banners.value.slice(start,end)
  }
}

function populateForm( event ) {
  loading.value = true
  formData.set( "file", event.currentTarget.files[0] )
  if ( createBanner.value.type === 1 ) {
    uploadEventsIcon( formData ).then( res => {
      getAllEventsIcon().then(res => {
        icons.value = res.data;
        createBanner.value.customImage.icon = icons.value[0]
        createBanner.value.iconCollection = icons.value.slice(0,10)
        loading.value = false
      })
    })
  } else {
    uploadEventsBanner( formData ).then( res => {
      getAllEventsBanner().then(res => {
        banners.value = res.data;
        banner.value = banners.value[0];
        createBanner.value.bannerCollection = banners.value.slice(0,6);
        loading.value = false
      })
    })
  }

}

function selectIcon (icon){
  createBanner.value.selectedIcon = icon
  createBanner.value.customImage.icon = icon
}
function selectBanner (image){
  createBanner.value.selectedBanner = image
  banner.value = image
}

/** 提交按钮 submit form*/
function submitForm(){
  proxy.$refs["activityForm"].validate(async valid => {
    if (valid) {
      if ( createBanner.value.type === '1' ) {
        const container = document.getElementById('original');
        await html2canvas( container ).then( function (canvas) {
          form.value.icon = canvas.toDataURL('image/png');
        });
      } else {
        form.value.creationType = createBanner.value.type
        form.value.icon = banner.value
      }

      switch ( form.value.typeId ) {
        case 1:
          form.value.event = events.value.deposit
          break;
        case 2:
          form.value.event = events.value.signIn
          break;
      }
      form.value.configString = JSON.stringify( form.value.event )
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

function convert() {
  event.preventDefault();
  const container = document.getElementById('original');
  html2canvas(container).then( function (canvas) {
    const dataURL = canvas.toDataURL('image/png');
    const img = new Image();
    img.src = dataURL;
    document.body.appendChild(img);
    console.log(img)
  });
}

function removeImage(){
  event.preventDefault();
  loading.value = true
  if ( createBanner.value.type === 1 ) {
    removeEventsIcon(createBanner.value.selectedIcon).then( res => {
      getAllEventsIcon().then(res => {
        icons.value = res.data;
        createBanner.value.customImage.icon = icons.value[0]
        createBanner.value.iconCollection = icons.value.slice(0,10)
        loading.value = false
      })
    })
  } else {
    removeEventsBanner(createBanner.value.selectedBanner).then( res => {
      getAllEventsBanner().then(res => {
        banners.value = res.data;
        banner.value = banners.value[0];
        createBanner.value.bannerCollection = banners.value.slice(0,6);
        loading.value = false
      })
    })
  }
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
body {
  font-family: 'LocalMarket-Bold';
}

section {
  display: flex;
  justify-content: center;
}

img {
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
}

.form-group {
  margin-bottom: 20px;
}
.preview {
  height: 300px;
  max-width: 600px;
  margin-top: 10px;
  padding: 20px;
  border: 1px solid #ccc;
}
.icon {
  font-size: 24px;
}
.text {
  font-size: 18px;
}

.selected-image {
  border: 2px solid #00dfff;
}

#original {
  position: relative;
  overflow: hidden;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
  height: 300px;
  width: 300px;
}



</style>