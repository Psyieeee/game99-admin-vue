<template>
  <div class="app-container">
    <el-dialog v-model="open" title="Feedback Details">
    <el-descriptions direction="vertical">
      <el-descriptions-item label="Feedback Account" >{{ feedbackAccount }}</el-descriptions-item>
      <el-descriptions-item label="Currency">{{ currency }}</el-descriptions-item>
      <el-descriptions-item label="Source Group">{{ sourceGroup }}</el-descriptions-item>
      <el-descriptions-item label="Source Company">{{ sourceCompany }}</el-descriptions-item>
      <el-descriptions-item label="Source Site">{{ sourceSite }}</el-descriptions-item>
      <el-descriptions-item label="Source Page">{{ sourcePage }}</el-descriptions-item>
      <el-descriptions-item label="Feedback Time">{{ feedbackTime }}</el-descriptions-item>
      <el-descriptions-item label="Feedback Content">{{ feedbackContent }}</el-descriptions-item>
      <el-descriptions-item label="Appendix">{{ attachmentsIcon }}</el-descriptions-item>
      <el-descriptions-item label="State">{{ states }}</el-descriptions-item>
      <el-descriptions-item label="Audit Multiple">{{ operator }}</el-descriptions-item>
    </el-descriptions>
        <el-button type="primary" @click="handleConfirm">
          Confirm
        </el-button>
    </el-dialog>
  </div>
</template>

<script setup name="DetailTable">
import {reactive, ref, toRefs} from "vue";

const sourcePage = ref("-");
const feedbackAccount = ref("-");
const currency = ref("-");
const sourceGroup = ref("-");
const sourceCompany = ref("-");
const sourceSite = ref("-");
const feedbackTime = ref("-");
const feedbackContent = ref("-");
const attachmentsIcon = ref("-");
const states = ref("-");
const operator = ref("-");

const open = ref(false);

function show( sourcePage_, currency_, feedbackAccount_, feedbackTime_,
  feedbackContent_, attachmentsIcon_, adoptionBonus_, importance_, states_,
  replyContent_, operator_, operatingTime_, sourceGroup_, sourceSite_) {
  feedbackAccount.value = feedbackAccount_;
  sourcePage.value = sourcePage_;
  currency.value = currency_;
  sourceGroup.value = sourceGroup_;
  sourceCompany.value = sourceSite_;
  feedbackTime.value = feedbackTime_;
  feedbackContent.value = feedbackContent_;
  attachmentsIcon.value = attachmentsIcon_;
  states.value = states_;
  operator.value = operator_;
  open.value = true;
}

function hide() {
  open.value = false;
}

function handleConfirm() {
  hide();
}

defineExpose({
  show
});

</script>

<style scoped>

</style>