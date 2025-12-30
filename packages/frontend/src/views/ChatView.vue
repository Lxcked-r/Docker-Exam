<script setup>
import API from "@/utils/apiWrapper";
import { onMounted, ref, watch, inject } from "vue";
import { useRouter, useRoute } from "vue-router";

import Chat from "@/components/Chat.vue";

import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import CustomDialog from "@/components/CustomDialog.vue";
import crypter from "@/utils/crypter";
import App from "@/App.vue";

const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();

const loading = ref(true);

const chatRef = ref(null);

const user = ref({});

const users = ref([]);

const router = useRouter();
const route = useRoute();

const messages = ref([]);

const dialogRef = ref(null);

const channelID = ref(null);
const channelName = ref(null);
const channelAvatar = ref(null);
const channelKey = ref(null);

const actualChannel = ref(null);

const lastLoadedMessages = ref([]);

const page = 1;

channelID.value = route.params.id;

const socket = inject("socket");


watch(() => route.params.id, async (newVal, oldVal) => {
	channelID.value = newVal;
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
		} catch (e) {
			console.error(e);
			status = false;
			router.push("/login");
		}
		if (status) {
			user.value = localUserStore.user;
			if (!await getMessages()){
				dialogRef.value.show();
				loading.value = false;
				return;
			}
			await getThisChannel();
			await getUsers();
			channelAvatar.value = actualChannel.value.avatar;
			channelID.value = route.params.id;
			chatRef.value.channelAvatar = actualChannel.value.avatar;
			if(actualChannel.value.key) {
				channelKey.value = actualChannel.value.key;
			}
			loading.value = false;
		} else {
			router.push("/login");
		}
		
});


socket.on("editChannel", async (data) => {
	if (data.id === channelID.value) {
		channelName.value = data.name;
	}

});

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
	} catch (e) {
		console.error(e);
		status = false;
		router.push("/login");
	}
	if (status) {
		user.value = localUserStore.user;
		if (!await getMessages()){
			dialogRef.value.show();
			return;
		}
		await getThisChannel();
		await getUsers();
		channelAvatar.value = actualChannel.value.avatar;
		loading.value = false;
	} else {
		router.push("/login");
	}
	loading.value = false;


});

const getThisChannel = async () => {
	const res = await API.fireServer("/api/v1/channels?id="+channelID.value, {
		method: "GET"
	});

	const channel = await res.json();
	channelName.value = channel.name;
	actualChannel.value = channel;
	channelAvatar.value = channel.avatar;
	channelKey.value = channel.key;
}

const reload = () => {
	window.location.reload();
};

const getMessages = async () => {
	let msgs;
	let secondEncrypt;
	const res = await API.fireServer("/api/v1/messages?channelID="+channelID.value+"&page=" + page, {
		method: "GET"}
	);

	if(res.status === 403) {
		return false;
	}

	const encryptedMessages = await res.json();

	const decryptedMessages = await crypter.decrypt(encryptedMessages);

	msgs = decryptedMessages;

	lastLoadedMessages.value = msgs.reverse();
	msgs.reverse();
	messages.value = msgs.reverse();
	return true;
}

const getUsers = async () => {
	users.value = [];
	const res = await API.fireServer("/api/v1/channelsRelations?channelID=" + channelID.value + "&test=chatView", {
		method: "GET"
	});
	const tt = await res.clone();
	const json2 = await tt.json();

	users.value = json2;

	return users.value;
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
	<Teleport to="#dash">
		<CustomDialog
			ref="dialogRef"
			confirm-name="Yes"
			:isAcknowledgement="true"
			@confirm="router.push('/dashboard')"
		>
			<template #title>
				ERROR
			</template>
			<template #content>
				<p>
					You are not allowed to access this channel.
				</p>
			</template>
		</CustomDialog>
	</Teleport>
		<div v-if="loading">
			<span class="loading loading-spinner"></span>
				<p>
					Getting the latest data...
				</p>
		</div>
		<Chat v-else
			ref="chatRef"
			:channelName="channelName"
			:channelMessages="messages"
			:channelID="channelID"
			:userName="user.username"
			:userID="user.id"
			:channelUsers="users"
			:isOwner="isOwner()"
			:isOP="isOp()"
			:ownerID="getOwnerId()"
			:channelAvatar="channelAvatar"
			:channelType="actualChannel.type"
			:key="channelKey"
		/>
</template>