<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['member:memberAdvertisement:add']"
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
            v-hasPermi="['member:memberAdvertisement:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            size="small"
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table stripe v-loading="loading" :data="memberTierList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="id"/>
      <el-table-column label="Hierarchy Type" align="center" prop="hierarchyType"/>
      <el-table-column label="Level Name" align="center" prop="levelName"/>
      <el-table-column label="Description" align="center" prop="description"/>
      <el-table-column label="Number of Recharges" align="center" prop="recharges"/>
      <el-table-column label="Cumulative Recharge Amount" align="center" prop="cumulativeRechargeAmount" min-width="100"/>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="Modify" min-width="100">
        <template #default="scope">
          <el-button
              v-hasPermi="['member:memberTier:edit']"
              icon="Edit" link
              size="small"
              type="primary"
              @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button
              v-hasPermi="['member:memberTier:delete']"
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
              :total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              :page-sizes="[20,30,50]"
              @pagination="getList"/>

    <el-dialog v-model="open" :close-on-click-modal="false" :title="title" append-to-body style="padding-bottom: 20px"
               width="700">
      <el-form ref="memberTierRef" :model="form" :rules="rules" label-width="250px">
        <div class="el-row">
          <div class="el-col-lg-24">
            <el-form-item label="Hierarchy Type" prop="hierarchyType" >
              <el-input
                  v-model="form.hierarchyType"
                  clearable
                  placeholder="Hierarchy Type"
              />
            </el-form-item>
            <el-form-item label="Level Name" prop="levelName" >
              <el-input
                  v-model="form.levelName"
                  clearable
                  placeholder="Level Name"
              />
            </el-form-item>
            <el-form-item label="description" prop="description" >
              <el-input
                  v-model="form.description"
                  clearable
                  placeholder="description"
              />
            </el-form-item>
            <el-form-item label="Number of Recharges" prop="recharges">
              <el-input
                  v-model="form.recharges"
                  clearable
                  placeholder="Number of Recharges"
              />
            </el-form-item>
            <el-form-item label="Cumulative Recharge Amount" prop="cumulativeRechargeAmount" >
              <el-input
                  v-model="form.cumulativeRechargeAmount"
                  clearable
                  placeholder="Cumulative Recharge Amount"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup name="MemberTier">
import {getCurrentInstance, reactive, ref, toRefs, onMounted} from "vue";
import {
  memberTierListData,
  addMemberTier,
  updateMemberTier,
  deleteMemberTier,
  getTierMemberData
} from "@/api/member/memberTier";
import {resetForm} from "@/utils/common";

const {proxy} = getCurrentInstance()
const showSearch = ref(true);
const loading = ref(false);
const ids = ref([]);
const total = ref(0);
const memberTierList = ref([]);
const title = ref("");
const open = ref(false);
const multiple = ref(true);
const single = ref(true);

const data = reactive({

      components: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        memberId: null,
        title: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
);

const {queryParams, form, rules} = toRefs(data);

function getList() {
  loading.value = true;
  memberTierListData(queryParams.value).then(response => {
    memberTierList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}

function handleQuery() {
  if (queryParams.value.memberId) {
    const reg = '^[0-9a-zA-Z_]{1,}$'
    let flag = queryParams.value.memberId.match(reg)
    if (!flag) {
      proxy.$modal.msgError("会员ID只能输入数字及下划线")
      return
    }
  }
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  resetForm("memberTierRef");
  handleQuery();
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset();
  open.value = true;
  title.value = "Kwak Kwak Kwak";
}

//No use. Copied from 77. Might be needed in future implementations.
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value;
  getTierMemberData(id).then(response => {
    form.value = response.data;
    console.log(form.value)
    open.value = true;
  })
  console.log(form.value)

}

function submitForm() {
  proxy.$refs["memberTierRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMemberTier(form.value).then(res => {
          if (res.code === 200) {
            proxy.$modal.msgSuccess(res.msg)
            open.value = false;
            getList()
          } else {
            proxy.$modal.msgError(res.msg)
          }
          getList();
        });
      } else {
        console.log(JSON.stringify( form.value )+ " *@#@*)")
        addMemberTier(form.value).then(res => {
          if (res.code === 200) {
            proxy.$modal.msgSuccess(res.msg)
            open.value = false;
            getList()
          } else {
            proxy.$modal.msgError(res.msg)
          }
          getList();
        });
      }
    }
  });
}

function handleDelete(row) {
  const memberTierID = row.id || ids.value;
  proxy.$modal.confirm('Do you really want to delete this "' + memberTierID + '" data?', "Warning", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning"
  }).then(function () {
    return deleteMemberTier(memberTierID);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  })
}

function reset() {
  form.value = {
    hierarchyType: null,
    levelName: null,
    description: null,
    recharges: null,
    cumulativeRechargeAmount: null
  }
  proxy.resetForm("memberTierRef");
}

getList();
</script>
