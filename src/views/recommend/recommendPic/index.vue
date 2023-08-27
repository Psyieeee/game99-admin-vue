<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="recommendPicList">
      <el-table-column label="参数名称" align="center" prop="envTitle"/>
      <el-table-column label="参数编码" align="center" prop="envCode"/>
      <el-table-column label="图片" align="center" prop="envValue">
        <template #default="scope">
          <el-image
              style="height:80px"
              :src="scope.row.envValue"
              fit="contain"
          >
          </el-image>
        </template>
      </el-table-column>
      <!--      <el-table-column label="参数说明" align="center" prop="envDes"/>-->
      <el-table-column label="参数组" align="center" prop="envGroup"/>
      <el-table-column label="排序" align="center" prop="envSort"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改推广图对话框 -->
    <el-dialog :close-on-click-modal="false" :title="title" v-model="open" width="500px"
               append-to-body>
      <el-form ref="formEnvRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="envTitle">
          <el-input v-model="form.envTitle"/>
        </el-form-item>
        <el-form-item label="参数编码" prop="envCode">
          <el-input v-model="form.envCode" readonly/>
        </el-form-item>
        <el-form-item label="图片" prop="envValue">
          <imageUpload v-model="form.envValue" path="bannerInfo"/>
        </el-form-item>
        <!--        <el-form-item label="参数说明" prop="envDes">-->
        <!--          <el-input v-model="form.envDes"/>-->
        <!--        </el-form-item>-->
        <el-form-item label="参数组" prop="envGroup">
          <el-input v-model="form.envGroup"/>
        </el-form-item>
        <el-form-item label="排序" prop="envSort">
          <el-input v-model="form.envSort"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open= !open">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup name="RecommendPic">

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getConfigEnvironment, listConfigEnvironmentPic, updateConfigEnvironmentPic} from "@/api/config/env";

const {proxy} = getCurrentInstance()
const loading = ref(false);

const recommendPicList = ref([]);
const total = ref(0);
const title = ref('');
const open = ref(false);

const data = reactive({
   queryParams : {
     pageNum:1,
     pageSize:10
   },
  form:{},
  rules:{}
});

const {queryParams,form,rules} = toRefs(data);

/** get all recommended pic list  */
function getList(){
  loading.value = true
  listConfigEnvironmentPic(queryParams.value).then(res=>{
    recommendPicList.value = res.data
    total.value = res.total
    loading.value = false
  })

}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

// 表单重置
function reset() {
  form.value = {
    envTitle: null,
    envCode: null,
    envValue: null,
    envDes: null,
    envGroup: null,
    envSort: null,
  };
  proxy.resetForm("formEnvRef");
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
}

/** handle update  修改按钮操作  */
 function handleUpdate(row){
  reset();
  getConfigEnvironment(row.envCode).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改推广图";
  });
}

/** 提交按钮 */
function submitForm(){
  proxy.$refs["formEnvRef"].validate(valid => {
    if (valid) {
      updateConfigEnvironmentPic(form.value).then(response => {
        proxy.$modal.msgSuccess("修改成功");
        open.value = false;
        getList();
      });
    }
  });
}

getList()
</script>

<style scoped>

</style>