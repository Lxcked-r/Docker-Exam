<script setup>
//chat view component
import { ref, onMounted, inject, watch, onBeforeMount, nextTick } from "vue";
import { useRouter } from "vue-router";

import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import { useFriendsStore } from "@/stores/friends";

import NotificationManager from "./NotificationManager.vue";

import CryptoJS from "crypto-js";

import CustomDialog from "@/components/CustomDialog.vue";
import Message from "@/components/Message.vue";
import AvatarCircle from "./AvatarCircle.vue";

import API from "@/utils/apiWrapper";

import config from "@/../config.json";

import router from "@/router";

import crypter from "@/utils/crypter";

const channelAvatarRef = ref(null);
const channelPrivateAvatarRef = ref(null);

const checkAvatars = ref([]);

const actualUser = ref(null);

const showUserProfileDialogRef = ref(null);

const tt = ref(false);

const friends = ref([]);

const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

const showDeleteMessageVar = ref(null);

const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();
const friendsStore = useFriendsStore();

const msg = ref({});

const socket = inject("socket")

const notify = inject("notify");

const user = ref({});

const secret = "abcde";

const loading  = ref(true);

const lastMessage = ref({});

const messageInput = ref(null);

const message = ref({});

const messages = ref([]);

const privateKey = ref(null);

const messageHTML = ref(null);

const messagesRef = ref(null);

const actualTyper = ref(null);

const someoneIsTyping = ref(null);

const audioNotif = ref(null);

const notifs = ref(0);

const lastPage = ref(0);

const editChannelDialogRef = ref(null);

const showAddPersonDialogRef = ref(null);

const addSomeoneInputRef = ref(null);

const showUser = ref(false);

const channelUsers = ref([]);

const notifRef = ref(null);

const isNewImageUserProfile = ref(null);

const page = ref(2);

const lastLoadedMessages = ref([]);

const showUserProfile = (user) => {
    actualUser.value = user;

    actualUser.value.isFriend = isFriend(user.userID);

    try {
    showUserProfileDialogRef.value.show();
    } catch (e) {
        console.log(e);
    }
};

const handleConnect = () => {
	if (userName.value.length > 0) {
		connect.value = true;
	}
}


const encryptData = (data) => {
    const encrypted = crypter.encrypt(data, secret);
    return encrypted;
};

const showDeleteMessage = (message) => {
    showDeleteMessageVar.value = message;
};


const props = defineProps({
    userID: String,
    userName: String,
    channelName: String,
    channelMessages: Array,
    channelUsers: Array,
    channelID: String,
    channelTypingUsers: Array,
    channelTypingTimeout: Number,
    channelTyping: Boolean,
    channelTypingUser: String,
    channelAvatar: String,
    isOwner: Boolean,
    key: {
        type: String,
        default: "0",
    },
    isOP: Boolean,
    ownerID: String,
    channelType: String,
    isWatched: {
        type: Boolean,
        default: false,
    },
});

watch(() => props.channelUsers, async (newVal, oldVal) => {
    loading.value = true;
    page.value = 2;
    lastLoadedMessages.value = [];
    //const newUsers = convertFriends(newVal);
    let newUsers = newVal;
    channelUsers.value = newUsers;
    loading.value = false;

    await nextTick(() => {
        scrollToBottom();
    });

});

watch(() => props.channelMessages, async (newVal, oldVal) => {
    loading.value = true;
    messages.value = newVal;
    let tmp;
    try {
        for (let message of messages.value) {
            tmp = await crypter.decrypt(message.text);
            if(tmp !== null) {
                message.text = tmp;
            }
        }
    } catch {

    }
    loading.value = false;
    await nextTick(() => {
        scrollToBottom();
    });
});

watch(() => props.type, async (newVal, oldVal) => {
    loading.value = true;
    channelType.value = newVal;
    loading.value = false;
});

const getAvatarFromUsers = (channel) => {
	if (channel.Channel.type === 'public') {
		return channel.Channel.avatar;
	} else{
		for (const friend of friends.value) {
			if (friend.id === channel.Channel.id) {
				if(friend.user.id === localUserStore.user.id) {
					return friend.otherUser.avatar;
				} else {
					return friend.user.avatar;
				}
			}
		}
}
};

socket.on("newUser", (event) => {
    channelUsers.value = event;
});

user.value.id = props.userID;
user.value.name = "John Doe";

const isSameThanActualUser = (message) => {
    return message.userID === props.userID;
};

const isFriend = (userID) => {
    if (friendsStore.friends.find((x) => x.user.id === userID) || friendsStore.friends.find((x) => x.otherUser.id === userID) || userID == localUserStore.user.id) {
        return true;
    }
    return false;
};

const isFirst = (message, key) => {
    if (message.userID !== props.channelMessages[key-1]?.userID || new Date(message.createdAt) > new Date(props.channelMessages[key-1].createdAt).getTime() + 600000){
        return true;
    } else {
        return false;
    }
}

const isSameThanNext = (message, key) => {
    if (message.userID === props.channelMessages[key+1]?.userID) {
        return true;
    }
};

const clearNotifs = () => {
    notifs.value = 0;
    socket.emit("clearNotifs", {userID: props.userID});
};

const setSocketMessage = (userID, text, channelID, userName, avatar) => {
    if (text === "") {
        return;
    }
    const messageData = {userID: userID, text: text, channelID: channelID, User: {username: userName, avatar: avatar}};

    const encrypted = encryptData(messageData);
    socket.emit("message", encrypted);
}

const internalNotif = (title, content) => {
    msg.value = {title: title, body: content};
    notify(msg.value);
};

socket.on("message", async (event) => {
    if(event.channelID !== props.channelID) {
        return;
    }
	const message = event;

    try {
        message.text = await crypter.decrypt(message.text);
    } catch {

    }

    if(message.User.username === "Server") {
        props.channelMessages.push(message);
        scrollToBottom();
        return;
    }

	props.channelMessages.push(message);

    setTimeout(() => {
        scrollToBottom();
    }, 2);

    
    if (message.userID === props.userID) {
        return;
    } else {
       //audioNotif.value.play();
        internalNotif("New message", "You have a new message from " + event.User.username);
       notifs.value++;
    }
    
});


socket.on("typing", async (event) => {
    if (event.userID === props.userID || event.channelID !== props.channelID) {
        return;
    }
    if(actualTyper.value === event.userName) {
        someoneIsTyping.value.innerText = event.userName + " is typing";
        return;
    }try {
    if (someoneIsTyping.value.innerText === "") {
        someoneIsTyping.value.innerText = event.userName + " is typing";
        actualTyper.value = event.userName;
        setTimeout(() => {
            someoneIsTyping.value.innerText = "";
            actualTyper.value = "";
        }, 3000);
    }
    else {
        someoneIsTyping.value.innerText = event.userName + " is typing";
        actualTyper.value = event.userName;
        setTimeout(() => {
            someoneIsTyping.value.innerText = "";
            actualTyper.value = "";
        }, 3000);
    }} catch (e) {
    }
}); 

const backToChatsList = () => {
    router.push("/dashboard/chats");
};

const checkScroll = async (event) => {
        if (messagesRef.value.scrollTop === 0) {
            await setTimeout(() => {
                messagesRef.value.scrollTop = 1;
            }, 1000);
            await getTwentyNewMessages(page.value);
            page.value++;
        }

};

const showError = (message) => {
    let newMSG = {title: "Error", body: message};
    notify(newMSG);
};

const sendFriendRequest = async (userID) => {
    const data = {userID: localUserStore.user.id, friendID: userID};
    const res = await API.fireServer("/api/v1/friends", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if(res.status === 200) {
        friendsStore.friends.push({user: {id: userID}});
        socket.emit("newFriend", await crypter.encrypt({userID: localUserStore.user.id, friendID: userID}));
        actualUser.value.isFriend = true;
    }
};

const sendNewMessage = async () => {
    if(messageInput.value.value === "") {
        return;
    }
    /*if(messageInput.value.value.length > 300 || messageInput.value.value.length < 1) {
        showError("The message must be between 1 and 300 characters long");
        return;
    }*/
    setSocketMessage(props.userID, messageInput.value.value, props.channelID, props.userName, localUserStore.user.avatar);

    messageInput.value.value = ""; // clear the input
};

const updateLastMessage = (message) => {
    lastMessage.value = message;
};

const scrollToBottom = async () => {
    if(!messagesRef.value) {
        return;
    }
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
};

const typing = async (event) => {
    const data = {channelID: props.channelID, userID: props.userID, userName: props.userName};
    const encrypted = encryptData(data);
    socket.emit("typing", encrypted);
    if (event.code === "Enter" || event.code === "NumpadEnter") {
        if(messageInput.value.value === "") {
            return;
        }
        if(messageInput.value.value.length > 300 || messageInput.value.value.length < 1) {
            showError("The message must be between 1 and 300 characters long");
            return;
        }
        setSocketMessage(props.userID, messageInput.value.value, props.channelID, props.userName, localUserStore.user.avatar);
        messageInput.value.value = ""; // clear the input
    }
};

const openChannelEdit = (channelID) => {
    editChannelDialogRef.value.show();
};

const showUsersList = () => {
    showUser.value = !showUser.value;
};

const tryAvatar = async (id) => {
	let response;

	if(checkAvatars.value.includes(id)) {
		return false;
	}

	response = await fetch(`${baseUrl}/api/v1/avatars/${id}`, {
		method: 'HEAD',
	});

	lastAvatar.value = id;
	checkAvatars.value.push(id);
	if(response) {
		if (response.status === 200) {
		return true;
		}
	}
	return false;
};


const getTwentyNewMessages = async () => {
	if(lastLoadedMessages.value.length<=0 && page.value!==2) {
		return false;
	}
    const res = await API.fireServer("/api/v1/messages?channelID="+props.channelID+"&page="+page.value, {
        method: "GET",
    });

    const encrypted = await res.json();

    const data = await crypter.decrypt(encrypted);

    for (let message of data) {
        try {
            let newText = await crypter.decrypt(message.text);
            if(newText !== null) {
                message.text = newText;
            }
        } catch {

        }
    }
    lastLoadedMessages.value = data;

    if(data.length === 0) {
        return;
    }
    
    const newMessages = data.reverse();
    //unshift adds the new messages to the beginning of the array without using a loop
    messages.value.unshift(...newMessages);



};


const getIsOp = () => {
    if(props.isOP || props.isOwner) {
        return true;
    }
};

const removeFromChannel = async (userID) => {
    const data = {userID: userID, channelID: props.channelID};
    await API.fireServer("/api/v1/channelsrelations", {
        method: "DELETE",
        body: JSON.stringify(data),
    });

};

const reload = async () => {

    let data = {channelID: props.channelID, userID: localUserStore.user.id, userName: localUserStore.user.userName};
    data = await encryptData(data);
    socket.emit("channel", data);
    audioNotif.value = new Audio("/uwu.wav");

    setTimeout(() => {
        scrollToBottom();
    }, 2);
    await refreshAvatarImage();
};

const showAddPerson = () => {
    showAddPersonDialogRef.value.show();
}

const refreshAvatarImage = async () => {
    const htmlImage = document.getElementById(props.channelID);
    if(!htmlImage) {
        return;
    }
    htmlImage.src = htmlImage.src + "?t=" + new Date().getTime();
}

const getAvatar = async () => {
    if (props.channelAvatar) {
        return props.channelAvatar;
    }
    return null;
};

const addSomeone = async () => {
    if(addSomeoneInputRef.value.value === "") {
        return;
    }
    if(addSomeoneInputRef.value.value === props.userName) {
        return;
    }
    if(channelUsers.value.find((user) => user.User?.username === addSomeoneInputRef.value.value)) {
        return;
    }
    const data = {username: addSomeoneInputRef.value.value, channelID: props.channelID};
    const res = await API.fireServer("/api/v1/channelsrelations", {
        method: "POST",
        body: JSON.stringify(data),
    });
    if(res.status === 200) {
        await reload();
        const temp = await res.json();
        const encryptedData = await crypter.encrypt({userID: temp.userID, channelID: props.channelID});
        socket.emit("newChan", encryptedData);
        showAddPersonDialogRef.value.hide();
    }

};
/**
 * Converts the friends data by replacing the current user with the other user.
 * @param {Object} data - The friends data to be converted.
 * @returns {Object} - The converted friends data.
 */
const convertFriends = (data) => {
    for (let key in data) {
        if (data[key].User.id === localUserStore.user.id) {
            data[key].User = data[key].otherUser;
        }
    }
    return data;
};

const closeFriendDialogRef = () => {
    editChannelDialogRef.value.hide();
    actualUser.value = null;
};

onBeforeMount(async () => {

    channelUsers.value = props.channelUsers;

    messages.value = props.channelMessages;


    await reload();
    await getAvatar();
    await refreshAvatarImage();
});

const showMessageOptions = (message, e) => {
};


onMounted(async () => {
    let tmp;
    for (let usr of props.channelUsers) {
    }
    messages.value = props.channelMessages;

    for (let message of messages.value) {
        try {
             tmp = await crypter.decrypt(message.text);
             if(tmp !== null) {
                 message.text = tmp;
             }
        } catch {

        }
    }
    
    loading.value = false;
    await nextTick(() => {
        scrollToBottom();
        messagesRef.value.addEventListener("scroll", checkScroll);
    });
});

defineExpose({
    reload,
    refreshAvatarImage,
    onMounted,
});

</script>

<template>
    <Teleport to="#dash">
        <CustomDialog
            ref="editChannelDialogRef"
            :is-acknowledgement="true"
            confirm-name="Save"
            @confirm="editChannelDialogRef.hide()"
        >
            <template #title>
                Edit channel
            </template>

            <template #content>
                <input
                    type="text"
                    placeholder="Channel Name"
                    class="input input-bordered w-full max-w-xs"
                    :value="channelName"
                />
                <div class="flex flex-col">
                    <button @click="showUsersList">
                        <i class="bi bi-people-fill"></i>
                    </button>
                </div>
                <div v-if="showUser" class="flex flex-col">
                    <div v-for="userchan in channelUsers" class="flex flex-row">
                        <div v-if="userchan.User">
                            <AvatarCircle
                                :name="userchan.User.username ? userchan.User.username : userchan.user.username"
                                :id="userchan.userID"
                                :avatar="userchan.User.avatar"
                            />
                            <span>
                                {{ userchan.User.username }}
                                <div v-if="userchan.userID != ownerID && userchan.id != user.id">
                                    <button @click="removeFromChannel(userchan.userID)">X</button>
                                </div>
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </CustomDialog>

        <CustomDialog
            ref="showUserProfileDialogRef"
            :is-acknowledgement="true"
            confirm-name="Close"
            @confirm="showUserProfileDialogRef.hide()"
        >
            <template #title>
                <AvatarCircle
                    v-if="actualUser"
                    :name="actualUser?.User.username"
                    :id="actualUser?.userID"
                    :avatar="isNewImageUserProfile ? isNewImageUserProfile : actualUser.User.avatar"
                    debug="showUser"
                /><br />

                {{ actualUser?.User.username }}
            </template>
            <template #content>
                <button
                    @click="sendFriendRequest(actualUser?.userID)"
                    v-if="!actualUser?.isFriend"
                    class="btn btn-outline"
                >
                    <i class="bi bi-person-plus-fill"></i>
                    Send friend request
                </button>
            </template>
        </CustomDialog>

        <CustomDialog
            ref="showAddPersonDialogRef"
            :is-acknowledgement="true"
            confirm-name="Close"
            @confirm="showAddPersonDialogRef.hide()"
        >
            <template #title>
                Add person
            </template>
            <template #content>
                <input
                    ref="addSomeoneInputRef"
                    type="text"
                    placeholder="Username"
                    class="input input-bordered w-full max-w-xs"
                />
                <button @click="addSomeone" class="btn btn-primary">Add</button>
            </template>
        </CustomDialog>
    </Teleport>

    <div v-if="loading">
        <span class="loading loading-spinner"></span>
        <p>
            Getting the latest data...
        </p>
    </div>

    <div v-else class="flex-1 flex justify-between flex flex-col w-[32px]">
        <div class="flex gap-2 sm:items-center justify-between py-3 border-b-2 border-gray-200 px-4">
            <div class="relative flex flex-1">
                <AvatarCircle
                    v-if="channelType === 'public'"
                    :name="channelName"
                    :id="channelID"
                    :avatar="channelAvatar"
                    :is-chan="true"
                    ref="channelAvatarRef"
                />
                <AvatarCircle
                    v-if="channelType === 'private' && channelUsers.length > 0"
                    :name="channelName"
                    :id="channelUsers.find((x) => x.userID !== user.id).userID"
                    :avatar="channelUsers.find((x) => x.userID !== user.id).User.avatar"
                    :is-chan="true"
                    ref="channelPrivateAvatarRef"
                />

                <div class="flex flex-col leading-tight">
                    <div class="text-2xl mt-1 flex items-center">
                        <span v-if="channelType === 'public'" class="text-gray-700 mr-3 dark:text-gray-300">
                            {{ channelName }}
                        </span>
                        <span v-if="channelType === 'private' && channelUsers.length > 0" class="text-gray-700 mr-3 dark:text-gray-300">
                            {{ channelUsers.find((x) => x.userID !== user.id).User.username }}
                        </span>
                    </div>
                </div>
            </div>
            <div v-if="channelType === 'public'" class="flex items-center space-x-2">
                <button v-if="getIsOp()" type="button" @click="openChannelEdit(channelID)">
                    <i class="bi bi-gear"></i>
                </button>
            </div>
            <div class="dropdown dropdown-end pr-2">
                <div v-if="channelType === 'public'" tabindex="0" class="">
                    <button @click="showUsersList">
                        <i class="bi bi-people-fill"></i>
                    </button>
                </div>

                <ul tabindex="0" class="dropdown-content mt-2 z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
                    <li v-if="channelType === 'public'">
                        <div class="flex flex-row btn" @click="showAddPerson">
                            <i class="bi bi-person-fill-add"></i>
                            Add user
                        </div>
                    </li>
                    <li v-for="userchan in channelUsers">
                        <div class="flex flex-row" @click="showUserProfile(userchan)">
                            <div v-if="userchan.User">
                                <AvatarCircle :id="userchan.userID" :avatar="userchan.User.avatar" />
                                <span>{{ userchan.User.username }}
                                    <div v-if="userchan.userID != ownerID && userchan.id != user.id">
                                    </div>
                                </span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <ul role="list" ref="messagesRef" id="messages" class="inline-flex flex-1 flex-col space-y-4 p-3 max-h-[calc(100vh-195px)] overflow-y-auto overflow-x-hidden">
            <div v-for="(message, index) in messages">
                <Message
                    @showUser="showUserProfile(message)"
                    @showMessageOptions="showMessageOptions(message)"
                    @mouseover="showDeleteMessage(message)"
                    :text="message.text"
                    :isOwnMessage="isSameThanActualUser(message)"
                    :isLast="!isSameThanNext(message, index)"
                    :userName="message.User.username"
                    :userID="message.userID"
                    :isFirst="isFirst(message, index)"
                    :createdAt="new Date(message.createdAt).toLocaleString()"
                    :id="message.id"
                    :avatar="message.User.avatar ? message.User.avatar : message.userID"
                />
            </div>
        </ul>

        <div ref="someoneIsTyping" class="chat-header flex"></div>

        <div class="flex flex-col">
            <div class="relative">
                <input
                    @input="typing($event)"
                    @keypress="typing($event)"
                    ref="messageInput"
                    type="text"
                    placeholder="Write your message!"
                    class="input input-bordered w-full"
                />
                <div class="absolute right-0 items-center inset-y-0 hidden sm:flex">
                    <button type="button" class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500">
                        <i class="bi bi-emoji-smile-fill"></i>
                    </button>
                    <button @click="sendNewMessage" type="button" class="btn btn-outline">
                        <span class="font-bold">Send</span>
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>