import { ref } from "vue";
import { defineStore } from "pinia";
import API from "@/utils/apiWrapper";

export const useLocalChannelStore = defineStore("localChannel", () => {

    const channels = ref([]);
    const initialized = ref(false);
    const actualChannel = ref(null);

    const init = async (userID) => {
        // we get the user from the api first before falling back to localStorage
        // if that fails too somehow, we need to throw an error

        let apiInitFailed = false;
        let localStorageInitFailed = false;

        // try the api first
        try {
            const response = await API.fireServer("/api/v1/channelsRelations?userID=" + userID, {
                method: "GET",
            });

            response.data = await response.json();

            // make sure the values in the response are sane
            if (!response.ok) {
                apiInitFailed = true;
                throw new Error("Bad response code");
            }

            if (!Array.isArray(response.data.channels)) {
                apiInitFailed = true;
                throw new Error("Invalid response format");
            }
            // copy to live store
            channels.value = response.data.channels;

            localStorage.setItem("localChannels", JSON.stringify(response.data.channels));

            actualChannel.value = response.data.channels[0];
        } catch (error) {
            console.error("[stores/localChannel] Could not fetch channels from server. Falling back to localStorage.");
            apiInitFailed = true;
        }
        initialized.value = true;
    };

    const setChannelID = (channelID) => {
        actualChannel.value = channels.value.find((channel) => channel.id === channelID);
    };

    const getChannelID = () => {
        return actualChannel.value.id;
    }

    return {
        channels,
        actualChannel,
        initialized,
        init,
        setChannelID,
        getChannelID,
    };

});