<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="customerSupportLink">
      <el-table-column align="center" label="Title" min-width="70" prop="envTitle"/>
      <el-table-column align="center" label="URL" min-width="100" prop="envValue"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="70">
          <el-button
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate">Edit
          </el-button>
      </el-table-column>
    </el-table>

    <el-dialog v-model="updateCustomerLink" v-loading="settingsLoading" :close-on-click-modal="false"
               :title="title"
               style="padding-bottom: 30px; padding-left: 30px"
               width="800px">

      <el-form :inline="true" ref="settingsRef" form="settingsForm" :model="settingsForm"
               label-width="250px">
        <el-row>
          <el-col>
            <el-form-item label="Customer Support URL Link">
              <el-input rows="1" cols="100" style="width: 400px" v-model="settingsForm.envValue">
                <template #prepend>Http://</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSettings">编辑</el-button>
        <el-button @click="updateCustomerLink=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script name="customerSupport" setup>
import {getCurrentInstance, ref} from "vue";
import {
        customerSupportList,
        updateCustomerSupport
} from "@/api/system/customerSupport";
const {proxy} = getCurrentInstance();

const loading = ref(true);
const customerSupportLink = ref([]);
const settingsForm = ref([]);
const total = ref(0);
const updateCustomerLink = ref(false);
const settingsLoading = ref(false);
const title = ref('');

function getList() {
  loading.value = true;
  customerSupportList().then(response => {

    customerSupportLink.value = [ response ];
    console.log( customerSupportLink.value )
    loading.value = false;
  });
}

function handleUpdate() {
  customerSupportList().then(() => {
    updateCustomerLink.value = true
    title.value = 'Update URL Link'
  })
}

function submitSettings() {
  proxy.$refs['settingsRef'].validate(async valid => {
    if (valid) {
      const params = {
        envCode: 'customer_support',
        envValue: 'Http://' + settingsForm.value.envValue
      }
      updateCustomerSupport(params).then(() => {
        proxy.$modal.msgSuccess('修改成功')
        updateCustomerLink.value = false
        getList()
      })
    }
  })
}

getList();
</script>

<style>
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
</style>
