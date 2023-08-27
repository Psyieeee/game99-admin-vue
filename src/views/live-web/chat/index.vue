<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForms" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item prop="fromPlatform">
        <el-input
            v-model="queryParams.fromPlatform"
            placeholder="会员ID"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
            style="width: 150px;"
        />
      </el-form-item>
      <el-form-item prop="userNickName">
        <el-input
            v-model="queryParams.userNickName"
            placeholder="会员昵称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
            style="width: 150px;"
        />
      </el-form-item>
      <el-form-item prop="poscatId">
        <el-input
            v-model="queryParams.poscatId"
            placeholder="主播ID"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
            style="width: 150px;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="small"
            @click="openIpBlackList()"
        >查看封停ip
        </el-button>
      </el-col>
      <el-col :span="10" style="margin-left: 10px">
        <span style="font-size: 16px;margin-right: 10px">记录刷新</span>
        <el-select v-model="refreshSec" placeholder="时间间隔" style="width: 110px">
          <el-option value="5" label="5秒"></el-option>
          <el-option value="10" label="10秒"></el-option>
          <el-option value="15" label="15秒"></el-option>
          <el-option value="20" label="20秒"></el-option>
          <el-option value="30" label="30秒"></el-option>
        </el-select>
        <div style="width: 120px; display: inline-block;text-align: center">
          <span>{{ refreshDesc }}</span>
        </div>
        <el-button :type="refreshType" :icon="refreshIcon" size="small" @click="refreshData">{{
            refreshLabel
          }}
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table stripe v-loading="loading" :data="liveVideoChatList">
      <el-table-column label="平台会员ID" min-width="130" align="center" prop="fromPlatform"/>
      <el-table-column label="用户昵称" :show-overflow-tooltip="true" width="120" align="center" prop="userNickName"/>
      <el-table-column label="消息类型" width="90" align="center" prop="type" :formatter="typeFormat"/>
      <el-table-column label="消息内容" :show-overflow-tooltip="true" min-width="350" align="center" prop="msg"/>
      <el-table-column label="主播ID" min-width="120" align="center" prop="poscatId"/>
      <el-table-column label="主播昵称" :show-overflow-tooltip="true" width="120" align="center" prop="poscatNickName"/>
      <el-table-column label="是否封停" width="80" align="center" prop="noSpeaking">
        <template #default="scope">
          <span v-if="scope.row.noSpeaking" style="color: #FF5722">
            已封停
          </span>
          <span v-else style="color: #5FB878">
            正常
          </span>
        </template>
      </el-table-column>
      <el-table-column label="是否禁言" width="80" align="center" prop="forbid">
        <template #default="scope">
          <span v-if="scope.row.forbid" style="color: #FF5722">
            禁言
          </span>
          <span v-else style="color: #5FB878">
            正常
          </span>
        </template>
      </el-table-column>
      <el-table-column label="发言ip" width="160" align="center" prop="userIp"/>
      <el-table-column label="发送时间" width="160" align="center" prop="createTimes"/>
      <el-table-column label="操作" width="145" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
              v-show="!scope.row.noSpeaking"
              size="small"
              type="danger"
              @click="handleUpdateStop(scope.row)"
              v-if="scope.row.type == 0 || scope.row.type == 1"
              v-hasPermi="['admin:liveVideoChat:edit']"
          >封停
          </el-button>
          <el-button
              v-show="scope.row.noSpeaking"
              size="small"
              type="success"
              @click="handleUpdate(scope.row)"
              v-if="scope.row.type == 0 || scope.row.type == 1"
              style="margin-left: 0px"
              v-hasPermi="['admin:liveVideoChat:edit']"
          >解封
          </el-button>
          <el-button
              size="small"
              type="warning"
              @click="handleForbid(scope.row)"
              v-if="scope.row.type == 0 || scope.row.type == 1"
              v-hasPermi="['admin:liveVideoChat:edit']"
          >禁言
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="total>0"
        :total="total"
        :page-sizes="[20,50,100]"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
    />
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">

        <el-form-item label="平台会员ID" prop="fromPlatform">
          <el-input v-model="form.fromPlatform" placeholder="请输入平台会员ID" readonly disabled/>
        </el-form-item>

        <el-form-item label="发送者昵称" prop="userNickName">
          <el-input v-model="form.userNickName" placeholder="请输入发送者昵称" readonly disabled/>
        </el-form-item>

        <el-form-item label="消息内容" prop="msg">
          <el-input v-model="form.msg" readonly disabled/>
        </el-form-item>
        <el-form-item label="封停ip" prop="userIp">
          <el-input v-model="form.userIp" readonly disabled/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="suspendUserRec('',true,1,form.userIp,form.msg)">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 禁言备注弹框 -->
    <el-dialog
        draggable
        :close-on-click-modal="false"
        title="备注禁言原因"
        :visible.sync="muteRemarkSpeak"
        width="400px"
        append-to-body
    >
      <el-input v-model="fromPlatform" v-show="false"/>
      <el-input v-model="poscatId" v-show="false"/>
      <el-select
          v-model="remark"
          placeholder="请选择禁言原因"
          clearable
          style="min-width: 360px"
      >
        <el-option
            v-for="dict in muteRemarkOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
        />
      </el-select>
      <el-input v-model="remarked" placeholder="请输入禁言原因" v-if="remark.value === '其他'"/>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitMuteRemarkSpeak">立即提交</el-button>
      </div>
    </el-dialog>
    <!--查看封停ip-->
    <el-dialog title="查看封停ip" v-model="showSpeakIpBlackList" width="1200px" append-to-body>
      <el-form :model="queryParam" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="会员id" prop="userId">
          <el-input
              v-model="queryParam.userId"
              placeholder="会员id"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="会员ip" prop="userIp">
          <el-input
              v-model="queryParam.userIp"
              placeholder="会员ip"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQueryIpBlack">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :stripe="true" v-loading="loading" :data="speakIpBlackData">
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column label="会员ID" align="center" prop="userId" width="130"/>
        <el-table-column label="封停ip" show-overflow-tooltip align="center" prop="userIp" width="150"/>
        <el-table-column label="封停备注" show-overflow-tooltip align="center" prop="msg"/>
        <el-table-column label="封停时间" align="center" prop="createTime" width="160"/>
        <el-table-column label="操作" width="80" align="center" class-name="small-padding fixed-width" fixed="right">
          <template #default="scope">
            <el-button
                size="small"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdateIpBlack(scope.row)"
            >解封
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
          v-show="total>0"
          :total="total"
          :page-sizes="[10,20,100]"
          :page.sync="queryParam.pageNum"
          :limit.sync="queryParam.pageSize"
          @pagination="openIpBlackList"
      />
    </el-dialog>
  </div>
</template>

<script name="liveVideoChat" setup>
import {
  forbid,
  suspendUser,
  listLiveVideoChat,
  getLiveVideoChat,
  delLiveVideoChat,
  addLiveVideoChat,
  updateLiveVideoChat,
  exportLiveVideoChat
} from '@/api/live-web/chat/liveVideoChat';
import {
  listSpeakIpBlackList,
  updateSpeakIpBlackList
} from '@/api/live-web/chat/speakIpBlackList';


import {useRouter} from "vue-router";
import {getDicts} from '@/api/system/dict/data';
import {getCurrentInstance, onMounted, reactive, ref, toRefs} from "vue";

const {proxy} = getCurrentInstance();
const router = useRouter();
const loading = ref(false);
const showSearch = ref(true);
const refreshIcon = ref('el-icon-refresh');
const refreshSec = ref('5');
const refreshType = ref('primary');
const refreshLabel = ref('开始刷新');
const refreshDesc = ref('');
const open = ref(false);
const noSpeaking = ref(null);
const muteRemarkSpeak = ref(false);
const muteRemarkOptions = ref([]);
const fromPlatform = ref('');
const poscatId = ref('');
const remark = ref('');
const remarked = ref('');
// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSpeakIpBlackList = ref(false);
// 会员发言表格数据
const liveVideoChatList = ref([]);
const speakIpBlackData = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    poscatId: null,
    group: null,
    userId: null,
    msg: null,
    type: null,
    poscatNickName: null,
    userNickName: null,
    fromPlatform: null,
    orderByColumn: 'create_time',
    isAsc: 'desc'
  },
  queryParam: {
    pageNum: 1,
    pageSize: 20,
    orderByColumn: 'create_time',
    isAsc: 'desc'
  },
  total: 0,
  title: '',
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    poscatId: [
      {required: true, message: '主播ID不能为空', trigger: 'blur'}
    ],
  },
});

const {queryParams, queryParam, total, title, form, rules} = toRefs(data);

onMounted(() => {
  getList()
  getDicts('muteRemarkOptions').then(res => {
    muteRemarkOptions.value = res.data
  })
})

function activated() {
  refreshType.value = 'primary'
  refreshIcon.value = 'el-icon-refresh'
  refreshLabel.value = '开始刷新'
  refreshDesc.value = ''

  stopRefresh()
}

/** 查询会员发言列表 */
function getList() {
  loading.value = true
  listLiveVideoChat(queryParams.value).then(res => {
    liveVideoChatList.value = res.data
    total.value = res.total
    loading.value = false
  })
}

function openIpBlackList() {
  showSpeakIpBlackList.value = true
  title.value = '查看已封停的ip'
  listSpeakIpBlackList(queryParams.value).then(res => {
    speakIpBlackData.value = res.data
    total.value = res.total
    loading.value = false
  })
}

function searchIpBlackList() {
  listSpeakIpBlackList(queryParam.value).then(res => {
    speakIpBlackData.value = res.data
    total.value = res.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    poscatId: null,
    group: null,
    userId: null,
    msg: null,
    createTime: null,
    type: null,
    poscatNickName: null,
    userNickName: null,
    fromPlatform: null
  }
  queryParam.value = {
    userId: null,
    userIp: null
  }
  proxy.resetForm('form')
  proxy.resetForm('queryParam')
}

/** 搜索按钮操作 */
function handleQuery() {
  // console.log('aa', queryParams)
  if (queryParams.value.fromPlatform) {
    const reg = '^[0-9a-zA-Z_]{1,}$'
    let flag = queryParams.value.fromPlatform.match(reg)
    if (!flag) {
      proxy.$modal.msgError("会员ID只能输入数字及下划线")
      return
    }
  }
  queryParams.value.pageNum = 1
  getList()
}

function handleQueryIpBlack() {
  queryParams.value.pageNum = 1
  searchIpBlackList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryForm')
  proxy.resetForm('queryForms')
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加会员发言'
}

/** 修改按钮操作 */
function handleUpdateStop(row) {
  const id = row.id || ids.value
  getLiveVideoChat(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '封停用户'
  })
}

function handleUpdate(row) {
  proxy.$confirm('确定要' + row.fromPlatform + '解封吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return suspendUserRec(row.fromPlatform, false, 0, row.userIp, row.msg)
  }).then(() => {
    proxy.$modal.msgSuccess('解封成功')
    getList()
  })
}

/** 修改按钮操作 */
function handleUpdateIpBlack(row) {
  proxy.$confirm('确定要' + row.userId + '解封吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    let data = {}
    data.userIp = row.userIp
    data.userId = row.userId
    return updateSpeakIpBlackList(data)
  }).then(() => {
    proxy.$modal.msgSuccess('解封成功')
    openIpBlackList()
    getList()
  })

}

function handleForbid(row) {
  // console.log("row " , row)
  remark.value = null
  remarked.value = null
  fromPlatform.value = row.fromPlatform
  poscatId.value = row.poscatId
  muteRemarkSpeak.value = true
}

function submitMuteRemarkSpeak() {
  if (remarked != null) {
    remark.value = remarked.value
  }
  forbidRec(fromPlatform.value, poscatId.value, remark.value)
}


function forbidRec(pUserId, videoId, remark) {
  let data = {}
  data.pUserId = pUserId
  data.videoId = videoId
  data.remark = remark

  forbid(data).then(res => {
    liveVideoChatList.value = res.data
    total.value = res.total
    loading.value = false
  })
  proxy.$modal.msgSuccess('禁言成功')
  muteRemarkSpeak.value = false
  getList()
}

function suspendUserRec(pUserId, flag, num, userIp, msg) {
  let data = {}
  if (num === 1) {
    data.pUserId = form.fromPlatform.value
  } else {
    data.pUserId = pUserId
  }
  data.flag = flag
  data.num = num
  data.userIp = userIp
  data.msg = msg

  suspendUser(data)

  if (flag === 1) {
    proxy.$modal.msgSuccess('封停成功')
  }
  open.value = false
  getList()
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['form'].validate(valid => {
    if (valid) {
      if (form.id.value != null) {
        updateLiveVideoChat(form).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addLiveVideoChat(form).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const idsConst = row.id || ids.value
  proxy.$modal.confirm('是否确认删除会员发言编号为"' + idsConst + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delLiveVideoChat(idsConst)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

function typeFormat(row, column) {
  if (row.type === '0') {
    return '普通消息'
  } else if (row.type === '1') {
    return '弹幕消息'
  }
}

function speakFormat(row, column) {
  if (row.noSpeaking === true) {
    return '已封停'
  } else {
    return '正常'
  }
}

function forbidFormat(row, column) {
  if (row.row.forbid === true) {
    return '禁言'
  } else {
    return '正常'
  }
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$confirm('是否确认导出所有会员发言数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return exportLiveVideoChat(queryParams)
  }).then(response => {
    (response.msg)
  })
}

function refreshData() {
  if (refreshType.value === 'primary') {
    refreshType.value = 'danger'
    refreshIcon.value = 'el-icon-circle-close'
    refreshLabel.value = '停止刷新'
    refreshDesc.value = ''

    stopRefresh()
    getList()
    startRefresh()
  } else {
    refreshType.value = 'primary'
    refreshIcon.value = 'el-icon-refresh'
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

</script>
