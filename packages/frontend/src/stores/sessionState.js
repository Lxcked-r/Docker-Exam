import { ref } from "vue";
import { defineStore } from "pinia";

export const useSessionStateStore = defineStore("sessionState", () => {
	const signedIn = ref(false);
	const isOffline	= ref(false);

	function setSignedInState(bool) {
		signedIn.value = bool;
	}

	return {
		signedIn,
		isOffline,
		setSignedInState,
	};
});
