<script setup>
import { ref, onMounted } from 'vue';
import API from '@/utils/apiWrapper';

import { useRouter } from 'vue-router';

import { useLocalUserStore } from '@/stores/localUser';

import ChatsDisp from '@/components/ChatsDisp.vue';
import CustomDialog from '@/components/CustomDialog.vue';
import socket from '@/utils/socket';

import crypter from '@/utils/crypter';

const creating = ref(false);

const createDialogRef = ref(null);

const localUserStore = useLocalUserStore();

const router = useRouter();

const channels = ref([]);

const selectedChannel = ref(null);

const loading = ref(true);

const getChannels = async () => {
  const response = await API.fireServer('/api/v1/channelsrelations?userID='+localUserStore.user.id, {
    method: 'GET',
  });

  if (response.status === 200) {
    channels.value = await response.json();
  }
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

	if (channel.key !== "") {
		router.push('/dashboard/chat?channelID='+channel.channelID);
	} else {

	}
};

const createNewChan = () => {
	creating.value = true;
	createDialogRef.value.show();
};

const closeEditorAndSave = () => {
	creating.value = false;
	createDialogRef.value.hide();
};


</script>

<style scoped>
/* Add your custom styles here */
</style>
<template v-if="!loading">
		
		<CustomDialog
			ref="createDialogRef"
			confirm-name="Save"
			cancel-name="Cancel"
			@cancel="createDialogRef.hide()"
			@confirm="closeEditorAndSave();"
			:confirm-locked="isEditorSaving"
		>
		<template #content>
			<h2>
				Create a new chat
			</h2>
			<input type="text" placeholder="Channel Name" class="input input-bordered w-full max-w-xs" />
		</template>
			
		</CustomDialog>

	<button @click="backToDashBoard" class="btn btn-outline">
		Back to Dashboard
	</button>
	<button @click="createNewChan" class="btn btn-outline btn-primary">
		Create New Chat
	</button>
	<div class="flex flex-col gap-4">

		<h2>
			Click on a chat to join it.
		</h2>
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
			v-else
			:key="channel.id"
			:id="channel.Channel.id"
			:name="channel.Channel.name"
			:avatar="channel.Channel.avatar"

			@click="selectedChannel = channel; openChat(channel);"
		/>

		<CustomDialog
			ref="dialogRef"
			:is-acknowledgement="true"
			confirm-name="Reload"
			@confirm="reload();"
		/>
</div>
  </template>