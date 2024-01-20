<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="通道名称" prop="name" class="input-wd25">
                <el-input
                        v-model="queryParams.name"
                        placeholder="请输入通道名称"
                        clearable
                        @keyup.enter="handleQuery"/>
            </el-form-item>
            <el-form-item label="状态" prop="effect">
                <el-select
                        v-model="queryParams.effect"
                        placeholder="请选择状态"
                        clearable
                        class="col-w240">
                    <el-option
                            v-for="dict in sys_effect_type"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="支付平台" prop="platformId">
                <el-select
                        filterable
                        v-model="queryParams.platformId"
                        placeholder="请选择支付平台"
                        clearable
                        class="col-w240">
                    <el-option
                            v-for="Platform in payPlatformOptions"
                            :key="Platform.id"
                            :label="Platform.name"
                            :value="Platform.id"/>
                </el-select>
            </el-form-item>

            <el-form-item label="支付类型" prop="typeId">
                <el-select
                        filterable
                        v-model="queryParams.typeId"
                        placeholder="请选择支付类型"
                        clearable
                        class="col-w240">
                    <el-option
                            v-for="payTp in payTypes"
                            :key="payTp.id"
                            :label="payTp.name"
                            :value="payTp.id"/>
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
                        v-hasPermi="['pay:channel:add']"
                >新增
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        size="small"
                        @click="handleExport"
                        v-hasPermi="['pay:channel:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-show="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table :stripe="true" v-loading="loading" :data="payChannelList">
            <el-table-column label="ID" align="center" prop="id"/>
            <el-table-column label="通道名称" align="center" prop="name" min-width="120"/>
            <el-table-column label="支付方式编码" align="center" prop="channelCode" width="120"/>
            <el-table-column label="状态" align="center" prop="effect" width="80">
                <template #default="scope">
                    <el-switch
                            v-model="scope.row.effect"
                            :active-value="true"
                            :inactive-value="false"
                            @click="effectStatusChange(scope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="开启回调" align="center" prop="canCallback" width="80">
                <template #default="scope">
                    <el-switch
                            v-model="scope.row.canCallback"
                            :active-value="true"
                            :inactive-value="false"
                            @click="callbackStatusChange(scope.row)"
                    ></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="支付平台" align="center" prop="platformId" :formatter="formatterPlatformId"/>
            <el-table-column label="支付类型" align="center" prop="typeId" :formatter="formatterTypeId"/>
            <el-table-column label="通道费率" align="center" prop="rateStr"/>
            <el-table-column label="优惠比例" align="center" prop="discountBill" :formatter="formatterDiscountBill"/>
            <el-table-column label="成功率" align="center" prop="successRate"/>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right"
                             min-width="125">
                <template #default="scope">
                    <el-button
                            size="small"
                            link
                            type="primary"
                            icon="Edit"
                            @click="handleUpdate(scope.row)"
                            v-hasPermi="['pay:channel:edit']">修改
                    </el-button>
                    <el-button
                            type="danger"
                            link
                            icon="Delete"
                            size="small"
                            @click="handleDelete(scope.row)"
                            v-hasPermi="['pay:channel:remove']"
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
                :page-sizes="[20,50,100,200]"
                @pagination="getList"
        />

        <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="720px" style="height:500px"
                   append-to-body>
            <el-form ref="payChannelForm" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="通道名称" prop="name">
                    <el-input v-model.trim="form.name" placeholder="请输入通道名称"/>
                </el-form-item>

                <el-form-item label="通道编码" prop="channelCode">
                    <el-input v-model.trim="form.channelCode" placeholder="通道编码"/>
                </el-form-item>

                <div class="el-row">
                    <div class="el-col-lg-12">
                        <el-form-item label="支付平台" prop="platformId">
                            <el-select
                                    filterable
                                    v-model="form.platformId"
                                    placeholder="请选择支付平台"
                                    clearable
                                    class="col-w240">
                                <el-option
                                        v-for="Platform in payPlatformOptions"
                                        :key="Platform.id"
                                        :label="Platform.name"
                                        :value="Platform.id"/>
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="el-col-lg-12">
                        <el-form-item label="支付类型" prop="typeId">
                            <el-select
                                    filterable
                                    v-model="form.typeId"
                                    placeholder="请选择支付类型"
                                    clearable
                                    class="col-w240">
                                <el-option
                                        v-for="dict in payTypes"
                                        :key="dict.id"
                                        :label="dict.name"
                                        :value="dict.id"/>
                            </el-select>
                        </el-form-item>
                    </div>
                </div>

                <el-form-item label="通道费率" prop="rate">
                    <el-input type="number" class="no-number" v-model.trim="form.rate"
                              placeholder="请输入通道费率(最高0.4最低0.01)"/>
                </el-form-item>

                <el-form-item label="优惠比例" prop="discountBill">
                    <el-input type="number" class="no-number" v-model.trim="form.discountBill"
                              placeholder="请输入小数形式的优惠比例"/>
                </el-form-item>
                <el-form-item label="开放层级" prop="openLevelMin">
                    <el-col :span="11">
                        <el-input type="number" class="no-number" v-model.trim="form.openLevelMin"
                                  placeholder="请输入最小开放层级"
                                  oninput="if(value>50){value=50}if(value<0){value=0}value=Number.parseInt(value)"/>
                    </el-col>
                    <el-col :span="2" class="text-center">-</el-col>
                    <el-col :span="11">
                        <el-input type="number" class="no-number" v-model.trim="form.openLevelMax"
                                  placeholder="请输入最大开放层级"
                                  oninput="if(value>50){value=50}if(value<0){value=0}value=Number.parseInt(value)"/>
                    </el-col>
                </el-form-item>

              <el-form-item label="自定义金额" prop="customMoneyMin">
                <el-col :span="11">
                  <el-input type="number" class="no-number" v-model.trim="form.customMoneyMin"
                            placeholder="请输入最小金额"/>
                </el-col>
                <el-col :span="2" class="text-center">-</el-col>
                <el-col :span="11">
                  <el-input type="number" class="no-number" v-model.trim="form.customMoneyMax"
                            placeholder="请输入最最大金额"/>
                </el-col>
              </el-form-item>

                <el-form-item label="快捷金额" prop="quickAmount">
                    <el-input v-model.trim="form.quickAmount" type="textarea"
                              onkeyup="this.value=this.value.replace(/[^\d\,]/g,'')"
                              placeholder="请输入快捷金额,用','分割(英文逗号)"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup name="PayChannel">

import {reactive, ref, toRefs} from "vue";
import {
    addPayChannel,
    changeCallBackPayChannel,
    changeEffectStatus,
    exportPayChannel, getByIdPayChannel,
    listPayChannel, removePayChannel,
    updatePayChannel
} from "@/api/pay/payChannel";
import {payTypeListAll} from "@/api/pay/payType";
import {getAllPayPlatform} from "@/api/pay/payPlatform";
import {downloadExcel} from "@/utils/common";

const router = useRouter();
const {proxy} = getCurrentInstance();

const {sys_effect_type} = proxy.useDict("sys_effect_type");


const payChannelList = ref([]);
const payTypes = ref([]);
const payPlatformOptions = ref([]);

/**  选中数组 */
const ids = ref([]);

const total = ref(0);
const title = ref('');

/**  非单个禁用 */
const single = ref(true);
/**  非多个禁用 */
const multiple = ref(true);

const loading = ref(true);
const showSearch = ref(true);
const open = ref(false);


const data = reactive({

    queryParams: {
        pageNum: 1,
        pageSize: 20,
        name: '',
        effect: null,
        platformId: null,
        typeId: null,
        channelCode: null,
        canCallback: null,
        openLevelMin: null,
        openLevelMax: null,
        rate: null,
    },
    form: {},
    rules: {
        rate: [
            {required: true, message: "通道费率不能为空", trigger: "blur"}
        ],
        name: [
            {required: true, message: "通道名称不能为空", trigger: "blur"}
        ],
        effect: [
            {required: true, message: "状态不能为空", trigger: "blur"}
        ],
        platformId: [
            {required: true, message: "支付平台编号不能为空", trigger: "blur"}
        ],
        typeId: [
            {required: true, message: "支付类型编号不能为空", trigger: "blur"}
        ],
        quickAmount: [
            {required: true, message: "快捷金额不能为空", trigger: "blur"}
        ]
    }

});

const {queryParams, form, rules} = toRefs(data);

/**  handle list all data query */
function getList() {
    loading.value = true
    listPayChannel(queryParams.value).then(res => {
        payChannelList.value = res.data;
        total.value = res.total
        loading.value = false
    })
}

/**  handle list all data query */
function payTypeList() {
    loading.value = true
    payTypeListAll().then(res => {
        payTypes.value = res.data;
    })
}

/**  handle list all data query */
function platFormListAll() {
    loading.value = true
    getAllPayPlatform().then(res => {
        payPlatformOptions.value = res.data;
        loading.value = false
    })
}

platFormListAll()

/** 优惠比例为空，显示0  The discount ratio is empty, showing 0*/
function formatterDiscountBill(row) {
    if (row.discountBill === null) {
        return '0.00'
    } else {
        return row.discountBill
    }
}

function formatterPlatformId(row) {
    for (const a of payPlatformOptions.value) {
        if (a.id === row.platformId) {
            return a.name;
        }
    }
    return "";
}

function formatterTypeId(row) {
    for (const a of payTypes.value) {
        if (a.id === row.typeId) {
            return a.name;
        }
    }
    return "";
}

// 表单重置
function reset() {
    form.value = {
        id: null,
        name: null,
        channelCode: null,
        platformId: null,
        typeId: null,
        openLevelMin: null,
        openLevelMax: null,
        customMoneyMin:null,
        customMoneyMax:null,
        discountBill: null,
        quickAmount: null,
        rate: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        successRate: null,
        rateStr: null
    };
    proxy.resetForm("payChannelForm");
}

/** 搜索按钮操作 handle search query*/
function handleQuery() {
    queryParams.pageNum = 1
    getList()
}

/** 重置按钮操作 handle resetQuery*/
function resetQuery() {
    proxy.resetForm("queryForm");
    handleQuery()
    loading.value = false
}

/**  update query */
function handleUpdate(row) {
    reset();
    const id = row.id || ids.value
    getByIdPayChannel(id).then(res => {
        form.value = res.data
        open.value = true
    })
}

/** handle delete data */
function handleDelete(row) {
    const id = row.id || ids.value
    proxy.$modal.confirm('是否确认删除编号为"' + id + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return removePayChannel(id)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess('删除成功')
    }).catch(() => {
    })
}

/**  handle change callBackStatus query */
function callbackStatusChange(row) {
    let text = row.canCallback ? "启用" : "停用";
    proxy.$modal.confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(function () {
        return changeCallBackPayChannel(row.id, row.canCallback);
    }).then(() => {
        proxy.$modal.msgSuccess(text + "成功");
    }).catch(function () {
        row.canCallback = !row.canCallback
    });

}

/**  handle effect change status query */
function effectStatusChange(row) {
    let text = row.effect ? "启用" : "停用";
    proxy.$modal.confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(function () {
        return changeEffectStatus(row.id, row.effect);
    }).then(() => {
        proxy.$modal.msgSuccess(text + "成功");
    }).catch(function () {
        row.effect = !row.effect
    });

}

/**  handle add dialog */
function handleAdd() {
    title.value = "新增支付通道"
    reset();
    open.value = true
}

/**  handle submit form */
function submitForm() {
    proxy.$refs["payChannelForm"].validate(valid => {
        if (valid) {
            if (form.value.id != null) {
                updatePayChannel(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addPayChannel(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功");
                    open.value = false;
                    getList();
                });
            }
        }
    });
}

/**  导出按钮操作 handle export data as excel query */
function handleExport() {
    proxy.$confirm('确认处理Excel并下载，数据量大的时候会延迟，请耐心等待...', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return exportPayChannel(queryParams.value)
    }).then(response => {
        downloadExcel(response, '支付类型')
    }).catch(() => {
    })
}

/**  cancel dialog */
function cancel() {
    open.value = false
    loading.value = false
    proxy.resetForm("payChannelForm");
}

getList()
payTypeList()
</script>

<style scoped>
.dialog-footer {
    float: right;
}
</style>