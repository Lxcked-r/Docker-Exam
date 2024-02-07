import { ref } from "vue";
import { defineStore } from "pinia";
import API from "@/utils/apiWrapper";

export const useUsersStore = defineStore("users", () => {
	const users = ref([]);
	const initialized = ref(false);

	/**
	 * Initializes the store for use in the app.
	 * @returns {Promise<void>}
	 */
	const init = async () => {
		// we try to get the users from the api. if this fails, we use the fallback
		// copy in localStorage. if that fails too somehow, we just use an empty array.

		let apiInitFailed = false;
		let localStorageInitFailed = false;

		// try the api first
		try {
			const response = await API.fireServer("/api/v1/users", {
				method: "GET",
			});

			response.data = await response.json();

			// sanity checks
			if (!response.ok) {
				apiInitFailed = true;
				throw new Error("Bad response code");
			}

			if (!response.data) {
				apiInitFailed = true;
				throw new Error("No data received");
			}

			// inspect response format
			// format: { success: true, data: [{ id: 1, name: "John Doe" }, ...] }

			if (!response.data.success) {
				apiInitFailed = true;
				throw new Error("API returned unsuccessful response");
			}

			if (!response.data.data) {
				apiInitFailed = true;
				throw new Error("API returned no data");
			}

			// if we're here, everything went well
			users.value = response.data.data;
			initialized.value = true;

			// save to localStorage
			localStorage.setItem("users", JSON.stringify(response.data.data));
			localStorage.setItem("users.lastUpdated", Date.now());
		} catch (error) {
			console.error("[stores/users] Could not fetch users from server. Falling back to localStorage.");
			console.error(error);
		}

		// try localStorage next
		if (apiInitFailed) {
			try {
				const localStorageUsers = JSON.parse(localStorage.getItem("users"));

				if (!localStorageUsers) {
					localStorageInitFailed = true;
					throw new Error("No data in localStorage");
				}

				users.value = localStorageUsers;
				initialized.value = true;
			} catch (error) {
				console.error("[stores/users] Could not fetch users from localStorage. Using empty array.");
				console.error(error);
			}
		}

		// if everything failed, just use an empty array
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
