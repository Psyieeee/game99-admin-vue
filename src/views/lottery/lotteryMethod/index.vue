<template>
   <div class="app-container">
     <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
       <el-form-item label="所属彩种类型" prop="lotteryType">
         <el-select v-model="queryParams.lotteryType" placeholder="请选择所属彩种类型" clearable>
           <el-option
               v-for="item in lotteryType"
               :key="item.value"
               :label="item.label"
               :value="item.value">
           </el-option>
         </el-select>
       </el-form-item>
       <el-form-item label="投注名称" prop="name" class="input-wd28">
         <el-input
             v-model="queryParams.name"
             placeholder="请输入投注名称"
             clearable
             @keyup.enter="handleQuery"
         />
       </el-form-item>
       <el-form-item>
         <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
         <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
       </el-form-item>
     </el-form>

     <el-table stripe v-loading="loading" :data="lotteryMethodList">
       <el-table-column label="所属彩种类型" align="center" prop="lotteryType"/>
       <el-table-column label="投注名称" align="center" prop="name">
         <template v-slot="{row}">
           <a @click="$router.push({path: '/lottery/lotteryGame',query: { type: row.name}})" style="color: #00afff">
             {{ row.name }}</a>
         </template>
       </el-table-column>
       <el-table-column label="排序键" align="center" prop="sort"/>
     </el-table>
     <pagination
         v-show="total"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         :page-sizes="[20,30,50]"
         @pagination="getList"
     />

   </div>
</template>

<script setup name="LotteryMethod">

import {getCurrentInstance, onMounted, reactive, ref, toRefs} from "vue";
import {listLotteryMethodData} from "@/api/lottery/lotteryMethod";

const {proxy}  = getCurrentInstance();

const  lotteryMethodList = ref({});
const showSearch = ref(true);
const loading = ref(false);
const total = ref(0);


const data = reactive({
  queryParams:{
    pageNum: 1,
    pageSize: 20,
    lotteryType: null,
    sort: null,
    name: null,
    ind: null,
  }, // 表单参数
  form: {},
  // 表单校验
  rules: {},

  lotteryType: [{
    value: '时时彩',
    label: '时时彩'
  }, {
    value: '11选5',
    label: '11选5'
  }, {
    value: '快三',
    label: '快三'
  }, {
    value: '赛车',
    label: '赛车'
  }, {
    value: '六合彩',
    label: '六合彩'
  }, {
    value: 'baccarat',
    label: '百家乐'
  }, {
    value: '百人牛牛',
    label: '百人牛牛'
  }],

});

const {queryParams,form,rules,lotteryType} = toRefs(data);

/**
 * 查询彩票种类列表 lottery method list
 */
function getList(){
  loading.value = true
  listLotteryMethodData(queryParams.value).then(res=>{
    lotteryMethodList.value = res.data;
    total.value = res.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery(){
  queryParams.pageNum = 1;
  getList();
}

function reset() {
  form.value = {
    id: null,
    lotteryType: null,
    sort: null,
    name: null,
  };
  proxy.resetForm("form");
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
}

onMounted(() => {
  init()
})

function init() {
  if (proxy.$route.query.lotteryType) {
    queryParams.value.lotteryType = proxy.$route.query.lotteryType
  }
  getList()
}
init()

getList()
</script>

<style scoped>

</style>