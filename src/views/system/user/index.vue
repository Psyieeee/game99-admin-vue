<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名称" prop="userName">
        <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
            v-model="queryParams.status"
            placeholder="用户状态"
            clearable
            style="width: 240px"
        >
          <el-option
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px;">
        <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:user:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:user:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:user:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center"/>
      <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="columns[0].visible"/>
      <el-table-column label="用户名称" align="center" key="userName" prop="userName" v-if="columns[1].visible"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="用户昵称" align="center" key="nickName" prop="nickName" v-if="columns[2].visible"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="状态" align="center" key="status" v-if="columns[3].visible">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="MFA验证" align="center" key="otpSecret" prop="otpSecret" v-if="columns[4].visible">
        <template #default="scope">
          <el-button type="primary" link @click="showQrCode(scope.row)" v-if="scope.row.otpSecret!=='1'">
            未绑定
          </el-button>
          <span type="primary" v-else>已绑定</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[5].visible" width="160"/>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top" v-if="scope.row.userId !== 1">
            <el-button
                type="primary"
                link
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['system:user:edit']"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="scope.row.userId !== 1">
            <el-button
                type="danger"
                link
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['system:user:remove']"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="重置密码" placement="top" v-if="scope.row.userId !== 1">
            <el-button
                type="primary"
                link
                icon="Key"
                @click="handleResetPwd(scope.row)"
                v-hasPermi="['system:user:resetPwd']"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="重置MFA" placement="top" v-if="scope.row.userId !== 1">
            <el-button
                type="primary"
                link
                icon="Unlock"
                @click="handleResetOtp(scope.row)"
                v-hasPermi="['system:user:resetOtp']"
            ></el-button>
          </el-tooltip>
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

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20"
                        show-password/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                    v-for="dict in sys_user_sex"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                    v-for="dict in sys_normal_disable"
                    :key="dict.value"
                    :label="dict.value"
                >{{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择">
                <el-option
                    v-for="item in roleOptions"
                    :key="item.roleId"
                    :label="item.roleName"
                    :value="item.roleId"
                    :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="margin-top: -35px">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!--重置用户密码对话框 -->
    <el-dialog :title="resetPwdTitle" v-model="resetPwdOpen" width="500px" append-to-body>
      <el-form :model="resetPwdForm" :rules="resetPwdRules" ref="resetPwdRef" label-width="80px">
        <el-form-item label="重置密码" prop="password">
          <el-input v-model="resetPwdForm.password" type="password" placeholder="请输入用户密码" maxlength="30"
                    autocomplete="new-password"/>
        </el-form-item>
        <el-form-item label="验证密钥" prop="otpCode">
          <el-input v-model="resetPwdForm.otpCode" placeholder="请输入验证密钥" type="number" class="no-number"
                    oninput="if(value.length>6)value=value.slice(0,6)"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="resetPwdSubmitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 未绑定OTP验证码弹框 -->
    <el-dialog :close-on-click-modal="false" :title="otpDialogTitle" v-model="otpVisible"
               width="350px">
      <div style="text-align: center">
        <img :src="pic" alt="绑定MFA验证器" height="310"/>
        <el-input v-model="userName" v-show="false"/>
        <el-input v-model="secretKey" v-show="false"/>
        <el-input placeholder="请输入MFA验证码" v-model="otpAuthCode" style="width: 70%"/>
        <el-button type="primary" @click="bound">绑定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="User">
import {
  addUser,
  boundOtpSecret,
  changeUserStatus,
  delUser,
  getOtpSecretQrcode,
  getUser,
  listUser,
  resetUserOtpSecret,
  resetUserPwd,
  updateUser
} from "@/api/system/user";

const router = useRouter();
const {proxy} = getCurrentInstance();
const {sys_normal_disable, sys_user_sex} = proxy.useDict("sys_normal_disable", "sys_user_sex");

const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const initPassword = ref(undefined);
const roleOptions = ref([]);

const resetPwdOpen = ref(false);
const resetPwdTitle = ref("重置用户密码");

//OTP验证码点击关闭
const otpVisible = ref(false);
const otpDialogTitle = ref("绑定MFA验证码");
//OTP验证器二维码
const pic = ref(undefined);
const secretKey = ref('');
const otpAuthCode = ref('');
const otpAuthSecret = ref('');
const userName = ref('');

// 列显隐信息
const columns = ref([
  {key: 0, label: `用户编号`, visible: true},
  {key: 1, label: `用户名称`, visible: true},
  {key: 2, label: `用户昵称`, visible: true},
  {key: 3, label: `状态`, visible: true},
  {key: 4, label: `MFA验证`, visible: true},
  {key: 5, label: `创建时间`, visible: true}
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    userName: undefined,
    status: undefined
  },
  rules: {
    userName: [{required: true, message: "用户名称不能为空", trigger: "blur"}, {
      min: 2,
      max: 20,
      message: "用户名称长度必须介于 2 和 20 之间",
      trigger: "blur"
    }],
    nickName: [{required: true, message: "用户昵称不能为空", trigger: "blur"}],
    password: [{required: true, message: "用户密码不能为空", trigger: "blur"}, {
      min: 5,
      max: 20,
      message: "用户密码长度必须介于 5 和 20 之间",
      trigger: "blur"
    }],
  },
  resetPwdForm: {},
  resetPwdRules: {
    otpCode: [{required: true, message: "验证密钥不能为空", trigger: "blur"}],
    password: [{required: true, message: "重置密码不能为空", trigger: "blur"}, {
      min: 6,
      max: 20,
      message: "用户密码长度必须介于 6 和 20 之间",
      trigger: "blur"
    }],
  },
});

const {queryParams, form, rules, resetPwdForm, resetPwdRules} = toRefs(data);

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

/** 查询用户列表 */
function getList() {
  loading.value = true;
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false;
    userList.value = res.data;
    total.value = res.total;
  });
};

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
};

/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value;
  proxy.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？').then(function () {
    return delUser(userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
};

/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗?').then(function () {
    return changeUserStatus(row.userId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  reset();
  const userId = row.userId || ids.value;
  resetPwdForm.value.userId = userId;
  resetPwdOpen.value = true;
};

function handleResetOtp(row) {
  proxy.$prompt('请输入MFA验证码', "重置用户" + row.userName + "的MFA秘钥", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^[0-9]{6}$/,
    inputErrorMessage: "MFA验证码必须为6位数字",
  }).then(({value}) => {
    resetUserOtpSecret(row.userId, value).then(response => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess(response.msg)
        this.getList()
      } else {
        proxy.$modal.msgError(response.msg)
      }
    });
  }).catch(() => {
  });
}

function bound() {
  boundOtpSecret(userName.value, secretKey.value, otpAuthCode.value).then(response => {
    if (response.code === 200) {
      proxy.$modal.msgSuccess("绑定成功");
      otpVisible.value = false;
      getList();
    } else {
      proxy.$modal.msgError(response.msg)
    }
  })
}

function showQrCode(row) {
  userName.value = row.userName
  otpAuthCode.value = undefined
  otpVisible.value = true
  const name = row.userName
  getOtpSecretQrcode(name).then(response => {
    pic.value = 'data:image/png;base64,' + response.data.qrBarcodeBase
    secretKey.value = response.data.secretKey
  })
}

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    roleIds: []
  };
  proxy.resetForm("userRef");

  resetPwdForm.value = {
    userId: undefined,
    password: undefined,
    otpCode: undefined,
  };
  proxy.resetForm("resetPwdRef");
};

/** 取消按钮 */
function cancel() {
  open.value = false;
  resetPwdOpen.value = false;
  reset();
};

/** 新增按钮操作 */
function handleAdd() {
  reset();
  getUser().then(response => {
    roleOptions.value = response.roles;
    open.value = true;
    title.value = "添加用户";
    form.value.password = initPassword.value;
  });
};

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const userId = row.userId || ids.value;
  getUser(userId).then(response => {
    form.value = response.data;
    roleOptions.value = response.roles;
    form.value.roleIds = response.roleIds;
    open.value = true;
    title.value = "修改用户";
    form.password = "";
  });
};

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addUser(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
};

function resetPwdSubmitForm() {
  proxy.$refs["resetPwdRef"].validate(valid => {
    if (valid) {
      if (resetPwdForm.value.userId != undefined) {
        resetUserPwd(resetPwdForm.value).then(response => {
          proxy.$modal.msgSuccess(response.msg);
          resetPwdOpen.value = false;
          getList();
        });
      }
    }
  });
}

getList();
</script>
