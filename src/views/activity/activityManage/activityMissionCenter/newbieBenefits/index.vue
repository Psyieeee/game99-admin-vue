<template>
  <div class="app-container">
    <el-form label="Newbie Benefits" v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams" label-width="98px">
      <el-form-item prop="现状" style="min-width: 50px">
        <el-input
            v-model="queryParams.taskCode"
            clearable
            placeholder="现状"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" size="small" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    button on the table for query-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['mission:questRepeat:add']"
            icon="Plus"
            plain
            size="small"
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['mission:questRepeat:delete']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['mission:questRepeat:edit']"
            icon="Edit"
            plain
            size="small"
            type="primary"
            @click="handleNewbieSettings"
        >Newcomer Welfare Settings
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"/>
    </el-row>

    <!--    display data in table -->
    <el-table v-loading="loading" :data="newbieBenefitsList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="ID" min-width="70" prop="id"/>
      <el-table-column align="center" label="Task Conditions" min-width="180" prop="taskConditions"/>
      <el-table-column align="center" label="Reward Amount BRL" min-width="180" prop="rewards"/>
      <el-table-column align="center" label="Reward Activity" min-width="180" prop="rewardActivity"/>
      <el-table-column align="center" label="Mission Introduction" min-width="180" prop="description"/>
      <el-table-column align="center" min-width="150" label="Whether to turn on" prop="status">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="150" label="Whether to turn on" prop="tipBubbleSwitch">
        <template #default="scope">
          <el-switch
              v-model="scope.row.tipBubbleSwitch"
              :active-value=1
              :inactive-value=0
              @change="handleEffectChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" align="center" label="Operate" min-width="180" prop="url">
        <template #default="scope">
          <div>
            <a
                v-if="scope.row.url !== ''"
                :href="scope.row.url"
                style="color: #409eff; font-size: 12px"
                target="_blank"
            >Revise
            </a>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Operator" min-width="180" prop="updateBy"/>
      <el-table-column align="center" label="Operating Time" min-width="180" prop="updateTime"/>
      <el-table-column align="center" label="Description" min-width="180" prop="description"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button
              v-hasPermi="['mission:questRepeat:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['mission:questRepeat:delete']"
              icon="Delete" link
              size="small"
              style="color: #e05e5e"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :page-sizes="[20,30,50]"
        :total="total"
        @pagination="getList"
    />

    <!--Add Newbie Benefits-->
    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="700px">
      <el-form :inline="true" ref="newbieBenefitsRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="id" prop="id" style="min-width: 290px">
          <el-input
              v-model="form.id"
              clearable
              placeholder="id"
          />
        </el-form-item>
        <el-form-item label="Quest Settings ID" prop="questSettingsId" style="min-width: 290px">
          <el-input
              v-model="form.questSettingsId"
              clearable
              placeholder="questSettingsId"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="data.showAddButton" @click="submitForm">提交</el-button>
        <el-button type="primary" v-if="data.showEditButton" @click="handleUpdate">编辑</el-button>
        <el-button @click="open=false">取 消</el-button>

      </div>
    </el-dialog>


    <!--Modify Newbie Settings-->
    <el-dialog v-model="settings" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="800px">
      <el-form :inline="true" ref="newbieSettingsRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="Select Currency" label-width="150px">
          <el-checkbox-group v-model="currency" label="Select Currency">
            <div>
            <el-checkbox label="Select All" />
            </div>
            <el-checkbox label="BRL" />
          </el-checkbox-group>
        </el-form-item>
        <div>
          <el-form-item label="Rule Description" label-width="150px">
          <div class="mb-2 flex items-center text-sm">
            <el-radio-group v-model="data.ruleDescriptionOption" class="ml-4">
              <el-radio label="1" size="large">Professional Translation</el-radio>
              <el-radio label="2" size="large">Customized Translation</el-radio>
            </el-radio-group>
            <el-input :disabled="data.ruleDescriptionOption === '2'"/>
          </div>
        </el-form-item>
        </div>
          <el-form-item label="Collection Method" label-width="150px">
            <div class="mb-2 flex items-center text-sm">
              <el-radio-group v-model="data.collectionMethodOption" class="ml-4">
                <el-radio label="1" size="large">Direct to Account</el-radio>
                <el-radio label="2" size="large">Manual Collection</el-radio>
              </el-radio-group>
            </div>
          </el-form-item>
        <div>
          <el-form-item label="Event Collection Entrance" label-width="150px">
            <el-checkbox-group v-model="currency" label="Select Currency">
              <div>
                <el-checkbox label="PC" />
                <el-checkbox label="H5" />
              </div>
                <el-checkbox label="Each browser fingerprint is limited to 1 redemption" />
              <div>
                <el-checkbox label="Android" />
                <el-checkbox label="IOS" />
              </div>
              <el-checkbox label="Each login device number can only be claimed once" />
            </el-checkbox-group>
          </el-form-item>
        </div>
          <el-form-item label="More Collection Restrictions" label-width="150px">
            <el-checkbox-group v-model="currency" label="Select Currency">
              <div>
                <el-checkbox label="Only registered device number can be collected" />
                <el-checkbox label="Payment method hase been bound" />
              </div>
              <el-checkbox label="Each login IP number is limited to 1 claim" />
            </el-checkbox-group>
          </el-form-item>
        <div>
          <el-form-item label="Audit Multiple" label-width="150px">
            <div class="mb-2 flex items-center text-sm">
              <el-input v-model="data.auditInput"/>
            </div>
          </el-form-item>
        </div>
          <el-form-item label="Audit Restricted Platform" label-width="150px">
            <div class="mb-2 flex items-center text-sm">
              <el-radio-group v-model="data.collectionMethodOption" class="ml-4">
                <el-radio label="1" size="large">Not Limited</el-radio>
                <el-radio label="2" size="large">Only for the following checked platforms</el-radio>

                <el-tabs type="border-card">
                  <el-tab-pane label="Chess">
                    <el-checkbox-group v-model="chess" label="Select Currency">
                      <el-checkbox v-for="item in data.platformList"
                                   :label ="item.gameCategory"
                                   size="large"
                                   style="width: auto">
                        {{item.gameCategory}}
                      </el-checkbox>
                    </el-checkbox-group></el-tab-pane>
                  <el-tab-pane label="Fishing">
                    <el-checkbox-group v-model="fishing" label="Select Currency">
                      <el-checkbox v-for="item in data.platformList"
                                   :label ="item.gameCategory"
                                   size="large"
                                   style="width: auto">
                        {{item.gameCategory}}
                      </el-checkbox>
                    </el-checkbox-group></el-tab-pane>
                  <el-tab-pane label="Electronics">
                    <el-checkbox-group v-model="electronics" label="Select Currency">
                      <el-checkbox v-for="item in data.platformList"
                                   :label ="item.gameCategory"
                                   size="large"
                                   style="width: auto">
                        {{item.gameCategory}}
                      </el-checkbox>
                    </el-checkbox-group></el-tab-pane>
                  <el-tab-pane label="Real">
                    <el-checkbox-group v-model="real" label="Select Currency">
                    <el-checkbox v-for="item in data.platformList"
                                 :label ="item.gameCategory"
                                 size="large"
                                 style="width: auto">
                      {{item.gameCategory}}
                    </el-checkbox>
                  </el-checkbox-group></el-tab-pane>
                  <el-tab-pane label="Sports">
                    <el-checkbox-group v-model="sports" label="Select Currency">
                    <el-checkbox v-for="item in data.platformList"
                                 :label ="item.gameCategory"
                                 size="large"
                                 style="width: auto">
                      {{item.gameCategory}}
                    </el-checkbox>
                  </el-checkbox-group></el-tab-pane>
                  <el-tab-pane label="Blockchain">
                    <el-checkbox-group v-model="blockchain" label="Select Currency">
                      <el-checkbox v-for="item in data.platformList"
                                   :label ="item.gameCategory"
                                   size="large"
                                   style="width: auto">
                        {{item.gameCategory}}
                      </el-checkbox>
                    </el-checkbox-group>
                  </el-tab-pane>
                </el-tabs>
              </el-radio-group>
            </div>
          </el-form-item>
        <div>
          <el-form-item label="Task Duration" label-width="150px">
            <div class="mb-2 flex items-center text-sm">
              <el-radio-group v-model="data.collectionMethodOption" class="ml-4">
                <el-radio label="1" size="large">Long</el-radio>
                <el-radio label="2" size="large">Limited Time</el-radio>
                <el-input
                  v-model="input1"
                  class="w-50 m-2"
                  max="9999"
                  min="1"
                  size="large"
                  placeholder="Please Input"
                />
              </el-radio-group>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="data.showAddButton" @click="submitForm">提交</el-button>
        <el-button type="primary" v-if="data.showEditButton" @click="handleUpdate">编辑</el-button>
        <el-button @click="open=false">取 消</el-button>

      </div>
    </el-dialog>


  </div>
</template>

<script name="newbieBenefits" setup>
//region
import {
  newbieListData,
  deleteNewbie,
  addNewbieBenefits,
  updateNewbieBenefits,
  changeNewbieStatus
} from "@/api/activity/newbieBenefits";

import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {getToken} from "@/utils/auth";
import {newbiePlatformList} from "@/api/activity/questRepeat";
const {proxy} = getCurrentInstance();

const router = useRouter();

const newbieBenefitsList = ref([]);
const ids = ref([]);
const id = ref('');
const status = ref('');
const tipBubbleSwitch = ref('');
const updateTime = ref('');
const updateBy = ref('');
const description = ref('');
const title = ref('');
const total = ref(0);
const open = ref(false);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const loading = ref(true);

const currency = ref([]);
const settings = ref(false);
const chess = ref([]);
const fishing = ref([]);
const electronics = ref([]);
const real = ref([]);
const sports = ref([]);
const blockchain = ref([]);
//endregion
const data = reactive({

  showAddButton: false,
  showEditButton: false,
  ruleDescriptionOption: '1',
  collectionMethodOption: '1',
  auditInput: null,
  platformList: {},
  /** 查询参数 query params*/
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    type: null,
    effect: null,
    taskCode: null,
    tipBubbleSwitch: null,
    status: null,
  },

  /** 表单参数 form parameter*/
  form: {},

  headers: {
    Authorization: 'Bearer ' + getToken()
  },

});
const {queryParams, form, rules, headers} = toRefs(data);

function handleInput() {

}

function handleEffectChange(row) {
  let text = row.tipBubbleSwitch === '1' ? '启用' : '停用'
  proxy.$confirm('确认要' + text + '"' + row.title + '"吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(function () {
    const tipBubbleSwitch = changeNewbieStatus(row.id, row.tipBubbleSwitch);
    loading.value = true
    if (tipBubbleSwitch) {
      loading.value = false
      return tipBubbleSwitch
    }
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功')
    getList()
  }).catch(function () {
    row.effect = row.effect === '0' ? '1' : '0'
  })
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** fetch all data from back-end as getList */
function getList() {
  loading.value = true;
  newbieListData(queryParams.value).then(response => {
    newbieBenefitsList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    questSettingsId: null,
  }
  proxy.resetForm('newbieBenefitsRef');
}

/** 重置按钮操作 handle reset query*/
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
  loading.value = false
}

/** handle add new data */
function handleAdd() {
  data.showAddButton = true
  data.showEditButton = false
  reset()
  open.value = true
  title.value = '添加页脚'
}

/** submit new data and handle insert data api*/
function submitForm() {
  proxy.$refs['newbieBenefitsRef'].validate(async valid => {
    if (valid) {
      const params = {

      }

      if (form.value.id != null) {
        updateNewbieBenefits(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addNewbieBenefits(params).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
  proxy.$refs['newbieSettingsRef'].validate(async valid => {
    if (valid) {
      const params = {

      }

      if (form.value.id != null) {
        updateNewbieBenefits(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addNewbieBenefits(params).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** handle update data */
function handleUpdate(row) {
  data.showEditButton = true
  data.showAddButton = false
  form.value = row
  open.value = true
  title.value = '添加页脚'
}

/**  删除按钮操作 handle delete */
function handleDelete(row) {
  const idss = row.id || ids.value
  proxy.$confirm('是否确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return deleteNewbie(idss)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  })
}

function handleNewbieSettings() {
  newbiePlatformList(queryParams.value).then(response => {
    console.log( response.data )
    data.platformList = response.data
  });
  proxy.resetForm( 'newbieSettingsRef' )
  settings.value = true
  title.value = 'Newcomer Welfare Settings'
}


getList()
</script>

<style>
</style>
