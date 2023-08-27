<template>
  <div>
    <el-dialog
        draggable
        :close-on-click-modal="false"
        :title="title"
        v-model="visible"
        width="600px"
        top="5vh"
        @close="reset()"
        append-to-body
    >
      <el-form ref="form" :model="memberGameDataDetail">
        <el-form-item>
          <el-input v-model="memberGameDataDetail" placeholder="" type="textarea" :rows="20"/>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>

</template>

<script setup="detail">

import {getCurrentInstance, onMounted, reactive, ref, toRefs, watch} from "vue";
import {gameDetailList, gameRecordList} from '@/api/member/memberGameData'
import {getDicts} from "@/api/system/dict/data";
const {proxy} = getCurrentInstance();

const msgList = ref(null);
const visible = ref(false);
const title = ref('游戏对局详情');
const loading = ref(true);
const gameId = ref(null);
const msg = ref('');

const data = reactive({
  memberGameDataDetail: [],
  form: {},
  // 总条数
  total: 0,
  //日期开始时间
  game_start_time: null,
  //日期结束时间
  game_end_time: null,
  //明细id
  recordId: null,
  //游戏 ID
  kindID: null,
  //椅子号
  chairId: null,
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10000,
    platformId: null,
    agent: null,
    kindId: null,
    recordId: null,
    account: null
  }
});

const {totalData, queryParams, chairId, memberGameDataDetail, recordLink, fundsOpen} = toRefs(data)
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
  queryParams.value.account = row.account
  queryParams.value.recordId = row.recordID
  queryParams.value.kindId = row.kindID
  queryParams.value.agent = row.agent
  queryParams.value.platformId = row.platformId
  chairId.value = row.chairId
  getDetailList();
  visible.value = true
}

// 查询表数据
function getDetailList() {
  loading.value = true
  gameDetailList(queryParams.value).then(response => {
    let result = response.data
    let newMes = result.replace("chairId", chairId);
    memberGameDataDetail.value = newMes
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function print(val) {
  return (val + '').replace(/\n/g, "<br/>")
}

/** 重置按钮操作 */
function reset() {
  memberGameDataDetail.value = []
}

defineExpose({
  show,
});

</script>
