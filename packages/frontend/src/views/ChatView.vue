<script setup>
import API from "@/utils/apiWrapper";
import { onMounted, ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";

import Chat from "@/components/Chat.vue";

import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import CustomDialog from "@/components/CustomDialog.vue";

const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();

const loading = ref(true);

const user = ref({});

const router = useRouter();

const messages = ref([]);

const dialogRef = ref(null);

const channelID = ref(null);

channelID.value = 9;

onMounted(async () => {	
	// Check if the user is logged in, and redirect them to the chat if they are.
	let status = true;
	try {
		await localUserStore.init();
		sessionStateStore.setSignedInState(true);
		if (localUserStore.kind !== "api") {
			status = false;
			router.push("/login");
			return;
		}
		router.push("/chat");
	} catch (e) {
		console.error(e);
		status = false;
		router.push("/login");
	}
	if (status) {
		user.value = localUserStore.user;
		await getMessages();
		loading.value = false;
	} else {
		router.push("/login");
	}

});

const reload = () => {
	window.location.reload();
};

const getMessages = async () => {
	const res = await API.fireServer("/api/v1/messages?channelID="+channelID.value, {
		method: "GET"}
	);

	messages.value = await res.json();
}

const getUserFromLocalStore = async () => {
	user.value = localUserStore.user;
}

</script>

<template>
	<div v-if="loading">
		<span class="loading loading-spinner"></span>
			<p>
				Getting the latest data...
			</p>
	</div>
	<div v-else="" class="home">
		<CustomDialog ref="dialogRef" />
		<Chat 
		channelName="test"
		:channelMessages=messages
		:channelID=channelID
		:userID=user.id />
	</div>
</template>