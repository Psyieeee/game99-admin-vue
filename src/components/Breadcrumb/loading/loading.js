import loadingTemplate from './loading';
export default {
    install (Vue) {
        const LoadingVue = Vue.extend(loadingTemplate);
        let loading = null;
        function show (msg,that) {
            // if (!loading) {
            loading = new LoadingVue();
            loading.$mount();
            if (that) {
                that.$refs.container.appendChild(loading.$el);
            }else {
                document.querySelector('body').appendChild(loading.$el);
            }
            // }
            loading.visible = true;
            loading.msg = msg;
        }

        function hide () {
            if (loading) {
                loading.visible = false;
            }
        }
        let fn = {
            show,
            hide
        };
        Vue.prototype.$rjLoading = fn;
    }
};
