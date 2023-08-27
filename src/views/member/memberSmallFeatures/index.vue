<template>
  <div class="app-container">
    <el-row v-loading="loading">
      <el-col :span="5" class="card-box">
        <el-card>
          <div slot="header"><span class="fs15">批量手机号更新密码</span></div>
          <el-form :model="phoneFrom" ref="phoneFromRef" :rules="phoneRules">
            <el-form-item prop="phones">
              <el-input
                  type="textarea"
                  :rows="45"
                  clearable
                  v-model="phoneFrom.phones"
                  placeholder="手机号统一以竖行排列,不允许有任何字符"
              />
            </el-form-item>
            <el-form-item prop="password" class="col-100pr">
              <el-input
                  class="inline-input"
                  type="text"
                  clearable
                  v-model="phoneFrom.password"
                  placeholder="请输入更新的密码"
              ></el-input>
            </el-form-item>
            <el-form-item prop="googleAuthCode" class="col-100pr">
              <el-input
                  style="width: 52%"
                  clearable
                  type="number"
                  class="no-number"
                  v-model="phoneFrom.googleAuthCode"
                  placeholder="请输入谷歌验证码21"
                  @keyup.enter="handleUpdate"
              />
              <el-button type="primary" plain style="width: 23%;" @click="handleUpdate">更新</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="5" class="card-box">
        <el-card>
          <div slot="header"><span class="fs15">批量会员ID查询手机号</span></div>
          <el-form :model="phoneByIdFrom" ref="phoneByIdFromRef" :rules="phoneByIdRules">
            <el-form-item prop="userIds" class="col-100pr">
              <el-input
                  type="textarea"
                  :rows="23"
                  clearable
                  v-model="phoneByIdFrom.userIds"
                  placeholder="会员ID统一以竖行排列,不允许有任何字符"
              />
            </el-form-item>
            <el-form-item prop="googleAuthCode">
              <el-input
                  clearable
                  style="width: 52%"
                  type="number"
                  class="no-number"
                  v-model="phoneByIdFrom.googleAuthCode"
                  placeholder="请输入谷歌验证码"
                  @keyup.enter="handleQuery"
              />
              <el-button type="primary" plain style="width: 25%;margin-left: 1px" @click="handleQuery">查询</el-button>
              <el-button type="info" size="small" plain style="width: 18%;padding:11px" @click="handleClear">清除
              </el-button>
            </el-form-item>
            <el-form-item prop="phonesByIds" class="col-100pr">
              <el-input
                  v-model="phonesByIds"
                  type="textarea"
                  :rows="23"
              >
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="4.5" class="card-box">
        <el-card>
          <div slot="header"><span class="fs15">批量会员ID派送彩金</span></div>
          <el-form :model="memberIdsFrom" ref="memberIdsFromRef" :rules="memberIdsRules">
            <el-form-item prop="uploadExcel" class="col-100pr">
              <el-upload
                  :limit="1"
                  class="upload-demo"
                  ref="upload"
                  :action="uploadFileUrl"
                  :headers="headers"
                  name="excelFile"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-error="uploadFalse"
                  :on-success="uploadSuccess"
                  :auto-upload="false"
                  :before-upload="beforeAvatarUpload"
              >
                <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                <div slot="tip" class="el-upload__tip">只能上传excel文件</div>
              </el-upload>
              <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">批量导入
              </el-button>
            </el-form-item>
            <el-form-item prop="memberIds" class="col-100pr">
              <el-input
                  type="textarea"
                  :rows="40"
                  clearable
                  v-model="memberIdsFrom.memberIds"
                  placeholder="会员ID统一以竖行排列,不允许有任何字符"
              />
            </el-form-item>
            <el-form-item prop="money" class="col-100pr">
              <el-input
                  class="no-number"
                  type="number"
                  clearable
                  v-model="memberIdsFrom.money"
                  placeholder="请输入派送金额"
              ></el-input>
            </el-form-item>
            <el-form-item prop="googleAuthCode" style="width: 110%">
              <el-input
                  style="width: 52%"
                  clearable
                  type="number"
                  class="no-number"
                  v-model="memberIdsFrom.googleAuthCode"
                  placeholder="请输入谷歌验证码"
              />
              <el-button type="primary" plain style="width: 23%;" @click="handleCommit">提交</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="MemberSmallFeatures">

import {updatePhones, queryPhones, commitMoney} from '@/api/member/memberSmallFeatures'
import {url} from '@/utils/url'
import {getToken} from '@/utils/auth'
import {getCurrentInstance, reactive, ref, toRefs, onMounted} from "vue";

const {proxy} = getCurrentInstance();
const loading = ref(false);
const phonesByIds = ref('');
const businessType = ref('');
const data = reactive({

      /**  统计总的数据 total statistics */
      totalData: {
        peopledTotal: 0,
        totalMoney: 0,
        safeBalanceTotalMoney: 0
      },

      uploadFileUrl: "dev-api" + url.game88PlatformAdminWeb + "/member/memberInfo/batchInsertShops",
      headers: {
        Authorization: 'Bearer ' + getToken()
      },
      fileList: null,

      // phonesByIds: '',
      phonesByIdsList: null,

      // 手机号更新密码表单参数
      phoneFrom: {
        phones: null,
        password: null,
        googleAuthCode: null
      },

      memberIdsFrom: {
        memberIds: null,
        money: null,
        googleAuthCode: null
      },

      // 批量会员ID查询手机号表单参数
      phoneByIdFrom: {
        userIds: null,
        googleAuthCode: null
      },
      // 批量会员ID派送彩金表单参数
      phoneByIdRules: {
        userIds: [
          {required: true, message: "批量会员ID不能为空", trigger: "blur"}
        ],
        googleAuthCode: [
          {required: true, message: "谷歌验证码不能为空", trigger: "blur"}
        ]
      },
      phoneRules: {
        phones: [
          {required: true, message: "批量手机号不能为空", trigger: "blur"}
        ],
        password: [
          {required: true, message: "密码不能为空", trigger: "blur"}
        ],
        googleAuthCode: [
          {required: true, message: "谷歌验证码不能为空", trigger: "blur"}
        ]
      },
      memberIdsRules: {
        memberIds: [
          {required: true, message: "批量会员ID不能为空", trigger: "blur"}
        ],
        money: [
          {required: true, message: "派送金额不能为空", trigger: "blur"}
        ],
        googleAuthCode: [
          {required: true, message: "谷歌验证码不能为空", trigger: "blur"}
        ]
      },
    }
);

const {
  phoneFrom
  , phoneRules
  , phoneByIdFrom
  , phoneByIdRules
  , memberIdsFrom
  , memberIdsRules
  , uploadFileUrl
  , headers
} = toRefs(data);


function uploadSuccess(response, file, fileList) {
  if (response.code === 200) {
    proxy.$modal.msgSuccess("文件导入成功");
  } else {
    proxy.$modal.msgError("文件导入失败");
  }
}

function uploadFalse(response, file, fileList) {
  proxy.$modal.msgError("文件上传失败！");
}

// 上传前对文件的大小的判断
function beforeAvatarUpload(file) {
  const extension = file.name.split(".")[1] === "xls";
  const extension2 = file.name.split(".")[1] === "xlsx";
  const extension3 = file.name.split(".")[1] === "doc";
  const extension4 = file.name.split(".")[1] === "docx";
  const isLt2M = file.size / 1024 / 1024 < 10;
  if (!extension && !extension2 && !extension3 && !extension4) {
    proxy.$modal.msgError("上传模板只能是 xls、xlsx、doc、docx 格式!");
  }
  if (!isLt2M) {
    console.log("上传模板大小不能超过 10MB!");
  }
  return extension || extension2 || extension3 || (extension4 && isLt2M);
}

function submitUpload() {
  if (businessType != null) {
    //触发组件的action
    proxy.$refs.upload.submit();
  }
  if (businessType == null) {
    businessType.value = "businessType不能为空";
  }
}

function handleRemove(file, fileList) {
  console.log(file, fileList);
}

function handlePreview(file) {
  if (file.response.status) {
    proxy.$modal.msgSuccess("此文件导入成功");
  } else {
    proxy.$modal.msgError("此文件导入失败");
  }
}

//Did not implement because it is not complete.
function querySearch(queryString, cb) {
  console.log("this.restaurants.value " + this.restaurants + " - " + queryString)
  let restaurantsLet = this.restaurants.value;
  let results = queryString ? restaurantsLet.filter(this.createFilter(queryString)) : restaurants;
  // 调用 callback 返回建议列表的数据
  cb(results);
}

function createFilter(queryString) {
  return (restaurant) => {
    return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
  };
}

function loadAll() {
  return [
    {"value": "123456"},
  ];
}

/** 手机号更新密码更新按钮 */
function handleUpdate() {
  console.log("res " + phoneFrom.value, phoneFrom.value)
  proxy.$refs['phoneFromRef'].validate(valid => {
    if (valid) {
      loading.value = true;
      updatePhones(phoneFrom.value).then(res => {
        console.log("res " + res.code, res)
        if (res.code === 200) {
          proxy.$modal.msgSuccess((res.msg))
        } else {
          proxy.$modal.msgError((res.msg))
        }
        loading.value = false;
      }).catch(() => {
        proxy.$modal.msgError('网络异常')
        loading.value = false;
      })
    }
  })
}

/** 批量会员ID查询手机号按钮 */
function handleQuery() {
  const userIds = phoneByIdFrom.value.userIds
  const googleAuthCode = phoneByIdFrom.value.googleAuthCode
  proxy.$refs['phoneByIdFromRef'].validate(valid => {
    if (valid) {
      loading.value = true;
      queryPhones(userIds, googleAuthCode).then(res => {
        if (res.code === 200) {
          let idsList = res.data.data
          if (idsList.length !== 0) {
            idsList.forEach(value => {
              if (value != null)
                phonesByIds.value = value + '\n' + phonesByIds.value
            })
          }
          proxy.$modal.msgSuccess((res.msg))
        } else {
          proxy.$modal.msgError((res.msg))
        }
        loading.value = false;
      }).catch((res) => {
        proxy.$modal.msgError(res)
        loading.value = false;
      })
    }
  })
}

/** 批量会员ID清除手机号按钮 */
function handleClear() {
  phonesByIds.value = '';
}

/** 批量会员ID派送彩金按钮 */
function handleCommit() {
  proxy.$refs['memberIdsFromRef'].validate(valid => {
    if (valid) {
      loading.value = true;
      const memberIds = memberIdsFrom.value.memberIds
      const money = memberIdsFrom.value.money
      const googleAuthCode = memberIdsFrom.value.googleAuthCode
      commitMoney(memberIds, money, googleAuthCode).then(res => {
        if (res.code === 200) {
          proxy.$modal.msgSuccess(res.msg)
        } else {
          proxy.$modal.msgError(res.msg)
        }
        loading.value = false
      }).catch(() => {
        proxy.$modal.msgError('网络异常')
        loading.value = false
      })
    }
  })
}
</script>

<style scoped>

</style>