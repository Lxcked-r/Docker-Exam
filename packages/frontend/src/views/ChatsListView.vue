<script setup>
import { ref, onMounted } from 'vue';
import API from '@/utils/apiWrapper';

import { useRoute, useRouter } from 'vue-router';

import { useLocalUserStore } from '@/stores/localUser';

import ChatsDisp from '@/components/ChatsDisp.vue';
import CustomDialog from '@/components/CustomDialog.vue';
import socket from '@/utils/socket';

import crypter from '@/utils/crypter';

const creating = ref(false);

const createDialogRef = ref(null);

const localUserStore = useLocalUserStore();

const router = useRouter();

const route = useRoute();

const channels = ref([]);

const selectedChannel = ref(null);

const newChanInput = ref(null);

const chatViewRef = ref(null);

const loading = ref(true);

const allImgs = ref([]);

const getChannels = async () => {
	const response = await API.fireServer('/api/v1/channelsrelations?userID=' + localUserStore.user.id, {
		method: 'GET',
	});

	if (response.status === 200) {
		channels.value = await response.json();
	}
};


const getAllImagesFromPage = () => {
	const imgs = document.querySelectorAll('img');
	const imgSrcs = [];
	imgs.forEach((img) => {
		imgSrcs.push(img);
	});
	allImgs.value = imgSrcs;

};

const backToDashBoard = () => {
	router.push('/dashboard');
};

onMounted(async () => {
	await localUserStore.init();
	if (localUserStore.kind !== 'api') {
		router.push('/login');
		return;
	} else {
		await getChannels();
		loading.value = false;
	}
});

const openChat = (channel) => {
	router.replace('/dashboard/chats/' + channel.channelID);
};

const createNewChan = () => {
	creating.value = true;
	createDialogRef.value.show();
};

const saveChan = async () => {
	if (newChanInput.value.value === '') {
		return;
	}

	const response = await API.fireServer('/api/v1/channels', {
		method: 'POST',
		body: JSON.stringify({
			name: newChanInput.value.value,
			owner: localUserStore.user.id,
		}),
	});

	if (response.status === 200) {
		const newChannel = await response.json();
		const response2 = await API.fireServer('/api/v1/channelsrelations', {
			method: 'POST',
			body: JSON.stringify({
				userID: localUserStore.user.id,
				channelID: newChannel.id,
			}),
		});

		if (response2.status === 200) {
			await getChannels();
			let data = {
				channelID: newChannel.id,
				userID: localUserStore.user.id,
			};
			const encryptedData = await crypter.encrypt(data);
			socket.emit("channel", encryptedData);
			creating.value = false;
			createDialogRef.value.hide();
		}
	}
};

socket.on("newChan", async (data) => {
	const decryptedData = await crypter.decrypt(data);
	if (decryptedData.userID === localUserStore.user.id) {
		await getChannels();
	}
});


</script>

<template>
	<div class="flex flex-1">

		<div class="flex flex-col gap-4 min-w-60 p-2 bg-base-200">

			<Teleport to="#dash">
				<CustomDialog ref="createDialogRef" confirm-name="Save" cancel-name="Cancel" @cancel="createDialogRef.hide()"
					@confirm="saveChan();">
					<template #content>
						<h2>
							Create a new chat
						</h2>
						<input ref="newChanInput" type="text" placeholder="Channel Name" class="input input-bordered w-full max-w-xs" />
					</template>
				</CustomDialog>
			</Teleport>

			
			<div class="flex p-2">
				<h2 class="flex-1 text-2xl font-bold">
					Chatrooms
				</h2>
				
				<button @click="createNewChan" class="btn btn-sm btn-outline btn-primary">
					<i class="bi bi-plus text-2xl"></i>
				</button>
			</div>
			<div v-if="loading" class="flex flex-col items-center gap-2">
				<span class="loading loading-spinner"></span>
				<p>
					Getting the latest data...
				</p>
			</div>
			<div v-else-if="channels.length === 0">
				<p>
					No chats found.
				</p>
			</div>
			<ChatsDisp
				v-for="channel in channels"
				v-else :key="channel.id"
				:id="channel.Channel.id"
				:name="channel.Channel.name"
				:avatar="channel.Channel.avatar"
				@click="selectedChannel = channel; openChat(channel);"
			/>
		</div>

		<div class="flex flex-1">
			<router-view v-slot="{ Component }">
  				<component :is="Component" ref="chatViewRef" />
			</router-view>
		</div>
	</div>
</template>