import "./assets/main.css";

import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

import { createApp } from "vue";
import { createPinia } from "pinia";

import i18next from "i18next";
import I18NextVue from "i18next-vue";

import App from "./App.vue";
import router from "./router";


import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import ru from "./locales/ru.json";
import el from "./locales/el.json";
import tr from "./locales/tr.json";

import Languagedetector from "i18next-browser-languagedetector";

const locales = {
    fr: fr,
    en: en,
    es: es,
    de: de,
    ru: ru,
    el: el,
    tr: tr,
};


i18next.use(Languagedetector);

i18next.init({
    fallbackLng: ["en", "fr", "es", "de", "ru", "el", "tr"],
    resources: {
        en: {
            translation: en,
        },
        fr: {
            translation: fr,
        },
        es: {
            translation: es,
        },
        de: {
            translation: de,
        },
        ru: {
            translation: ru,
        },
        el: {
            translation: el,
        },
        tr: {
            translation: tr,
        },

    },
});


i18next.on("languageChanged", (lng) => {
    document.documentElement.setAttribute("lang", lng);
});

console.log(i18next.languages);



const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ContextMenu);
app.use(I18NextVue, {
    i18next
});

app.mount("#app");
