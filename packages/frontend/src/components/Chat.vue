<script setup>
//chat view component
import { ref, onMounted, inject } from "vue";
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

const test = ref(null);

const actualTyper = ref(null);

const someoneIsTyping = ref(null);

const audioNotif = ref(null);

const notifs = ref(0);

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
});

user.value.id = props.userID;
user.value.name = "John Doe";
    
const reload = () => {
    window.location.reload();
};

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

const setSocketMessage = (userID, text, channelID, userName) => {
    if (text === "") {
        return;
    }
    const messageData = {userID: userID, text: text, channelID: channelID, User: {username: userName}};

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

const sendNewMessage = async () => {
    if(messageInput.value.value === "" || messageInput.value.value.length<3) {
        return;
    }
    setSocketMessage(props.userID, messageInput.value.value, props.channelID, props.userName);

    messageInput.value.value = ""; // clear the input
};

const updateLastMessage = (message) => {
    lastMessage.value = message;
};

const scrollToBottom = async () => {
    if(!test.value) {
        return;
    }
    test.value.scrollTop = test.value.scrollHeight;
};

const typing = async (event) => {
    const data = {channelID: props.channelID, userID: props.userID, userName: props.userName};
    const encrypted = encryptData(data);
    socket.emit("typing", encrypted);
    if (event.code === "Enter" || event.code === "NumpadEnter") {
        setSocketMessage(props.userID, messageInput.value.value, props.channelID, props.userName);
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

onMounted( async() => {

    channelStore.init(localUserStore.user.userID);
    
    let data = {channelID: props.channelID, userID: localUserStore.user.id, userName: localUserStore.user.userName};
    data = await encryptData(data);
    socket.emit("channel", data);
    audioNotif.value = new Audio("/uwu.wav");

    setTimeout(() => {
        scrollToBottom();
    }, 2);
    loading.value = false;
});
</script>

<template>
    
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
  
    <div v-if="loading">
        <span class="loading loading-spinner"></span>
            <p>
                Getting the latest data...
            </p>
    </div>
    <!-- component -->
    <div v-else class="flex-1 p:2 sm:p-6 justify-between flex flex-col h-[56rem] overflow-x-scroll no-scrollbar">

        <div class="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">        
            <button @click="backToChatsList" class="btn btn-outline">
                Back to Chats list
            </button>  
            <div class="relative flex items-center space-x-4">
                <AvatarCircle 
                :name="channelName"
                :id="channelID"
                :avatar="channelAvatar" />
                <div class="flex flex-col leading-tight">
                    <div class="text-2xl mt-1 flex items-center">
                        <span class="text-gray-700 mr-3">{{ channelName }}</span>
                    </div>
                    <span class="text-lg text-gray-600"></span>
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
        <div ref="test" id="messages" class="flex flex-col space-y-4 p-3 overflow-y-auto h-full scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            <div v-for="(message, index) in channelMessages" >
                <Message
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
        <div ref="someoneIsTyping" class="chat-header">
        </div>
        <div class="relative flex-col">          
            <div class="relative"> 
                <span class="absolute inset-y-0 flex items-center">
                    <button type="button" class="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6 text-gray-600">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                        </svg>
                    </button>
                </span>
                <input @input="typing($event)" @keypress="typing($event)" ref="messageInput" type="text" placeholder="Write your message!" class="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3">
                <div class="absolute right-0 items-center inset-y-0 hidden sm:flex">
                    <button type="button" class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6 text-gray-600">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                        </svg>
                    </button>
                    <button type="button" class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6 text-gray-600">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    <button type="button" class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6 text-gray-600">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                    <button @click="sendNewMessage" type="button" class="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none">
                        <span class="font-bold">Send</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="currentColor" class="bi bi-send pl-2" viewBox="0 0 16 16">
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>    

</template>