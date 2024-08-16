<script setup>

import { onMounted, ref, inject, onBeforeMount } from 'vue';

import config from "@/../config";

import API from "@/utils/apiWrapper";
import CustomDialog from '@/components/CustomDialog.vue';
import meteoSwissAPI from '@/utils/meteoSwissAPIWrapper';
import NotificationManager from '@/components/NotificationManager.vue';

import cities from '@/assets/cities.json';

const citiesDataList = ref();

const notify = inject("notify");

const isLoadingWeather = ref(false);

const title = 'Meteo (meteoswiss API)';

const postalCodeInputRef = ref(null);

const meteoData = ref(null);
const city = ref(null);
const maxTemp = ref(null);
const minTemp = ref(null);
const actualTemp = ref(null);
const symbol = ref(null);
const version = ref(null);


const getWeather = async (postalCode) => {


    if(postalCode.length != 4) {
        let newMSG = {title: "Error", body: "Postal code must be 4 digits", level: "error"};
        notify(newMSG);
        return;
    }
    if(isNaN(postalCode)) {
        let newMSG = {title: "Error", body: "Postal code must be a number", level: "error"};
        notify(newMSG);
        return;
    }
    if(!isInside(postalCode)) {
        let newMSG = {title: "Error", body: "Postal code must be a valid Swiss postal code", level: "error"};
        notify(newMSG);
        return;
    }
    isLoadingWeather.value = true;
    const data = await meteoSwissAPI.getWeather(postalCode, version.value);

    let tmp = await data.json();
    if (data.status === 404) {
        console.log(tmp.error);
        let newMSG = {title: "Error", body: tmp.error, level: "error"};
        notify(newMSG);
        return;
    }
    else {
        isLoadingWeather.value = false;
        meteoData.value = tmp.data;
        city.value = meteoData.value.city_name;
        maxTemp.value = meteoData.value.forecasts[0].temp_high;
        minTemp.value = meteoData.value.forecasts[0].temp_low;
        actualTemp.value = meteoData.value.current.temperature;
        
        symbol.value = `https://www.meteosuisse.admin.ch/static/resources/weather-symbols/${meteoData.value.current['weather_symbol_id']}.svg`;
    }

}

// use datalist but only from beginning of the postal code
const completeDatalist = () => {
    let input = postalCodeInputRef.value;
    let datalist = document.getElementById('cities');
    let options = datalist.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value.startsWith(input)) {
            options[i].style.display = 'block';
        } else {
            options[i].style.display = 'none';
        }
    }
}

const isInside = (city) => {
    //cities object look like [{PLZ: postalCode}, {PLZ: postalCode}, ...]
    return cities.some((element) => element.PLZ == city);
}

const lookDL = () => {
    console.log("NUMBER OF OPTIONS");
    console.log(citiesDataList.value.options.length);
}

onBeforeMount(() => {
    document.title = `Meteo - ${config.app_name}`;
});

onMounted(async () => {
    let tempData = await meteoSwissAPI.getVersion();
    version.value = await tempData.text();

    //const data = await meteoSwissAPI.getWeather('8000');

    //symbol.value = await getSymbol(data.value.forecast[0].symbol);
});

</script>

<template>
    <div>

    
        <h1>{{ title }}</h1>
        <div>
            <label for="postalCode">Postal Code:</label>
            <input type="text" id="postalCode" ref="postalCodeInputRef" class="input input-bordered" placeholder="Enter a postal code" list="cities"/>
            <datalist ref="citiesDataList" id="cities">
                <option v-for="city in cities" :value="city.PLZ" :key="city.PLZ">{{ city.PLZ }} : {{ city.Ortschaftsname }}</option>
            </datalist>
            <button v-if="!isLoadingWeather" @click="getWeather(postalCodeInputRef.value)" class="btn btn-outline">Get Weather</button>
            <button v-else class="btn btn-outline" disabled>
                <span class="loading loading-spinner"></span>
                Loading...
            </button>
        </div>
        <div v-if="meteoData && !isLoadingWeather" class="flex-1 flex justify-center max-h-32 flex-col flex-center items-center pt-32">
            <h2>{{ city }}</h2>
            <p>Max Temperature : {{ maxTemp }}°C</p>
            <p>Min Temperature : {{ minTemp }}°C</p>
            <p>Actual Temperature : {{ actualTemp }}°C</p>
            <img :src=symbol>
        </div>
        <span v-else-if="isLoadingWeather" class="loading loading-spinner"></span>
    </div>
</template>
