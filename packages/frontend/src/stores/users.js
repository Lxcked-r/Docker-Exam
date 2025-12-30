import { ref } from "vue";
import { defineStore } from "pinia";
import API from "@/utils/apiWrapper";
import { universalStorage } from "@/utils/universalStorage";

export const useUsersStore = defineStore("users", () => {
    const users = ref([]);
    const initialized = ref(false);

    const init = async () => {
        let apiInitFailed = false;
        let localStorageInitFailed = false;

        try {
            const response = await API.fireServer("/api/v1/users", { method: "GET" });
            response.data = await response.json();

            if (!response.ok) throw new Error("Bad response code");
            if (!response.data) throw new Error("No data received");
            if (!response.data.success) throw new Error("API returned unsuccessful response");
            if (!response.data.data) throw new Error("API returned no data");

            users.value = response.data.data;
            initialized.value = true;

            await universalStorage.set("users", response.data.data);
            await universalStorage.set("users.lastUpdated", Date.now());
        } catch (error) {
            console.error("[stores/users] Could not fetch users from server. Falling back to localStorage.");
            console.error(error);
            apiInitFailed = true;
        }

        if (apiInitFailed) {
            try {
                const localStorageUsers = await universalStorage.get("users");
                if (!localStorageUsers) throw new Error("No data in localStorage");
                users.value = localStorageUsers;
                initialized.value = true;
            } catch (error) {
                console.error("[stores/users] Could not fetch users from localStorage. Using empty array.");
                console.error(error);
                localStorageInitFailed = true;
            }
        }

        if (apiInitFailed && localStorageInitFailed) {
            users.value = [];
            initialized.value = true;
        }
    };

    return {
        users,
        initialized,
        init,
    };
});