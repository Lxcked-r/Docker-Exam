<script setup>
import API from "@/utils/apiWrapper";
import { computed, onMounted, ref, provide } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
//import { useChannelStore } from "@/stores/channel";

import socket from "@/utils/socket";

import crypter from "@/utils/crypter";

import config from "@/../config";

import AvatarCircle from "@/components/AvatarCircle.vue";
import HomeSquare from "@/components/HomeSquare.vue";
import CustomDialog from "@/components/CustomDialog.vue";
import NotificationMenu from "@/components/NotificationMenu.vue";
const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();
//const channelStore = useChannelStore();

const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

const signOutFailDialog = ref(null);
const notifications = ref([]);

const isLoaded = ref(false);

const channels = ref([]);

const notifs = ref(0);

const lastNotif = ref(null);

const onDefaultRoute = computed(() => {
	return router.currentRoute.value.path === "/dashboard";
});



const headerText = computed(() => {
	switch (router.currentRoute.value.path) {
	case "/dashboard":
		return "Home";
	case "/dashboard/chats":
		return "Chats";
	case "/dashboard/templates":
		return "Templates";
	case "/dashboard/users":
		return "Users";
	case "/dashboard/settings":
		return "Settings";
	default:
		return "Home";
	}
});

const signOut = async () => {
	try {
		const res = await API.fireServer("/api/v1/session/end", {
			method: "POST",
			body: JSON.stringify({}),
		});

		if (res.status === 200) {
			clearLocalData();
			router.replace("/");
		} else {
			signOutFailDialog.value.show();
		}
	} catch (e) {
		console.error(e);
		signOutFailDialog.value.show();
	}
};



const clearLocalData = () => {
	sessionStateStore.setSignedInState(false);
	localStorage.clear();
};

const reloadPage = () => {
	window.location.reload();
};


const getChannels = async () => {
	const response = await API.fireServer("/api/v1/channelsrelations?userID="+localUserStore.user.id, {
		method: "GET",
	});

	if (response.status === 200) {
		channels.value = await response.json();
	}
};



const tryAvatar = async (id) => {
	let response;
	response = await fetch(`${baseUrl}/api/v1/avatars/${id}`);

	if(response) {
		if (response.status === 200) {
		return true;
		}
	}
	return false;
};

// ############################################################################################################
// sockets 
socket.on("notification", async (notif) => {
	if(notif.message.userID === localUserStore.user.id) {
		return;
	} else {
		addNotif(notif);
		if (notif.message.text == "UwU") {
			const uwuAudio = new Audio("/uwu.wav");
			setTimeout(() => {
			}, 1000);
		}
		if(lastNotif.value != notif)
		{
			let url;
			if(await tryAvatar(notif.message.userID)) {
				url = `${baseUrl}/api/v1/avatars/${notif.message.userID}`;
			} else {
				url = `${baseUrl}/api/v1/avatars/null`;
			}

			newNotif(await notif.user.username, url, notif.message.text);
			lastNotif.value = notif;
		}
	}
});



const emitJoinChannels = () => {
	for (const channel of channels.value) {
		let data = {
			channelID: channel.channelID,
			userID: localUserStore.user.id,
		};
		data = crypter.encrypt(data);
		socket.emit("channel", data);
	}
};


// ############################################################################################################
// NOTIFS 

const addNotif = (notif) => {
	notifications.value.push(notif);
	notifs.value ++;
};


const newNotif = async (title, img, value) => {

	if(!tryNotif()) {
		return;
	}


	new Notification(title, {
	body: value,
	icon: img,
	}); 

}

const tryNotif = () => {
	if (!("Notification" in window)) {
		return false;
  } else if (Notification.permission === "granted") {
	return true;
  } else if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    Notification.requestPermission()
	return false;

    };
  }

  const getNotifs = async () => {
	const res = await API.fireServer("/api/v1/notifications?userID="+ localUserStore.user.id, {
		method: "GET",
	});
	return res;
};

const clearNotifs = () => {
    notifs.value = 0;
	notifications.value = [];
};


// ############################################################################################################


const openChat = (channelID, notif, key) => {
	if(notif) {
		notifications.value.splice(key, 1);
		notifs.value --;
	}
	router.push('/dashboard/chat?channelID='+channelID);
};

onMounted(async () => {

	// Check if the user is logged in, and redirect them to the dashboard if they are.
	try {
		await localUserStore.init();
		if (localUserStore.kind !== "api") {
			router.push("/login");
			return;
		}
		sessionStateStore.setSignedInState(true);
	} catch (e) {
		console.error(e);
		router.push("/login");
	}

	try {
		await channelStore.init();
	} catch (e) {
		console.error(e);
	}

	await getNotifs().then(async (res) => {
		notifications.value = await res.json();
	});

	await getChannels();
	await emitJoinChannels();

	isLoaded.value = true;


});

</script>

<template>
	<CustomDialog
		ref="signOutFailDialog"
		confirm-name="Yes"
		cancel-name="No"
		@cancel="signOutFailDialog.hide()"
		@confirm="clearLocalData(); reloadPage();"
	>
		<template #title>
			Sign out failure
		</template>
		<template #content>
			<p>
				We couldn't sign you out because the server is not responding properly. <br>
				This usually means you've already been signed out while the app was offline, or the data in <br>
				your browser is corrupted or severely outdated.
				<br><br>
				Do you want to clear the local data and try signing in again? This will not affect the data on the server,<br>
				but you will lose any unsaved changes.
			</p>
		</template>
	</CustomDialog>
	<main class="flex align-center justify-center h-screen" v-if="!isLoaded">
		<span class="loading loading-spinner loading-lg"></span>
	</main>
	<div class="h-dvh w-dvh flex flex-col" id="dash" v-else>
		<!-- Controls bar -->
		<div
			class="flex items-center py-3 bg-gray-300 dark:bg-slate-950 sticky top-0 z-[9999] gap-4"
		>
			<div class="dropdown">
					<div tabindex="0" role="button">
						<h1 class="text-2xl font-bold px-4">
							{{ headerText }}
							<i class="bi bi-chevron-down"></i>
						</h1>
					</div>
					<ul tabindex="0" class="dropdown-content z-[1] menu p-2 mt-2 shadow bg-base-100 rounded-box w-52">
						<RouterLink
							to="/dashboard"
						>
							<li>
								<a>
									Home
								</a>
							</li>
						</RouterLink>
						<RouterLink
							to="/dashboard/chats"
						>
							<li>
								<a>
									Chats list
								</a>
							</li>
						</RouterLink>
						<RouterLink
							to="/dashboard/admin"
							v-if="localUserStore.user.operator"
						>
							<li>
								<a>
									Administration
								</a>
							</li>
						</RouterLink>
					</ul>
			</div>

			<div class="flex-1">
			</div>

			<div
				class="tooltip tooltip-left cursor-pointer"
				data-tip="You're offline. Click here to connect to live servers."
				v-if="sessionStateStore.isOffline"
				@click="reloadPage"

				>
				<div
					class="badge badge-warning flex gap-2 items-center transition-all py-2"
				>
					<i class="bi bi-wifi-off"></i>
				</div>
			</div>

			<div class="dropdown dropdown-end pr-2">
				<div tabindex="0" class="w-10 h-12 pt-3">
					<i class="bi bi-bell text-2xl"></i>
				</div><div v-if="notifs>0" class="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">{{notifs}}</div>
				<ul  v-if="notifications.length>0" tabindex="0" class="dropdown-content mt-2 z-[1] menu p-2 shadow bg-base-200 rounded-box w-max">
					<div class="p-2 flex items-center gap-2">
						<li v-for="notif, key in notifications">
							<NotificationMenu @click="openChat(notif.message.channelID, notif, key)" :message="notif.message.text" :user="notif.user.username" :channel="notif.channel" :userID="notif.message.userID"/>
						</li>
					</div>
				</ul>
			</div>

			<!-- autogenerated profile picture. a div and some letters inside -->
			<div class="dropdown dropdown-end pr-2">
				<div tabindex="0" class="bg-neutral text-neutral-content rounded-full w-12 h-12">
					<AvatarCircle :name="localUserStore.user.username" :id="localUserStore.user.id" :avatar="localUserStore.user.avatar"/>
				</div>
				<ul tabindex="0" class="dropdown-content mt-2 z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
					<div class="p-2 flex items-center gap-2">
						<AvatarCircle :name="localUserStore.user.username" :id="localUserStore.user.id" :avatar="localUserStore.user.avatar"/>
						<div class="flex flex-col">
							<span class="font-bold">
								{{ localUserStore.user.username }}
							</span>
							<span class="text-xs text-neutral-500">
								{{ localUserStore.user.username }}
							</span>
						</div>
					</div>
					<div class="divider m-0.5 px-2"></div>
					<li class="flex"
						@click="router.push('/dashboard/settings')"
					>
						<a>
							<i class="bi bi-gear"></i>
							Settings
						</a>
					</li>
					<li
						@click="signOut();"
					>
						<a>
							<i class="bi bi-box-arrow-right"></i>
							Sign out
						</a>
					</li>
				</ul>
			</div>
		</div>
		<div
			class="flex-1 flex items-center justify-center text-2xl flex-col gap-4"
			v-if="onDefaultRoute"
		>
		<button @click="newNotif('22', 'https://172.21.22.153:2025/api/v1/avatars/dc245c3d-e172-4a08-8664-0c70b4424ceb', 'vasdwqe')" class="btn btn-primary">t</button>
			Pick a section to begin.
				<div class="flex gap-4">
					<HomeSquare
						to="/dashboard/chats"
						icon="bi-list-task"
						text="Chats list"
					>
					</HomeSquare>
					<div class="flex flex-col gap-4">
						<HomeSquare
							to="/dashboard/admin"
							icon="bi-people"
							text="Administrate"
							styles="half-v"
							v-if="localUserStore.user.operator"
						/>
						<HomeSquare
							to="/dashboard/settings"
							icon="bi-gear"
							text="Settings"
							:styles="localUserStore.user.operator ? 'half-v' : ''"
						/>
					</div>
				</div>
			</div>
		<RouterView v-else />
	</div>
</template>

<style scoped>
</style>