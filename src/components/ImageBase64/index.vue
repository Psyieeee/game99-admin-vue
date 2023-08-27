<template>
  <div class="component-upload-image">
    <el-upload
        :multiple="false"
        method="get"
        list-type="picture-card"
        :on-change="handleChangeUpload"
        :before-upload="handleBeforeUpload"
        :limit="limit"
        :on-exceed="handleExceed"
        ref="imageUpload"
        :before-remove="handleDelete"
        :show-file-list="true"
        :file-list="fileList"
        :class="{ hide: fileList.length >= limit }"
        :auto-upload="true"
    >
      <el-icon class="avatar-uploader-icon">
        <plus/>
      </el-icon>
    </el-upload>
    <!-- 上传提示 -->
    <div class="el-upload__tip" v-if="showTip">
      请选择
      <template v-if="fileSize">
        大小不超过 <b style="color: #f56c6c">{{ fileSize }}kb</b>
      </template>
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
      的图片
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  modelValue: [String, Object, Array],
  // 图片数量限制
  limit: {
    type: Number,
    default: 1,
  },
  // 大小限制(kb)
  fileSize: {
    type: Number,
    default: 100,
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => ["png", "jpg", "jpeg"],
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: true
  }
});

const {proxy} = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const fileList = ref([]);
const showTip = computed(
    () => props.isShowTip && (props.fileType || props.fileSize)
);

watch(() => props.modelValue, val => {
  if (val) {
    fileList.value.push({name: val, url: val})
  } else {
    fileList.value = [];
    return [];
  }
}, {deep: true, immediate: true});

// 上传前loading加载
function handleBeforeUpload(file) {
  let isImg = false;
  if (props.fileType.length) {
    let fileExtension = "";
    if (file.name.lastIndexOf(".") > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
    }
    isImg = props.fileType.some(type => {
      if (file.type.indexOf(type) > -1) return true;
      return (fileExtension && fileExtension.indexOf(type) > -1)
    });
  } else {
    isImg = file.type.indexOf("image") > -1;
  }
  if (!isImg) {
    proxy.$modal.msgError(
        `文件格式不正确, 请选择${props.fileType.join("/")}图片格式文件!`
    );
    return false;
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`上传头像图片大小不能超过 ${props.fileSize} kb!`);
      return false;
    }
  }
  number.value++;
}

function handleChangeUpload(file) {
  const reader = new FileReader()
  reader.onload = function (e) {
    emit("update:modelValue", reader.result);
  }
  reader.readAsDataURL(file.raw)
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
}

// 删除图片
function handleDelete() {
  emit("update:modelValue", null);
}
</script>

<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
:deep(.hide .el-upload--picture-card) {
  display: none;
}
</style>