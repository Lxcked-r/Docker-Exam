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

const users = ref([]);

const router = useRouter();

const messages = ref([]);

const dialogRef = ref(null);

const channelID = ref(null);
const channelName = ref(null);

const actualChannel = ref(null);
const urlParams = new URLSearchParams(window.location.search);

channelID.value = urlParams.get("channelID");

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
		router.push("/dashboard/chat?channelID="+ urlParams.get("channelID"));
	} catch (e) {
		console.error(e);
		status = false;
		router.push("/login");
	}
	if (status) {
		user.value = localUserStore.user;
		await getThisChannel();
		await getMessages();
		await getUsers();
		loading.value = false;
	} else {
		router.push("/login");
	}

});

const getThisChannel = async () => {
	const res = await API.fireServer("/api/v1/channels?id="+urlParams.get("channelID"), {
		method: "GET"
	});

	const channel = await res.json();
	channelName.value = channel.name;
	actualChannel.value = channel;

}

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

const getUsers = async () => {
	const res = await API.fireServer("/api/v1/channelsRelations?channelID=" + channelID.value, {
		method: "GET"
	});

	users.value = await res.json();
	return users;
}

const isOp = () => {
	return user.value.id === users.channOP;
}

const isOwner = () => {
	return actualChannel.value.owner === user.value.id;
}

const getOwnerId = () => {
	return actualChannel.value.owner;
}

</script>

<template>
		<div v-if="loading">
			<span class="loading loading-spinner"></span>
				<p>
					Getting the latest data...
				</p>
		</div>
		<div v-else class="home">
			<Chat 
			:channelName="channelName"
			:channelMessages="messages"
			:channelID="channelID"
			:userName="user.username"
			:userID="user.id"
			:channelUsers="users"
			:isOwner="isOwner()"
			:isOP="isOp()"
			:ownerID="getOwnerId()" />
		</div>
</template>