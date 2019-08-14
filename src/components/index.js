import VDaterange from './VDaterange';
import i18n from '../i18n'

const VuetifyDaterangePicker = {
    install(Vue) {
        Vue.component(i18n);
        Vue.component(VDaterange.name, VDaterange);
    }
};
export default VuetifyDaterangePicker;
export {VDaterange};
