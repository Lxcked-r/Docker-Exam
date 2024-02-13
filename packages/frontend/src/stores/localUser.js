import { ref } from "vue";
import { defineStore } from "pinia";
import API from "@/utils/apiWrapper";

export const useLocalUserStore = defineStore("localUser", () => {
	const user = ref({
		id: "null",		
		username: "user",
		operator: false,
	});

	const kind = ref(null);	// local, api, or null

	const initialized = ref(false);

	/**
	 * Initializes the store for use in the app.
	 * @returns {Promise<void>}
	 */
	const init = async () => {
		// we get the user from the api first before falling back to localStorage
		// if that fails too somehow, we need to throw an error

		let apiInitFailed = false;
		let localStorageInitFailed = false;

		kind.value = "api";	// default to
		// try the api first
		try {
			const response = await API.fireServer("/api/v1/users/me", {
				method: "GET",
			});

			response.data = await response.json();

			// make sure the values in the response are sane
			if (!response.ok) {
				apiInitFailed = true;
				throw new Error("Bad response code");
			}

			if (
				response.data.user.id === undefined || response.data.user.username === undefined || typeof response.data.user.username !== "string" ||
				response.data.user.operator === undefined || typeof response.data.user.operator !== "boolean"
			) {
				apiInitFailed = true;
				throw new Error("Invalid response format");
			}
			
			// copy this to local storage
			localStorage.setItem("localUser", JSON.stringify(response.data.user));

			// copy to live store
			user.value = response.data.user;
		} catch (error) {
			
			console.error("[stores/localUser] Could not fetch user from server. Falling back to localStorage.");
			kind.value = "local";
			apiInitFailed = true;
		}

		// try localStorage next
		try {
			const localUser = JSON.parse(localStorage.getItem("localUser"));

			if (
				localUser.id === undefined ||
				localUser.username === undefined || typeof localUser.username !== "string" ||
				localUser.operator === undefined || typeof localUser.operator !== "boolean"
			) {
				localStorageInitFailed = true;
				throw new Error("Invalid response format");
			}
			// copy to live store
			user.value = await localUser;
		} catch (error) {
			console.error("[stores/localUser] Could not fetch user from localStorage.");

			localStorageInitFailed = true;
		}

		// if both failed, throw an error
		if (apiInitFailed && localStorageInitFailed) {
			kind.value = null;
			throw new Error("Could not initialize localUser store");
		}

		// if we're here, everything went well
		initialized.value = true;
	};

	const getUser = async () => {
		return user.value;
	};

	return { user, initialized, kind, init , getUser};
});
