<script setup>
//chat view component
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";

import CryptoJS from "crypto-js";

import CustomDialog from "@/components/CustomDialog.vue";
import Message from "@/components/Message.vue";
import AvatarCircle from "./AvatarCircle.vue";

import { io } from "socket.io-client";
import API from "@/utils/apiWrapper";

import config from "@/../config.json";

const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;


const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();
const socket = io(baseUrl);

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

const handleConnect = () => {
	if (userName.value.length > 0) {
		connect.value = true;
	}
}

const encryptData = (data) => {
    const x = CryptoJS.AES.encrypt(JSON.stringify(data), secret,
 {
    keySize: 128 / 8,
    iv: secret,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
    return x;
}

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
});

user.value.id = props.userID;
user.value.name = "John Doe";
    
const reload = () => {
    window.location.reload();
};

const isSameThanActualUser = (message) => {
    return message.userID === props.userID;
};

const isSameThanNext = (message) => {
    if (lastMessage.value.id === message.id) {
        return true;
    }
    else {
        return false;
    
    }
};

const setSocketMessage = (userID, text, channelID, userName) => {
    const messageData = {userID: userID, text: text, channelID: channelID, User: {username: userName}};

    const encrypted = encryptData(messageData);
    socket.emit("message", encrypted);

}

socket.on("message", (event) => {
	const message = event;
	props.channelMessages.push(message);
    console.log(test.value.scrollTop);
});

socket.on("notif", (event) => {
    console.log(event);
});

socket.on("typing", async (event) => {
    if (event.userID === props.userID) {
        return;
    }
    if(actualTyper.value === event.userName) {
        someoneIsTyping.value.innerText = event.userName + " is typing";
        return;
    }
    if (someoneIsTyping.value.innerText === "") {
        someoneIsTyping.value.innerText = event.userName + " is typing";
        actualTyper.value = event.userName;
        setTimeout(() => {
            someoneIsTyping.value.innerText = "";
            actualTyper.value = "";
        }, 3000);
    }
    else {
        console.log("Someone is typing");
        someoneIsTyping.value.innerText = event.userName + " is typing";
        actualTyper.value = event.userName;
        setTimeout(() => {
            someoneIsTyping.value.innerText = "";
            actualTyper.value = "";
        }, 3000);
    }
}); 

const sendNewMessage = async () => {
    console.log("Sending message");
    const res = await API.fireServer("/api/v1/messages",
    {
        method: "POST",
        body: JSON.stringify({
            text: messageInput.value.value,
            userID: props.userID,
            channelID: props.channelID,
        }),
    });

    setSocketMessage(props.userID, messageInput.value.value, props.channelID, props.userName);

    messageInput.value.value = ""; // clear the input
};


const updateLastMessage = (message) => {
    lastMessage.value = message;
};


const typing = async () => {
    const data = {channelID: props.channelID, userID: props.userID, userName: props.userName};
    const encrypted = encryptData(data);
    socket.emit("typing", encrypted);
};

onMounted( async() => {
    let data = {channelID: props.channelID, userID: localUserStore.user.id, userName: localUserStore.user.userName}
    data = await encryptData(data);
    socket.emit("channel", data);
    loading.value = false;
});

</script>

<template>
    
    <div v-if="loading">
        <span class="loading loading-spinner"></span>
            <p>
                Getting the latest data...
            </p>
    </div>

    <!-- component -->
    <div v-else class="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen h-full">

    <div class="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div class="relative flex items-center space-x-4">
            <AvatarCircle 
            name="ee" />
            <div class="flex flex-col leading-tight">
                <div class="text-2xl mt-1 flex items-center">
                <span class="text-gray-700 mr-3">{{ channelName }}</span>
                </div>
                <span class="text-lg text-gray-600"></span>
            </div>
        </div>
        <div class="flex items-center space-x-2">
            <button type="button" class="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </button>
            <button type="button" class="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
            </button>
            <button type="button" class="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
            </button>
        </div>
    </div>
    <div ref="test" id="messages" class="flex flex-col space-y-4 p-3 overflow-y-auto h-full scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        <div v-for="message in channelMessages" v-scroll-to >
            <Message
            :text=message.text
            :isOwnMessage=isSameThanActualUser(message)
            :isLast=!isSameThanNext(message)
            :userName="message.User.username"
            created-at="ee" />
        </div>
    </div>
    <div ref="someoneIsTyping" class="chat-header">
    </div>
    <div class="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
        <div class="relative flex">                        

            <span class="absolute inset-y-0 flex items-center">
                <button type="button" class="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6 text-gray-600">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    </svg>
                </button>
            </span>
            <input @input="typing" ref="messageInput" type="text" placeholder="Write your message!" class="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3">
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-6 w-6 ml-2 transform rotate-90">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>