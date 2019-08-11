import Vue from 'vue';
import vuetify from '@/plugins/vuetify'
import i18n from './i18n'
import App from './App.vue';


Vue.config.productionTip = false;

new Vue({
  i18n,
  vuetify,
  render: h => h(App),
  components: { App }
}).$mount('#app');
