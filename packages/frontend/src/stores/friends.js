import { ref } from "vue";
import { defineStore } from "pinia";
import API from "@/utils/apiWrapper";

export const useFriendsStore = defineStore("friends", () => {
    const friends = ref([]);
    const kind = ref(null);	// local, api, or null
    const initialized = ref(false);


    /**
     * Initializes the store for use in the app.
     * @returns {Promise<void>}
     * @throws {Error} if the store could not be initialized
    */
    const init = async (userID) => {
        // we get the user from the api first before falling back to localStorage
        // if that fails too somehow, we need to throw an error

        let apiInitFailed = false;
        let localStorageInitFailed = false;

        kind.value = "api";	// default to
        // try the api first
        try {
            if(!userID) {
                return;
            }
            const response = await API.fireServer("/api/v1/friends/" + userID, {
                method: "GET",
            });

            response.data = await response.json();

            // for each friends in data set online to null
            response.data.forEach((friend) => {
                friend.online = null;
            });

            // make sure the values in the response are sane
            if (!response.ok) {
                apiInitFailed = true;
                throw new Error("Bad response code");
            }

            if (!Array.isArray(response.data)) {
                apiInitFailed = true;
                throw new Error("Invalid response format");
            }

            // copy to live store
            friends.value = response.data;

        } catch (error) {
            console.error(error);
            console.error("[stores/friends] Could not fetch friends from server. Falling back to localStorage.");
            kind.value = "local";
            apiInitFailed = true;
        }

        // if the api failed, try localStorage
        if (apiInitFailed) {
            throw new Error("Could not initialize friends store");
        }

        if (apiInitFailed && localStorageInitFailed) {
            throw new Error("Could not initialize friends store");
        }

        initialized.value = true;
    };

    return {
        friends,
        kind,
        initialized,
        init,
    };
});
