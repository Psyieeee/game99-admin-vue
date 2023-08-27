<template>
    <div style="border: 1px solid #ccc">
        <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
        />
        <Editor
                style="height: 500px; overflow-y: hidden;"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="editorCreated"
                @onChange="editorChange"
        />
    </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {onBeforeUnmount, onUpdated, ref, shallowRef, watch} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {getToken} from "@/utils/auth";
import {url} from "@/utils/url";

export default {
    components: {Editor, Toolbar},
    emits: [
        "update:modelValue",
        "change",
        "destroyed",
    ],
    props: {
        // 文本域内容
        modelValue: {
            type: String,
            default: "",
        },
        imagePath: {
            type: String,
            default: "default",
        }
    },
    setup(props, {emit}) {
        const editorRef = shallowRef()
        const valueHtml = ref('')
        const toolbarConfig = {
            excludeKeys: [
                'codeBlock',
                'group-video',
                'insertImage'
            ]
        }
        const domain = localStorage.getItem('vhostUrl');
        const editorConfig = {
            placeholder: '请输入内容...',
            MENU_CONF: {
                uploadImage: {
                    // 小于该值就插入 base64 格式（而不上传），默认为 0
                    // base64LimitSize: 2 * 1024, // 2kb
                    server: url.baseUrl + url.game88PlatformAdminWeb + '/upload/' + props.imagePath,
                    fieldName: 'file',
                    // 单个文件的最大体积限制，默认为 2M
                    maxFileSize: 10 * 1024 * 1024, // 10M
                    // 最多可上传几个文件，默认为 100
                    maxNumberOfFiles: 10,
                    headers: {
                        Authorization: "Bearer " + getToken()
                    },
                    // 超时时间，默认为 10 秒
                    timeout: 60 * 1000, // 60 秒,
                    // 自定义插入图片
                    customInsert(res, insertFn) {
                        insertFn(domain + res.data, '', '')
                    }
                }
            }
        }

        onBeforeUnmount(() => {
            const editor = editorRef.value
            if (editor == null) return
            editor.destroy()
        })
        watch(() => props.modelValue, () => {
            const editor = editorRef.value
            setHtml(editor)
        })
        // 实例加载后触发
        const editorCreated = (editor) => {
            editorRef.value = editor;
            setHtml(editor)
        };
        // 实例内容变化时触发
        const editorChange = (editor) => {
            emit("update:modelValue", editor.getHtml().replaceAll(domain, "\$\{domain\.oss\}"));
        };

        function setHtml(editor) {
            if (editor == null) return
            if (editor.getHtml() !== props.modelValue) {
                editor.setHtml(props.modelValue == null ? '' : props.modelValue.replaceAll("\$\{domain\.oss\}", domain))
            }
        }

        return {
            editorRef,
            valueHtml,
            mode: 'default', // 或 'simple'
            toolbarConfig,
            editorConfig,
            editorCreated,
            editorChange,
        };
    }
}
</script>

<style scoped>

</style>