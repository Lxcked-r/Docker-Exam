import config from "@/../config.json";
const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;


const meteoSwissAPI = {};

meteoSwissAPI.getWeather = async function(location, version) {
    const response = await fetch(`${baseUrl}/api/v1/meteoswiss/weather?location=${location}&version=${version}`);
    return response;
}

meteoSwissAPI.getVersion = async function() {
    const response = await fetch(`${baseUrl}/api/v1/meteoswiss/version`);
    return response;
}

export default meteoSwissAPI;