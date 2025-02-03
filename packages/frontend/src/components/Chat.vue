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

import DragNDropUI from "./DragNDropUI.vue";

import API from "@/utils/apiWrapper";


import router from "@/router";

import crypter from "@/utils/crypter";

import config from "@/../config";

const appName = config.app_name;

const fileFromClipboard = ref(null);

const channelAvatarRef = ref(null);
const channelPrivateAvatarRef = ref(null);

const changeChannelImageDialogRef = ref(null);
const changeChannelImageInputRef = ref(null);

const checkAvatars = ref([]);

const actualUser = ref(null);

const showUserProfileDialogRef = ref(null);
const showImageDialogRef = ref(null);

const showImageRef = ref(null);

const tt = ref(false);

const friends = ref([]);

const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

const showDeleteMessageVar = ref(null);

const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();
const friendsStore = useFriendsStore();

const actualIMG = ref(null);

const actualChars = ref(0);
const maxChars = 300;

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

const newNameInputRef = ref(null);

const showAddPersonDialogRef = ref(null);

const addSomeoneInputRef = ref(null);

const uploadFileDialogRef = ref(null);

const uploadFileInputRef = ref(null);

const dragNDropUI = ref(null);

const showUser = ref(false);

const channelUsers = ref([]);

const notifRef = ref(null);

const isNewImageUserProfile = ref(null);

const page = ref(2);

const lastLoadedMessages = ref([]);

const enterKeyDialogRef = ref(null);

const key = ref(null);

const isMessagesDecrypted = ref(false);

const channelNameWithoutProps = ref(null);

/**
 * Show the user profile dialog
 * @param {Object} user - The user object to show the profile of.
 */
const showUserProfile = (user) => {
    actualUser.value = user;

    actualUser.value.isFriend = isFriend(user.userID);

    try {
    showUserProfileDialogRef.value.show();
    } catch (e) {
        console.log(e);
    }
};

/**
 * Connect to the chat
 */
const handleConnect = () => {
	if (userName.value.length > 0) {
		connect.value = true;
	}
}

/**
 * Encrypt the data
 * @param {Object} data - The data to encrypt.
 * @returns {String} - The encrypted data.
 */
const encryptData = (data) => {
    const encrypted = crypter.encrypt(data, secret);
    return encrypted;
};

/**
 * Show the delete message dialog
 * @param {String} message - The message to show.
 */
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
    
    if(props.channelType === "public") {
        document.title = props.channelName + " - " + appName;
    } else {
        for (const friend of friends.value) {
            if (friend.id === props.channelID) {
                if(friend.user.id === localUserStore.user.id) {
                    document.title = friend.otherUser.username + " - " + appName;
                } else {
                    document.title = friend.user.username + " - " + appName;
                }
            }
        }
    }

    await nextTick(() => {
        scrollToBottom();
        
        messagesRef.value.addEventListener("scroll", checkScroll);
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
                let text = convertLinks(tmp);
                message.text = text;
            }
        }
    } catch {

    }
    
    loading.value = false;
    await nextTick(() => {
        scrollToBottom();
        
        messagesRef.value.addEventListener("scroll", checkScroll);
    });
});

watch(() => props.channelAvatar, async (newVal, oldVal) => {
    channelAvatarRef.value = newVal;
});

watch(() => props.channelName, async (newVal, oldVal) => {
    channelNameWithoutProps.value = newVal;
});


/**
 * Check if the user is dragging a file
 * @param {Event} e - The event to check.
 */
const checkDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if(e.dataTransfer.types.includes("Files")) {
        dragNDropUI.value.show();
    }
};

/**
 * Open the file from the drag and drop
 * @param {Event} e - The event to open the file from.
 */
const openDragFile = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        uploadFileInputRef.value.files = files;
        uploadFileDialogRef.value.show();
    }
    dragNDropUI.value.hide();
};

/**
 * Get the avatar from the users
 * @param {Object} channel - The channel to get the avatar from.
 * @returns {String} - The avatar of the user.
 */
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

socket.on("editMessage", async (event) => {
    const message = event;
    const index = messages.value.findIndex((x) => x.id === message.id);
    if (index !== -1) {
        messages.value[index].text = message.text;
        messages.value[index].updatedAt = message.updatedAt;
    }
});

socket.on("deleteMessage", async (event) => {
    const message = event;
    const index = messages.value.findIndex((x) => x.id === message.id);
    if (index !== -1) {
        messages.value.splice(index, 1);
    }
    if(messages.value.length < 25) {
        await getTwentyNewMessages(page.value);
        page.value++;
    }
});

// add the user to the channel
socket.on("newUser", (event) => {
    channelUsers.value = event;
});

// on offline set the user offline
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

// on online set the user online
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

const editChannel = async () => {
    const data = {channelID: props.channelID, newName: newNameInputRef.value.value, userID: localUserStore.user.id};

    socket.emit("editChannel", data);
    editChannelDialogRef.value.hide();
};

const changeChannelImage = async () => {
    const file = changeChannelImageInputRef.value.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.name.substring(file.name.lastIndexOf('.')+1, file.name.length) || file.name);
    formData.append("channelID", props.channelID);
    formData.append("userID", localUserStore.user.id);
    const res = await API.fireServer("/api/v1/channels/avatar", {
        method: "POST",
        headers: {
            "Content-Type": false,
        },
        body: formData,
    });
    if (res.status === 200) {
        const data = await res.json();
        socket.emit("channelImage", data);
        changeChannelImageDialogRef.value.hide();
    }
}

// to avoid before load problems set user to smth.
user.value.id = props.userID;
user.value.name = "John Doe";

/**
 * Check if the user is the same as the actual user
 * @param {Object} message - The message to check.
 * @returns {Boolean} - If the user is the same as the actual user.
 */
const isSameThanActualUser = (message) => {
    return message.userID === props.userID;
};

/**
 * Check if the user is a friend
 * @param {String} userID - The user ID to check.
 * @returns {Boolean} - If the user is a friend.
 */
const isFriend = (userID) => {
    if (friendsStore.friends.find((x) => x.user.id === userID) || friendsStore.friends.find((x) => x.otherUser.id === userID) || userID == localUserStore.user.id) {
        return true;
    }
    return false;
};

/**
 * Get the friendship ID
 * @param {String} userID - The user ID to get the friendship ID from.
 * @returns {String} - The friendship ID.
 */
const getFriendShipID = (userID) => {
    if (friendsStore.friends.find((x) => x.user.id === userID)) {
        return friendsStore.friends.find((x) => x.user.id === userID).id;
    } else if (friendsStore.friends.find((x) => x.otherUser.id === userID)) {
        return friendsStore.friends.find((x) => x.otherUser.id === userID).id;
    }
};

/**
 * Check if the message is the first 
 * @param {Object} message - The message to check.
 * @param {Number} key - The key to check.
 * @returns {Boolean} - If the message is the first.
 */
const isFirst = (message, key) => {
    if (message.userID !== props.channelMessages[key-1]?.userID || new Date(message.createdAt) > new Date(props.channelMessages[key-1].createdAt).getTime() + 600000){
        return true;
    } else {
        return false;
    }
}

/**
 * Calculate the max
 * @param {Number} max - The max to calculate.
 * @param {Number} actual - The actual to calculate.
 * @returns {Number} - The calculated value.
 */
const calc = (max, actual) => {
    return max / actual;
};

/**
 * Check if the message user is the same as the next
 * @param {Object} message - The message to check.
 * @param {Number} key - The key to check.
 * @returns {Boolean} - If the message is the same as the next.
 */
const isSameThanNext = (message, key) => {
    if (message.userID === props.channelMessages[key+1]?.userID) {
        return true;
    }
};

/**
 * Clear the notifications
 */
const clearNotifs = () => {
    notifs.value = 0;
    socket.emit("clearNotifs", {userID: props.userID});
};

/**
 * Set the socket message
 * @param {String} userID - The user ID to set the message from.
 * @param {String} text - The text to set the message from.
 * @param {String} channelID - The channel ID to set the message from.
 * @param {String} userName - The user name to set the message from.
 * @param {String} avatar - The avatar to set the message from.
 */
const setSocketMessage = (userID, text, channelID, userName, avatar) => {
    if (text === "") {
        return;
    }
    const messageData = {userID: userID, text: text, channelID: channelID, User: {username: userName, avatar: avatar}};

    const encrypted = encryptData(messageData);
    socket.emit("message", encrypted);
}

/**
 * Internal notification
 * @param {String} title - The title to set the notification from.
 * @param {String} content - The content to set the notification from.
 */
const internalNotif = (title, content) => {
    msg.value = {title: title, body: content};
    notify(msg.value);
};

/**
 * Get the image/file URL from an ID
 * @param {String} tryer - The tryer to get the image from.
 * @returns {String} - The image URL.
 */
const getImg = (tryer) => {
    if(tryer === null || tryer === undefined) {
        return;
    }
    return `${baseUrl}/api/v1/files/${tryer}`;
}

/**
 * Open the friend chat
 * @param {String} friendShipID - The friend ship ID to open the chat from.
 */
const openFriendChat = (friendShipID) => {
    router.push("/dashboard/chats/" + friendShipID);
};

// on message from socket, decrypt the message and add it to the messages array
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

    if(message.text !== null) {
        let text = convertLinks(message.text);
        message.text = text;
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

// on typing from socket, show the user is typing
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

/**
 * Back to the chats list, push the router to the chats list
 */
const backToChatsList = () => {
    router.push("/dashboard/chats");
};


let t = 0;

/**
 * Check the scroll and get the new messages
 * @param {Event} event - The event to check the scroll from.
 */
const checkScroll = async (event) => {
    if(new Date().getTime() - t < 1000 || messagesRef.value.scrollTop >= 1) {
        return;
    }

    t = new Date().getTime();

    if (messagesRef.value.scrollTop <= 1) {
        await getTwentyNewMessages(page.value);
        page.value++;
    }
};

/**
 * Show error message as a notification
 * @param {String} message - The message to show the error from.
 */
const showError = (message) => {
    let newMSG = {title: "Error", body: message, level: "error"};
    notify(newMSG);
};

/**
 * Send a friend request
 * @param {String} userID - The user ID to send the friend request from.
 */
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

/**
 * Send a new message to the chat from the text input
 */
const sendNewMessage = async () => {
    if(messageInput.value.value === "") {
        return;
    }
    if(messageInput.value.value.length > 300 || messageInput.value.value.length < 1) {
        
        showError("The message must be between 1 and 300 characters long");
        return;
    }
    setSocketMessage(props.userID, messageInput.value.value, props.channelID, props.userName, localUserStore.user.avatar);

    messageInput.value.value = ""; // clear the input
    actualChars.value = 0;
};

/**
 * Update the last message
 * @param {String} message - The message to update the last message from.
 */
const updateLastMessage = (message) => {
    lastMessage.value = message;
};

/**
 * Scroll to the bottom of the messages
 */
const scrollToBottom = async () => {
    if(!messagesRef.value) {
        return;
    }
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
};

/**
 * Typing event and send the 'typing' event to the server
 * @param {Event} event - The event to check the typing from. 
 */
const typing = async (event) => {
    actualChars.value = messageInput.value.value.length;
    const data = {channelID: props.channelID, userID: props.userID, userName: props.userName};
    const encrypted = encryptData(data);
    socket.emit("typing", encrypted);
    if (event.code === "Enter" || event.code === "NumpadEnter") {
        if(messageInput.value.value === "") {
            return;
        }
        if((localUserStore.user.username !== "Lxcked") && messageInput.value.value.length > 300 || messageInput.value.value.length < 1) {
            showError("The message must be between 1 and 300 characters long");
            return;
        }
        setSocketMessage(props.userID, messageInput.value.value, props.channelID, props.userName, localUserStore.user.avatar);
        messageInput.value.value = ""; // clear the input
        actualChars.value = 0;
    }
};

/**
 * Open the channel edit dialog
 * @param {String} channelID - The channel ID to open the channel edit from.
 */
const openChannelEdit = (channelID) => {
    editChannelDialogRef.value.show();
};

/**
 * Show the users list
 */
const showUsersList = () => {
    showUser.value = !showUser.value;
};

/**
 * Try to get the avatar
 * @param {String} id - The ID to try to get the avatar from.
 * @returns {Boolean} - If the avatar is found.
 */
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

/**
 * Get the twenty new messages from the server and add them to the messages array
 */
const getTwentyNewMessages = async () => {

    //avoid opaque responses

	if(lastLoadedMessages.value.length<=0 && page.value!==2 || lastLoadedMessages.value.length>0 && lastLoadedMessages.value.length<20 && page.value!==2) {
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
                let text = convertLinks(newText);
                message.text = text;
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
    //messages.value.unshift(...newMessages);
    messages.value.unshift(...newMessages);
};

/**
 * Check if the user is an OP or owner
 */
const getIsOp = () => {
    if(props.isOP || props.isOwner) {
        return true;
    }
};

/**
 * Remove the user from the channel
 * @param {String} userID - The user ID to remove from the channel.
 */
const removeFromChannel = async (userID) => {
    const data = {userID: userID, channelID: props.channelID};
    await API.fireServer("/api/v1/channelsrelations", {
        method: "DELETE",
        body: JSON.stringify(data),
    });

};

/**
 * Reload the chat
 */
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

/**
 * Show the add person dialog
 */
const showAddPerson = () => {
    showAddPersonDialogRef.value.show();
}

/**
 * Show the upload file dialog
 */
const showUploadFile = () => {
    uploadFileDialogRef.value.show();
};

/**
 * Show the image dialog
 * @param {String} message - The message to show the image dialog from.
 */
const showImageDialog = (message) => {
    actualIMG.value = message;
    showImageDialogRef.value.show();
};

/**
 * Refresh the avatar image
 */
const refreshAvatarImage = async () => {
    const htmlImage = document.getElementById(props.channelID);
    if(!htmlImage) {
        return;
    }
    htmlImage.src = htmlImage.src + "?t=" + new Date().getTime();
}

/**
 * Get the avatar
 * @returns {String} - The avatar.
 */
const getAvatar = async () => {
    if (props.channelAvatar) {
        return props.channelAvatar;
    }
    return null;
};

/**
 * Add someone to the channel
 */
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
 * Check the online friends
 */
const checkOnlineFriends = async () => {
	const data = {friends: friends.value, userID: localUserStore.user.id};
	socket.emit("checkOnline", data);
};

/**
 * Converts the friends data by replacing the current user with the other user.
 * @param {Object} data - The friends data to be converted.
 * @returns {Object} - The converted friends data.
 */
const convertFriends = (data) => {
    for (let key in data) {
        if (data[key].user.id === localUserStore.user.id) {
            data[key].user = data[key].otherUser;
        }
    }
    return data;
};

/**
 * Check if the user is a friend and is pending
 * @param {String} userID - The user ID to check.
 * @returns {Boolean} - If the user is a friend and is pending.
 */
const isFriendPending = (userID) => {
    if (friendsStore.friends.find((x) => x.friendID === userID && x.pending)) {
        return true;
    }
    return false;
};

/**
 * Get the image
 * @param {String} id - The ID to get the image from.
 * @returns {String} - The image.
 */
const getImage = async (id) => {
    const res = await API.fireServer("/api/v1/files/" + id, {
        method: "GET",
    });

    const url = res.url;
    return url;
};

/**
 * Download the image
 * @param {String} url - The URL to download the image from.
 */
const donwloadImage = async (url) => {
    if(!url || url.endsWith("null") || url.endsWith("undefined")) {
        return;
    }
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

/**
 * Upload File to conversation
 */
const uploadFile = async () => {
    let file;
    if(uploadFileInputRef.value.files.length === 0) {
        file = fileFromClipboard.value;
    } else {
        file = uploadFileInputRef.value.files[0];
    }
/*
    if(file.size > 10000000) {
        showError("The file is too big. The maximum size is 10MB");
        return;
    }*/
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.name.substring(file.name.lastIndexOf('.')+1, file.name.length) || file.name);
    formData.append("channelID", props.channelID);
    formData.append("userID", localUserStore.user.id);
    const res = await API.fireServer("/api/v1/files", {
        method: "POST",
        headers: {
            "Content-Type": false,
        },
        body: formData,
    });
    if (res.status === 200) {
        const data = await res.json();

        data.text = data.id;
        data.User = localUserStore.user;

        const encryptedData = await crypter.encrypt(data);
        socket.emit("message", encryptedData);
        uploadFileDialogRef.value.hide();
    }
};

/**
 * Close the friend dialog
 */
const closeFriendDialogRef = () => {
    editChannelDialogRef.value.hide();
    actualUser.value = null;
};

/**
 * Check if the user is the owner
 * @param {String} id - The ID to check if the user is the owner from.
 * @returns {Boolean} - If the user is the owner.
 */
const checkIfOwnUser = (id) => {
    if (id === localUserStore.user.id) {
        return true;
    }
    return false;
};

/**
 * Find the user from the friend list
 * @param {String} id - The ID to find the user from.
 * @returns {Object} - The user.
 */
const findUserFromFriendList = (id) => {
    const user = friends.value.find((friend) => friend.otherUser.id === id);
    return user;
}

const convertLinks = (text) => {
    const linksFound = text.match(/(https?:\/\/[^\s]+)/g);
    if (linksFound) {
        for (let link of linksFound) {
            text = text.replace(link, `<a href="${link}" target="_blank">${link}</a>`);
        }

    }
    return text;
 }

const decryptMessagesFromKey = async (key) => {
    for (let message of messages.value) {
        try {
            let newText = await crypter.decrypt(message.text, key);
            if(newText !== null) {
                let text = convertLinks(newText);
                message.text = text;
            } else {
                //message.text = null;
            }
        } catch {
            showError("Error decrypting messages");
        }
    }
    isMessagesDecrypted.value = true;
};

/**
 * Check if the user is online
 * @param {String} id - The ID to check if the user is online from.
 * @returns {Boolean} - If the user is online.
 */
const checkUserOnline = (id) => {
    const user = findUserFromFriendList(id);
    if (user) {
        return user.online;
    }
    return false;
}

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
                let text = convertLinks(tmp);
                 message.text = text;
             }
        } catch {

        }
    }

    friends.value = friendsStore.friends;

    friends.value = convertFriends(friends.value);

    checkOnlineFriends();
    
    if(props.channelType === "public") {
        isMessagesDecrypted.value = true;
        document.title = props.channelName + " - " + appName;
        channelNameWithoutProps.value = props.channelName;
    } else {
        //enterKeyDialogRef.value.show();
        decryptMessagesFromKey(props.key);

        for (const friend of friends.value) {
            if (friend.id === props.channelID) {
                if(friend.user.id === localUserStore.user.id) {
                    document.title = friend.otherUser.username + " - " + appName;
                } else {
                    document.title = friend.user.username + " - " + appName;
                }
            }
        }
    }
    
    loading.value = false;
    await nextTick(() => {
        messagesRef.value.addEventListener("scroll", checkScroll);
        scrollToBottom();
    });   
    messageInput.value.addEventListener('paste', (e) => {
        if (e.clipboardData.files.length > 0) {
            e.preventDefault();
            const dataTransfer = e.clipboardData.files || navigator.clipboard.read();

            fileFromClipboard.value = dataTransfer[0];
            uploadFileInputRef.value.files = e.clipboardData.files;
            uploadFileDialogRef.value.show("www");
        }
    });

    if(props.channelName === 'zz' && localUserStore.user.username === 'Lxcked') {
         /*   for(let i = 0; i < 1000; i++) {
                setSocketMessage(props.userID, 'ceci est un message pour tester zebi', props.channelID, props.userName, localUserStore.user.avatar);
            }*/
           console.log('yo Lxcked');
    }

    // wait 2 seconds to avoid the scroll to bottom
    setTimeout(() => {
        scrollToBottom();
    }, 190);
    
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
            @confirm="editChannel"
        >
            <template #title>
                Edit channel
            </template>

            <template #content>
                <button @click="changeChannelImageDialogRef.show()">
                    <AvatarCircle
                        :name="props.userName"
                        :id="props.userID"
                        :avatar="props.channelAvatar"
                    />
                </button>
                <input
                    type="text"
                    placeholder="Channel Name"
                    class="input input-bordered w-full max-w-xs"
                    :value="channelName"
                    ref="newNameInputRef"
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
            ref="changeChannelImageDialogRef"
            :is-acknowledgement="true"
            confirm-name="Save"
            @confirm="changeChannelImage"
        >
            <template #title>
                Change channel image
            </template>
            <template #content>
                <input
                    ref="changeChannelImageInputRef"
                    type="file"
                    class="file-input file-input-bordered w-full max-w-xs"
                />
            </template>
        </CustomDialog>

        <CustomDialog
            ref="showImageDialogRef"
            :is-acknowledgement="false"
            cancel-name="Close"
            confirm-name="Download"
            @cancel="showImageDialogRef.hide()"
            @confirm="donwloadImage(getImg(actualIMG?.text))"
        >
            <template #title>
                Image
            </template>
            <template #content>
                <div class="object-cover max-w-[600px] flex flex-box justify-center">
                    <img ref="showImageRef" :src="getImg(actualIMG?.text)" class="" />
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
            <div class="justify-center">
                <button
                    @click="sendFriendRequest(actualUser?.userID)"
                    v-if="!actualUser?.isFriend"
                    class="btn btn-outline"
                >
                    <i class="bi bi-person-plus-fill"></i>
                    Send friend request
                </button>
                <button v-else-if="isFriendPending(actualUser.User.id)" class="btn btn-outline" disabled>
                    <i class="bi bi-person-check-fill"></i>
                    Friend request sent
                </button>
                <button v-else-if="actualUser.userID !== localUserStore.user.id || !actualUser.User" class="btn btn-outline justify-center" @click="openFriendChat(getFriendShipID(actualUser.userID))">
                    Open Chat
                </button>
            </div>
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

        <CustomDialog
            ref="uploadFileDialogRef"
            confirm-name="Upload"
            cancel-name="Cancel"
            @confirm="uploadFile()"
            @cancel="uploadFileDialogRef.hide()"
        >

            <template #title>
                Upload file
            </template>
            <template #content>
                <input ref="uploadFileInputRef" type="file" :src="getImg(actualIMG?.text)" class="file-input file-input-bordered w-full max-w-x"/>
            </template>
        </CustomDialog>

        <CustomDialog
            ref="enterKeyDialogRef"
            :is-acknowledgement="true"
            confirm-name="save"
            @confirm="decryptMessagesFromKey(key)"
        >
            <template #title>
                Enter key
            </template>
            <template #content>
                <input
                    type="text"
                    placeholder="Key"
                    class="input input-bordered w-full max-w-xs"
                    v-model="key"
                />
            </template>
        </CustomDialog>
        
    </Teleport>

    <div v-if="loading">
        <span class="loading loading-spinner"></span>
        <p>
            Getting the latest data...
        </p>
    </div>

    <div v-else class="flex-1 flex justify-between flex flex-col w-[32px] min-h-[9rem] max-h-[55rem]" @drop.prevent="openDragFile" @dragenter="checkDrag" @dragover="checkDrag">
        
        <div class="flex gap-2 sm:items-center justify-between py-3 border-b-2 border-gray-200 px-4 ">
            <div class="relative flex flex-1">
                <AvatarCircle
                    v-if="channelType === 'public'"
                    :name="channelNameWithoutProps"
                    :id="channelID"
                    :avatar="channelAvatar"
                    :is-chan="true"
                    ref="channelAvatarRef"
                />
                <AvatarCircle
                    v-if="channelType === 'private' && channelUsers.length > 0"
                    :name="channelNameWithoutProps"
                    :id="channelUsers.find((x) => x.userID !== user.id).userID"
                    :avatar="channelUsers.find((x) => x.userID !== user.id).User.avatar"
                    :is-chan="true"
                    ref="channelPrivateAvatarRef"
                />
                
                <div class="flex flex-col leading-tight">
                    <div class="text-2xl mt-1 flex items-center">
                        
                        <span v-if="channelType === 'public'" class="text-gray-700 mr-3 dark:text-gray-300">
                           &nbsp; {{ channelNameWithoutProps }}
                        </span>
                        <span v-if="channelType === 'private' && channelUsers.length > 0" class="text-gray-700 mr-3 dark:text-gray-300">
                           &nbsp; {{ channelUsers.find((x) => x.userID !== user.id).User.username }}
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

        <DragNDropUI ref="dragNDropUI"></DragNDropUI>
        <ul role="list" ref="messagesRef" id="messages" class="inline-flex flex-1 flex-col p-3 max-h-[calc(100vh-195px)] overflow-y-auto overflow-x-hidden">
            
            <div v-if="isMessagesDecrypted" v-for="(message, index) in messages" class=" hover:bg-gray-900 hover:rounded-lg">
                <Message
                    @showUser="showUserProfile(message)"
                    @showMessageOptions="showMessageOptions(message)"
                    @mouseover="showDeleteMessage(message)"
                    @showImage="showImageDialog(message)"
                    :text="message.text"
                    :isOwnMessage="isSameThanActualUser(message)"
                    :isLast="!isSameThanNext(message, index)"
                    :userName="message.User.username"
                    :userID="message.userID"
                    :isFirst="isFirst(message, index)"
                    :createdAt="new Date(message.createdAt).toLocaleString()"
                    :id="message.id"
                    :type="message.type"
                    :avatar="message.User.avatar ? message.User.avatar : message.userID"
                    :is-online="!checkIfOwnUser(message.userID)?checkUserOnline(message.userID):null"
                    :is-o-p="getIsOp()"
                    :is-edited="message.editedAt"
                />
                {{ console.log(message) }}
            </div>
        </ul>

        <div ref="someoneIsTyping" class="chat-header flex flex-box opacity-80 max-h-8"></div>
        <div class="flex flex-col">
            <div class="relative">
                <input
                    @input="typing($event)"
                    @keypress="typing($event)"
                    ref="messageInput"
                    type="text"
                    placeholder="Write your message!"
                    class="input input-bordered w-full max-w-[calc(100%-90px)] max-h-20 overflow-y-auto "
                />
                <div class="absolute right-0 items-center inset-y-0 hidden sm:flex">
                    <div>
                        <span class="-z-1 text-gray-500">{{ actualChars }}/{{ maxChars }}</span>
                    </div>
                    <button @click="showUploadFile()" type="button" class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out">
                        <i class="bi bi-file-earmark-arrow-up"></i>
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