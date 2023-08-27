<template>
  <div>
    <el-dialog
        draggable
        :close-on-click-modal="false"
        :title="title"
        v-model="visible"
        v-if="visible"
        width="1500px"
        top="5vh"
        @close="reset()"
        append-to-body
    >
      <el-table stripe v-loading="loading" :data="memberGameDataRecordList">
        <el-table-column label="游戏局号" align="center" prop="gameID"/>
        <el-table-column label="玩家帐号" align="center" prop="accounts"/>
        <el-table-column label="房间ID" align="center" prop="serverID"/>
        <el-table-column label="游戏ID" align="center" prop="kindID"/>
        <el-table-column label="桌子号" align="center" prop="tableID"/>
        <el-table-column label="椅子号" align="center" prop="chairID"/>
        <el-table-column label="玩家数量" align="center" prop="userCount"/>
        <el-table-column label="手牌公共牌" align="center" prop="cardValue"/>
        <el-table-column label="有效下注" align="center" prop="cellScore"/>
        <el-table-column label="总下注" align="center" prop="allBet"/>
        <el-table-column label="盈利" align="center" prop="profit"/>
        <el-table-column label="抽水" align="center" prop="revenue"/>
        <el-table-column label="结算时间" align="center" prop="gameEndTime"/>
        <el-table-column label="代理ID" align="center" prop="channelID"/>
        <el-table-column label="所属站点" align="center" prop="lineCode"/>
        <el-table-column label="详情" align="center" class-name="small-padding fixed-width" fixed="right">
          <template slot-scope="scope">
            <el-button
                type="primary"
                plain
                icon="el-icon-menu"
                size="small"
                @click="handleDetail(scope.row)"
                v-hasPermi="['member:memberGameData:detailList']"
            >更多
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <detail ref="memberDetail" :record-id="recordID"/>
    <!-- 游戏对局日志 -->
    <el-dialog title="游戏对局日志" :visible.sync="detailOpen" width="1500px"
               style="max-height:100%;overflow-y: scroll;"
               append-to-body>

      <!--      <div v-loading="loading" :style="'height:'+ height">-->
      <div v-loading="loading">
        <iframe :src="detailLink" frameborder="no" style="width: 100%;height: 650px" scrolling="auto"/>
      </div>

      <a style="color: #00afff" :href="detailLink" target="_blank">点击打开对局详情</a>
      <!--      <div v-loading="loading" :style="'height:'+ height">-->
      <!--        <iframe :src="detailLink" frameborder="no" style="width: 100%;height: 650px" scrolling="auto" />-->
      <!--      </div>-->

    </el-dialog>
  </div>

</template>

<script setup name="record">

import {getCurrentInstance, onMounted, reactive, ref, toRefs, watch} from "vue";
import {gameDetailList, gameRecordList} from '@/api/member/memberGameData'
import detail from './detail'
import {getDicts} from "@/api/system/dict/data";

const {proxy} = getCurrentInstance();
const msg = ref('');
const loading = ref(true);
const title = ref('游戏对局列表');
const index = ref(1);
const visible = ref(false);
const gameId = ref(null);
const tables = ref([]);
const memberGameDataRecordList = ref([]);
const form = ref({});
const game_start_time = ref(null);
const game_end_time = ref(null);
const chairId = ref(null);
const account = ref(null);
const accounts = ref(null);
const detailOpen = ref(false);
const detailLink = ref(null);
const platformId = ref(null);
const msgList = ref(null);
const vip = ref(null);



const data = reactive({
  recordID: '',
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
})

const {
  queryParams, recordID
} = toRefs(data);

/*监听器,监听单个变量,param就是data的变量*/
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
  console.log("Show record 1")
  platformId.value = row.platformId
  queryParams.value.gameId = row.gameId;
  queryParams.value.gameRound = row.gameRound;
  queryParams.value.agent = row.agent;
  queryParams.value.gameStartTime = row.game_start_time
  queryParams.value.gameEndTime = row.game_end_time
  queryParams.value.platformId = row.platformId
  queryParams.value.account = row.account;
  account.value = row.account;
  console.log("Show record 2")
  getRecordList();
  visible.value = true
  console.log("Show record 3")
}

// 查询表数据
function getRecordList() {
  loading.value = true
  gameRecordList(queryParams.value).then(response => {
    memberGameDataRecordList.value = response.data.list
    if (response.data.list[0] != null && response.data.list[0] != undefined) {
      chairId.value = response.data.list[0].chairID
    }
    total.value = response.data.count
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

//查看明细
function handleDetail(row) {
  if (platformId.value == 17) {
    queryParams.value.gameId = row.gameId;
    queryParams.value.gameRound = row.gameRound;
    queryParams.value.agent = row.accounts.split("_")[0];
    queryParams.value.platformId = platformId
    queryParams.value.account = row.accounts
    queryParams.value.gameUserNo = row.gameID
    queryParams.value.serverId = row.serverID
    queryParams.value.recordId = row.recordID
    loading.value = true
    gameDetailList(queryParams).then(response => {
      detailLink.value = response.data
      detailOpen.value = true
      loading.value = false

    }).catch(() => {
      loading.value = false
    })
  } else {
    row.platformId = platformId
    row.chairId = chairId
    row.accounts = accounts
    row.account = account
    proxy.$refs["memberDetail"].show(row)
  }
}

/** 重置按钮操作 */
function reset() {
  memberGameDataRecordList.value = []
}

defineExpose({
  show,
});
</script>
