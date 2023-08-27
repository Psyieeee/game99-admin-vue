import {createApp} from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import locale from 'element-plus/lib/locale/lang/zh-cn' // 中文语言
import * as numberUtil from '@/utils/number.js'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive


// 注册指令
import plugins from './plugins' // plugins
import {download} from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import {useDict} from '@/utils/dict'
import {resetForm, handleTree, selectDictLabel, selectDictLabels,downloadExcel,copyCommand} from '@/utils/common'
import {
    parseTime,
    getTodayStartTime,
    getTodayEndTime,
    getMeiDongTodayStartTime,
    getMeiDongTodayEndTime,
    getDateStartTime,
    getDateEndTime,
    addDateRange,
    getDefaultTime,
    pickerDateTimeShortcuts,
    pickerDateShortcuts
} from '@/utils/dateUtils'

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片转base64组件
import ImageBase64 from "@/components/ImageBase64"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect'
// 字典标签组件
import DictTag from '@/components/DictTag'
// 富文本组件
import WangEditor from '@/components/WangEditor'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels
app.config.globalProperties.downloadExcel = downloadExcel
app.config.globalProperties.copyCommand = copyCommand

app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.getTodayStartTime = getTodayStartTime
app.config.globalProperties.getTodayEndTime = getTodayEndTime
app.config.globalProperties.getMeiDongTodayStartTime = getMeiDongTodayStartTime
app.config.globalProperties.getMeiDongTodayEndTime = getMeiDongTodayEndTime
app.config.globalProperties.getDateStartTime = getDateStartTime
app.config.globalProperties.getDateEndTime = getDateEndTime
app.config.globalProperties.pickerDateTimeShortcuts = pickerDateTimeShortcuts
app.config.globalProperties.pickerDateShortcuts = pickerDateShortcuts
app.config.globalProperties.getDefaultTime = getDefaultTime
app.config.globalProperties.numberUtil = numberUtil

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImageBase64', ImageBase64)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('WangEditor', WangEditor)

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
    locale: locale,
    // 支持 large、default、small
    size: Cookies.get('size') || 'default'
})

app.mount('#app')
