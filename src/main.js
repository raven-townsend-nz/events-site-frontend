import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';

import Button from 'primevue/button';
import Menubar from "primevue/menubar";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DataView from "primevue/dataview";
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Divider from "primevue/divider";
import Card from 'primevue/card';
import Toast from "primevue/toast";
import ToastService from 'primevue/toastservice';
import Dropdown from "primevue/dropdown";
import MultiSelect from "primevue/multiselect";
import Calendar from "primevue/calendar";
import FileUpload from "primevue/fileupload";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import SelectButton from "primevue/selectbutton";
import ConfirmDialog from "primevue/confirmdialog";
import ConfirmationService from 'primevue/confirmationservice';


const app = createApp(App);
app.use(PrimeVue);
app.use(ToastService);
app.use(ConfirmationService);
app.use(router);

app.component('p-button', Button);
app.component('p-menubar', Menubar);
app.component('p-datatable', DataTable);
app.component('p-column', Column);
app.component('p-dataview', DataView);
app.component('p-dialog', Dialog);
app.component('p-inputtext', InputText);
app.component('p-password', Password);
app.component('p-divider', Divider);
app.component('p-card', Card);
app.component('p-toast', Toast);
app.component('p-dropdown', Dropdown);
app.component('p-multiselect', MultiSelect);
app.component('p-calendar', Calendar);
app.component('p-fileupload', FileUpload);
app.component('p-textarea', Textarea);
app.component('p-inputnumber', InputNumber);
app.component('p-selectbutton', SelectButton);
app.component('p-confirmdialog', ConfirmDialog);


app.mount('#app');
