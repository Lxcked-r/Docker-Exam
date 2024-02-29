<script setup>
//chat view component
import { ref, onMounted, inject, watch, onBeforeMount } from "vue";
import { useRouter } from "vue-router";

import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import { useLocalChannelStore } from "@/stores/channel";

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

const checkAvatars = ref([]);

const actualUser = ref(null);

const showUserProfileDialogRef = ref(null);

const tt = ref(false);

const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

const showDeleteMessageVar = ref(null);

const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();
const channelStore = useLocalChannelStore();

const socket = inject("socket");

const user = ref({});

const secret = "abcde";

const loading  = ref(true);

const lastMessage = ref({});

const messageInput = ref(null);

const message = ref({});

const messageHTML = ref(null);

const messagesRef = ref(null);

const actualTyper = ref(null);

const someoneIsTyping = ref(null);

const audioNotif = ref(null);

const notifs = ref(0);

const lastPage = ref(0);

const editChannelDialogRef = ref(null);

const showUser = ref(false);

const showUserProfile = (user) => {
    actualUser.value = user;

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
    isOP: Boolean,
    ownerID: String,
    isWatched: {
        type: Boolean,
        default: false,
    },
    
});

watch(() => props.channelAvatar, async (newVal, oldVal) => {
    channelAvatarRef.value.avatar = newVal;
    scrollToBottom();
});



user.value.id = props.userID;
user.value.name = "John Doe";

const isSameThanActualUser = (message) => {
    return message.userID === props.userID;
};

const isFirst = (message, key) => {
    if (message.userID !== props.channelMessages[key-1]?.userID) {
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

socket.on("message", (event) => {
    if(event.channelID !== props.channelID) {
        return;
    }
	const message = event;

	props.channelMessages.push(message);

    setTimeout(() => {
        scrollToBottom();
    }, 2);

    
    if (message.userID === props.userID) {
        return;
    } else {
       //audioNotif.value.play();
       notifs.value++;
    }
    
});

socket.on("notif", (event) => {
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
    await setTimeout(async () => {
        if (messagesRef.value.scrollTop === 0) {
            await getTwentyNewMessages(lastPage.value+1);
            lastPage.value++;
        }
    }, 1000);
};

const sendNewMessage = async () => {
    if(messageInput.value.value === "") {
        return;
    }
    setSocketMessage(props.userID, messageInput.value.value, props.channelID, props.userName, localUserStore.user.avatar);

    messageInput.value.value = ""; // clear the input
};

const updateLastMessage = (message) => {
    lastMessage.value = message;
};

const scrollToBottom = async () => {
    messagesRef.value.addEventListener("scroll", checkScroll);
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


const getTwentyNewMessages = async (page) => {
    const res = await API.fireServer("/api/v1/messages?channelID="+props.channelID+"&p="+page, {
        method: "GET",
    });

    console.log(await res.json());
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
    channelStore.init(localUserStore.user.userID);

    let data = {channelID: props.channelID, userID: localUserStore.user.id, userName: localUserStore.user.userName};
    data = await encryptData(data);
    socket.emit("channel", data);
    audioNotif.value = new Audio("/uwu.wav");

    setTimeout(() => {
        scrollToBottom();
    }, 2);
    await refreshAvatarImage();
};

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
    return "/avatar.png";
};

onBeforeMount(async () => {

    await reload();
    await getAvatar();
    await refreshAvatarImage();
    loading.value = false;
});

onMounted(async () => {
    reload();
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
        @confirm="editChannelDialogRef.hide()">

            <template #title>
                Edit channel
            </template>

            <template #content>
                <input type="text" placeholder="Channel Name" class="input input-bordered w-full max-w-xs" :value="channelName"/>
                <div class="flex flex-col">
                <button @click="showUsersList"><i class="bi bi-people-fill"></i></button></div>
                <div v-if="showUser" class="flex flex-col">
                    <div v-for="userchan in channelUsers" class="flex flex-row">
                        <AvatarCircle :name="userchan.User.username" :id="userchan.userID" :avatar="userchan.User.avatar"/>
                        <span>{{userchan.User.username}}<div v-if="userchan.userID!=ownerID&&userchan.id!=user.id">
                            <button @click="removeFromChannel(userchan.userID)">X</button>
                        </div></span>
                    </div>
                </div>
            </template>

        </CustomDialog>

        
        <CustomDialog 
        ref="showUserProfileDialogRef"
        :is-acknowledgement="true"
        confirm-name="Close"
        @confirm="showUserProfileDialogRef.hide()">
        <template #title>
        </template>
        <template #content>
            {{ actualUser?.User?.username }}
        </template>
        </CustomDialog>
    </Teleport>
  
    <div v-if="loading">
        <span class="loading loading-spinner"></span>
            <p>
                Getting the latest data...
            </p>
    </div>
    <!-- component -->
    <div v-else class="flex-1 justify-between flex flex-col">

        <div class="flex gap-2 sm:items-center justify-between py-3 border-b-2 border-gray-200 px-4">    
            <div class="relative flex flex-1 items-center space-x-4">
                <AvatarCircle 
                :name="channelName"
                :id="channelID"
                :avatar="channelAvatar" 
                :is-chan="true"
                ref="channelAvatarRef"/>
                
                <div class="flex flex-col leading-tight">
                    <div class="text-2xl mt-1 flex items-center">
                        <span class="text-gray-700 mr-3 dark:text-gray-300">{{ channelName }}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button v-if="getIsOp()" type="button" @click="openChannelEdit(channelID)">
                    <i class="bi bi-gear"></i>
                </button>
            </div>
            <div class="dropdown dropdown-end pr-2">
        <div tabindex="0" class="">
            <button @click="showUsersList"><i class="bi bi-people-fill"></i></button>
        </div>

        <ul tabindex="0" class="dropdown-content mt-2 z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
            <li v-for="userchan in channelUsers" >
                <div class="flex flex-row" @click="showUserProfile(userchan)">
                    <AvatarCircle :name="userchan.User.username" :id="userchan.userID" :avatar="userchan.User.avatar"/>
                    <span>{{userchan.User.username}}
                        <div v-if="userchan.userID!=ownerID&&userchan.id!=user.id">
                        </div>
                    </span> 
                </div>
            </li>

        </ul>
    </div>
        </div>

        <div ref="messagesRef" id="messages" class="inline-flex flex-1 flex-col space-y-4 p-3 max-h-[calc(100vh-195px)] overflow-y-auto">
            <div v-for="(message, index) in channelMessages" >
                <Message
                @showUser="showUserProfile(message)"
                @mouseover="showDeleteMessage(message)"
                :text=message.text
                :isOwnMessage=isSameThanActualUser(message)
                :isLast="!isSameThanNext(message, index)"
                :userName="message.User.username"
                :userID="message.userID"
                :isFirst="isFirst(message, index)"
                :createdAt="new Date(message.createdAt).toLocaleString()"
                :avatar="message.User.avatar? message.User.avatar : null"/>
            </div>
        </div>
        <div ref="someoneIsTyping" class="chat-header flex">
        </div>
        <div class="flex flex-col">          
            <div class="relative"> 
                <input @input="typing($event)" @keypress="typing($event)" ref="messageInput" type="text" placeholder="Write your message!" class="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-4 bg-gray-200 rounded-md py-3">
                <div class="absolute right-0 items-center inset-y-0 hidden sm:flex">
                    <button type="button" class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                        <i class="bi bi-emoji-smile-fill"></i>
                    </button>
                    <button @click="sendNewMessage" type="button" class="gap-2 inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none">
                        <span class="font-bold">Send</span>
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>    

</template>