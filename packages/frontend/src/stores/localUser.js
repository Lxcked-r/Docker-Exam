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

    const kind = ref(null);	// local, api, or null
    const initialized = ref(false);

    const init = async () => {
        let apiInitFailed = false;
        let localStorageInitFailed = false;

        kind.value = "api";
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
        } catch (error) {
            console.error("[stores/localUser] Could not fetch user from server. Falling back to localStorage.");
            kind.value = "local";
            apiInitFailed = true;
        }

        try {
            const localUser = await universalStorage.get("localUser");
            if (
                !localUser ||
                localUser.id === undefined ||
                localUser.username === undefined || typeof localUser.username !== "string" ||
                localUser.operator === undefined || typeof localUser.operator !== "boolean"
            ) throw new Error("Invalid response format");
            user.value = localUser;
        } catch (error) {
            console.error("[stores/localUser] Could not fetch user from localStorage.");
            localStorageInitFailed = true;
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
        } catch (error) {
            console.error(error);
        }
        return user.value;
    };

    return { user, initialized, kind, init, getUser };
});