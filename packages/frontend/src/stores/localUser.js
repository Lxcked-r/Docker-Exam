import { ref } from "vue";
import { defineStore } from "pinia";
import API from "@/utils/apiWrapper";
import { universalStorage } from "@/utils/universalStorage";

export const useLocalUserStore = defineStore("localUser", () => {
    const user = ref({
        id: "null",		
        username: "user",
        operator: false,
    });

    console.log("[stores/localUser] Initializing localUser store...");

    console.log(universalStorage);
    // Check if the user is already stored in localStorage/Electron

    universalStorage.get("localUser").then((localUser) => {
        console.log("[stores/localUser] Found localUser in storage:", localUser);
    }).catch((error) => {
        console.error("[stores/localUser] No localUser found in storage:", error);
    });

    const kind = ref(null);	// "api" if loaded from API, "local" if loaded from storage, null if failed
    const initialized = ref(false);

    const init = async () => {
        let apiInitFailed = false;
        let localStorageInitFailed = false;

        // First, try to fetch the user from the API
        if(window.electronAPI) {
            console.log("[stores/localUser] Using Electron API to get token.");
            window.electronAPI.getToken().then((token) => {
                if (token) {
                    console.log("[stores/localUser] Token found in Electron API, setting it in API wrapper.");
                    API.setToken(token);
                }
                }).catch((error) => {
                    console.error("[stores/localUser] Error retrieving token from Electron API:", error);
                });
        }
        
        try {
            const response = await API.fireServer("/api/v1/users/me", { method: "GET" });
            response.data = await response.json();

            if (!response.ok) throw new Error("Bad response code");
            if (
                response.data.user.id === undefined ||
                response.data.user.username === undefined || typeof response.data.user.username !== "string" ||
                response.data.user.operator === undefined || typeof response.data.user.operator !== "boolean"
            ) throw new Error("Invalid response format");

            await universalStorage.set("localUser", response.data.user);
            user.value = response.data.user;
            kind.value = "api"; // <-- Set kind to "api" if API call succeeds
        } catch (error) {
            console.error("[stores/localUser] Could not fetch user from server. Falling back to localStorage/Electron.");
            apiInitFailed = true;
        }

        if (apiInitFailed) {
            try {
                const localUser = await universalStorage.get("localUser");
                if (
                    !localUser ||
                    localUser.id === undefined ||
                    localUser.username === undefined || typeof localUser.username !== "string" ||
                    localUser.operator === undefined || typeof localUser.operator !== "boolean"
                ) throw new Error("Invalid response format");
                user.value = localUser;
                kind.value = "local"; // <-- Set kind to "local" if loaded from storage
            } catch (error) {
                console.error("[stores/localUser] Could not fetch user from localStorage/Electron.");
                localStorageInitFailed = true;
            }
        }

        if (apiInitFailed && localStorageInitFailed) {
            kind.value = null;
            throw new Error("Could not initialize localUser store");
        }
        initialized.value = true;
    };

    const getUser = async () => {
        try {
            const response = await API.fireServer("/api/v1/users/me", { method: "GET" });
            response.data = await response.json();

            if (!response.ok) throw new Error("Bad response code");
            if (
                response.data.user.id === undefined ||
                response.data.user.username === undefined || typeof response.data.user.username !== "string" ||
                response.data.user.operator === undefined || typeof response.data.user.operator !== "boolean"
            ) throw new Error("Invalid response format");

            await universalStorage.set("localUser", response.data.user);
            user.value = response.data.user;
            kind.value = "api";
        } catch (error) {
            console.error(error);
            // Optionally, you could try to load from storage here as a fallback
        }
        return user.value;
    };

    return { user, initialized, kind, init, getUser };
});