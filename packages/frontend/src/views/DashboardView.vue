<script setup>
import API from "@/utils/apiWrapper";
import { computed, onMounted, ref, provide } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import { useFriendsStore } from "@/stores/friends";

import socket from "@/utils/socket";

import crypter from "@/utils/crypter";

import config from "@/../config";

import AvatarCircle from "@/components/AvatarCircle.vue";
import HomeSquare from "@/components/HomeSquare.vue";
import CustomDialog from "@/components/CustomDialog.vue";
import NotificationMenu from "@/components/NotificationMenu.vue";
import FriendNotif from "@/components/FriendNotif.vue";
const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();

const friendsStore = useFriendsStore();

const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;
const app_name = config.app_name;

const signOutFailDialog = ref(null);
const notifications = ref([]);

const createNewDialog = ref(null);

const newInput = ref({
	title: "",
	body: "",
});

const isLoaded = ref(false);

const channels = ref([]);

const notifs = ref(0);

const lastNotif = ref(null);

const news = ref({});

const friends = ref([]);


const onDefaultRoute = computed(() => {
	if(router.currentRoute.value.path === "/dashboard") {
		changeTitle(onTitleRoute.value);
	}
	return router.currentRoute.value.path === "/dashboard";
});

const onTitleRoute = computed(() => {
	if(router.currentRoute.value.path === "/dashboard") {
		return `Home - ${app_name}`;
	} else {
		return;
	}
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

/**
 * Delete New (admin only)
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteNew = async (id) => {
	const res = await API.fireServer("/api/v1/news", {
		method: "DELETE",
		body: JSON.stringify({id: id}),
	});
	if(res.status === 200) {
		news.value = await getNews();
	}
	const data = await res.json();
	return data;
};

/**
 * Open New Dialog (admin only)
 */
const openNewDialog = () => {
	createNewDialog.value.show();
};

/**
 * Create New from New Input (admin only)
 * @returns {Promise<void>}
 */
const createNew = async () => {
	const res = await API.fireServer("/api/v1/news", {
		method: "POST",
		body: JSON.stringify(newInput.value),
	});
	if(res.status === 200) {
		createNewDialog.value.hide();
		newInput.value = {
			title: "",
			body: "",
		};
		news.value = await res.json();
	}
	const data = await res.json();

	return data;
};

/**
 * Get News and put it in the news.value
 * @returns {Promise<void>}
 */
const getNews = async () => {
	const res = await API.fireServer("/api/v1/news", {
		method: "GET",
	});
	if(res.status === 200) {
		const data = await res.json();
		return data;
	}
	return null;
};

/**
 * Get Friends and put it in the friends.value
 * @returns {Promise<void>}
 */
const getFriends = async () => {
    const res = await API.fireServer("/api/v1/friends/" + localUserStore.user.id, {
        method: "GET",
    });
    const data = await res.json();
    friends.value = data;
};

/**
 * Sign Out
 * @returns {Promise<void>}
 */
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

/**
 * Clear Local Data
 */
const clearLocalData = () => {
	sessionStateStore.setSignedInState(false);
	localStorage.clear();
};

/**
 * Reload Page
 */
const reloadPage = () => {
	window.location.reload();
};

/**
 * Get Channels and put it in the channels.value
 * @returns {Promise<void>}
 */
const getChannels = async () => {
	const response = await API.fireServer("/api/v1/channelsrelations?userID="+localUserStore.user.id, {
		method: "GET",
	});

	if (response.status === 200) {
		channels.value = await response.json();
	}
};

/**
 * Try Avatar
 * @param {number} id
 * @returns {Promise<boolean>}
 */
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

// on offline, set the friend with the id of friendID to offline
socket.on("offline", async (friendID) => {
	// in friends.value put the friend with the id of friendID and set the online to false
	if(friends.value.length > 0) {
		//find the friend in the friends.value array by the friendID
		const friend = friends.value.find(friend => friend.id === friendID.id);
		if(friend) {
			friend.online = false;
		}
	}
});

// on online, set the friend with the id of friendID to online
socket.on("online", async (friendID) => {
	// in friends.value put the friend with the id of friendID and set the online to true
	if(friends.value.length > 0) {
		//find the friend in the friends.value array by the friendID
		const friend = friends.value.find(friend => friend.id === friendID.id);
		if(friend) {
			friend.online = true;
		}
	}
});

// on notification, add the notification to the notifications array
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

			let tempText;
			try {
				tempText = crypter.decrypt(notif.message.text);
				if(tempText) {
					notif.message.text = tempText;
				}
			} catch (e) {
				console.error(e);
			}

			if(notif.type !== "text" && notif.type !== "friend" ) {
				notif.message.text = "new Message";
			}

			newNotif(await notif.user.username, url, notif.message.text);
			lastNotif.value = notif;
		}
	}
});

// on newFriend, add the notification to the notifications array
socket.on("newFriend", async (friend) => {
	await getFriends();
	if(friend.id === localUserStore.user.id || friend === "New friend request") {
		return;
	} else {
		console.log("//////////////////////////");
		console.log(friend);
		getPendingFriendsRequestsFromSpecificFriendID(friend.id);
	}
});


// ############################################################################################################
// NOTIFS 

/**
 * Add Notification to the notifications array and increment the notifs value
 * @param {object} notif
 */
const addNotif = (notif) => {
	notifications.value.push(notif);
	notifs.value ++;
};

/**
 * New Notification to os notification from the browser
 * @param {string} title
 * @param {string} img
 * @param {string} value
 */
const newNotif = async (title, img, value) => {

	if(!tryNotif()) {
		return;
	}


	new Notification(title, {
	body: value,
	icon: img,
	}); 

}

/**
 * Try Notification to check if the browser supports notifications and if the user has given permission
 * @returns {boolean}
 */
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
};

/**
 * Get Notifications and put it in the notifications.value
 * @returns {Promise<void>}
 */
const getNotifs = async () => {
	const res = await API.fireServer("/api/v1/notifications?userID="+ localUserStore.user.id, {
		method: "GET",
	});
	return res;
};

/**
 * Clear Notifications and set the notifs value to 0
 */
const clearNotifs = () => {
    notifs.value = 0;
	notifications.value = [];
};


// ############################################################################################################

/**
 * for each channel in the channels array, emit a channel event to the socket
 */
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

/**
 * Open Chat and remove the notification from the notifications array
 * @param {number} channelID
 * @param {object} notif notification to remove from the notifications array - (not required)
 * @param {number} key
 */
const openChat = (channelID, notif, key) => {
	if(notif) {
		notifications.value.splice(key, 1);
		notifs.value --;
	}
	router.push('/dashboard/chats/'+channelID);
};

/**
 * Open Friends List
 * @param {object} notif
 */
const openFriendsList = (notif) => {
	router.push('/dashboard/friends');
};

const refreshFriendsList = async () => {
	await getFriends();
};

/**
 * Get Pending Friends Requests From Specific Friend ID
 * @param {number} id
 */
const getPendingFriendsRequestsFromSpecificFriendID = async (id) => {
	await refreshFriendsList();
	if(friends.value.length > 0) {
		if(friends.value.find(friend => friend.id === id).pending && await friends.value.find(friend => friend.user.id !== localUserStore.user.id) !== undefined) {
			if(friends.value.find(friend => friend.id === id).userID !== localUserStore.user.id) {
			addNotif({message: {text: "new friend request", userID: id}, user: {username: "..."}, type: "friend"});
			}
		
			//notifications.value.push({message: {text: "UwU", userID: id}, user: {username: "UwU"}});
			
		}
	}
}

/**
 * Change Title
 * @param {string} title
 */
const changeTitle = (title) => {
	document.title = title;
};

/**
 * Check Online Friends
 */
const checkOnlineFriends = async () => {
	const data = {friends: friends.value, userID: localUserStore.user.id};
	socket.emit("checkOnline", data);
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
		await friendsStore.init(localUserStore.user.id);
	} catch (e) {
		console.error(e);
	}

	friends.value = friendsStore.friends;
	await checkOnlineFriends();

	news.value = await getNews();

	await getNotifs().then(async (res) => {
		notifications.value = await res.json();
	});

	await getChannels();
	await emitJoinChannels();
	await getFriends();

	for ( const friend of friends.value) {
		getPendingFriendsRequestsFromSpecificFriendID(friend.id);
	}
	changeTitle(`Home - ${app_name}`);


	isLoaded.value = true;


});

</script>

<template>
	<div id="dash">
		<!-- helper element for teleporting -->
	</div>
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

	<CustomDialog
		ref="createNewDialog"
		confirm-name="Save"
		cancel-name="Cancel"
		@cancel="createNewDialog.hide()"
		@confirm="createNew();"
	>
		<template #title>
			Create News
		</template>
		<template #content>
			<div class="flex flex-col">
				<input type="text" placeholder="Title" v-model="newInput.title" class="input input-bordered mb-2">
				<textarea placeholder="Body" v-model="newInput.body" class="textarea textarea-bordered"></textarea>
			</div>
		</template>
	</CustomDialog>
	<main class="flex align-center justify-center h-screen" v-if="!isLoaded">
		<span class="loading loading-spinner loading-lg"></span>
	</main>
	<div class="h-dvh w-dvh flex flex-col" v-else>
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
							to="/dashboard/friends"
						>
							<li>
								<a>
									Friends list
								</a>
							</li>
						</RouterLink>
						<RouterLink
							to="/dashboard/pong"
							>
							<li>
								<a>
									Pong
								</a>
							</li>
						</RouterLink>
						<RouterLink
							to="/dashboard/memory"
							>
							<li>
								<a>
									Memory
								</a>
							</li>
						</RouterLink>
						<RouterLink
							to="/dashboard/meteo"
							>
							<li>
								<a>
									Meteo
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
							<NotificationMenu v-if="notif.type!=='friend'" @click="openChat(notif.message.channelID, notif, key)" :message="notif.message.text" :user="notif.user.username" :channel="notif.channel" :userID="notif.message.userID"/>
							<FriendNotif @click="openFriendsList(notif)" v-else :user="notif.user"/> 
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
			v-show="onDefaultRoute"
		>
		
		<div v-if="news" class="flex-1 flex justify-center max-h-32 flex-col flex-center items-center">
			<h1>NEWS : </h1>
			<div> {{ news.title }}</div>
			<div> {{ news.body }}</div>
			<button v-if="localUserStore.user.operator" @click="deleteNew(news.id)" class="btn btn-error">
				Delete This News
			</button>
		</div>
		<button v-if="localUserStore.user.operator" @click="openNewDialog()" class="btn btn-success">
			Create News
		</button>
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
							to="/dashboard/friends"
							icon="bi-people"
							text="Friends List"
							styles="half-v"
						/>
						<HomeSquare
							to="/dashboard/settings"
							icon="bi-gear"
							text="Settings"
							:styles="localUserStore.user.operator ? 'half-v' : ''"
						/>
					</div>
				</div>
				
				<div class="flex gap-4">
					<HomeSquare class=""
						to="/dashboard/memory"
						icon="bi-joystick"
						text="Memory"
						styles="half-v">
					</HomeSquare>
					<HomeSquare
						to="/dashboard/meteo"
						icon="bi-cloud-sun"
						text="Meteo"
					>
					</HomeSquare>
				</div>
			</div>
		<RouterView v-show="!onDefaultRoute && isLoaded" />
	</div>
</template>

<style scoped>
</style>