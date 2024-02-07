<script setup>
import API from "@/utils/apiWrapper";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import CustomDialog from "@/components/CustomDialog.vue";
const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();

const router = useRouter();

const dialogRef = ref(null);

onMounted(async () => {
	// Check if the user is logged in, and redirect them to the dashboard if they are.
	try {
		await localUserStore.init();
		if (localUserStore.kind !== "api") {
			sessionStateStore.isOffline = true;
		}
		sessionStateStore.setSignedInState(true);
		router.push("/dashboard");
	} catch (e) {
		console.error(e);
		router.push("/login");
	}
});

const reload = () => {
	window.location.reload();
};

</script>

<template>
<main class="flex align-center justify-center h-screen">
	<span class="loading loading-spinner loading-lg"></span>
	<CustomDialog
		:is-acknowledgement="true"
		ref="dialogRef"
		confirm-name="Reload"
		@confirm="reload();"
	>
		<template #title>
			<span class="text-2xl font-bold">
				An error occurred
			</span>
		</template>

		<template #content>
			<p>
				An error occurred while trying to check your session.
			</p>
			<p>
				Please try again later.
			</p>
		</template>
	</CustomDialog>
</main>
</template>
