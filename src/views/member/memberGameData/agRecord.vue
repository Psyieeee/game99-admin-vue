<template>
  <div>
    <el-dialog
        draggable
        :close-on-click-modal="false"
        :title="title"
        v-model="visible"
        width="1500px"
        top="5vh"
        @close="resetRecord()"
        append-to-body
    >
      <el-table stripe v-loading="loading" :data="memberGameDataRecordList">
        <el-table-column label="订单号" align="center" prop="gameId"/>
        <el-table-column label="用户名" align="center" prop="playName"/>
        <el-table-column label="局号" align="center" prop="gameRound"/>
        <el-table-column label="派彩额度" align="center" prop="netAmount"/>
        <el-table-column label="下注时间" align="center" prop="betTime"/>
        <el-table-column label="游戏类型" align="center" prop="gameType">
          <template v-slot="{row}">
            <span v-if="row.gametype == 'BAC'">百家乐</span>
            <span v-if="row.gametype == 'DT'">龙虎</span>
          </template>
        </el-table-column>
        <el-table-column label="总投注" align="center" prop="betAmount"/>
        <el-table-column label="有效投注" align="center" prop="validBetAmount"/>
        <el-table-column label="订单状态" align="center" prop="flag">
          <template v-slot="{row}">
            <span v-if="row.flag == '0'">异常</span>
            <span v-if="row.flag == '1'">已派彩</span>
            <span v-if="row.flag == '8'">已取消</span>
            <span v-if="row.flag == '9'">已取消</span>
          </template>
        </el-table-column>
        <el-table-column label="玩法" align="center" prop="playType">
          <template v-slot="{row}">
            <span v-if="row.playType === '1'">庄</span>
            <span v-if="row.playType === '2'">闲</span>
            <span v-if="row.playType === '3'">和</span>
            <span v-if="row.playType === '21'">龙</span>
            <span v-if="row.playType === '22'">虎</span>
            <span v-if="row.playType === '23'">和</span>
          </template>
        </el-table-column>
        <el-table-column label="桌台号" align="center" prop="tableCode"/>
        <el-table-column label="派彩时间" align="center" prop="recalcuTime"/>
        <el-table-column label="余额" align="center" prop="beforeCredit"/>
        <el-table-column label="投注IP" align="center" prop="betIP"/>
        <el-table-column label="详情" align="center" class-name="small-padding fixed-width" fixed="right">
          <template v-slot="{row}">
            <el-button
                type="primary"
                plain
                icon="el-icon-menu"
                size="small"
                @click="handleDetail(row)"
                v-hasPermi="['member:memberGameData:detailList']"
            >更多
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <detail ref="memberDetail" :record-id="gameRound"/>

    <!--会员Ag视讯注单数据详情-->
    <el-dialog
        title="注单数据详情"
        draggable
        :close-on-click-modal="false"
        :title="title"
        v-model="agVisible"
        width="600px"
        top="5vh"
        @close="reset()"
        append-to-body
    >
      <el-form ref="form" :model="agRecordform">
        <el-form-item>
          <el-input v-model="messageText" placeholder="" type="textarea" :rows="20"/>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup="AgRecord">

import {getCurrentInstance, onMounted, reactive, ref, toRefs, watch} from "vue";
import {gameDetailList, gameRecordList} from '@/api/member/memberGameData'
import detail from './detail'
import {messageCode, messageVal} from '@/utils/sportCode'
import {getDicts} from "@/api/system/dict/data";

const {proxy} = getCurrentInstance();

const platformId = ref(null);
const title = ref('游戏对局列表');
const loading = ref(true);
const visible = ref(false);
const agVisible = ref(false);
const index = ref(1);
const msg = ref({});
const tables = ref([]);
const msgList = ref(null);
const total = ref(0);
const agRecordform = ref({});

const data = reactive({
  messageText: null,
  props: {},
  components: {
    detail
  },
  gameId: null,
  // 对局详情列表
  memberGameDataRecordList: [],
  //加分提交的数据

  //日期开始时间
  game_start_time: null,
  //日期结束时间
  game_end_time: null,
  //明细id
  gameRound: null,
  //椅子号
  chairId: '',
  //h会员账号
  account: null,
  //显示明细
  detailOpen: false,
  //对局地址
  detailLink: null,
  // 查询参数
  queryParams: {
    platformId: null,
    agent: null,
    gameId: null,
    gameRound: null,
    gameStartTime: null,
    gameEndTime: null,
    chairId: null,
    account: null,
    serverId: null,
    gameUserNo: null,
    recordId: null
  }
});

const {
  memberGameDataRecordList, chairId, gameRound, account, messageText, game_start_time, game_end_time, detailLink,
  queryParams
} = toRefs(data);

// watch(vip, () => {
//   if (newVal < oldVip) {
//     proxy.$notify.error('vip等级只能大于之前的等级')
//     showVipDisabled.value = true
//   } else {
//     showVipDisabled.value = false
//   }
// })


onMounted(() => {
  getDicts('member_msg').then(response => {
    msgList.value = response.data
  })
})

// 显示弹框
function show(row) {
  platformId.value = row.platformId
  queryParams.value.gameId = row.gameId;
  queryParams.value.kindId = row.kindId;
  queryParams.value.gameRound = row.gameRound;
  queryParams.value.agent = row.agent;
  queryParams.value.gameStartTime = row.game_start_time
  queryParams.value.gameEndTime = row.game_end_time
  queryParams.value.platformId = row.platformId
  queryParams.value.account = row.account;
  account.value = row.account;
  getRecordList();
  visible.value = true
}

// 查询表数据
function getRecordList() {
  loading.value = true
  gameRecordList(queryParams.value).then(response => {
    memberGameDataRecordList.value = response.data
    if (response.data[0] != null && response.data[0] != undefined) {
      chairId.value = response.data[0].chairID
    }
    total.value = response.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

//查看明细
function handleDetail(row) {
  queryParams.value.gameId = row.gameId;
  queryParams.value.gameRound = row.gameRound;
  queryParams.value.kindId = row.gametype
  queryParams.value.gametype = row.gametype
  loading.value = true
  gameDetailList(queryParams).then(response => {
    if (response.data != null && response.data != undefined) {
      let strings = response.data[0];
      let buffer = "";
      for (let key in strings) {
        buffer = buffer + (messageCode(key) + ":" + messageVal(key, strings[key]) + "\n");
      }
      messageText.value = buffer;
    }
    agVisible.value = true
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 重置按钮操作 */
function resetRecord() {
  memberGameDataRecordList.value = []
}

function reset() {
  messageText.value = null
}

defineExpose({
  show
});
</script>
