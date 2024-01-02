<template>
  <div class="app-container">
    <el-form :disabled="isButtonDisabled" :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item prop="标题" class="input-wd20">
        <el-input
            v-model="queryParams.title"
            placeholder="输入标题"
            clearable
            @keyup.enter="handleSearchQuery"/>
      </el-form-item>
      <el-form-item prop="效果">
        <el-select v-model="queryParams.effect" placeholder="效果" clearable>
          <el-option label="Disabled" value="0"></el-option>
          <el-option label="Enabled" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="奖励类型" prop="typeId" label-width="100px">
        <el-select
            filterable
            v-model="queryParams.typeId"
            placeholder="选择奖金类型"
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
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            :disabled="isButtonDisabled"
            @click="handleAddBonusActivity"
            v-hasPermi="['config:vipBonusInfo:add']">添加
        </el-button>
        <el-button
            type="danger"
            plain
            icon="Delete"
            size="small"
            :disabled="multiple"
            @click="handleDeleteTableData"
            v-hasPermi="['config:vipBonusInfo:remove']">删除
        </el-button>
        <el-button
            type="warning"
            plain
            icon="Download"
            size="small"
            :disabled="isButtonDisabled"
            @click="handleExportData"
            v-hasPermi="['config:vipBonusInfo:export']">导出
        </el-button>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="listVipBonusActivities"></right-toolbar>
    </el-row>

<!-- display data into table-->
    <el-table v-loading="loading" :data="vipBonusInfoList" @selection-change="handleMultipleSelection">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="标题" align="center" prop="title" min-width="180"/>
      <el-table-column label="奖励类型" align="center" prop="typeId" :formatter="formatterActivityType"  min-width="100"/>
      <el-table-column label="支持的平台" align="center" prop="platforms" min-width="120"/>
<!--      <el-table-column label="Icon" align="center" prop="icon">-->
<!--          <template #default="scope">-->
<!--            <el-image-->
<!--                style="height: 50px;"-->
<!--                :src="scope.row.icon"-->
<!--                fit="contain">-->
<!--            </el-image>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--      <el-table-column label="内容" align="center" prop="content"  min-width="100">-->
<!--        <template v-slot="{row}">-->
<!--          <div v-html="row.content" style="max-height: 80px"></div>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="跳转链接" align="center" prop="url"  min-width="100"/>-->
      <el-table-column label="日程类型" align="center" prop="scheduleType"  min-width="100"/>
      <el-table-column label="开始效果" align="center" prop="startEffect"  min-width="120"/>
      <el-table-column label="结束效果" align="center" prop="endEffect"  min-width="120"/>
      <el-table-column label="创建时间" align="center" prop="createTime"  min-width="120"/>
      <el-table-column label="主页弹出窗口" align="center" prop="isDisplayHome"  min-width="100"/>
      <el-table-column label="效果" align="center" prop="effect">
        <template #default="scope">
          <el-switch
              v-model="scope.row.effect"
              :disabled="isButtonDisabled"
              :active-value="true"
              :inactive-value="false"
              @click="handleEffectChange(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="动作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="120">
        <template #default="scope">
          <el-button
              :disabled="isButtonDisabled"
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdateForm(scope.row)"
              v-hasPermi="['config:vipBonusInfo:edit']">编辑
          </el-button>
          <el-button
              :disabled="isButtonDisabled"
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="handleDeleteTableData(scope.row)"
              v-hasPermi="['config:vipBonusInfo:remove']"> 删除
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
        style="
          min-width: 1600px;
          max-width: 70%;
          padding-bottom: 20px
        "
        append--body
        @closed="handleClosedForm"
        :close-on-click-modal="false"
    >
      <el-form ref="vipBonusForm" :model="form" :rules="rules" label-width="120">
        <div class="el-row">
<!-- Configurations -->
<!--          <div style="min-width: 40%"> -->
          <div class="el-col el-col-11" style="padding-right: 50px">
            <label style="font-size: 25px; text-align: left">基本配置</label>
            <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">
            <el-form-item label="奖金类型" prop="typeId">
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
            <el-form-item label="标题" prop="title">
              <el-input style="width: 350px" v-model="form.title" placeholder="请输入标题"/>
            </el-form-item> <br>
            <el-form-item label="时间表类型" prop="scheduleType">
              <el-radio-group v-model="form.scheduleType">
                <el-radio label="1">固定时间</el-radio>
                <el-radio label="2">永久性</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-show="form.scheduleType === '1'" label="有效时间" style="width: 50%;" prop="dateRange" >
                <el-date-picker type="daterange"
                                v-model="dateRange"
                                start-placeholder="开始时间"
                                end-placeholder="开始时间"
                                range-separator="至"
                                clearable
                                format="YYYY-MM-DD"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                @change="calculateNumberOfDays"/>
            </el-form-item>
            <el-form-item v-show="form.scheduleType === '2'" label="开始日期" prop="startDate">
              <el-date-picker type="date"
                              v-model="form.startEffect"
                              placeholder="开始时间"
                              format="YYYY-MM-DD"
                              value-format="YYYY-MM-DD HH:mm:ss"
                              clearable>
              </el-date-picker>
            </el-form-item>
            <el-form-item label="主页弹出窗口" label-width="120">
              <el-switch
                  v-model="form.isDisplayHome"
                  class="ml-2"
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              />
            </el-form-item>
            <el-form-item label="平台" prop="platform">
              <el-checkbox-group v-model="form.platforms">
                <el-checkbox v-for="(option, index) in platforms" :key="index" :label="option" @change="handleChangePlatform(option)">{{ option }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
<!-- Other Config -->
<!--            <label style="font-size: 25px;padding-top: 10px; text-align: left">其他配置</label>-->
<!--            <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">-->
<!--            <el-form-item label="跳跃类型" prop="jumpType">-->
<!--              <el-radio-group v-model="form.jumpType">-->
<!--                <el-radio label="0">奖励活动详情</el-radio>-->
<!--                <el-radio label="1">跳转链接</el-radio>-->
<!--              </el-radio-group>-->
<!--            </el-form-item>-->
<!-- Jump Type -->
<!--            <div style="max-width: 1000px">-->
<!--              <el-form-item label="内容" prop="content" v-if="form.jumpType === '0'">-->
<!--                <WangEditor v-model="form.content" image-path="VipBonusInfo" style="max-width: 680px"/>-->
<!--              </el-form-item>-->
<!--              <el-form-item label="Url" prop="url" v-if="form.jumpType === '1'">-->
<!--                <el-input v-model="form.url" placeholder="请输入图标跳转链接" style="max-width: 680px"/>-->
<!--              </el-form-item>-->
<!--            </div>-->
          </div>
          <div class="el-col el-col-12">
            <label style="font-size: 25px; text-align: left">{{ vipBonusTypes.find((type) => type.id === form.typeId).name + ' 配置'}}</label>
            <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">
<!-- Sign in Config -->
            <div v-if="form.typeId === 1">
              <label>上传奖励图标</label>
              <el-form-item v-if="form.platforms.includes('web')" prop="webRewardIcon">
                <div style="padding-right: 10px">
                  <div class="upload-reward-icon-button" @click="handleUploadIcon('rewardImg','web','web')">web</div>
                </div>
                <div class="upload-image-container">
                  <div v-for="(icon, index) in configurations.rewardIcons.web" :key="index" class="image-preview-container">
                    <img :src="icon" alt="Reward Icon Preview" class="image-preview">
                    <div class="reward-close-button" @click="removeImage('web','rewardImg','web', icon)">x</div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item v-if="form.platforms.includes('mobile')" prop="mobileRewardIcon">
                <div style="padding-right: 10px">
                  <div class="upload-reward-icon-button" @click="handleUploadIcon('rewardImg','mobile','mobile')">mobile</div>
                </div>
                <div class="upload-image-container">
                  <div v-for="(icon, index) in configurations.rewardIcons.mobile" :key="index" class="image-preview-container">
                    <img :src="icon" alt="Reward Icon Preview" class="image-preview">
                    <div class="reward-close-button" @click="removeImage('mobile','rewardImg','mobile', icon)">x</div>
                  </div>
                </div>
              </el-form-item>
              <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">
              <label>上传状态图标</label>
              <el-form-item v-if="form.platforms.includes('web')" label="web" style="padding-top: 10px; font-weight: bold" prop="statusIcon">
                <input type="file" ref="fileInput" multiple style="display: none" @change="onFileInputChange()" />
                <div class="image-container">
                  <div class="image-wrapper">
                    <el-image class="status-image-preview" :src="configurations.signIn.statusIcon.web.claimable"/>
                    <div v-if="configurations.signIn.statusIcon.web.claimable !== null" class="status-close-button" @click="removeImage('web','statusImg','claimable',configurations.signIn.statusIcon.web.claimable)">x</div>
                    <div v-else class="upload-status-icon-button" @click="handleUploadIcon('statusImg','web','claimable')">可索赔</div>
                  </div>
                  <div class="image-wrapper">
                    <el-image class="status-image-preview" :src="configurations.signIn.statusIcon.web.claimed"/>
                    <div v-if="configurations.signIn.statusIcon.web.claimed !== null" class="status-close-button" @click="removeImage('web','statusImg','claimed',configurations.signIn.statusIcon.web.claimed)">x</div>
                    <div v-else class="upload-status-icon-button" @click="handleUploadIcon('statusImg','web','claimed')">已申请</div>
                  </div>
                  <div class="image-wrapper">
                    <el-image class="status-image-preview" :src="configurations.signIn.statusIcon.web.notClaimable"/>
                    <div v-if="configurations.signIn.statusIcon.web.notClaimable !== null" class="status-close-button" @click="removeImage('web','statusImg','notClaimable',configurations.signIn.statusIcon.web.notClaimable)">x</div>
                    <div v-else class="upload-status-icon-button" @click="handleUploadIcon('statusImg','web','notClaimable')">不可索赔</div>
                  </div>
                  <div class="image-wrapper">
                    <el-image class="status-image-preview" :src="configurations.signIn.statusIcon.web.notClaimed"/>
                    <div v-if="configurations.signIn.statusIcon.web.notClaimed !== null" class="status-close-button" @click="removeImage('web','statusImg','notClaimed',configurations.signIn.statusIcon.web.notClaimed)">x</div>
                    <div v-else class="upload-status-icon-button" @click="handleUploadIcon('statusImg','web','notClaimed')">未申请</div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item v-if="form.platforms.includes('mobile')" label="mobile" style="padding-top: 10px; font-weight: bold" prop="statusIcon">
                <input type="file" ref="fileInput" multiple style="display: none" @change="onFileInputChange()" />
                <div class="image-container">
                  <div class="image-wrapper">
                    <el-image class="status-image-preview" :src="configurations.signIn.statusIcon.mobile.claimable"/>
                    <div v-if="configurations.signIn.statusIcon.mobile.claimable !== null" class="status-close-button"  @click="removeImage('mobile','statusImg','claimable',configurations.signIn.statusIcon.mobile.claimable)">x</div>
                    <div v-else class="upload-status-icon-button" @click="handleUploadIcon('statusImg','mobile','claimable')">可索赔</div>
                  </div>
                  <div class="image-wrapper">
                    <el-image class="status-image-preview" :src="configurations.signIn.statusIcon.mobile.claimed"/>
                    <div v-if="configurations.signIn.statusIcon.mobile.claimed !== null" class="status-close-button" @click="removeImage('mobile','statusImg','claimed',configurations.signIn.statusIcon.mobile.claimed)">x</div>
                    <div v-else class="upload-status-icon-button" @click="handleUploadIcon('statusImg','mobile','claimed')">已申请</div>
                  </div>
                  <div class="image-wrapper">
                    <el-image class="status-image-preview" :src="configurations.signIn.statusIcon.mobile.notClaimable"/>
                    <div v-if="configurations.signIn.statusIcon.mobile.notClaimable !== null" class="status-close-button" @click="removeImage('mobile','statusImg','notClaimable',configurations.signIn.statusIcon.mobile.notClaimable)">x</div>
                    <div v-else class="upload-status-icon-button" @click="handleUploadIcon('statusImg','mobile','notClaimable')">不可索赔</div>
                  </div>
                  <div class="image-wrapper">
                    <el-image class="status-image-preview" :src="configurations.signIn.statusIcon.mobile.notClaimed"/>
                    <div v-if="configurations.signIn.statusIcon.mobile.notClaimed !== null" class="status-close-button" @click="removeImage('mobile','statusImg','notClaimed',configurations.signIn.statusIcon.mobile.notClaimed)">x</div>
                    <div v-else class="upload-status-icon-button" @click="handleUploadIcon('statusImg','mobile','notClaimed')">未申请</div>
                  </div>
                </div>
              </el-form-item>
              <hr style="max-width: 800px; margin-top: 32px; margin-left: 0">
              <el-form-item label="收集方法" prop="collectMethod">
                <el-radio-group v-model="configurations.signIn.collectMethod">
                  <el-radio label="1">连续</el-radio>
                  <el-radio label="2">累计</el-radio>
                  <el-radio label="3">对应日</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="周期" prop="cycle">
                <el-input style="width: 350px" disabled v-model="configurations.signIn.cycle" placeholder="7" @change="populateSignInConfigTable(configurations.signIn.cycle)"/>
              </el-form-item>
              <el-form-item label="自定义日" prop="customDay" @change="populateSignInConfigTable(configurations.signIn.cycle)">
                <el-radio-group v-model="configurations.signIn.customDay" >
                  <el-radio label="1">启用</el-radio>
                  <el-radio label="2">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="VIP 级别">
                <el-select
                    v-model="configurations.vipLevel"
                    filterable
                    clearable
                    style="width: 350px"
                    @change="handleVipLevelChange"
                >
                  <el-option
                      v-for="i in 30"
                      :key="i"
                      :label="'VIP ' + (i) "
                      :value="i"
                  ></el-option>
                </el-select>
                <div style="padding-left: 10px">
                  <el-button type="primary" size="small" @click="saveSignInConfig">节省</el-button>
                  <el-button icon="Refresh" size="small" @click="resetSignInConfig">重置</el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-table :data="configurations.signIn.dailyData" style="max-width: 670px; max-height: 430px;overflow-y:auto; border: 5px solid #e0e0e0; border-radius: 5px" >
                  <el-table-column label="日" width="60px" align="center" prop="day">
                    <template #default="scope">
                      <div v-if="configurations.signIn.customDay === '1'">
                        <el-input v-model="scope.row.day"/>
                      </div>
                      <div v-else>
                        {{ scope.row.day }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="奖励类型" width="105px" align="center"  prop="rewardType">
                    <template #default="scope">
                      <el-select
                          filterable
                          v-model="scope.row.rewardType"
                          style="width: 100px"
                          @change="handleRewardChangeType(scope)"
                      >
                        <el-option
                            label="固定式"
                            value="1"
                        ></el-option>
                        <el-option
                            label="随机"
                            value="2"
                        ></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="金额" width="70px" align="center">
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
                  <el-table-column label="所需存款" width="70px" align="center"  prop="topUpRequirement">
                    <template #default="scope">
                      <el-input v-model="scope.row.topUpRequirement"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="所需投注" width="70px" align="center"  prop="codingRequirement">
                    <template #default="scope">
                      <el-input v-model="scope.row.codingRequirement"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="Web 奖励图标" align="center" width="135px">
                    <template #default="scope">
                      <el-select
                          filterable
                          v-model="scope.row.rewardIcon.web"
                          style="width: 120px"
                      >
                        <template #prefix>
                          <el-image style="width: 60px; height: 60px; margin-top: 5px; margin-bottom: 5px; margin-left: 10px " :src="scope.row.rewardIcon.web"/>
                        </template>
                        <el-option
                            label=" "
                            v-for="icon in ( scope.row.rewardType === '1' ? configurations.rewardIcons.web : treasureIcons)"
                            :value="icon"
                            style="width: 120px; height: 100px; margin-left: -15px"
                        >
                          <el-image style="width: 50px; height: 50px;margin-top: 10px; margin-left: 25px" :src="icon"  />
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="Mobile 奖励图标" align="center" width="150px">
                    <template #default="scope">
                      <el-select
                          filterable
                          v-model="scope.row.rewardIcon.mobile"
                          style="width: 120px"
                      >
                        <template #prefix>
                          <el-image style="width: 60px; height: 60px; margin-top: 5px; margin-bottom: 5px; margin-left: 10px " :src="scope.row.rewardIcon.mobile"/>
                        </template>
                        <el-option
                            label=" "
                            v-for="icon in ( scope.row.rewardType === '1' ? configurations.rewardIcons.mobile : treasureIcons)"
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
          </div>
<!-- Banner Creation -->
<!--          <div class="el-col el-col-8">-->
<!--            <label style="font-size: 25px; text-align: left">Create Banner</label>-->
<!--            <el-radio-group style="float: right;" v-model="createBanner.type" @change="getBannerCreationRelatedImages(1)">-->
<!--              <el-radio style="width: 120px" label="1" border>Customize</el-radio>-->
<!--              <el-radio style="width: 120px" label="2" border>Pre-Made</el-radio>-->
<!--            </el-radio-group><hr style="margin-top: 20px; margin-bottom: 20px">-->
<!--            <label style="font-size: 20px">Preview</label>-->
<!--&lt;!&ndash; Customize &ndash;&gt;-->
<!--            <div v-if="createBanner.type === '1'">-->
<!--              <div class="preview" style="position: relative" id="original">-->
<!--                <div :style="`background-color: ${createBanner.customize.properties.background}`">-->
<!--                  <div style="display: inline-flex; justify-content: center; height: 250px; align-items: center">-->
<!--                    <img :src="createBanner.customize.properties.icon" style=" margin-right: 10px;width: 230px; height: 230px"/>-->
<!--                  </div>-->
<!--                <pre :style="`display: inline-block; margin-top: 20px; position: absolute; color: ${createBanner.customize.properties.textStyle.color}; font-family: ${createBanner.customize.properties.textStyle.font}; font-size: ${createBanner.customize.properties.textStyle.size}px`">{{createBanner.customize.properties.text}}</pre>-->
<!--              </div>-->
<!--            </div><hr style="margin-top: 20px">-->
<!--              <div id="canvas"></div>-->
<!--              <div class="form-group">-->
<!--                <label for="background">Background Color:</label>-->
<!--                <input style="margin-left: 10px; width: 100px; border: 2px solid #000000" v-model="createBanner.customize.properties.background" type="color" id="background"/>-->
<!--              </div>-->
<!--              <div class="form-group">-->
<!--                <label>Select Icon:</label><hr>-->
<!--                <div style="display: grid; grid-template-columns: repeat(5, 1fr);">-->
<!--                  <div v-for="(icon, index) in createBanner.customize.iconCollection"-->
<!--                       :key="index"-->
<!--                       @click="  createBanner.customize.properties.icon=icon"-->
<!--                       :class="{ 'selected-image' : icon === createBanner.customize.properties.icon }"-->
<!--                       style="cursor: pointer;">-->
<!--                    <img :src="icon" alt="Icon" style="max-height: 70px; max-width: 70px;" />-->
<!--                  </div>-->
<!--                </div>-->
<!--                <div class="pagination" style="margin-top: 10px">-->
<!--                  <button :disabled="createBanner.isActionFinished" @click="handleImagePagination(false)">Previous</button>-->
<!--                  <button :disabled="createBanner.isActionFinished" style="margin-left: 10px" @click="handleImagePagination(true)">Next</button>-->
<!--                  <span> Page:  {{ createBanner.pagination.param.pageNum  }} / {{createBanner.pagination.pageTotal}}</span>-->
<!--                  <input style="float: right" type="file" id="imageUpload" :disabled="createBanner.isActionFinished" accept="image/* " @change="handleUploadImage">-->
<!--                  <button style="float: right; margin-right: 10px" class="upload-button" :disabled="createBanner.isActionFinished" @click="handleRemoveImage()">Remove</button>-->
<!--                </div>-->
<!--              </div><hr>-->
<!--              <div class="form-group">-->
<!--                <p>Event Description:</p>-->
<!--                <label for="font">Font: </label>-->
<!--                <el-select style="width: 200px" v-model="createBanner.customize.properties.textStyle.font">-->
<!--                  <el-option v-for="font in fontOptions" :key="font" :label="font" :value="font"></el-option>-->
<!--                </el-select>-->
<!--                <label for="text" style="margin-left: 20px">Font Color:</label>-->
<!--                <input style="margin-left: 10px; width: 100px; border: 2px solid #000000" v-model="createBanner.customize.properties.textStyle.color" type="color" id="text"/>-->
<!--                <div style="margin-top: 10px">-->
<!--                  <label for="text">Text Size: </label>-->
<!--                  <el-slider-->
<!--                      v-model="createBanner.customize.properties.textStyle.size"-->
<!--                      :min="8"-->
<!--                      :max="48"-->
<!--                      style="width: 300px">-->
<!--                  </el-slider>-->
<!--                </div>-->
<!--                <div>-->
<!--                  <textarea style="height: 100px;width: 300px; margin-top: 5px" v-model="createBanner.customize.properties.text">-->
<!--                  </textarea>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--&lt;!&ndash; Pre-Made &ndash;&gt;-->
<!--            <div v-if="createBanner.type === '2'">-->
<!--              <div class="preview">-->
<!--              <img :src="createBanner.preMade.banner" style="width: 510px "/>-->
<!--            </div><hr style="margin-top: 20px; margin-bottom: 20px" >-->
<!--              <div class="form-group">-->
<!--              <label style="margin-bottom: 20px">Select Banner:</label>-->
<!--              <div style="display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 10px">-->
<!--                <div v-for="(image, index) in createBanner.preMade.bannerCollection"-->
<!--                     :key="index"-->
<!--                     @click="createBanner.preMade.banner=image"-->
<!--                     :class="{ 'selected-image': image === createBanner.preMade.banner }"-->
<!--                     style="cursor: pointer;">-->
<!--                  <img :src="image" alt="Banner" style="max-height: 150px; max-width: 200px" />-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="pagination" style="margin-top: 10px">-->
<!--                <button :disabled="createBanner.isActionFinished" @click="handleImagePagination(false)">Previous</button>-->
<!--                <button :disabled="createBanner.isActionFinished" style="margin-left: 10px" @click="handleImagePagination(true)">Next</button>-->
<!--                <span> Page:  {{ createBanner.pagination.param.pageNum  }} / {{ createBanner.pagination.pageTotal }}</span>-->
<!--                <input style="float: right" type="file" id="imageUpload" accept="image/* " :disabled="createBanner.isActionFinished" @change="handleUploadImage">-->
<!--                <button style="float: right; margin-right: 10px" class="upload-button" :disabled="createBanner.isActionFinished" @click="handleRemoveImage">Remove</button>-->
<!--              </div>-->
<!--            </div><hr>-->
<!--            </div>-->
<!--          </div>-->
        </div>
      </el-form>

<!-- Footer -->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmitForm">提交</el-button>
        <el-button @click="open=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="VipBonusInfo" setup>
import {url} from "@/utils/url";
import {getCurrentInstance, reactive, ref, toRefs, watch} from "vue";
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
  getAllVipBonusLogo,
  removeVipBonusBanner,
  removeVipBonusLogo,
  uploadVipBonusBanner,
  uploadVipBonusLogo, getUploadedImages, removeAndListImages, cleanImagesByType,
} from "@/api/config/vipBonusInfo";

const isButtonDisabled    = ref(true); //Used for disabling button
const vipBonusInfoList = ref([]);
const vipBonusTypes    = ref([]);
const showSearch       = ref(true);
const multiple = ref(true); //Multiple Row Selection
const loading  = ref(false);
const single   = ref(true); //Single Row Selection
const title    = ref(); //Form Title
const total    = ref(0); //Total rows
const open     = ref(false); //Opening form
const ids      = ref([]); //Selected ids of table rows
const fileInput = ref(null);
const activityUploadIconParam = ref({type: '',platform: '', field: ''})
const rewardStatus = ref( ['claimable', 'claimed', 'notClaimable', 'notClaimed'])

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

/** Others */
const {proxy}   = getCurrentInstance();
const data      =  reactive({
  queryParams:{
    title: null,
    typeId:null,
    effect: null,
    pageNum: 1,
    pageSize: 10
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
  dateRange: [],
  form:{},
  createBanner:{},
  configurations:{  }
});
const {queryParams, rules, dateRange, form, createBanner, configurations} = toRefs(data);
let formData = new FormData();
const platforms = ref(['all', 'web', "mobile" ]);

/**  Handle Table  */
function handleSearchQuery(){
  queryParams.pageNum = 1;
  listVipBonusActivities()
}
function handleResetQuery(){
  proxy.resetForm("queryForm");
  handleSearchQuery();
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
  getVipBonusInfoList(queryParams.value).then((res)=>{
    vipBonusInfoList.value = res.data
    total.value = res.total
  }).then( () => {
    isButtonDisabled.value = false
  })
}
function handleEffectChange(row){
  if ( isButtonDisabled.value ) return;
  let text = row.effect === '1' ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return vipBonusInfoUpdateStatus(row.id, row.effect)
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
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
/** Handle Form */
function handleClosedForm() {
  listVipBonusActivities()
}
function handleResetData() {
  // createBanner.value = {
  //   type: '1',
  //   isActionFinished: false,
  //   customize: {
  //     iconCollection: null,
  //     properties: {
  //       background: '#030303',
  //       icon: null,
  //       text: 'PUT TEXT HERE',
  //       textStyle: {
  //         font: "Arial, sans-serif",
  //         size: 30,
  //         color: '#ffffff'
  //       }
  //     }
  //   },
  //   preMade: {
  //     bannerCollection: null,
  //     banner: null,
  //   },
  //   pagination: {
  //     param: {
  //       pageNum: 1,
  //       pageSize: 10
  //     },
  //     pageTotal: 1
  //   }
  // };

  configurations.value = {
    vipLevel: 1,
    rewardIcons: {
      web: [],
      mobile: []
    },
    signIn: {
      collectMethod: '1',
      cycle: null,
      customDay: '2',
      dailyData: [],
      listOfDailyData: [],
      statusIcon: {
        web: {
          claimable: null,
          notClaimable: null,
          claimed: null,
          notClaimed: null
        },
        mobile: {
          claimable: null,
          notClaimable: null,
          claimed: null,
          notClaimed: null
        }
      }
    }
  };

  const f = form.value;
  f.id = null;
  f.typeId = 1;
  f.title = null;
  f.scheduleType = '1';
  f.startEffect = null;
  f.platforms = ['mobile']
  f.endEffect = null;
  f.isDisplayHome = false;
  f.configString = null;
  // f.jumpType = '1';
  f.content = '';
  // f.url = null;
  // f.icon = null;
  dateRange.value = []

  cleanImagesByType(['rewardImg', 'statusImg'])
}
function handleChangePlatform(option) {
  //This Logic is based on beforeChanges
  const f = form.value;
  const index = f.platforms.indexOf(option);
  const beforeChange = index === -1 ? [...f.platforms, option] : [...f.platforms.slice(0, index), ...f.platforms.slice(index + 1)];
  const isSelectAllChecked = beforeChange.includes('all');
  const isAllSelected = beforeChange.length === platforms.value.length;

  if (option === 'all') {
    f.platforms = isAllSelected ? platforms.value : isSelectAllChecked ? [] : platforms.value;
  } else if (isAllSelected) {
    f.platforms.splice(f.platforms.indexOf('all'), 1);
  } else if (beforeChange.length === platforms.value.length - 2) {
    f.platforms.push(beforeChange.includes(option) ? option : 'all');
  }
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
  const param      = pagination.param;

  param.pageNum = pageNum;
  if ( createBanner.value.type === '1' ) {
    param.pageSize = 10;
    getAllVipBonusLogo(param).then( res => {
      res.rows = res.rows.map(img => prependActivityInfoImageBaseURI(img))
      customize.iconCollection  = res.rows;
      let icon = customize.properties.icon;
      customize.properties.icon = icon === null ? res.rows[0]: icon;
      pagination.pageTotal = Math.max(1,Math.ceil(res.total / param.pageSize))
    })
  } else {
    param.pageSize = 6;
    getAllVipBonusBanner(param).then( res => {
      preMade.bannerCollection = res.rows;
      let banner = preMade.banner;
      preMade.banner = banner === null ? res.rows[0] : banner;
      pagination.pageTotal = Math.max(1,Math.ceil(res.total / param.pageSize));
    })
  }
}
function prependActivityInfoImageBaseURI(img) {
  return url.baseUrl + url.game99PlatformAdminWeb + "/config/vipBonusInfo/image?url=" + img;
}
function getOriginalImageLink(img){
  const urlRegex = /url=(https?:\/\/[^&]+)/;
  const match = img.match(urlRegex);
  return match ? match[1] : img;
}
function handleImagePagination(isNext){
  event.preventDefault();
  const pageTotal = createBanner.value.pagination.pageTotal;
  let   pageNum    = createBanner.value.pagination.param.pageNum;

  if ( isNext && pageNum < pageTotal ) pageNum++;
  else if ( !isNext && pageNum > 1 ) pageNum--;
  else return;
  createBanner.value.isActionFinished = true;
  setTimeout(() => {
    getBannerCreationRelatedImages(pageNum);
    createBanner.value.isActionFinished = false;
  },500)
}
function handleUploadIcon (type, platform, field){
  activityUploadIconParam.value = {type: type, platform: platform, field: field};
  fileInput.value.click();
}
async function removeImage(platform, type, field, imageUrl) {
  let updatedImages;
  await removeAndListImages(type, platform, field, getOriginalImageLink(imageUrl)).then(  res => {
    res.data = res.data.map(img => prependActivityInfoImageBaseURI(img));
    updatedImages = res.data;
  }).then(()=>{
    switch ( type ) {
      case 'rewardImg': {
        configurations.value.rewardIcons[platform] = updatedImages;
        updateSignInRewardIcons({type: type, platform: platform, field: field});
        break;
      }
      case 'statusImg': {
        configurations.value.signIn.statusIcon[platform][field] = null;
        break;
      }
      //TODO: Add more field in the future
    }
  });
}
function onFileInputChange() {
  const conf = configurations.value;
  const signIn = conf.signIn;
  const newFileInput = fileInput.value;
  const files = Array.from(newFileInput.files);
  const formData = new FormData();
  const param = activityUploadIconParam.value;

  files.forEach( file => {
    formData.append('files', file);
  })
  formData.append('type', param.type)
  formData.append('platform', param.platform)
  formData.append('field', param.field)

  getUploadedImages(formData).then(res => {
    res.data = res.data.map(img => prependActivityInfoImageBaseURI(img));
    const result = Array.isArray(res.data) ? res.data : [res.data];
    switch (param.type){
      case 'rewardImg': {
        conf.rewardIcons[param.field] = result;
        break;
      }
      case 'statusImg': {
        signIn.statusIcon[param.platform][param.field] = result[0];
        break;
      }
    }
  }).then( ()=> {
    newFileInput.value = null;
    activityUploadIconParam.value = null;
    if ( title.value === '添加奖励活动') populateSignInConfigTable();
    else updateSignInRewardIcons(param);
  });
}

/**  Handle Add/Update Bonus Activity */
async function handleAddBonusActivity(){
  await handleResetData()
  // await getBannerCreationRelatedImages(1);
  title.value = "添加奖励活动"
  open.value  = true
  populateSignInConfigTable()
}
function handleUpdateForm(row) {
  handleResetData()
  vipBonusInfoFindById(row.id).then( async res => {
    await populateForm(res.data)
    // await populateBannerConfiguration()
    await populateBonusTypeConfiguration();
  }).then( () => {
    title.value = "更新奖励活动"
    open.value = true;
  })
}
function populateForm( r ){
  const f = form.value;
  f.id = r.id
  f.typeId = r.typeId
  f.title = r.title
  f.scheduleType = r.scheduleType.toString()
  f.startEffect = r.startEffect
  f.endEffect = r.endEffect
  f.isDisplayHome = r.isDisplayHome
  f.configString = r.configString
  // f.jumpType = r.jumpType.toString()
  f.content = r.content
  // f.url = r.url
  // f.icon = r.icon
  f.platforms = r.platforms.split(',');
  dateRange.value = r.scheduleType === 1 ? [ form.value.startEffect, form.value.endEffect ] : []
}
// function populateBannerConfiguration() {
//   let customizedProperties = JSON.parse(form.value.configString).customBannerConfig;
//   let isCustomized = customizedProperties === null ? false : true;
//   if ( isCustomized ) {
//     createBanner.value.type = '1'
//     createBanner.value.customize.properties = customizedProperties;
//   } else {
//     createBanner.value.type = '2'
//     createBanner.value.preMade.banner = form.value.icon;
//   }
//   getBannerCreationRelatedImages(1);
// }
function populateBonusTypeConfiguration(){
  let parsedEventConfig = JSON.parse(form.value.configString).eventConfig;
  switch ( form.value.typeId ) {
    case 1: //Sign In
        const conf = configurations.value
        conf.signIn = parsedEventConfig;
        if ( parsedEventConfig.listOfDailyData.length > 0 ) {
          let listOfDailyData = parsedEventConfig.listOfDailyData;
          conf.signIn.dailyData = listOfDailyData === undefined ? [] : listOfDailyData[0].config;
        }
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
  // f.icon = await getCustomizedOrPreMadeIcon();
  f.startEffect = isScheduleFixed ? dateRange.value[0] : f.startEffect;
  f.endEffect   = isScheduleFixed ? dateRange.value[1] : null;
  f.configString = JSON.stringify({
    eventConfig: getEventConfigByTypeId(),
    customBannerConfig: create.type === '1' ? create.customize.properties : null
  });
  f.platforms = f.platforms.join(',');

  let actionMethod = f.id === null ? vipBonusInfoAdd(f) : vipBonusInfoUpdate(f);
  actionMethod.then(() => {
    proxy.$modal.msgSuccess("修改成功");
    open.value = false;
  })
}
function getEventConfigByTypeId(){
  // TypeId = Vip Bonus Activity Type
  const config = configurations.value;
  const statusIcon = config.signIn.statusIcon;
  const listOfDailyData = config.signIn.listOfDailyData;
  switch ( form.value.typeId ) {
    case 1: {
      const platforms = form.value.platforms.filter( platform => platform !== 'all');
      rewardStatus.value.forEach( status => {
        platforms.forEach( platform => {
          const img = statusIcon[platform][status];
          statusIcon[platform][status] = img === null ? null : getOriginalImageLink(img);
        })
      })

      listOfDailyData.forEach( dailyData => {
        dailyData.config.forEach (data => {
          platforms.forEach( platform => {
            const img = data.rewardIcon[platform];
            if ( img !== null ) data.rewardIcon[platform] = getOriginalImageLink(data.rewardIcon[platform]);
          })
        })
      });
      return config.signIn;
    }
      //TODO: Update this when added more vip bonus activity
    default: return null;
  }
}
// async function getCustomizedOrPreMadeIcon() {
//   let icon = createBanner.value.preMade.banner;
//   if (createBanner.value.type === '1') {
//     const container = document.getElementById('original');
//     await html2canvas(container).then(function (canvas) {
//       icon =  canvas.toDataURL('image/png');
//     });
//   }
//   return icon;
// }

/**  Sign In Related */
function customDay_populateSignInConfigTable(){
  const signIn = configurations.value.signIn;
  let firstConfig = signIn.listOfDailyData[0].config
  if ( firstConfig === undefined ) return;

  signIn.dailyData = []
  for ( let i = 0; i < firstConfig.length; i++ ) {
    let row = firstConfig[i];
    signIn.dailyData .push(
        {
          day: row.day,
          rewardType: row.rewardType,
          rewardAmount: {
            min: null,
            max: null
          },
          topUpRequirement: null,
          codingRequirement: null,
          rewardIcon: row.rewardIcon
        }
    )
  }
}
function updateSignInRewardIcons(param) {
  const icons = configurations.value.rewardIcons[param.platform];
  const signIn = configurations.value.signIn;
  const dataList = signIn.listOfDailyData;

  if (icons.length <= 0) return;

  if ( dataList.length <= 0 ) {
    signIn.dailyData.forEach( (data,i) => {
      data.rewardIcon[param.platform] = icons[i];
    });
  } else {
    dataList.forEach((dataPerVip) => {
      dataPerVip = Array.isArray(dataPerVip) ? dataPerVip : [dataPerVip];
      dataPerVip.forEach( data => {
        data.config.forEach( (config,i) => {
          config.rewardIcon[param.platform] = i >= icons.length ? null : icons[i];
        })
      })
    });
  }
}

function populateSignInConfigTable(){
  const rewardIcons = configurations.value.rewardIcons;
  const signIn = configurations.value.signIn;
  // let cycle = signIn.cycle;
  let cycle = 7;
  signIn.dailyData  = [];

  for ( let i = 0; i < cycle; i++ ) {
    const webImg = rewardIcons.web[i];
    const mobileImg = rewardIcons.mobile[i];

    signIn.dailyData .push(
        {
          day: i+1,
          rewardType: '1',
          rewardAmount: {
            min: null,
            max: null
          },
          topUpRequirement: null,
          codingRequirement: null,
          rewardIcon: {
            web: webImg === undefined ? null : getOriginalImageLink(webImg),
            mobile: mobileImg === undefined ? null : getOriginalImageLink(mobileImg)
          }
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
        config.signIn.dailyData = tableConfig.config
        break;
      }

      if ( signIn.customDay === '1' ) customDay_populateSignInConfigTable()
      else populateSignInConfigTable()
      break;
    }
  }
}
function handleRewardChangeType(scope){
  const rewardIcons = configurations.value.rewardIcons
  scope.row.rewardIcon.web = scope.row.rewardType === '1' ? rewardIcons.web[0] : treasureIcons.value[0];
  scope.row.rewardIcon.mobile = scope.row.rewardType === '1' ? rewardIcons.mobile[0] : treasureIcons.value[0];
}
function saveSignInConfig(){
  const signIn = configurations.value.signIn;
  const indexOfExistingData = signIn.listOfDailyData.findIndex(data => data.level === configurations.value.vipLevel);
  const hasData = indexOfExistingData !== -1;

  if ( hasData ) {
    //Update
    signIn.listOfDailyData[indexOfExistingData].config = signIn.dailyData;
  } else {
    //Insert
    signIn.listOfDailyData.push({
      level: configurations.value.vipLevel,
      config: signIn.dailyData
    });
  }
  ElMessage.success('Success')
}
function resetSignInConfig(){
  configurations.value.signIn.listOfDailyData = []
  configurations.value.vipLevel = 0;
  populateSignInConfigTable()
}
function initQuery(){
  listVipBonusActivities()
  getVipBonusTypeList().then((res)=>{
    vipBonusTypes.value = res
  })
}

initQuery();
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
.image-container {
  display: flex;
}

.image-item {
  margin-left: 10px;
}

.status-close-button {
  padding-bottom: 3px;
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background-color: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-80%, 30%); /* Adjust the values for fine-tuning */
}

.upload-status-icon-button:hover {
  font-size: 10px;
  color: #3498db;
}
.status-close-button:hover {
  background-color: #ff000b;
  color: #ffffff;
  width: 25px; /* Adjust as needed */
  height: 25px; /* Adjust as needed */
  transform: translate(-55%, 15%); /* Adjust the values for fine-tuning */
}

.upload-reward-icon-button {
  cursor: pointer;
  font-size: 10px;
  padding-top: 10px;
  text-align: center;
  width: 50px;
  height: 50px;
  background-color: #3F9DFDFF; /* Set your desired background color */
  color: rgb(255, 255, 255); /* Set your desired text color */
  font-weight: bold;
  border: 3px solid #e0e0e0;
  border-radius: 10px; /* Set your desired border-radius */
}
.upload-image-container {
  padding-top: 5px;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 120px;
  min-height: 65px;
  width: 550px;
  border: 3px solid #e0e0e0;
  padding-left: 5px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
}
.image-preview-container {
  display: inline-block; /* Display images in a row */
  margin-right: 5px; /* Adjust the margin between images as needed */
  margin-bottom:5px ;
  max-height: 50px;
}

.reward-close-button {
  padding-bottom: 1px;
  position: relative;
  justify-content: center;
  align-items: center;
  display: flex;
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
  background-color: #FFFFFF;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  transform: translate(190%,-370%);
}

.reward-close-button:hover {
  background-color: #ff000b;
  color: #ffffff;
  width: 20px; /* Adjust as needed */
  height: 20px; /* Adjust as needed */
  transform: translate(130%, -280%); /* Adjust the values for fine-tuning */
}

.image-wrapper {
  padding-left: 10px;
  position: relative;
  display: flex;
}

.image-preview {
  width: 50px;
  height: 50px;
  border: 3px solid #e0e0e0;
  border-radius: 10px;
  /* Add any additional styling for .image-preview if needed */
}

.status-image-preview {
  width: 80px;
  height: 80px;
  border: 3px solid #e0e0e0;
  border-radius: 10px;
  /* Add any additional styling for .image-preview if needed */
}

.upload-status-icon-button {
  font-size: 10px;
  cursor: pointer;
  position: absolute;
  top: 50%;
  left: 55%;
  transform: translate(-50%, -50%);
}
</style>