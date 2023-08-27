<template>
    <div class="app-container">
        <div v-loading="totalLoading">
            <el-button type="primary" @click="copy1">交易笔数  {{ totalData.total || 0 }}</el-button>
            <el-button type="success" @click="copy2">总成功金额 {{ totalData.successMoney || 0 }}</el-button>
            <el-button type="info" id="copy3" @click="copy3">成功率
                {{ proxy.numberUtil.toPercent(totalData.successRate || 0) }}
            </el-button>
            <el-button type="primary" icon="Search" size="small" @click="listCounts()"
                       style="margin-left: 20px;padding: 10px">统计查询
            </el-button>
        </div>
        <el-form :model="queryParams" ref="queryForm" :inline="true" style="margin-top: 10px" v-show="showSearch"
                 label-width="100px">
            <el-form-item label="更新时间" prop="updateTime" label-width="70px">
                <el-date-picker type="datetimerange"
                                v-model="queryParams.selectDate"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                start-placeholder="开始时间"
                                end-placeholder="开始时间"
                                range-separator="至"
                                :style="{width: '95%'}"
                                clearable
                                :default-time="getDefaultTime()"
                                :shortcuts="proxy.pickerDateTimeShortcuts">
                </el-date-picker>
            </el-form-item>

            <el-form-item prop="status">
                <el-select
                        v-model="queryParams.status"
                        placeholder="全部状态"
                        clearable
                        style="width: 130px">
                    <el-option
                            v-for="dict in recharge_log_status"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item prop="rechargeOrderNo" style="width: 230px;">
                <el-input
                        v-model="queryParams.id"
                        placeholder="订单号"
                        clearable
                        @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item prop="memberId" style="width: 140px;">
                <el-input
                        v-model.trim="queryParams.memberId"
                        placeholder="会员ID"
                        clearable
                        @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item prop="bankAccount">
                <el-select
                        v-model="queryParams.bankAccount"
                        placeholder="公司入款列表"
                        clearable
                        style="width: 130px">
                    <el-option
                            v-for="dict in rechargeBankListOptions"
                            :key="dict.bankAccount"
                            :label="dict.accountName + ' - ' + (dict.bankAccount.substring(dict.bankAccount.length - 4))"
                            :value="dict.bankAccount"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="充值金额" prop="withdrawMoney">
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
            <el-form-item prop="rechargeUserName" style="width: 120px;">
                <el-input
                        v-model="queryParams.rechargeUserName"
                        placeholder="充值人"
                        clearable
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
            <el-form-item>
                <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <!--    tab button-->
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        size="small"
                        :disabled="disabled"
                        @click="handleExport"
                        v-hasPermi="['pay:memberRechargeBank:export']"
                >导出
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
            <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table :stripe="true" v-loading="loading" :data="memberBankRechargeList" :highlight-current-row="true"
                  size="large" :row-class-name="tableRowClassNameWithdraw">
            <el-table-column label="复制" align="center">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="handleCopy(scope.row)">复制</el-button>
                </template>
            </el-table-column>
            <el-table-column label="订单号" :show-overflow-tooltip="true" align="center" prop="rechargeOrderNo"
                             min-width="250"/>
            <el-table-column label="会员ID" :show-overflow-tooltip="true" align="center" prop="memberId"
                             min-width="120"/>
            <el-table-column label="绑卡姓名" align="center" prop="realName" min-width="90" show-overflow-tooltip/>
            <el-table-column label="充值人姓名" :show-overflow-tooltip="true" align="center" prop="rechargeRealName"
                             min-width="100"/>
            <el-table-column label="充值金额" align="center" prop="rechargeMoney" min-width="90"/>
            <el-table-column label="收款人" align="center" prop="bankUserName" min-width="90"/>
            <el-table-column label="银行名称" min-width="120" align="center" prop="bankId">
                <template #default="scope">
                    <div v-for="(item, index) in bankListOptions">
                        <span v-if="item.id === scope.row.bankId">{{ item.bankName }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="收款账号" align="center" prop="bankAccount" min-width="190"/>
            <el-table-column label="状态" align="center" prop="status" min-width="120">
                <template #default="scope">
                    <dict-tag :options="recharge_log_status" :value="scope.row.status"/>
                </template>
            </el-table-column>
            <el-table-column label="是否首次" align="center" prop="first" width="90">
                <template #default="scope">
                    <dict-tag :options="first" :value="scope.row.first"/>
                </template>
            </el-table-column>
            <el-table-column label="操作人" align="center" prop="opName" min-width="120"/>
            <el-table-column label="用户下单时间" align="center" prop="createTime" width="165"/>
            <el-table-column label="最后修改时间" align="center" prop="updateTime" width="165"/>
            <el-table-column label="提交IP" min-width="140" align="center" prop="ip"/>
            <el-table-column label="备注" :show-overflow-tooltip="true" align="center" prop="remark" width="160">
                <template v-slot="{row}">
                    <a style="color: #00afff" @click="updateRemark(row.rechargeOrderNo, row.remark)">{{
                        row.remark
                        }}</a>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right"
                             width="240">
                <template #default="scope">
                    <el-button
                            type="primary"
                            link
                            size="small"
                            icon="Unlock"
                            v-show="scope.row.status === 0"
                            @click="handleFirstAudit(scope.row)"
                            v-hasPermi="['pay:memberRechargeBank:firstAudit']"
                    >初审
                    </el-button>
                    <el-button
                            type="success"
                            link
                            size="small"
                            icon="Check"
                            v-show="scope.row.status === 1"
                            @click="handleFinalAudit(scope.row)"
                            v-hasPermi="['pay:memberRechargeBank:finalAudit']"
                    >终审通过
                    </el-button>
                    <el-button
                            size="small"
                            type="danger"
                            link
                            icon="Close"
                            v-show="scope.row.status === 0 || scope.row.status === 1"
                            @click="handleRefusedAudit(scope.row)"
                            v-hasPermi="['pay:memberRechargeBank:refusedAudit']"
                    >审核不通过
                    </el-button>
                    <el-button
                            size="small"
                            type="info"
                            link
                            icon="Right"
                            v-show="scope.row.status === 2 || scope.row.status === 4"
                            @click="handleRecoverAudit(scope.row)"
                            v-hasPermi="['pay:memberRechargeBank:recoverAudit']"
                    >恢复
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

        <!-- 添加或修改公司入款信息对话框 -->
        <el-dialog :close-on-click-modal="false" title="审核不通过原因" v-model="open" width="260px"
                   style="height: 200px"
                   append-to-body>
            <el-form ref="refusedForm" :model="form" :rules="rules">
                <input v-model="form.id" type="hidden">
                <el-select
                        v-model="form.refusedAuditReason"
                        placeholder="请选择不通过原因"
                        clearable>
                    <el-option
                            v-for="dict in rechargeBankRefusedReason"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                    <el-input
                            v-model="form.refusedAuditReason"
                            placeholder="请输入手写备注"
                            clearable
                            size="small"
                    />
                </el-select>

            </el-form>
            <div slot="footer" class="dialog-footer" style="margin-top: 15px;float: right">
                <el-button type="primary" @click="submitRefusedAudit">确 定</el-button>
                <el-button @click="open=false">取 消</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script name="MemberBankRecharge" setup>

import {reactive, ref, toRefs} from "vue";
import {copyCommand, downloadExcel} from "@/utils/common";
import {getDefaultTime} from "@/utils/dateUtils";
import {
    exportMemberRechargeBank,
    memberRechargeBankCount,
    memberRechargeBankFinalAudit,
    memberRechargeBankFirstAudit,
    memberRechargeBankList,
    MemberRechargeBankRecoverAudit,
    memberRechargeBankRefusedAudit,
    MemberRechargeBankUpdateRemark
} from "@/api/pay/memberRechargeBank";
import {listConfigBankListAll} from "@/api/pay/configBankList";
import {listAllPayRechargeBank} from "@/api/pay/payRechargeBank";

const {proxy} = getCurrentInstance();

const {
    recharge_log_status,
    rechargeBankRefusedReason,
    first
} = proxy.useDict("recharge_log_status", "rechargeBankRefusedReason", "first");

const memberBankRechargeList = ref([]);
const rechargeBankListOptions = ref([]);
const bankListOptions = ref([]);
const total = ref(0);

const refreshSec = ref('5');
const refreshType = ref('primary');
const refreshIcon = ref('Refresh');
const refreshDesc = ref('');
const refreshLabel = ref('开始刷新');

const open = ref(false);
const showSearch = ref(true);
const loading = ref(true);
const disabled = ref(false);
const totalLoading = ref(false);

const apiData = reactive({

    queryParams: {
        pageNum: 1,
        pageSize: 100,
        selectDate: [proxy.parseTime(proxy.getTodayStartTime()), proxy.parseTime(proxy.getTodayEndTime())],
        bankUserName: null,
        priceMin: null,
        priceMax: null,
        rechargeUserName: null,
        opName: null,
        status: null,
        orderByColumn: 'create_time',
        isAsc: 'desc',
    },


    /** 表单参数 form parameter */
    form: {},
    /**  表单校验 form validation */
    rules: {
        refusedAuditReason: [
            {required: true, message: '审核不通过原因不能为空', trigger: 'blur'}
        ]
    },

    /**统计总的数据 total data */
    totalData: {
        totalcount: 0,
        rechargeMoney: 0
    },


});
const {queryParams, form, rules, totalData} = toRefs(apiData)


/** 复制 */
function copy1() {
    copyCommand(totalData.total)
}

function copy2() {
    copyCommand(totalData.successMoney)
}

function copy3() {
    copyCommand(proxy.numberUtil.toPercent(totalData.successRate || 0))
}

/**  查询线下充值信息列表 list all member Recharge Bank report */
function getList() {
    loading.value = true
    memberRechargeBankList(queryParams.value).then(res => {
        memberBankRechargeList.value = res.data;
        total.value = res.total
        loading.value = false
    })
}


/**  列表统计 count */
function listCounts() {
    totalLoading.value = true
    memberRechargeBankCount(queryParams.value).then((res) => {
        totalData.value = res
    }).finally(() => {
        totalLoading.value = false
    })
}

/** 表单重置 */
function reset() {
    form.value = {
        id: null,
        memberId: null,
        rechargeMoney: null,
        bankName: null,
        bankAccount: null,
        status: null,
        remark: null,
        opName: null,
        priceMin: null,
        priceMax: null,
        createTime: null,
        updateTime: null,
        bankAddress: null,
        type: null,
        rechargeUserName: null,
        bankUserName: null,
        rechargeOrderNo: null,
        discountBill: null,
        first: null
    }
    proxy.resetForm('refusedForm')
}

function handleCopy(row) {
    let bankName = '';
    for (const bank of bankListOptions.value) {
        if (row.bankId == bank.id) {
            bankName = bank.bankName
        }
    }
    const textarea = document.createElement("textarea");
    let html = '<table><tr>'
    html += '<td>' + row.rechargeOrderNo + '</td>'
    html += '<td>' + row.memberId + '</td>'
    html += '<td>' + row.rechargeRealName + '</td>'
    html += '<td>' + row.rechargeMoney + '</td>'
    html += '<td>' + row.bankUserName + '</td>'
    html += '<td>' + bankName + '</td>'
    html += '<td>' + '\'' + row.bankAccount + '\'' + '</td>'
    html += '<td>' + row.statusDesc + '</td>'
    html += '<td>' + row.opName + '</td>'
    html += '<td>' + '\'' + row.createTime + '\'' + '</td>'
    html += '<td>' + '\'' + row.updateTime + '\'' + '</td>'
    html += '</tr></table>'
    textarea.value = html;
    copy(html)
}

function copy(data) {
    let url = data;
    let oInput = document.createElement('input');
    oInput.value = url;
    document.body.appendChild(oInput);
    oInput.select(); // 选择对象;
    document.execCommand("Copy"); // 执行浏览器复制命令
    proxy.$message({
        message: '复制成功',
        type: 'success'
    });
    oInput.remove()
}

function tableRowClassNameWithdraw(row) {
    console.info(row)
    if (row.first != null && (row.first === 1 || row.first === 2)) {
        return 'red'
    }
}

/**  handle query*/
function handleQuery() {
    queryParams.pageNum = 1
    getList()
}

/**  handle reset form query*/
function resetQuery() {
    proxy.resetForm('queryForm')
    handleQuery()
}

/** 导出按钮操作 export*/
function handleExport() {
    disabled.value = true
    // const queryParams = this.queryParams
    proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return exportMemberRechargeBank(queryParams.value)
    }).then(response => {
        downloadExcel(response, '线下充值报表')
        loading.value = false
        disabled.value = false
    }).catch(() => {
        disabled.value = false
    })
}


function refreshData() {
    if (refreshType.value === 'primary') {
        refreshType.value = 'danger'
        refreshIcon.value = 'CircleCloseFilled'
        refreshLabel.value = '停止刷新'
        refreshDesc.value = ''
        stopRefresh()
        refreshQuery()
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
            refreshQuery()
            secs = refreshSec.value
        }
        refreshDesc.value = secs + '秒后开始刷新'
        secs--
    }, 1000)
}

function stopRefresh() {
    clearInterval(window.refreshInterval)
}

/** 刷新搜索操作 */
function refreshQuery() {
    queryParams.priceMax = ""
    queryParams.priceMin = ""
    handleQuery()
}


function handleFirstAudit(row) {
    memberRechargeBankFirstAudit({id: row.rechargeOrderNo}).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        if (response.code == 200) {
            open.value = false
            getList()
        }
    })
}


function handleFinalAudit(row) {
    memberRechargeBankFinalAudit({id: row.rechargeOrderNo}).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        if (response.code == 200) {
            open.value = false
            getList()
        }
    })
}

function handleRefusedAudit(row) {
    form.value.id = row.rechargeOrderNo;
    open.value = true
}

function submitRefusedAudit() {
    proxy.$refs['refusedForm'].validate(valid => {
        if (valid) {
            memberRechargeBankRefusedAudit({
                id: form.value.id,
                remark: form.value.refusedAuditReason
            }).then(response => {
                proxy.$modal.msgSuccess(response.msg)
                if (response.code == 200) {
                    open.value = false
                    getList()
                }
            })
        }
    })
}

function bankList() {
    listConfigBankListAll().then(response => {
        bankListOptions.value = response.data;
    });
}

function rechargeBankList() {
    listAllPayRechargeBank().then(response => {
        rechargeBankListOptions.value = response.data;
    });
}

function handleRecoverAudit(row) {
    MemberRechargeBankRecoverAudit({id: row.rechargeOrderNo}).then(response => {
        proxy.$modal.msgSuccess(response.msg)
        if (response.code == 200) {
            open.value = false
            getList()
        }
    })
}

/**
 * 修改备注 member recharge update remark
 */
function updateRemark(rechargeOrderNo, remark) {
    proxy.$modal.prompt("修改备注", '', "info").then(({value}) => {
        return MemberRechargeBankUpdateRemark(rechargeOrderNo, value).then((res) => {
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

getList()
bankList()
rechargeBankList()
</script>

<style scoped>
.red {
    color: #e05e5e;
}
</style>