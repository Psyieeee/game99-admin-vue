<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item prop="title" class="input-wd20">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入活动标题"
            clearable
            @keyup.enter="handleSearchQuery"/>
      </el-form-item>
      <el-form-item prop="effect">
        <el-select v-model="queryParams.effect" placeholder="状态" clearable>
          <el-option label="Disabled" value="0"></el-option>
          <el-option label="Enabled" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="活动类型" prop="typeId">
        <el-select
            filterable
            v-model="queryParams.typeId"
            placeholder="请选择活动类型"
            clearable
            style="width: 350px">
          <el-option
              v-for="bonusType in vipBonusTypes"
              :key="bonusType.id"
              :label="bonusType.name"
              :value="bonusType.id"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleSearchQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="handleResetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            :disabled="isButtonDisabled"
            @click="handleAddBonusActivity"
            v-hasPermi="['config:vipBonusInfo:add']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            size="small"
            :disabled="single"
            @click="handleUpdateForm"
            v-hasPermi="['config:vipBonusInfo:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            size="small"
            :disabled="multiple"
            @click="handleDeleteTableData"
            v-hasPermi="['config:vipBonusInfo:remove']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            @click="handleExportData"
            v-hasPermi="['config:vipBonusInfo:export']">导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="listVipBonusActivities"></right-toolbar>
    </el-row>

<!-- display data into table-->
    <el-table v-loading="loading" :data="vipBonusInfoList" @selection-change="handleMultipleSelection">
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
      <el-table-column label="跳转类型" align="center" prop="jumpType" :formatter="formatterType"  min-width="160"/>
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="120">
        <template #default="scope">
          <el-button
              :disabled="isButtonDisabled"
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdateForm(scope.row)"
              v-hasPermi="['config:vipBonusInfo:edit']">修改
          </el-button>
          <el-button
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="handleDeleteTableData(scope.row)"
              v-hasPermi="['config:vipBonusInfo:remove']">删除
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
        :page-sizes="[10,20,50]"
        @pagination="listVipBonusActivities"
    />

<!-- Dialog: Add / Update -->
    <el-dialog
        :title="title"
        v-model="open"
        width="80%"
        style="height: auto;
        padding-bottom: 20px"
        append--body
        @closed="handleClosedForm"
        @open="handleOpenForm"
        :close-on-press-escape-key="false"
        :close-on-click-modal="false"
    >
      <el-form ref="vipBonusForm" :model="form" :rules="rules" label-width="120">
        <div class="el-row">
<!-- Configurations -->
          <div class="el-col el-col-14">
            <label style="font-size: 25px; text-align: left">Basic Config</label>
            <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">

            <el-form-item label="Bonus Type" prop="typeId">
              <el-select
                  filterable
                  v-model="form.typeId"
                  placeholder="请选择活动类型"
                  clearable
                  style="width: 350px">
                <el-option
                    v-for="bonusType in vipBonusTypes"
                    :key="bonusType.id"
                    :label="bonusType.name"
                    :value="bonusType.id"/>
              </el-select>
            </el-form-item><br>
            <el-form-item label="Title" prop="title">
              <el-input style="width: 350px" v-model="form.title" placeholder="请输入标题"/>
            </el-form-item> <br>
            <el-form-item label="Schedule Type" prop="scheduleType">
              <el-radio-group v-model="form.scheduleType">
                <el-radio label="1">Fixed Time</el-radio>
                <el-radio label="2">Permanent</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-show="form.scheduleType === '1'" label="Effective Time" prop="dateRange" >
              <div>
                <el-date-picker type="daterange"
                                v-model="dateRange"
                                start-placeholder="开始时间"
                                end-placeholder="开始时间"
                                range-separator="至"
                                clearable
                                format="YYYY-MM-DD"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                @change="calculateNumberOfDays"/>
              </div>
            </el-form-item>
            <el-form-item v-show="form.scheduleType === '2'" label="Start Date" prop="startDate">
              <el-date-picker type="date"
                              v-model="form.startEffect"
                              placeholder="开始时间"
                              format="YYYY-MM-DD"
                              value-format="YYYY-MM-DD HH:mm:ss"
                              clearable>
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Home Popup" label-width="120">
              <el-switch
                  v-model="form.isDisplayHome"
                  class="ml-2"
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              />
            </el-form-item>

            <label style="font-size: 25px; text-align: left">{{ vipBonusTypes.find((type) => type.id === form.typeId).name + ' Config'}}</label>
            <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">

<!-- Sign in Config -->
            <div v-if="form.typeId === 1">
              <el-form-item label="Collect Method" prop="collectMethod">
                <el-radio-group v-model="configurations.signIn.collectMethod">
                  <el-radio label="1">Continuous</el-radio>
                  <el-radio label="2">Cumulative</el-radio>
                  <el-radio label="3">Corresponding Day</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Cycle" prop="cycle">
                  <el-input style="width: 350px" v-model="configurations.signIn.cycle" placeholder="Please enter a number of days" @change="populateSignInConfigTable(configurations.signIn.cycle)"/>
              </el-form-item>
              <el-form-item label="Custom Day" prop="customDay" @change="populateSignInConfigTable(configurations.signIn.cycle)">
                <el-radio-group v-model="configurations.signIn.customDay" >
                  <el-radio label="1">Enable</el-radio>
                  <el-radio label="2">Disable</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="VIP Level">
                <el-select
                    v-model="configurations.vipLevel"
                    filterable
                    clearable
                    style="width: 350px"
                    @change="handleVipLevelChange"
                >
                  <el-option
                      v-for="i in 31"
                      :key="i"
                      :label="'VIP ' + (i - 1) "
                      :value="i - 1"
                  ></el-option>
                </el-select>
                <div style="padding-left: 10px">
                  <el-button type="primary" size="small" @click="saveSignInConfig">Save</el-button>
                  <el-button icon="Refresh" size="small" @click="resetSignInConfig">Reset</el-button>
                </div>
              </el-form-item>
              <el-form-item >
                <el-table :data="dailyData" style="width: 80%" >
                  <el-table-column label="Day" width="70" align="center" prop="day">
                      <template #default="scope">
                        <div v-if="configurations.signIn.customDay === '1'">
                          <el-input v-model="scope.row.day"/>
                        </div>
                        <div v-else>
                          {{ scope.row.day }}
                        </div>
                      </template>
                  </el-table-column>
                  <el-table-column label="Reward Type" width="110px" align="center"  prop="rewardType">
                    <template #default="scope">
                      <el-select
                          filterable
                          v-model="scope.row.rewardType"
                          style="width: 100px"
                          @change="handleRewardChangeType(scope)"
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
                      <template v-if="scope.row.rewardType === '1'">
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
                          <el-image style="width: 50px; height: 50px; margin-top: 5px; margin-bottom: 5px; margin-left: 10px " :src="scope.row.iconUrl"/>
                        </template>
                        <el-option
                            label=" "
                            v-for="icon in ( scope.row.rewardType === '1' ? configurations.rewardIcons : treasureIcons)"
                            :value="icon"
                            style="width: 120px; height: 100px; margin-left: -15px"
                        >
                          <el-image style="width: 50px; height: 50px;margin-top: 10px; margin-left: 25px" :src="icon"  />
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </div>

<!-- Other Config -->
            <label style="font-size: 25px; text-align: left">Other Config</label>
            <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">
            <el-form-item label="Jump Type" prop="jumpType">
              <el-radio-group v-model="form.jumpType">
                <el-radio label="0">Bonus Activity Details</el-radio>
                <el-radio label="1">Jump Link</el-radio>
              </el-radio-group>
            </el-form-item>
<!-- Jump Type -->
            <div style="max-width: 1000px">
              <el-form-item label="Content" prop="content" v-if="form.jumpType === '0'">
                <WangEditor v-model="form.content" image-path="VipBonusInfo"/>
              </el-form-item>
              <el-form-item label="Url" prop="url" v-if="form.jumpType === '1'">
                <el-input v-model="form.url" placeholder="请输入图标跳转链接"/>
              </el-form-item>
            </div>
          </div>
<!-- Banner Creation -->
          <div class="el-col el-col-8">
            <label style="font-size: 25px; text-align: left">Create Banner</label>
            <el-radio-group style="float: right;" v-model="createBanner.type" @change="getBannerCreationRelatedImages(1)">
              <el-radio style="width: 120px" label="1" border>Customize</el-radio>
              <el-radio style="width: 120px" label="2" border>Pre-Made</el-radio>
            </el-radio-group><hr style="margin-top: 20px; margin-bottom: 20px">
            <label style="font-size: 20px">Preview</label>
<!-- Customize -->
            <div v-if="createBanner.type === '1'">
              <div class="preview" style="position: relative" id="original">
                <div :style="`background-color: ${createBanner.customize.properties.background}`">
                  <div style="display: inline-flex; justify-content: center; height: 250px; align-items: center">
                    <img :src="createBanner.customize.properties.icon" style=" margin-right: 10px;width: 230px; height: 230px"/>
                  </div>
                <pre :style="`display: inline-block; margin-top: 20px; position: absolute; color: ${createBanner.customize.properties.textStyle.color}; font-family: ${createBanner.customize.properties.textStyle.font}; font-size: ${createBanner.customize.properties.textStyle.size}px`">{{createBanner.customize.properties.text}}</pre>
              </div>
            </div><hr style="margin-top: 20px">
              <div id="canvas"></div>
              <div class="form-group">
                <label for="background">Background Color:</label>
                <input style="margin-left: 10px; width: 100px; border: 2px solid #000000"
                       v-model="createBanner.customize.properties.background" type="color" id="background"/>
              </div>
              <div class="form-group">
                <label>Select Icon:</label><hr>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr);">
                  <div v-for="(icon, index) in createBanner.customize.iconCollection"
                       :key="index"
                       @click="  createBanner.customize.properties.icon=icon"
                       :class="{ 'selected-image' : icon === createBanner.customize.properties.icon }"
                       style="cursor: pointer;">
                    <img :src="icon" alt="Icon" style="max-height: 70px; max-width: 70px;" />
                  </div>
                </div>
                <div class="pagination" style="margin-top: 10px">
                  <button :disabled="createBanner.isPageChanging" @click="handleImagePagination(false)">Previous</button>
                  <button :disabled="createBanner.isPageChanging" style="margin-left: 10px" @click="handleImagePagination(true)">Next</button>
                  <span> Page:  {{ createBanner.pagination.param.pageNum  }} / {{createBanner.pagination.pageTotal}}</span>
                  <input style="float: right" type="file" id="imageUpload" :disabled="createBanner.isUploading" accept="image/* " @change="handleUploadImage">
                  <button style="float: right; margin-right: 10px" class="upload-button" :disabled="createBanner.isRemoving" @click="handleRemoveImage()">Remove</button>
                </div>
              </div><hr>
              <div class="form-group">
                <p>Event Description:</p>
                <label for="font">Font: </label>
                <el-select style="width: 200px" v-model="createBanner.customize.properties.textStyle.font">
                  <el-option v-for="font in fontOptions" :key="font" :label="font" :value="font"></el-option>
                </el-select>
                <label for="text" style="margin-left: 20px">Font Color:</label>
                <input style="margin-left: 10px; width: 100px; border: 2px solid #000000" v-model="createBanner.customize.properties.textStyle.color" type="color" id="text"/>
                <div style="margin-top: 10px">
                  <label for="text">Text Size: </label>
                  <el-slider
                      v-model="createBanner.customize.properties.textStyle.size"
                      :min="8"
                      :max="48"
                      style="width: 300px">
                  </el-slider>
                </div>
                <div>
                  <textarea style="height: 100px;width: 300px; margin-top: 5px" v-model="createBanner.customize.properties.text">
                  </textarea>
                </div>
              </div>
            </div>
<!-- Pre-Made -->
            <div v-if="createBanner.type === '2'">
              <div class="preview">
              <img :src="createBanner.preMade.banner" style="width: 510px "/>
            </div><hr style="margin-top: 20px; margin-bottom: 20px" >
              <div class="form-group">
              <label style="margin-bottom: 20px">Select Banner:</label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 10px">
                <div v-for="(image, index) in createBanner.preMade.bannerCollection"
                     :key="index"
                     @click="createBanner.preMade.banner=image"
                     :class="{ 'selected-image': image === createBanner.preMade.banner }"
                     style="cursor: pointer;">
                  <img :src="image" alt="Banner" style="max-height: 150px; max-width: 200px" />
                </div>
              </div>
              <div class="pagination" style="margin-top: 10px">
                <button :disabled="createBanner.isPageChanging" @click="handleImagePagination(false)">Previous</button>
                <button :disabled="createBanner.isPageChanging" style="margin-left: 10px" @click="handleImagePagination(true)">Next</button>
                <span> Page:  {{ createBanner.pagination.param.pageNum  }} / {{ createBanner.pagination.pageTotal }}</span>
                <input style="float: right" type="file" id="imageUpload" accept="image/* " :disabled="createBanner.isUploading" @change="handleUploadImage">
                <button style="float: right; margin-right: 10px" class="upload-button" :disabled="createBanner.isRemoving" @click="handleRemoveImage">Remove</button>
              </div>
            </div><hr>
            </div>
          </div>
        </div>
      </el-form>

<!-- Footer -->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="VipBonusInfo" setup>
import {url} from "@/utils/url";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas';
import {getVipBonusTypeList} from "@/api/config/vipBonusType";
import WangEditor from "@/components/WangEditor";
import {
  vipBonusInfoAdd,
  vipBonusInfoDelete,
  vipBonusInfoExport,
  vipBonusInfoFindById,
  vipBonusInfoUpdate,
  vipBonusInfoUpdateStatus,
  getVipBonusInfoList,
  getAllVipBonusBanner,
  getAllVipBonusLogo, getRewardIcons,
  removeVipBonusBanner,
  removeVipBonusLogo,
  uploadVipBonusBanner,
  uploadVipBonusLogo,
} from "@/api/config/vipBonusInfo";

const isButtonDisabled    = ref(true); //Used for disabling button
const vipBonusInfoList = ref([]);
const vipBonusTypes    = ref([]);
const showSearch       = ref(true);
const multiple = ref(true); //Multiple Row Selection
const loading  = ref(true);
const single   = ref(true); //Single Row Selection
const title    = ref(); //Form Title
const total    = ref(0); //Total rows
const open     = ref(false); //Opening form
const ids      = ref([]); //Selected ids of table rows

/** Create Banner Related */
const treasureIcons = ref([
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx1.png',
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx2.png',
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx3.png',
]);
const fontOptions   = ref([
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
]);

/** Bonus: Sign In Related */
const dailyData = ref([]);

/** Others */
const dateRange = ref([]);
const {proxy}   = getCurrentInstance();
const data      =  reactive({
  queryParams:{
    title: null,
    typeId:null,
    effect: null,
    pageNum: 1,
    pageSize: 10
  },
  form:{
    typeId: 1,
    title: null,
    scheduleType: '1',
    startEffect: null,
    endEffect: null,
    isDisplayHome: false,
    configString: null,
    jumpType: "0",
    content: '',
    url: null,
    icon: null,
  },
  configurations: {
    vipLevel: 0,
    rewardIcons: [],
    signIn: {
      collectMethod: '1',
      cycle: null,
      customDay: '2',
      listOfDailyData: [],
    },
    //TODO: More VIP related bonus
  },
  createBanner: {
    type: '1',
    isButtonDisabled: true,
    isUploading: false,
    isRemoving: false,
    isPageChanging: false,
    customize: {
      iconCollection: null,
      properties: {
        background: '#030303',
        icon: null,
        text: 'PUT TEXT HERE',
        textStyle: {
          font: "Arial, sans-serif",
          size: 30,
          color: '#ffffff'
        }
      }
    },
    preMade: {
      bannerCollection: null,
      banner: null,
    },
    pagination: {
      param: {
        pageNum: 1,
        pageSize: 10
      },
      pageTotal: 1
    }
  },
  rules:{
    title: [
      {required: true, message: "标题不能为空", trigger: "blur"}
    ],
    icon: [
      {required: true, message: "图标不能不上传", trigger: "blur"}
    ],
    typeId: [
      {required: true, message: "活动类型不能为空", trigger: "blur"}
    ]
  },
});

const {queryParams,form,rules, configurations, createBanner} = toRefs(data);
const formData = new FormData();

/**  Handle Table  */
function handleSearchQuery(){
  queryParams.pageNum = 1;
  listVipBonusActivities()
}
function handleResetQuery(){
  proxy.resetForm("queryForm");
  handleSearchQuery();
  loading.value = false;
}
function handleDeleteTableData(row){
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除"' + row.title + '"?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return vipBonusInfoDelete(id);
  }).then(() => {
    listVipBonusActivities();
    proxy.$modal.msgSuccess("删除成功");
  })
}
function handleExportData(){
  proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return vipBonusInfoExport(proxy.addDateRange(queryParams.value,updateTime.value));
  }).then(response => {
    proxy.downloadExcel(response, '活动信息')
  }).catch(() => {
  })
}
function handleMultipleSelection(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function listVipBonusActivities(){
  loading.value = true
  getVipBonusInfoList(proxy.addDateRange(queryParams.value)).then((res)=>{
    vipBonusInfoList.value = res.data
    total.value = res.total
  }).then( ()=> {
    loading.value = false
    isButtonDisabled.value = false;
  })
}
function handleEffectChange(row){
  let text = row.status === '1' ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return vipBonusInfoUpdateStatus(row.id, row.effect)
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.status = row.status === '0' ? '1' : '0'
  })
}
function formatterActivityType(row) {
  for (const a of vipBonusTypes.value) {
    if (a.id === row.typeId) {
      return a.name;
    }
  }
  return "";
}
function vipBonusTypeList(){
  getVipBonusTypeList().then((res)=>{
    vipBonusTypes.value = res
  })
}

/** Handle Form */
function handleOpenForm(){
  isButtonDisabled.value = true;
}
function handleClosedForm(){
  isButtonDisabled.value = false;
  loading.value = false
  listVipBonusActivities()
}
function handleResetForm() {
  form.value = {
    typeId: 1,
    scheduleType: '1',
    isDisplayHome: false,
    jumpType: '0',
    content: ''
  };
  proxy.resetForm("vipBonusForm");
}

/**  Handle Images */
function handleUploadImage(event) {
  if ( event.currentTarget.files[0] === undefined ) return;
  formData.set( "file", event.currentTarget.files[0])
  let uploadFunction = createBanner.value.type === '1' ? uploadVipBonusLogo( formData )
      : uploadVipBonusBanner( formData );

  uploadFunction.then( () => {
    getBannerCreationRelatedImages(1);
  }).then(() => {
    ElMessage.success('Success')
  })
}
function handleRemoveImage(){
  event.preventDefault();
  const type = createBanner.value.type;
  const logo = createBanner.value.customize.properties.icon;
  const banner = createBanner.value.preMade.banner;
  if ( (type === '1' && logo === undefined) || (type === '2' && banner === undefined) ) return;

  if (confirm("Are you sure you want to remove the image?")){
    let removeFunction = type === '1' ? removeVipBonusLogo(logo)
        : removeVipBonusBanner(banner);

    setTimeout( () => {
      removeFunction.then( () => {
        getBannerCreationRelatedImages(1);
      }).then( () => {
        ElMessage.success('Success')
      })
    },1000);
  }
}
function getBannerCreationRelatedImages (pageNum) {
  const _this      = createBanner.value;
  const pagination = _this.pagination;
  const customize  = _this.customize;
  const preMade    = _this.preMade;
  const param      = pagination.param
  const hasData    = form.value.id !== undefined;

  param.pageNum = pageNum;
  if ( createBanner.value.type === '1' ) {
    param.pageSize = 10;
    getAllVipBonusLogo(param).then( res => {
      res.rows = res.rows.map(img => prependActivityInfoImageBaseURI(img))
      customize.iconCollection  = res.rows;
      customize.properties.icon = hasData ? customize.properties.icon : res.rows[0];
      pagination.pageTotal = Math.max(1,Math.ceil(res.total / param.pageSize))
    })
  } else {
    param.pageSize = 6;
    getAllVipBonusBanner(param).then( res => {
      preMade.bannerCollection = res.rows;
      preMade.banner = hasData ? form.value.icon: res.rows[0];
      pagination.pageTotal = Math.max(1,Math.ceil(res.total / param.pageSize));
    })
  }
}
function prependActivityInfoImageBaseURI(img) {
  return url.baseUrl + url.game99PlatformAdminWeb + "/config/vipBonusInfo/image?url=" + img;
}
function handleImagePagination(isNext){
  event.preventDefault();
  const pageTotal = createBanner.value.pagination.pageTotal;
  let   pageNum    = createBanner.value.pagination.param.pageNum;

  if ( isNext && pageNum < pageTotal ) pageNum++;
  else if ( !isNext && pageNum > 1 ) pageNum--;
  else return;
  createBanner.value.isPageChanging = true;
  setTimeout(() => {
    getBannerCreationRelatedImages(pageNum);
    createBanner.value.isPageChanging = false;
  },500)
}

/**  Handle Add/Update Bonus Activity */
function handleAddBonusActivity(){
  getBannerCreationRelatedImages(1);
  handleResetForm();
  open.value = true
  title.value = "ADD VIP BONUS ACTIVITY"
}
function handleUpdateForm(row){
  handleResetForm();
  const id = row.id ||ids.value
  vipBonusInfoFindById(id).then(response => {
    const rsp = response.data;
    populateForm(rsp)
    populateBonusTypeConfiguration(rsp);
    populateBannerConfiguration(rsp)
  }).then( () => {
    open.value = true;
    title.value = "UPDATE VIP BONUS ACTIVITY"
  });
}
function populateForm( rsp ){
  form.value = rsp;
  form.value.jumpType = rsp.jumpType.toString();
  form.value.scheduleType = rsp.scheduleType.toString();
  dateRange.value = [ form.value.startEffect, form.value.endEffect ]
}
function populateBannerConfiguration( rsp ) {
  let parsedCustomBannerConfig = JSON.parse(rsp.configString).customBannerConfig;
  if ( parsedCustomBannerConfig !== null ) {
    createBanner.value.customize.properties = parsedCustomBannerConfig;
  } else {
    createBanner.value.type = '2'
  }
  getBannerCreationRelatedImages(1);
}
function populateBonusTypeConfiguration( rsp ){
  let parsedEventConfig = JSON.parse(rsp.configString).eventConfig;
  switch ( rsp.typeId ) {
    case 1: //Sign In
      configurations.value.signIn = parsedEventConfig;
      dailyData.value = parsedEventConfig.listOfDailyData[0].config
      break;
      //TODO: Update when added more bonus type
  }
}

/**  Handle Submit Form */
async function handleSubmitForm() {
  proxy.$refs["vipBonusForm"].validate(async valid => {
    if (!valid) return
  });

  const f = form.value;
  const isScheduleFixed = f.scheduleType === '1';
  const create = createBanner.value;

  //Populate other fields in form
  f.icon = await getCustomizedOrPreMadeIcon();
  f.startEffect = isScheduleFixed ? dateRange.value[0] : f.startEffect;
  f.endEffect   = isScheduleFixed ? dateRange.value[1] : null;
  f.configString = JSON.stringify({
    eventConfig: getEventConfigByTypeId(),
    customBannerConfig: create.type === '1' ? create.customize.properties : null
  });

  let actionMethod = f.id === undefined ? vipBonusInfoAdd(f) : vipBonusInfoUpdate(f);
  actionMethod.then(() => {
    proxy.$modal.msgSuccess("修改成功");
    open.value = false;
  })
}
function getEventConfigByTypeId(){
  // TypeId = Vip Bonus Activity Type
  const config = configurations.value;
  switch ( form.value.typeId ) {
    case 1: return config.signIn;
      //TODO: Update this when added more vip bonus activity
    default: return null;
  }
}
async function getCustomizedOrPreMadeIcon() {
  let icon = createBanner.value.preMade.banner;
  if (createBanner.value.type === '1') {
    const container = document.getElementById('original');
    await html2canvas(container).then(function (canvas) {
      icon =  canvas.toDataURL('image/png');
    });
  }
  return icon;
}

/**  Sign In Related */
function customDay_populateSignInConfigTable(){
  let firstConfig = configurations.value.signIn.listOfDailyData[0].config
  if ( firstConfig === undefined ) return;

  dailyData.value = []
  for ( let i = 0; i < firstConfig.length; i++ ) {
    let row = firstConfig[i];
    dailyData.value.push(
        {
          day: row.day,
          rewardType: row.rewardType,
          rewardAmount: {
            min: null,
            max: null
          },
          topUpRequirement: null,
          codingRequirement: null,
          iconUrl: row.iconUrl
        }
    )
  }
}
function populateSignInConfigTable(){
  let cycle = configurations.value.signIn.cycle;
  dailyData.value = [];

  for ( let i = 0; i < cycle; i++ ) {
    let row = null
    dailyData.value.push(
        {
          day: i+1,
          rewardType: '1',
          rewardAmount: {
            min: null,
            max: null
          },
          topUpRequirement: null,
          codingRequirement: null,
          iconUrl: configurations.value.rewardIcons[i] || null
        }
    )
  }
}
function calculateNumberOfDays() {
  if ( form.value.scheduleType === '1' ) {
    const start = new Date(dateRange.value[0]);
    const end   = new Date(dateRange.value[1]);
    const timeDifference = end - start;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    configurations.value.signIn.cycle = daysDifference + 1;
    populateSignInConfigTable()
  }
}
function handleVipLevelChange(){
  const config = configurations.value;
  switch ( form.value.typeId ) {
    case 1: {
      let signIn      = config.signIn;
      let tableConfig = signIn.listOfDailyData[config.vipLevel];

      if ( tableConfig !== undefined ) {
        dailyData.value = tableConfig.config
        break;
      }

      if ( signIn.customDay === '1' ) customDay_populateSignInConfigTable()
      else populateSignInConfigTable()
      break;
    }
  }
}
function handleRewardChangeType(scope){
  scope.row.iconUrl = ( scope.row.rewardType === '1' ? coinIcons : treasureIcons ).value[0]
}
function saveSignInConfig(){
  const indexOfExistingData = configurations.value.signIn.listOfDailyData.findIndex(data => data.level === configurations.value.vipLevel);
  const hasData = indexOfExistingData !== -1;

  if ( hasData ) {
    //Update
    configurations.value.signIn.listOfDailyData[indexOfExistingData].config = dailyData.value;
  } else {
    //Insert
    configurations.value.signIn.listOfDailyData.push({
      level: configurations.value.vipLevel,
      config: dailyData.value
    });
  }
  ElMessage.success('Success')
}
function resetSignInConfig(){
  configurations.value.signIn.listOfDailyData = []
  configurations.value.vipLevel = 0;
  populateSignInConfigTable()
}


listVipBonusActivities()
vipBonusTypeList()
</script>

<style scoped>
#original {
  position: relative;
  overflow: hidden;
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
.selected-image {
  border: 2px solid #00dfff;
}
.dialog-footer{
  float: right;
}
</style>