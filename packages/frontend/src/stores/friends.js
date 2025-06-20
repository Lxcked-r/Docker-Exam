import { ref } from "vue";
import { defineStore } from "pinia";
import API from "@/utils/apiWrapper";
import { universalStorage } from "@/utils/universalStorage";

export const useFriendsStore = defineStore("friends", () => {
    const friends = ref([]);
    const kind = ref(null);
    const initialized = ref(false);

    const init = async (userID) => {
        let apiInitFailed = false;
        let localStorageInitFailed = false;

        kind.value = "api";
        try {
            if(!userID) return;
            const response = await API.fireServer("/api/v1/friends/" + userID, { method: "GET" });
            response.data = await response.json();

            response.data.forEach((friend) => { friend.online = null; });

            if (!response.ok) throw new Error("Bad response code");
            if (!Array.isArray(response.data)) throw new Error("Invalid response format");

            friends.value = response.data;
            await universalStorage.set("friends", response.data);
        } catch (error) {
            console.error(error);
            console.error("[stores/friends] Could not fetch friends from server. Falling back to localStorage.");
            kind.value = "local";
            apiInitFailed = true;
        }

        if (apiInitFailed) {
            try {
                const localFriends = await universalStorage.get("friends");
                if (!Array.isArray(localFriends)) throw new Error("Invalid local friends format");
                friends.value = localFriends;
            } catch (error) {
                console.error("[stores/friends] Could not fetch friends from localStorage.");
                localStorageInitFailed = true;
            }
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