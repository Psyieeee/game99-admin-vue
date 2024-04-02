<template>
    <div class="app-container">
        <!--    total button-->
        <div v-loading="totalLoading">
            <el-button type="success" @click="copy1">成功出款笔数 {{ totalData.total || 0 }}</el-button>
            <el-button type="primary" @click="copy3">成功出款金额 {{ totalData.successTotal || 0 }}</el-button>
            <el-button type="warning" @click="copy2">成功率 {{ totalData.successRate || 0 }}</el-button>
            <el-button type="primary" @click="totalCount" size="small" icon="Search">统计查询</el-button>
        </div>

        <!--    search form -->
        <el-form :model="queryParams" ref="queryForm" :inline="true" style="margin-top: 10px" v-show="showSearch">
            <el-form-item prop="updateTime">
                <el-date-picker type="datetimerange"
                                v-model="queryParams.selectDate"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                :style="{width: '95%'}"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                range-separator="至"
                                clearable
                                :default-time="getDefaultTime()"
                                :shortcuts="proxy.pickerDateTimeShortcuts">
                </el-date-picker>
            </el-form-item>
            <el-form-item prop="status" style="width: 130px">
                <el-select v-model="queryParams.status" placeholder="全部状态" clearable>
                    <el-option value="-1" label="首次提现会员"/>
                    <el-option
                            v-for="dict in member_withdraw_status"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"/>
                </el-select>
            </el-form-item>
            <el-form-item prop="searchValue" style="width: 200px">
                <el-input
                        v-model.trim="queryParams.searchValue"
                        placeholder="会员ID/收款人/订单号"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="提现金额" prop="withdrawMoney" label-width="70px">
                <el-input
                        v-model="queryParams.priceMin"
                        placeholder="￥"
                        clearable
                        autocomplete="on"
                        min="0"
                        style="width: 86px"
                        type="number"
                        class="no-number"
                        @keyup.enter="handleQuery"
                />
                -
                <el-input
                        v-model="queryParams.priceMax"
                        placeholder="￥"
                        clearable
                        autocomplete="on"
                        min="0"
                        style="width: 86px"
                        type="number"
                        class="no-number"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item prop="opName" style="width: 120px;">
                <el-input
                        v-model="queryParams.opName"
                        placeholder="操作人"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item prop="remark" style="width: 100px;">
                <el-input
                        v-model="queryParams.remark"
                        placeholder="备注"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item prop="searchCardBlack" style="width: 155px;">
                <el-select v-model="queryParams.searchCardBlack" placeholder="银行归属地黑名单" clearable>
                    <el-option
                            v-for="item in CardBlackOptions"
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

        <!--    buttons -->
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        size="small"
                        :disabled="disabled"
                        @click="openExport"
                        v-hasPermi="['pay:memberWithdrawDetail:export']"
                >导出
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        size="small"
                        :disabled="disabled"
                        @click="handleShunWeiExport"
                        v-hasPermi="['pay:memberWithdrawDetail:export']"
                >顺为代付格式导出
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="danger"
                        plain
                        icon="CirclePlusFilled"
                        size="small"
                        @click="handleBatchRefused"
                        v-hasPermi="['pay:memberWithdrawDetail:refused']"
                >批量拒绝
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="primary"
                        plain
                        icon="Lock"
                        size="small"
                        @click="handleBatchLock"
                        v-has-permi="['pay:memberWithdrawDetail:lock']"
                >批量锁定
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="success"
                        plain
                        icon="Finished"
                        size="small"
                        @click="handleBatchMemberWithdrawButt"
                        v-has-permi="['pay:agentChannel:list']"
                >批量代付
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="primary"
                        plain
                        icon="CopyDocument"
                        size="small"
                        @click="handleBatchCopy"
                >批量复制
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="primary"
                        plain
                        icon="CopyDocument"
                        size="small"
                        @click="handleBatchOrderNoCopy"
                >订单号复制
                </el-button>
            </el-col>
            <el-col :span="7">
                <el-descriptions :column="3" size="small">
                    <el-descriptions-item label="记录刷新" width="175px">
                        <el-select v-model="refreshSec" placeholder="时间间隔" style="width: 110px" size="small">
                            <el-option value="5" label="5秒"></el-option>
                            <el-option value="10" label="10秒"></el-option>
                            <el-option value="15" label="15秒"></el-option>
                            <el-option value="20" label="20秒"></el-option>
                            <el-option value="30" label="30秒"></el-option>
                        </el-select>
                    </el-descriptions-item>
                    <el-descriptions-item width="100px">
                        <el-button :type="refreshType" :icon="refreshIcon" size="small" @click="refreshData">
                            {{ refreshLabel }}
                        </el-button>
                    </el-descriptions-item>
                    <el-descriptions-item>{{ refreshDesc }}</el-descriptions-item>
                </el-descriptions>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>


        <!--    display data in table -->
        <el-table v-loading="loading" :data="memberWithdrawDetailsList"
                  :highlight-current-row="true" @selection-change="handleSelectionChange">

            <el-table-column type="selection" width="50" align="center"/>
            <el-table-column label="复制" align="center" width="110">
                <template #default="scope">
                    <el-button
                            type="primary" size="small"
                            style="margin-left: 0 !important;"
                            @click="handleCopy(scope.row)">复制
                    </el-button>
                    <el-button
                            type="primary" link size="small"
                            icon="CopyDocument"
                            style="margin-left: 0 !important;"
                            @click="handleCopy2(scope.row)"/>
                </template>
            </el-table-column>
            <el-table-column label="提现订单号" min-width="210" align="center" prop="withdrawOrderNo"/>
            <el-table-column label="提现人" min-width="150" align="center" prop="withdrawId">
                <template #default="scope">
                    <a style="color: #ffa200" @click="funds(scope.row.withdrawId)"
                       v-if="scope.row.status === 7">{{ scope.row.withdrawId }}</a>
                    <a style="color: #00afff" @click="funds(scope.row.withdrawId)"
                       v-if="scope.row.status === 0 || scope.row.status === 1">{{ scope.row.withdrawId }}</a>
                    <a style="color: #ff0000" @click="funds(scope.row.memberId)"
                       v-if="scope.row.status === 4">{{ scope.row.withdrawId }}</a>
                    <a style="color: #ee00ff" @click="funds(scope.row.withdrawId)"
                       v-if="scope.row.status === 2 || scope.row.status === 3 || scope.row.status === 5">{{
                        scope.row.withdrawId
                        }}</a>
                    <a style="color: #59b00f" @click="funds(scope.row.withdrawId)"
                       v-if="scope.row.status === 6">{{ scope.row.withdrawId }}</a>
                </template>
            </el-table-column>
            <el-table-column label="提现请求" min-width="100" align="center" prop="withdrawMoney">
                <template v-slot="{row}">
                    <a style="color: #00afff" @click="copyColumn(row.withdrawMoney)">{{ row.withdrawMoney }}</a>
                </template>
            </el-table-column>
            <el-table-column label="取款成功" min-width="100" align="center" prop="withdrawMoneySuccess">
                <template v-slot="{row}">
                    <a style="color: #00afff" @click="copyColumn(row.withdrawMoneySuccess)">{{ row.withdrawMoneySuccess }}</a>
                </template>
            </el-table-column>
            <el-table-column label="是否首次" width="80" align="center" prop="first">
                <template #default="scope">
                    <dict-tag :options="first" :value="scope.row.first"/>
                </template>
            </el-table-column>
            <el-table-column label="收款人" min-width="100" align="center" prop="realName">
                <template v-slot="{row}">
                    <a style="color: #00afff" @click="copyColumn(row.realName)">{{ row.realName }}</a>
                </template>
            </el-table-column>
            <el-table-column label="银行名称" min-width="120" align="center" prop="bankId">
                <template #default="scope">
                    <div v-for="(item, index) in bankListOptions">
                        <span v-if="item.id === scope.row.bankId">{{ item.bankName }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="银行账号" min-width="180" align="center" prop="cardAccount">
                <template v-slot="{row}">
                    <a style="color: #00afff" @click="copyColumn(row.cardAccount)">{{ row.cardAccount }}</a>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center" prop="status">
                <template #default="scope">
                    <dict-tag :options="member_withdraw_status" :value="scope.row.status"/>
                </template>
            </el-table-column>
          <el-table-column label="操作人" min-width="120" align="center" prop="opName"/>
          <el-table-column label="审核备注" min-width="200" align="center" prop="remark"
                           :show-overflow-tooltip="true">
            <template v-slot="{row}">
              <a style="color: #00afff" @click="updateRemark(row.withdrawOrderNo, row.remark)">{{
                  row.remark
                }}</a>
            </template>
          </el-table-column>
          <el-table-column label="下单时间" width="160" align="center" prop="createTime"/>
          <el-table-column label="最后修改时间" width="160" align="center" prop="updateTime"/>
            <el-table-column label="提现费用" min-width="100" align="center" prop="withdrawFeeAmount">
              <template v-slot="{row}">
                <a style="color: #00afff" @click="copyColumn(row.withdrawFeeAmount)">{{ row.withdrawFeeAmount }}</a>
              </template>
            </el-table-column>
            <el-table-column label="入款姓名" min-width="120" align="center" prop="rechargeUserName"/>
            <el-table-column label="公司入款成功次数" min-width="130" align="center" prop="bankRechargeNum"/>
            <el-table-column min-width="100" align="center" prop="rechargeWithdrawRate" label="入款出款比">
              <template v-slot="{row}">
                <span style="color: #FF5722" v-if="row.rechargeWithdrawRate > 10">{{row.rechargeWithdrawRate }}</span>
                <span v-else>{{ row.rechargeWithdrawRate }}</span>
              </template>
            </el-table-column>
            <el-table-column label="投注打码比例" min-width="110" align="center" prop="rechargeBcodeRate"/>
            <el-table-column label="操作" min-width="350" align="center" class-name="small-padding fixed-width"
                             fixed="right">
                <template #default="scope">
                    <el-button
                            type="info"
                            plain
                            v-show="scope.row.status === 4"
                            icon="Right"
                            @click="handleBack(scope.row)"
                            v-has-permi="['pay:memberWithdrawDetail:back']">回退
                    </el-button>
                    <el-button
                            type="info"
                            link
                            v-show="scope.row.status === 5"
                            icon="Right"
                            @click="handleFailBack(scope.row)"
                            v-has-permi="['pay:memberWithdrawDetail:back']"
                    >回退
                    </el-button>
                    <el-button
                            type="primary"
                            link
                            v-show="scope.row.status === 4 || scope.row.status === 5"
                            icon="Search"
                            @click="handleQueryStatus(scope.row)"
                            v-has-permi="['pay:memberWithdrawDetail:queryStatus']"
                    >查询状态
                    </el-button>
                    <el-button
                            type="primary"
                            link
                            v-show="scope.row.status === 0"
                            icon="Lock"
                            @click="handleLock(scope.row)"
                            v-has-permi="['pay:memberWithdrawDetail:lock']"
                    >锁定
                    </el-button>
                    <el-button
                            type="primary"
                            link
                            v-show="scope.row.status === 1"
                            icon="Unlock"
                            @click="handleUnlock(scope.row)"
                            v-has-permi="['pay:memberWithdrawDetail:unlock']"
                    >解锁
                    </el-button>
                    <el-button
                            type="success"
                            link
                            v-show="scope.row.status == 1 || scope.row.status == 7 || scope.row.status == 8"
                            icon="el-icon-circle-check"
                            @click="handleWithdraw(scope.row)"
                            v-has-permi="['pay:memberWithdrawDetail:artificial']"
                    >出款
                    </el-button>
                    <el-button
                            type="danger"
                            link
                            v-show="scope.row.status < 2 || scope.row.status == 5 || scope.row.status == 7 || scope.row.status == 8"
                            icon="el-icon-circle-close"
                            @click="handleRefused(scope.row)"
                            v-has-permi="['pay:memberWithdrawDetail:refused']"
                    >拒绝
                    </el-button>
                    <el-button
                            type="warning"
                            link
                            v-show="scope.row.status == 5"
                            icon="el-icon-s-custom"
                            @click="handleArtificialWithdraw(scope.row)"
                            v-has-permi="['pay:memberWithdrawDetail:artificial']"
                    >人工出款
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <pagination
                v-show="total"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                :page-sizes="[20,50,100]"
                @pagination="getList"
        />

        <!-- 添加或修改会员提现信息对话框 Add or modify member withdrawal information dialog-->
        <el-dialog :close-on-click-modal="false" title="出款明细" v-model="open" width="500px" append-to-body>
            <el-form ref="memberWidthForm" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="会员ID" prop="withdrawId">
                    <el-input v-model="form.withdrawId" readonly/>
                </el-form-item>
                <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="form.realName" readonly/>
                </el-form-item>
                <el-form-item label="银行账号" prop="cardAccount">
                    <el-input v-model="form.cardAccount" readonly/>
                </el-form-item>
                <el-form-item label="申请出款" prop="withdrawMoney">
                    <el-input v-model="form.withdrawMoney" readonly/>
                </el-form-item>
                <el-form-item label="提现订单号" prop="withdrawOrderNo">
                    <el-input v-model="form.withdrawOrderNo" readonly/>
                </el-form-item>
                <el-form-item label="Google验证码" prop="googleAuthCode">
                    <el-input v-model="form.googleAuthCode" placeholder="代付需输入Google验证码"/>
                </el-form-item>
                <el-form-item label="代付平台" prop="payAgentChannelId">
                    <el-select v-model="form.payAgentChannelId" placeholder="代付需选择代付平台" clearable>
                        <el-option v-for="plat in payAgentChannelOptions" :key="plat.id" :label="plat.name"
                                   :value="plat.id"/>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="dialog-footer">
                <el-button
                        type="primary"
                        link
                        size="small"
                        @click="handlePayChannel"
                        :disabled="payChannelDisabled"
                        v-has-permi="['pay:agentChannel:order']"
                >代 付
                </el-button>
                <el-button
                        type="success"
                        link
                        size="small"
                        @click="handleArtificialWithdraw2"
                        v-has-permi="['pay:memberWithdrawDetail:artificial']"
                >出 款
                </el-button>
<!--                <el-button-->
<!--                        type="warning"-->
<!--                        link-->
<!--                        size="small"-->
<!--                        @click="handleAbnormalWithdrawal"-->
<!--                        v-show="form.status !== 7 && form.status !== 8"-->
<!--                        v-has-permi="['pay:memberWithdrawDetail:abnormalWithdrawal']"-->
<!--                >出款异常-->
<!--                </el-button>-->
                <el-button
                        type="danger"
                        link
                        size="small"
                        @click="handleDialogRefused"
                        v-has-permi="['pay:memberWithdrawDetail:refused']"
                >拒 绝
                </el-button>
                <el-button
                        type="info"
                        link
                        size="small"
                        @click="open=false">取 消
                </el-button>
            </div>
        </el-dialog>

        <!-- excelPrompt dialog -->
        <el-dialog :close-on-click-modal="false" title="导出Excel" v-model="openExcel" width="500px"
                   style="height: 200px" append-to-body>
            <el-form ref="queryExcelForm" :inline="true" label-width="68px">
                <el-form-item label="选择日期" prop="selectDate">
                    <el-date-picker type="datetimerange"
                                    v-model="updateTime"
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    :style="{width: '95%'}"
                                    start-placeholder="开始时间"
                                    end-placeholder="开始时间"
                                    range-separator="至"
                                    clearable
                                    :default-time="getDefaultTime()"
                                    :shortcuts="proxy.pickerDateTimeShortcuts"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitExcelForm">确 定
                </el-button>
                <el-button @click="openExcel=!openExcel">取 消</el-button>
            </div>
        </el-dialog>

        <el-dialog :close-on-click-modal="false" title="批量代付" v-model="data.batchMemberWithdrawOpen" width="500px"
                   append-to-body
        >
            <el-form ref="batchForm" :model="batchMemberWithdrawForm" :rules="rules" label-width="120px">
                <el-form-item label="Google验证码" prop="googleAuthCode">
                    <el-input v-model="batchMemberWithdrawForm.googleAuthCode" placeholder="代付需输入Google验证码"/>
                </el-form-item>
                <el-form-item label="代付平台" prop="payAgentPlatId">
                    <el-select v-model="batchMemberWithdrawForm.payAgentChannelId" placeholder="代付需选择代付平台"
                               clearable size="small">
                        <el-option v-for="plat in payAgentChannelOptions" :key="plat.id" :label="plat.name"
                                   :value="plat.id"/>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button
                        type="primary"
                        plain
                        size="small"
                        @click="handleBatchPayAgentOk"
                        v-has-permi="['pay:agentChannel:order']"
                >代 付
                </el-button>
                <el-button
                        type="info"
                        plain
                        size="small"
                        @click="cancel"
                >取 消
                </el-button>
            </div>
        </el-dialog>
        <TableShow ref="tableShow"/>
    </div>
</template>

<script name="MemberWithdrawDetails" setup>

import {reactive, ref, toRefs} from "vue";
import {
    memberWithdrawDetailAbnormalWithdrawal,
    memberWithdrawDetailArtificial,
    memberWithdrawDetailBack,
    memberWithdrawDetailCountTotal,
    memberWithdrawDetailExport,
    memberWithdrawDetailExportShunWei,
    memberWithdrawDetailFailBack,
    memberWithdrawDetailGetById,
    memberWithdrawDetailList,
    memberWithdrawDetailLock,
    memberWithdrawDetailLocks,
    memberWithdrawDetailQueryStatus,
    memberWithdrawDetailRefused,
    memberWithdrawDetailRefuseds, memberWithdrawDetailReportById,
    memberWithdrawDetailUnLock, memberWithdrawDetailUpdateRemark
} from "@/api/pay/memberWithdrawDetail";
import DictTag from "@/components/DictTag";
import {getDefaultTime} from "@/utils/dateUtils";
import {payAgentChannelEffectList, preOrderPayAgentChannel, preOrdersPayAgentChannel} from "@/api/pay/payAgentChannel";
import {listConfigBankListAll} from "@/api/pay/configBankList";
import TableShow from "./tableShow"
import {ElMessage, ElMessageBox} from 'element-plus'
import {MemberRechargeBankUpdateRemark} from "@/api/pay/memberRechargeBank";

const {proxy} = getCurrentInstance();

const {member_withdraw_status, first} = proxy.useDict("member_withdraw_status", "first")

const memberWithdrawDetailsList = ref([]);

const payAgentChannelOptions = ref([]);
const ids = ref([]);
const total = ref(0);
const memberStatus = ref(null);


const open = ref(false);
const payChannelDisabled = ref(false);
const openExcel = ref(false);
const single = ref(true);
const multiple = ref(false);
const totalLoading = ref(false);
const showSearch = ref(true);
const disabled = ref(false);
const loading = ref(false);
const payDisabled = ref(false);
const bankListOptions = ref([]);

const refreshSec = ref('5');
const refreshDesc = ref('');
const refreshIcon = ref('Refresh');
const refreshType = ref('primary');
const refreshLabel = ref('开始刷新');

const data = reactive({

    queryParams: {
        pageNum: 1,
        pageSize: 20,
        status: null,
        priceMin: null,
        priceMax: null,
        opName: null,
        remark: null,
        searchCardBlack: null,
        selectDate: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
        orderByColumn: 'create_time',
        isAsc: 'desc',
    },
    /** updateTime */
    updateTime: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],

    totalData: {
        total: 0,
        successRate: 0
    },
    /** 银行卡黑名单下拉框 */
    CardBlackOptions: [{
        value: '1',
        label: '是'
    }, {
        value: '0',
        label: '否'
    }],
    batchMemberWithdrawOpen: false,
    batchMemberWithdrawForm: {},
    memberWithdrawOptions: [],
    orderNos: [],
    /** 表单参数 form*/
    form: {},
    /**   表单校验 */
    rules: {
        googleAuthCode: [
            {required: true, message: 'google验证码不能为空', trigger: 'blur'}
        ],
        payAgentChannelId: [
            {required: true, message: '请选择代付平台', trigger: 'blur'}
        ]
    }

});
const {
    queryParams,
    updateTime,
    orderNos,
    CardBlackOptions,
    totalData,
    form,
    rules,
    batchMemberWithdrawOpen,
    batchMemberWithdrawForm,
    memberWithdrawOptions
} = toRefs(data);

function handleBatchMemberWithdrawButt() {
    if (ids.value.length <= 0) {
        msgWarning('请选择需要代付出款选项')
        return
    }
    batchMemberWithdrawOpen.value = true

    payAgentChannelEffectList().then(response => {
        payAgentChannelOptions.value = response.data
        console.log(payAgentChannelOptions + "batch effect")
    })
}

function cancel() {
    open.value = false
    batchMemberWithdrawOpen.value = false
    reset()
}

function handleBatchPayAgentOk() {
    console.log("handlebatch")
    proxy.$refs['batchForm'].validate(valid => {
        if (valid) {
            for (const row of memberWithdrawDetailsList.value) {
                for (const id of ids.value) {
                    if (id == row.withdrawOrderNo) {
                        orderNos.value.push(row.withdrawOrderNo)
                    }
                }
            }
            preOrdersPayAgentChannel({
                payAgentChannelId: batchMemberWithdrawForm.value.payAgentChannelId,
                withdrawOrderNos: orderNos.value,
                googleAuthCode: batchMemberWithdrawForm.value.googleAuthCode,
            }).then(response => {
              proxy.$modal.msgSuccess(response.msg)
              if (response.code == 200) {
                batchMemberWithdrawOpen.value = false
                getList()
                var successNum = response.data.success
                var failData = response.data.fail
                var failTxt = '成功数量: ' + successNum + ';<br/> 失败原因: <br/>'
                for (let failDataKey in failData) {
                  failTxt += failDataKey + '  ' + failData[failDataKey] + ' ;<br/> '
                }
                proxy.$alert(failTxt, '批量代付信息', {
                  confirmButtonText: '确定',
                  dangerouslyUseHTMLString: true
                })
              }
            })
        } else {
          proxy.$modal.msgError("表单验证不通过")
        }
    })
}

function copy1() {
    proxy.copyCommand(totalData.value.total, proxy);
}

function copy2() {
    proxy.copyCommand(totalData.value.successRate, proxy);
}

function copy3() {
    proxy.copyCommand(totalData.value.successTotal, proxy);
}

/** 查询会员提现信息列表 Query the list */
function getList() {
    loading.value = true
    memberWithdrawDetailList(queryParams.value).then(response => {
        memberWithdrawDetailsList.value = response.data
        total.value = response.total
        loading.value = false
    })
}


/** 多选框选中数据 */
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.withdrawOrderNo)
    single.value = selection.length !== 1
    multiple.value = !selection.length
}

// function tableRowClassNameWithdraw({row}) {
//   if (row.first != null && (row.first == 1 || row.first == 2 )){
//     return 'register-row'
//   } else if (row.bankCharge !== null && row.bankCharge > 10) {
//     return 'warning-row'
//   } else if (row.rechargeCodeRatio !== null && row.multipleCode != null && (parseFloat(row.rechargeCodeRatio) < parseFloat(row.multipleCode)
//       || row.rechargeCodeRatio === row.multipleCode)) {
//     return 'warning-row'
//   } else if (row.rechargeUserNameStatus == 1) {
//     return 'warning-row'
//   } else if (row.bankName != null && row.bankName === 'GOPAY') {
//     return 'gopay-row'
//   }
// }

/**  Query the list */
function reset() {
    form.value = {
        searchValue: null,
        withdrawMoney: null,
        status: null,
        updateTime: []
    }
    proxy.resetForm('memberWidthForm')
}


/**
 * 获取会员提现信息统计 Get member withdrawal information statistics
 */
function totalCount() {
    totalLoading.value = true
    memberWithdrawDetailCountTotal(queryParams.value).then((res) => {
        totalData.value = res.data
    }).finally(() => {
        totalLoading.value = false
    })
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
    queryParams.pageNum = 1;
    getList();

}

/** 重置按钮操作 handle resetQuery*/
function resetQuery() {
    proxy.resetForm('queryForm')
    handleQuery()
}

/**
 * 导出会员提现信息列表 export form
 */
function openExport() {
    openExcel.value = true
}

/**
 * 导出会员提现信息列表 export data
 */
function submitExcelForm() {
    if (updateTime.value) {
        const time1 = new Date(updateTime.value[1]).getTime();
        const time2 = new Date(updateTime.value[0]).getTime();
        if ((time1 - time2) < 604800000) {
            proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function () {
                return memberWithdrawDetailExport(proxy.addDateRange(queryParams.value, updateTime.value))
            }).then(response => {
                openExcel.value = false
                proxy.downloadExcel(response, '支付信息日志')
            })
        } else {
            proxy.$notify.warning("所选时间不能大于七天")
        }
    }
}

/**
 * 顺为代付格式导出会员提现信息列表  handle shunWeiExport
 */
function handleShunWeiExport() {
    if (ids.value.length <= 0) {
        proxy.$modal.msgError('请勾选需要导出的记录,不勾选无法导出')
        return
    }
    disabled.value = true
    proxy.$modal.confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return memberWithdrawDetailExportShunWei(ids.value)
    }).then(response => {
        proxy.downloadExcel(response, '顺为代付提现')
        disabled.value = false
    }).catch(() => {
        disabled.value = false
    })
}

/** 会员提现拒绝 handle multiple refused by selected */
function handleBatchRefused() {
    if (ids.value.length <= 0) {
        proxy.$modal.msgWarning('请选择需要拒绝出款选项')
        return
    }
    proxy.$modal.prompt(null, '请输入拒绝出款原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then(({value}) => {
        memberWithdrawDetailRefuseds({ids: [ids.value], remark: value}).then(response => {
            proxy.$modal.msgSuccess(response.msg)
            open.value = false
            getList()
        })
    }).catch(() => {
    })
}

/** 会员提现锁定 handle lock */
function handleBatchLock() {
    if (ids.value.length <= 0) {
        proxy.$modal.msgWarning('请选择需要锁定出款选项')
        return
    }
    memberWithdrawDetailLocks({ids: ids.value}).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        getList()
    })
}

/**  处理复制选择项目 handle copy select items */
function handleBatchCopy() {
    if (ids.value.length <= 0) {
        proxy.$modal.msgWarning('请选择需要批量复制选项')
        return
    }
    const textarea = document.createElement('textarea');
    let html = ''
    for (const row of memberWithdrawDetailsList.value) {
        for (const id of ids.value) {
            if (id == row.withdrawOrderNo) {
                let bankName = '';
                for (const bank of bankListOptions.value) {
                    if (row.bankId == bank.id) {
                        bankName = bank.bankName
                    }
                }
                html += '<table><tr>'
                html += '<td>' + row.withdrawOrderNo + '</td>'
                html += '<td>' + row.withdrawId + '</td>'
                html += '<td>' + row.withdrawMoney + '</td>'
                html += '<td>' + row.bankUserName + '</td>'
                html += '<td>' + bankName + '</td>'
                html += '<td>' + '\'' + row.bankAccount + '\'' + '</td>'
                html += '<td>' + row.statusDes + '</td>'
                html += '<td>' + row.opName + '</td>'
                html += '<td>' + '\'' + row.createTime + '\'' + '</td>'
                html += '<td>' + '\'' + row.updateTime + '\'' + '</td>'
                html += '</tr></table>'
            }
        }
    }
    textarea.value = html
    proxy.copyCommand(proxy.copyData = html, proxy)
}

/**  处理复制选择项目 handle copy select items */
function handleCopy(row) {
    let bankName = '';
    for (const bank of bankListOptions.value) {
        if (row.bankId == bank.id) {
            bankName = bank.bankName
        }
    }
    const textarea = document.createElement('textarea');
    let html = '<table><tr>'
    html += '<td>' + row.withdrawOrderNo + '</td>'
    html += '<td>' + row.withdrawId + '</td>'
    html += '<td>' + row.withdrawMoney + '</td>'
    html += '<td>' + row.bankUserName + '</td>'
    html += '<td>' + bankName + '</td>'
    html += '<td>' + '\'' + row.bankAccount + '\'' + '</td>'
    html += '<td>' + row.statusDes + '</td>'
    html += '<td>' + row.opName + '</td>'
    html += '<td>' + '\'' + row.createTime + '\'' + '</td>'
    html += '<td>' + '\'' + row.updateTime + '\'' + '</td>'
    html += '</tr></table>'
    textarea.value = html
    proxy.copyCommand(proxy.copyData = html, proxy)
}

/**  处理复制选择项目 handle copy select items */
function handleCopy2(row) {
    let bankName = '';
    for (const bank of bankListOptions.value) {
        if (row.bankId == bank.id) {
            bankName = bank.bankName
        }
    }
    var textarea = document.createElement('textarea')
    let html = row.withdrawOrderNo
        + '\r\n' + row.withdrawId
        + '\r\n' + row.withdrawMoney
        + '\r\n' + row.rechargeUserName
        + '\r\n' + row.bankRechargeNum
        + '\r\n' + row.rechargeWithdrawRate
        + '\r\n' + row.rechargeBcodeRate
        + '\r\n' + (row.first ? '是' : '否')
        + '\r\n' + row.bankUserName
        + '\r\n' + bankName
        + '\r\n' + row.bankAccount
        + '\r\n' + row.statusDes
        + '\r\n' + row.opName
        + '\r\n' + row.remark
        + '\r\n' + row.createTime
        + '\r\n' + row.updateTime
    textarea.value = html
    proxy.copyCommand(proxy.copyData = html, proxy)
}

/**  处理复制选择项目 handle copy 1 items */
function copyColumn(value) {
    proxy.copyCommand(value, proxy)
}

/**  处理复制选择项目 handle  not order copy select items */
function handleBatchOrderNoCopy() {
    let textarea;
    if (ids.value.length <= 0) {
        textarea = document.createElement('textarea');
        let html = ''
        for (const row of memberWithdrawDetailsList.value) {
            html += row.withdrawOrderNo + '\r,'
        }
        textarea.value = html
        proxy.copyCommand(proxy.copyData = html, proxy)
        return
    }
    textarea = document.createElement('textarea');
    let html = ''
    for (const row of memberWithdrawDetailsList.value) {
        for (const id of ids.value) {
            if (id == row.withdrawOrderNo) {
                html += row.withdrawOrderNo + '\r,'
            }
        }
    }
    textarea.value = html
    proxy.copyCommand(proxy.copyData = html, proxy)
}

/**
 * 修改备注 member Withdraw Detail update remark
 */
function updateRemark(withdrawOrderNo, remark) {
    proxy.$modal.prompt("修改备注", '', "info").then(({value}) => {
        return memberWithdrawDetailUpdateRemark(withdrawOrderNo, value).then((res) => {
            if (res.code === 200) {
                loading.value = true
                proxy.$modal.msgSuccess(res.msg)
                getList()
            } else {
                proxy.$modal.msgError(res.msg)
            }
        }).catch(() => {
            proxy.$modal.msgError('网络异常')
        })
    }).finally(() => {
        loading.value = false
    })
}

/** 会员提现回退 handle click turn back */
function handleBack(row) {
    proxy.$modal.confirm('请与三方仔细核对该订单是否成功提交,如该订单已提交成功不应回退,避免重复出款.确认回退？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return memberWithdrawDetailBack(row.withdrawOrderNo);
    }).then(response => {
        getList()
        proxy.$modal.msgSuccess("回退成功")
    })
}

/** 会员提现代付失败回退 handle Member's withdrawal and payment failure will be refunded */
function handleFailBack(row) {
    const id = row.id;
    proxy.$modal.confirm('请与三方仔细核对该订单是否已代付失败,如未确认该订单代付失败不应回退,避免重复出款.确认回退？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return memberWithdrawDetailFailBack(row.withdrawOrderNo);
    }).then(response => {
        getList()
        proxy.$modal.msgSuccess("回退成功")
    })
}

/** 会员提现查询状态 handle change status */
function handleQueryStatus(row) {
    loading.value = true
    memberWithdrawDetailQueryStatus({
        orderNo: row.withdrawOrderNo
    }).then(response => {
        getList()
        proxy.$modal.prompt(response.msg, '查询结果', {
            confirmButtonText: '知道了',
            customClass: 'message_box_alert',
        })
    }).finally(() => {
        loading.value = false
    })
}

/** handle lock 会员提现锁定 */
function handleLock(row) {
    memberWithdrawDetailLock({id: row.withdrawOrderNo}).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        getList()
    })
}

/** handle unlock 会员提现解锁 */
function handleUnlock(row) {
    memberWithdrawDetailUnLock({id: row.withdrawOrderNo}).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        getList()
    })
}

/** handleWithdraw */
function handleWithdraw(row) {
    reset()
    memberWithdrawDetailGetById(row.withdrawOrderNo).then(response => {
        form.value = response.data
        open.value = true
    }).then(() => {
        //代付平台
        payAgentChannelEffectList().then(response => {
            payAgentChannelOptions.value = response.data
        })
    })
}

/** 会员提现批量拒绝 Member withdrawals are rejected in batches*/
function handleRefused(row) {
    proxy.$modal.prompt(null, '请输入拒绝出款原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '拒绝原因不可为空'
    }).then(({value}) => {
        memberWithdrawDetailRefused({id: row.withdrawOrderNo, remark: value}).then(response => {
            proxy.$modal.msgSuccess(response.msg)
            open.valu = false
            getList()
        })
    }).catch(() => {
    })
}

/**  会员提现人工出款 handleArtificialWithdraw  */
function handleArtificialWithdraw() {
    memberWithdrawDetailArtificial(
        {
            id: form.value.withdrawOrderNo,
            payAgentChannelId: form.value.payAgentChannelId
        }).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        if (response.code == 200) {
            open.value = false
            getList()
        }
    }).catch(() => {
        proxy.$modal.msg({
            type: 'info',
            message: '已取消出款'
        });
    });
}

function handlePayChannel() {
    proxy.$refs['memberWidthForm'].validate(valid => {
        if (valid) {
            payDisabled.value = true
            preOrderPayAgentChannel({
                payAgentChannelId: form.value.payAgentChannelId,
                withdrawOrderNo: form.value.withdrawOrderNo,
                googleAuthCode: form.value.googleAuthCode
            }).then(response => {
                proxy.$modal.msgSuccess(response.msg)
                open.value = false
                getList()
                payDisabled.value = false
            }).catch(() => {
                proxy.$modal.msgError('网络异常')
            }).finally(() => {
                getList()
                payDisabled.value = false
            })
        } else {
            proxy.$modal.msgError("表单验证不通过")
        }
    })
}

/**  会员出款异常 handleAbnormalWithdrawal  */
function handleAbnormalWithdrawal() {
    proxy.$modal.prompt(null, '请输入出款异常原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    }).then((value) => {
        memberWithdrawDetailAbnormalWithdrawal(
            {
                id: form.value.withdrawOrderNo,
                remark: value
            }
        ).then(response => {
            proxy.$modal.msgSuccess(response.msg);
            if (response.code == 200) {
                open.value = false
                getList()
            }
        }).catch(() => {
        })
    })

}

/**  会员出款异常 handle refused  */
function handleDialogRefused(row) {
    proxy.$modal.prompt(null, '请输入拒绝出款原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '拒绝原因不可为空'
    }).then(({value}) => {
        memberWithdrawDetailRefused({
            id: form.value.withdrawOrderNo,
            remark: value
        }).then(response => {
            proxy.$modal.msgSuccess(response.msg)
            open.value = false
            getList()
        })
    }).catch(() => {
    })
}

function bankList() {
    listConfigBankListAll().then(response => {
        bankListOptions.value = response.data;
    });
}

function handleArtificialWithdraw2() {
    memberWithdrawDetailArtificial({id: form.value.withdrawOrderNo}).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        if (response.code == 200) {
            open.value = false
            getList()
        }
    })
}

/** fund details */
function funds(memberId) {
    memberWithdrawDetailReportById(memberId).then((res) => {
        proxy.$refs["tableShow"].show(res.data);
    })
}


function refreshData() {
    if (refreshType.value === 'primary') {
        refreshType.value = 'danger'
        refreshIcon.value = 'CircleCloseFilled'
        refreshLabel.value = '停止刷新'
        refreshDesc.value = ''

        stopRefresh()
        getList()
        startRefresh()
    } else {
        refreshType.value = 'primary'
        refreshIcon.value = 'Refresh'
        refreshLabel.value = '开始刷新'
        refreshDesc.value = ''
        stopRefresh()
    }
}

function startRefresh() {
    let secs = refreshSec.value
    window.refreshInterval = setInterval(function () {
        if (secs === 0) {
            getList()
            secs = refreshSec.value
        }
        refreshDesc.value = secs + '秒后开始刷新'
        secs--
    }, 1000)
}

function stopRefresh() {
    clearInterval(window.refreshInterval)
}

getList()
bankList()

</script>

<style scoped>

</style>