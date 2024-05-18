<template>
  <div class="app-container">
<!-- query-->
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
              v-for="activityType in activityTypes"
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
      <el-table-column label="活动图 " align="center" prop="icon">
        <template #default="scope">
          <el-image
              style="height: 50px;"
              :src="scope.row.icon"
              fit="contain">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="轮播图" align="center" prop="eventBanner">
        <template #default="scope">
          <el-image
              v-if="scope.row.eventBanner != null"
              style="height: 50px;"
              :src="scope.row.eventBanner"
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
      <el-table-column label="跳转状态" align="center" prop="jumpStatus"  min-width="100">
        <template #default="scope">
          <el-switch
              v-model="scope.row.jumpStatus"
              :active-value="true"
              :inactive-value="false"
              @change="handleJumpStatusChange(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="内部跳转类型" align="center" prop="internalJumpType"  min-width="120"/>
      <el-table-column label="活动跳跃类型" align="center" prop="eventJumpType"  min-width="120"/>

<!--      <el-table-column label="事件跳转状态" align="center" prop="eventJumpStatus"  min-width="120">-->
<!--        <template #default="scope">-->
<!--          <el-switch-->
<!--              v-model="scope.row.eventJumpStatus"-->
<!--              :active-value="true"-->
<!--              :inactive-value="false"-->
<!--              :disabled="true"-->
<!--              @change="handleEventJumpStatusChange(scope.row)">-->
<!--          </el-switch>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="活动跳跃类型" align="center" prop="eventJumpType"  min-width="120"/>-->

      <el-table-column label="排序" align="center" prop="sort"  min-width="50"/>
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

<!-- add or update -->
    <el-dialog
        :title="title"
        v-model="open"
        width="1700px"
        @close="reset"
        style="
          height: auto;
          padding-bottom: 20px
        "
        append--body
    >
      <el-form ref="activityForm" :model="form" :rules="rules" label-width="120">
<!-- Configurations -->
        <div class="el-row">
          <div class="el-col el-col-12" style="padding-right: 50px">
            <label style="font-size: 25px; text-align: left">基本配置</label>
            <hr style="max-width: 800px; margin-top: 15px; margin-left: 0">

            <el-form-item label="活动类型" prop="typeId">
              <el-select
                  filterable
                  v-model="form.typeId"
                  placeholder="请选择活动类型"
                  clearable
                  style="width: 350px">
                <el-option
                    v-for="activityType in activityTypes"
                    :key="activityType.id"
                    :label="activityType.name"
                    :value="activityType.id"/>
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
                              v-model="selectDate"
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
            <el-form-item label="状态" prop="sort">
              <el-input style="width: 110px" v-model="form.sort" placeholder="输入排序编号" @change="signInConfig"/>
            </el-form-item>
            <el-form-item label="主页弹出窗口" label-width="120">
              <el-switch
                  v-model="form.isDisplayHome"
                  class="ml-2"
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              />
            </el-form-item>

            <div v-if="eventIds.includes(form.typeId)">
              <label style="font-size: 25px; text-align: left">{{ activityTypes.find((type) => type.id === form.typeId).name + ' 配置'}}</label>
              <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">
            </div>

<!--         入款优惠 DEPOSIT TYPE -->
            <div v-if="form.typeId === 19">
              <el-form-item label="重置周期" prop="resetCycle" @change="handleResetCycleChange(configurations.deposit.resetCycle)">
                <el-radio-group v-model="configurations.deposit.resetCycle">
                  <el-radio label="1">单人</el-radio>
                  <el-radio label="2">每日</el-radio>
                  <el-radio label="3">每周</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="configurations.deposit.resetCycle !== '1'" label="Limited Recharge" label-width="160">
                <el-switch
                    v-model="configurations.deposit.limitedRechargeSwitch"
                    class="ml-2"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                />
              </el-form-item>
              <el-form-item label="活动条件" prop="activityCondition">
                <el-radio-group v-model="configurations.deposit.activityCondition">
                  <el-radio v-if="configurations.deposit.resetCycle === '1'" label="1">First Deposit</el-radio>
                  <el-radio label="2">存款总额</el-radio>
                  <el-radio label="3">单次充电</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item v-if="configurations.deposit.activityCondition !== '1'" label-width="120" label="存款方式" prop="depositMethod">
                <el-checkbox v-model="selectAllDepositMethod" @change="handleDepositSelectAll" style="padding-right: 10px">全部选择</el-checkbox>
                <el-checkbox-group v-model="configurations.deposit.depositMethod">
                  <el-checkbox v-for="item in depositOptions"
                               :label="item.value"
                               size="large"
                               style="width: auto"
                  >
                    {{ item.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="奖励方法" prop="bonusMethod">
                <el-radio-group v-model="configurations.deposit.bonusMethod" @change="handleBonusMethodChange()">
                  <el-radio label="1">固定金额</el-radio>
                  <el-radio label="2">随机金额</el-radio>
                  <el-radio label="3">比率 金额</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-table :data="depositData" style="max-width: 700px; max-height: 390px;overflow-y: auto; border: 5px solid #e0e0e0; border-radius: 5px" >
                  <el-table-column label="存款金额" width="100" align="center" prop="depositAmount">
                    <template #default="scope">
                      <el-input v-model="scope.row.depositAmount"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="奖金数额" width="150" align="center">
                    <template #default="scope">
                      <template v-if="configurations.deposit.bonusMethod === '1'">
                        <el-input v-model="scope.row.bonusAmount.max"/>
                      </template>
                      <template v-else-if="configurations.deposit.bonusMethod === '2'">
                        <el-input style="width: 50px; right: 5px" v-model="scope.row.bonusAmount.min"/>
                        -
                        <el-input style="width: 50px; left: 5px" v-model="scope.row.bonusAmount.max"/>
                      </template>
                      <template v-else>
                        <el-input style="width: 65px" v-model="scope.row.bonusAmount.max"/> {{ ' %'}}
                      </template>
                    </template>
                  </el-table-column>
                  <el-table-column v-if="configurations.deposit.bonusMethod === '3'" label="奖励限额" width="85" align="center" prop="rewardLimit">
                    <template #default="scope">
                      <el-input v-model="scope.row.rewardLimit"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="活动说明"  align="center"  prop="activityDescription">
                    <template #default="scope">
                      <el-input v-model="scope.row.activityDescription"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="运行" width="140" align="center" >
                    <template #default="scope">
                      <el-button @click="addDepositConfig" style="width: 40px">添加</el-button>
                      <el-button :disabled="depositData.length === 1" @click="removeDepositConfig( scope.$index )" style="width: 60px">移除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </div>
<!--         SIGN IN -->
            <div v-if="form.typeId === 20">
              <el-form-item label="收集方法" prop="signMethod">
                <el-radio-group v-model="configurations.signIn.signMethod">
                  <el-radio label="1">Continuous</el-radio>
                  <el-radio label="2">Cumulative</el-radio>
                  <el-radio label="3">Daily</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="周期" prop="cycle">
                <el-input style="width: 350px" v-model="configurations.signIn.cycle" placeholder="Please enter a number of days" @change="signInConfig"/>
              </el-form-item>
              <el-form-item >
                <el-table :data="signInData" style="max-width: 700px; max-height: 390px;overflow-y:auto; border: 5px solid #e0e0e0; border-radius: 5px"  >
                  <el-table-column label="日" width="50px" align="center" prop="day">
                    <template #default="scope">
                      {{ scope.row.day }}
                    </template>
                  </el-table-column>
                  <el-table-column label="奖励类型" width="105px" align="center"  prop="type">
                    <template #default="scope">
                      <el-select
                          filterable
                          v-model="scope.row.type"
                          style="width: 100px"
                          @change="handleEventChangeType(scope)"
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
                  <el-table-column label="金额" align="center">
                    <template #default="scope">
                      <template v-if="scope.row.type === '1'">
                        <el-input type="number" v-model="scope.row.rewardAmount.max"/>
                      </template>
                      <template v-else>
                        <el-input type="number" style="width: 50px; right: 5px" v-model="scope.row.rewardAmount.min"/>
                        -
                        <el-input type="number" style="width: 50px; left: 5px" v-model="scope.row.rewardAmount.max"/>
                      </template>
                    </template>
                  </el-table-column>
                  <el-table-column label="所需存款" width="80px" align="center"  prop="topUpRequirement">
                    <template #default="scope">
                      <el-input v-model="scope.row.topUpRequirement"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="所需投注" width="80px" align="center"  prop="codingRequirement">
                    <template #default="scope">
                      <el-input v-model="scope.row.codingRequirement"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="奖励图标" align="center" width="165px">
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
                            v-for="icon in ( scope.row.type === '1' ? configurations.rewardIcons : treasureIcons)"
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
            <label style="font-size: 25px;padding-top: 10px; text-align: left">其他配置</label>
            <hr style="max-width: 800px; margin-top: 20px; margin-left: 0">
<!-- Jump Type -->
            <div style="max-width: 1000px">
              <el-form-item label="跳转类型" prop="type">
                <el-radio-group v-model="form.type" @change="handleTypeChange()">
                  <el-radio label="0">活动详情</el-radio>
                  <el-radio label="1">外部浏览器</el-radio>
                  <el-radio label="2">WebView</el-radio>
                  <el-radio label="3">事件跳转状态</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="活动详情" prop="content" v-if="form.type === '0'">
                <WangEditor v-model="form.content" style="max-width: 680px" image-path="ActivityInfo" />
              </el-form-item>
              <el-form-item label="跳转链接" prop="url" v-if="form.type === '1' || form.type === '2'">
                <el-input v-model="form.url" placeholder="请输入图标跳转链接 " style="max-width: 680px"/>
              </el-form-item>
            </div>

            <el-form-item v-if="form.type == 3" label="活动跳跃类型">
              <el-select
                  filterable
                  v-model="form.eventJumpType"
                  style="width: 240px">
                <el-option
                    v-for="jumpType in jumpTypes"
                    :key="jumpType"
                    :label="jumpType"
                    :value="jumpType"/>
              </el-select>
            </el-form-item>

            <div v-if="form.type !== '2'">
              <el-form-item label="跳转状态">
                <el-switch
                    :disabled="form.effect"
                    v-model="form.jumpStatus"
                    :active-value="true"
                    :inactive-value="false">
                </el-switch>
              </el-form-item>

              <el-form-item v-if="form.jumpStatus" label="内部跳转类型">
                <el-select
                    filterable
                    v-model="form.internalJumpType"
                    style="width: 240px">
                  <el-option
                      v-for="jumpType in jumpTypes"
                      :key="jumpType"
                      :label="jumpType"
                      :value="jumpType"/>
                </el-select>
              </el-form-item>
            </div>



<!--            <el-form-item label="事件跳转状态">-->
<!--              <el-switch-->
<!--                  v-model="form.eventJumpStatus"-->
<!--                  :active-value="true"-->
<!--                  :inactive-value="false">-->
<!--              </el-switch>-->
<!--            </el-form-item>-->
          </div>
          <div class="el-col el-col-12">


            <label style="font-size: 25px; text-align: left">首页轮播图</label>
            <hr>
            <imageUpload v-model="form.eventBanner" path="eventBanner"/><br>

            <div>
              <label style="font-size: 25px; text-align: left">活动首页图</label>
              <el-radio-group style="float: right;" v-model="createBanner.type" @change="changeBannerCreationType(createBanner.type)">
                <el-radio style="width: 120px" label="1" border>定制</el-radio>
                <el-radio style="width: 120px" label="2" border>预制</el-radio>
              </el-radio-group><hr style="margin-top: 20px; margin-bottom: 20px">
            </div>

            <label style="font-size: 20px">预览</label>

            <div v-if="createBanner.type === '1'">
              <div class="preview" style="position: relative" id="original">
                <div :style="`background-color: ${createBanner.customize.properties.background}`">
                  <div style="display: inline-flex; justify-content: center; height: 320px; align-items: center">
                    <img :src="createBanner.customize.properties.icon" style=" margin-left: 15px;width: 280px; height: 280px; padding-right: 10px"/>
                  </div>
                  <pre :style=
                   "`
                    display: inline-block;
                    margin-top: 20px;
                    position: absolute;
                    color: ${createBanner.customize.properties.textStyle.color};
                    font-family: ${createBanner.customize.properties.textStyle.font};
                    font-size: ${createBanner.customize.properties.textStyle.size}px
                  `"
                  >{{createBanner.customize.properties.text}}</pre>
                </div>
              </div>
              <hr style="margin-top: 10px">
              <div class="form-group">
                <label for="background">背景颜色:</label>
                <input style="margin-left: 10px; width: 100px; border: 2px solid #000000"
                       v-model="createBanner.customize.properties.background" type="color" id="background"/>
              </div>
              <div class="form-group">
                <label>选择图标:</label><hr>
                <div style="display: grid; grid-template-columns: repeat(10, 1fr)">
                  <div v-for="(icon, index) in createBanner.customize.iconCollection"
                       :key="index"
                       @click="createBanner.customize.properties.icon = icon"
                       :class="{ 'selected-image' : icon === createBanner.customize.properties.icon }"
                       style="cursor: pointer;">
                    <img :src="icon" alt="Icon" style="max-height: 70px; max-width: 70px;padding: 5px 5px 0px" />
                    <div class="custom-banner-close-button" @click="handleRemoveImage('createBannerIcon',null, icon)">x</div>

                  </div>
                </div>
                <div class="pagination" style="margin-top: 10px">
                  <button @click="prevPage('createBannerIcon')">上一页</button>
                  <button style="margin-left: 10px" @click="nextPage('createBannerIcon')">下一页</button>
                  <span> Page:  {{ createBanner.customize.pagination.param.pageNum  }} / {{createBanner.customize.pagination.pageTotal}}</span>
                  <input type="file" ref="fileInput" multiple style="display: none" @change="onFileInputChange()" />
                  <button style="float: right; margin-right: 10px" class="upload-button" @click="handleUploadImage('createBannerIcon',null)">添加</button>
                </div>
              </div>
              <hr>
              <div class="form-group">
                <p>活动说明:</p>
                <label for="font">字体:</label>
                <el-select style="width: 200px" v-model="createBanner.customize.properties.textStyle.font">
                  <el-option v-for="font in fontOptions" :key="font" :label="font" :value="font"></el-option>
                </el-select>
                <label for="text" style="margin-left: 20px">字体颜色:</label>
                <input style="margin-left: 10px; width: 100px; border: 2px solid #000000" v-model="createBanner.customize.properties.textStyle.color" type="color" id="text"/>
                <div style="margin-top: 10px">
                  <label for="text">文字大小:</label>
                  <el-slider
                      v-model="createBanner.customize.properties.textStyle.size"
                      :min="8"
                      :max="48"
                      style="width: 300px"
                  >
                  </el-slider>
                </div>
                <div>
                  <textarea style="height: 100px;width: 300px; margin-top: 5px" v-model="createBanner.customize.properties.text">
                  </textarea>
                </div>
              </div>
            </div>
            <div v-if="createBanner.type === '2'">
              <div class="preview">
                <img :src="createBanner.preMade.banner" style="width: 787px "/>
              </div><hr style="margin-top: 20px; margin-bottom: 20px" >

              <div class="form-group">
                <label style="margin-bottom: 20px">选择横幅:</label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 10px; border: 5px solid #e0e0e0; border-radius: 5px">
                  <div v-for="(banner, index) in createBanner.preMade.bannerCollection"
                       :key="index"
                       @click="createBanner.preMade.banner = banner"
                       :class="{ 'selected-image': banner === createBanner.preMade.banner }"
                       style="cursor: pointer;">
                      <div style="height: 150px; width: 240px">
                        <img :src="banner" alt="Banner" style="height: 150px; width: 270px;  padding: 5px;" />
                        <div class="preMade-banner-close-button" @click="handleRemoveImage('preMadeBanner',null, banner)">x</div>
                      </div>
                  </div>
                </div>
                <div class="pagination" style="margin-top: 10px">
                  <button @click="prevPage('preMadeBanner')">上一页</button>
                  <button style="margin-left: 10px" @click="nextPage('preMadeBanner')">下一页</button>
                  <span> Page:  {{ createBanner.preMade.pagination.param.pageNum  }} / {{ createBanner.preMade.pagination.pageTotal }}</span>
                  <input type="file" ref="fileInput" multiple style="display: none" @change="onFileInputChange()" />
                  <button style="float: right; margin-right: 10px" class="upload-button" @click="handleUploadImage('preMadeBanner',null)">添加</button>
                </div>
              </div><hr>
            </div>
          </div>
        </div>
      </el-form>
<!-- Footer -->
      <div slot="footer" style="float: right">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script name="ActivityInfo" setup>
import {url} from "@/utils/url";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import html2canvas from 'html2canvas';
import {getActivityTypeAllList} from "@/api/activity/activityType";
import WangEditor from "@/components/WangEditor";
import {
  activityInfoAdd,
  activityInfoDelete,
  activityInfoExport,
  activityInfoFindById,
  activityInfoUpdate,
  activityInfoUpdateStatus,
  getActivityInfoList,
  getAllRewardIcon,
  uploadImage,
  listImages, removeImage, activityInfoUpdateJumpStatus, activityInfoUpdateEventJumpStatus
} from "@/api/activity/activityInfo";
import ImageUpload from "@/components/ImageUpload/index.vue";

const {proxy} = getCurrentInstance();
/** 活动信息表格数据 */
const activityInfoList = ref([]);
/** 活动类型 activity type list */
const activityTypes = ref([]);
/** 非单个禁用 */
const single = ref(true);
/** 非多个禁用 */
const multiple = ref(true);
/** 显示搜索条件 */
const showSearch = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref();
const treasureIcons = ref([
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx1.png',
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx2.png',
  'https://company-fj.s3.ap-east-1.amazonaws.com/siteadmin/active/img_qdbx3.png',
]);
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
]);
const depositOptions = ref([
  {
    name: 'IDR',
    value: 2
  },
  // {
  //   name: 'USDT-Trc20',
  //   value: 3
  // },
  // {
  //   name: 'BRL',
  //   value: 4
  // },
  // {
  //   name: 'USDC-Trc20',
  //   value: 5
  // },
  // {
  //   name: 'BTC-Bitcoin',
  //   value: 6
  // }
]);
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
const loading = ref(true);
const open = ref(false);
const selectDate = ref([]);
const selectAllDepositMethod = ref(false);
const data =  reactive({
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
  form:{},
  configurations: {},
  createBanner: {},
  rules:{
    selectDate:[
      { type: 'array', required: true, message: '请选择时间范围', trigger: 'change' },
    ],
    showTime:[
      { type: 'array', required: true, message: '请选择时间范围', trigger: 'change' },
    ],
    title: [
      {required: true, message: "标题不能为空", trigger: "blur"}
    ],
    icon: [
      {required: true, message: "图标不能不上传", trigger: "blur"}
    ],
    typeId: [
      {required: true, message: "活动类型不能为空", trigger: "blur"}
    ],
    /*Jump Type*/
    type: [
      {required: true, message: "跳转类型不能为空", trigger: "blur"}
    ]
  },
  /** updateTime */
});
const fileInput = ref(null);
const activityUploadIconParam = ref({type: '', field: ''})
const eventIds = ref([19,20]);

const jumpTypes = [ "VIP", "DAILY_BONUS", "FUND" ,"RECHARGE","BIND_PHONE" , "INVITER" ]

const {queryParams,form,rules, configurations, createBanner} = toRefs(data);
const {activityInfo_status} = proxy.useDict("activityInfo_status");
const formData = new FormData();

/**  Handle Event Configurations */
function handleEventChangeType(scope){
  const index = scope.row.day - 1;
  const collection = scope.row.type === '1' ? configurations.value.rewardIcons : treasureIcons.value;
  scope.row.iconUrl = collection[index];
}
function signInConfig(){
  const cycle = configurations.value.signIn.cycle;

  signInData.value = []
  for ( let i = signInData.value.length; i < cycle; i++ ) {
    signInData.value.push(
        {
          day: i+1,
          type: '1',
          rewardAmount: {
            min: null,
            max: null
          },
          topUpRequirement: null,
          codingRequirement: null,
          iconUrl: configurations.value.rewardIcons[i]
        }
    )
  }
}
function calculateNumberOfDays(){
  if ( selectDate.value.length === 2){
    const start = new Date(selectDate.value[0]);
    const end = new Date(selectDate.value[1]);
    const timeDifference = end - start;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    configurations.value.signIn.cycle = daysDifference + 1;
    signInConfig( configurations.value.signIn.cycle )
  }
}
function handleDepositSelectAll(){
  configurations.value.deposit.depositMethod = selectAllDepositMethod.value ? depositOptions.value.map(item => item.value) : [];
}
function removeDepositConfig(index){
  depositData.value.splice( index, 1 )
}
function handleResetCycleChange(resetCycle) {
  if ( resetCycle === '2') {
    configurations.value.deposit.activityCondition = '2'
  }
}
function addDepositConfig(){
  depositData.value.push(
      {
        depositAmount: null,
        bonusAmount: { min: null, max: null },
        activityDescription: null,
        rewardLimit: null
      }
  )
}
function handleBonusMethodChange(){
  depositData.value = [
    {
      depositAmount: null,
      bonusAmount: {
        min: null,
        max: null
      },
      activityDescription: null,
      rewardLimit: null
    }
  ]
}

/**  Handle Images */
function  getPaginationByImageType(type){
  const create = createBanner.value;
  switch (type){
    case 'createBannerIcon': return create.customize.pagination;
    case 'preMadeBanner': return create.preMade.pagination;
  }
}
async function listImage(type) {
  const pagination = getPaginationByImageType(type);
  const param = pagination.param;

  let result = {
    images: null,
    pageTotal: null
  }

  await listImages(param).then(res => {
    res.rows = res.rows.map(img => prependActivityInfoImageBaseURI(img));
    const totalPages = Math.ceil(res.total / param.pageSize);
    result.images = res.rows;
    result.pageTotal = Math.max(1, totalPages);
  }).then( () => {
    if ( result.pageTotal < param.pageNum ) {
      const tempPageNum = param.pageNum - 1;
      param.pageNum = Math.max(1,tempPageNum);
      listImage(type)
    }
  }).then( () => {
    const creation = createBanner.value;
    switch (type) {
      case 'createBannerIcon': {
        const customize = creation.customize;
        customize.iconCollection = result.images;
        customize.properties.icon = result.images[0];
        // customize.pagination.pageTotal = result.pageTotal;
        break;
      }
      case 'preMadeBanner': {
        const preMade = creation.preMade;
        preMade.bannerCollection = result.images;
        preMade.banner = result.images[0];
        // preMade.pagination.pageTotal = result.pageTotal;
        break;
      }
    }
    pagination.pageTotal = result.pageTotal;
  });
}
function listRewardIcons ( param ) {
  getAllRewardIcon(param).then(res => {
    configurations.value.rewardIcons = res.data
  })
}
function handleUploadImage (type, field){
  event.preventDefault();
  activityUploadIconParam.value = {type: type, field: field};
  fileInput.value.click();
}
function onFileInputChange(){
  const newFileInput = fileInput.value;
  const files = Array.from(newFileInput.files);
  const formData = new FormData();
  const param = activityUploadIconParam.value;

  files.forEach( file => {
    formData.append('files', file);
  })
  formData.append('type', param.type)
  formData.append('field', param.field)

  uploadImage(formData).then( () => {
    listImage(param.type);
  }).then( ()=> {
    newFileInput.value = null;
    activityUploadIconParam.value = null;
  });
}
async function handleRemoveImage(type, field, imageUrl) {
  await removeImage(type, field, getOriginalImageLink(imageUrl))
  await listImage(type)
}
function nextPage(type) {
  event.preventDefault();
  const create = createBanner.value;
  const pagination = type === 'createBannerIcon' ? create.customize.pagination : create.preMade.pagination;
  if ( pagination.param.pageNum < pagination.pageTotal ) {
    pagination.param.pageNum++;
    listImage(type)
  }
}
function prevPage(type){
  event.preventDefault();
  const create = createBanner.value;
  const pagination = type === 'createBannerIcon' ? create.customize.pagination : create.preMade.pagination;
  const param = pagination.param;
  if ( param.pageNum > 1 ) {
    param.pageNum --;
    listImage(type);
  }
}
function getOriginalImageLink(img){
  const urlRegex = /url=(https?:\/\/[^&]+)/;
  const match = img.match(urlRegex);
  return match ? match[1] : img;
}
function prependActivityInfoImageBaseURI(img) {
  return url.baseUrl + url.game99PlatformAdminWeb + "/activity/activityInfo/image?url=" + img;
}
function changeBannerCreationType(type){
  const create = createBanner.value;
  const collection = type === '1' ? create.customize.iconCollection : create.preMade.bannerCollection;
  if ( collection === null ) listImage(type === '1' ? 'createBannerIcon' : 'preMadeBanner');
}


/** Handle add button*/
async function handleAdd(){
  await reset()
  await listImage('createBannerIcon')
  await listRewardIcons()
  title.value = "添加活动信息"
  open.value = true
}
/** Handle delete data */
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
/** Handle export data*/
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

/** Handle update*/
function handleUpdate(row){
  reset();
  activityInfoFindById(row.id).then( async res => {
    await populateForm(res.data)
    await populateBonusTypeConfiguration()
    await populateBannerConfiguration();
  }).then( () => {
    title.value = "修改活动信息";
    open.value = true;
  })
}
function populateForm(rspData){
  selectDate.value = rspData.scheduleType === 1 ? [rspData.startEffect, rspData.endEffect] : [];
  const f = form.value;
  f.id = rspData.id;
  f.effect = rspData.effect;
  f.typeId = rspData.typeId;
  f.title = rspData.title;
  f.scheduleType = rspData.scheduleType.toString();
  f.startEffect = rspData.startEffect
  f.isDisplayHome = rspData.isDisplayHome;
  f.configString = rspData.configString;
  f.type = rspData.type.toString();
  f.content = rspData.content;
  f.url = rspData.url;
  f.icon = rspData.icon;
  f.sort = rspData.sort;
  f.jumpStatus = rspData.jumpStatus
  f.internalJumpType = rspData.internalJumpType
  f.eventJumpStatus = rspData.eventJumpStatus
  f.eventJumpType = rspData.eventJumpType
}
async function populateBannerConfiguration(){
  const configString = form.value.configString;
  const parsedConfigString = JSON.parse(configString);
  const customBannerConfig = parsedConfigString.customBannerConfig;
  const isCustomized = customBannerConfig === null ? false : true;

  await listImage( isCustomized ? 'createBannerIcon' : 'preMadeBanner').then( ()=> {
    const create = createBanner.value;
    if ( isCustomized ) {
      create.type = '1'
      create.customize.properties = customBannerConfig;
    } else {
      create.type = '2'
      create.preMade.banner = form.value.icon;
    }
  });

}
function populateBonusTypeConfiguration(){
  let parsedEventConfig = JSON.parse(form.value.configString).eventConfig;
  if (parsedEventConfig === null ) return
  const conf = configurations.value
  switch ( form.value.typeId ) {
    case 19: {
      conf.deposit = parsedEventConfig;
    }
    case 20: {
      listRewardIcons()
      const signIn = configurations.value.signIn;
      signIn.cycle = parsedEventConfig.cycle;
      signIn.signMethod = parsedEventConfig.signMethod;
      signIn.signInData = parsedEventConfig.signInData;
      signInData.value = parsedEventConfig.signInData;
    }
  }
}

/** Handle Submit form*/
async function submitForm() {
  proxy.$refs["activityForm"].validate(async valid => {
    if (!valid) return;
  });

  const f = form.value;
  const isScheduleFixed = f.scheduleType === '1';
  const create = createBanner.value;

  f.icon = await getCustomizedOrPreMadeIcon();
  f.startEffect = isScheduleFixed ? selectDate.value[0] : f.startEffect;
  f.endEffect = isScheduleFixed ? selectDate.value[1] : null;
  f.configString = JSON.stringify({
    eventConfig: getEventConfigByTypeId(),
    customBannerConfig: create.type === '1' ? create.customize.properties : null
  });

  let actionMethod = f.id === null ? activityInfoAdd(f) : activityInfoUpdate(f);
  actionMethod.then(() => {
    getList()
  }).then( () => {
    proxy.$modal.msgSuccess("修改成功");
    open.value = false;
  })
}
async function getCustomizedOrPreMadeIcon() {
  let icon;
  if (createBanner.value.type === '1') {
    const container = document.getElementById('original');
    await html2canvas(container).then(function (canvas) {
      icon = canvas.toDataURL('image/png');
    });
  } else {
    icon = getOriginalImageLink(createBanner.value.preMade.banner);
  }
  return icon;
}
function getEventConfigByTypeId(){
  const config = configurations.value;
  switch (form.value.typeId) {
    case 19: return config.deposit;
    case 20: return config.signIn;
    default: return null; // or handle other cases as needed
  }
}

/** Handle Reset Form*/
async function reset() {
  await resetCreateBannerConfig();
  await resetEventConfig()
  await resetForm()
}
function resetEventConfig(){
  signInData.value = [];
  configurations.value = {
    rewardIcons: [],
    deposit: {
      resetCycle: '1',
      limitedRechargeSwitch: false,
      activityCondition: '1',
      depositMethod: [],
      bonusMethod: '1',
      tableData: depositData
    },
    signIn: {
      signMethod: '1',
      cycle: null,
      signInData: signInData
    }
  }
}
function resetForm(){
  selectDate.value = [];
  const f = form.value;
  f.id = null;
  f.typeId = activityTypes.value[0].id;
  f.title = null;
  f.scheduleType = '1';
  f.isDisplayHome = false;
  f.startEffect = null;
  f.configString = null;
  f.type = '1';
  f.content = '';
  f.url = '';
  f.icon = null;
  f.eventBanner = null
  f.sort = null;
  f.creationType = '1';
  f.jumpStatus = false
  f.internalJumpType = null;
  f.eventJumpStatus = false
  f.eventJumpType = null;
}
function resetCreateBannerConfig(){
  createBanner.value = {
    type: '1',
    customize: {
      iconCollection: null,
      properties: {
        background: '#030303',
        icon: null,
        text: '在此处输入文字',
        textStyle: {
          font: "Arial, san-serif",
          size: 30,
          color: '#ffffff'
        }
      },
      pagination: {
        pageTotal: 1,
        param: {
          type: 'createBannerIcon',
          pageNum: 1,
          pageSize: 20
        }
      },
    },
    preMade: {
      bannerCollection: null,
      banner: null,
      pagination: {
        pageTotal: 1,
        param: {
          type: 'preMadeBanner',
          pageNum: 1,
          pageSize: 9
        }
      },
    },
  }
}

/**  Old Methods */
function getList(){
  loading.value = true
  getActivityInfoList(proxy.addDateRange(queryParams.value)).then((res)=>{
    activityInfoList.value = res.data
    total.value = res.total
    loading.value = false
  })
}
function activityTypeList(){
  getActivityTypeAllList().then((res)=>{
    activityTypes.value = res;
  })
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 0=Event Details 1=Jump Link */
function formatterType(row) {
  if (row.type == 0) {
    return '活动详情'
  } else if (row.type == 1) {
    return '内部浏览器'
  } else if( row.type == 2 ) {
    return '外部浏览器'
  } else if( row.type == 3 ){
    return '事件跳转状态'
  } else {
    return ''
  }
}
function formatterActivityType(row) {
  for (const a of activityTypes.value) {
    if (a.id === row.typeId) {
      return a.name;
    }
  }
  return "";
}
function handleQuery(){
  queryParams.pageNum = 1;
  getList()
}
function resetQuery(){
  proxy.resetForm("queryForm");
  handleQuery();
  loading.value = false;
}
/**  0停用1启用 */
function handleEffectChange(row){
  let text = row.effect ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then ( () => {
    activityInfoUpdateStatus( row.id, row.effect )
    row.eventJumpStatus = row.effect
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.effect = !row.effect
  })
}

function handleJumpStatusChange(row){
  let text = row.jumpStatus ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
      activityInfoUpdateJumpStatus( row.id, row.jumpStatus )
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.jumpStatus = !row.jumpStatus
  })
}

function handleEventJumpStatusChange(row){
  let text = row.eventJumpStatus ? '启用' : '停用'
  proxy.$modal.confirm('确认要"' + text + '""' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return activityInfoUpdateEventJumpStatus( row.id, row.eventJumpStatus )
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.eventJumpStatus = !row.eventJumpStatus
  })
}

function handleTypeChange() {
  form.value.eventJumpStatus = form.value.type == 3
}

getList()
activityTypeList()
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
  height: 330px;
  max-width: 800px;
  margin-top: 10px;
  padding: 5px;
  border: 1px solid #ccc;
}

.selected-image {
  border: 3px solid #00dfff;
}

.custom-banner-close-button {
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
  width: 20px;
  height: 20px;
  transform: translate(230%,-350%);
}

.custom-banner-close-button:hover {
  background-color: #ff000b;
  color: #ffffff;
  width: 25px; /* Adjust as needed */
  height: 25px; /* Adjust as needed */
  transform: translate(170%, -290%); /* Adjust the values for fine-tuning */
}

.preMade-banner-close-button {
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
  width: 25px;
  height: 25px;
  transform: translate(820%,-550%);
}

.preMade-banner-close-button:hover {
  background-color: #ff000b;
  color: #ffffff;
  width: 30px; /* Adjust as needed */
  height: 30px; /* Adjust as needed */
  transform: translate(660%, -460%); /* Adjust the values for fine-tuning */
}

</style>