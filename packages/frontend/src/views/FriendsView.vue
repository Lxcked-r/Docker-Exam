<script setup>
import { inject, onBeforeMount, onMounted, ref, watch } from "vue";

import { useLocalUserStore } from "@/stores/localUser";
const localUserStore = useLocalUserStore();

import UserDisp from "@/components/UserDisp.vue";

import router from "@/router";

import API from "@/utils/apiWrapper";
import AvatarCircle from "@/components/AvatarCircle.vue";

const loading = ref(true);
const friends = ref([]);

const getFriends = async () => {
    const res = await API.fireServer("/api/v1/friends/" + localUserStore.user.id, {
        method: "GET",
    });
    const data = await res.json();
    friends.value = data;
};

const convertFriends = (data) => {
    for (let key in data) {
        if (data[key].user.id === localUserStore.user.id) {
            data[key].user = data[key].otherUser;
        }
    }
    return data;
};

const friendCheck = (userID) => {
    return friends.value.find((x) => x.id === userID);
};

const acceptFriend = async (friend) => {
    const res = await API.fireServer("/api/v1/friends/" + friend.id, {
        method: "PUT",
        body: JSON.stringify({
            pending: false,
        }),
    });
    if (res.status === 200) {
        await getFriends();
        convertFriends(friends.value);
    }
}

const denyFriend = async (friend) => {
    const res = await API.fireServer("/api/v1/friends/" + friend.id, {
        method: "DELETE",
    });
}

const createChannelRelation = async (userID, channelID) => {
    const res = await API.fireServer("/api/v1/channelsrelations", {
        method: "POST",
        body: JSON.stringify({
            channelID: channelID,
            userID: userID,
        }),
    });
    return await res.json();
};


const checkChannel = async (friendRelationID) => {
    const res = await API.fireServer("/api/v1/channelsrelations?channelID=" + friendRelationID, {
        method: "GET",
    });
    return await res.json();
};

const createChannel = async (friend, friendRelationID) => {
    const res = await API.fireServer("/api/v1/channels", {
        method: "POST",
        body: JSON.stringify({
            name: "Chat with " + friend.user.username,
            type: "private",
            owner: localUserStore.user.id,
            id: friendRelationID
        }),
    });
    return await res.json();
};

const openChatFromFriend = async (friend, friendRelationID) => {
    await checkChannel(friendRelationID).then(async (data) => {
        console.log(data);
        if (data.length > 0) {
            router.push("/dashboard/chats/" + friendRelationID);
        } else {
            await createChannel(friend, friendRelationID).then(async (data) => {
                await createChannelRelation(localUserStore.user.id, friendRelationID);
                await createChannelRelation(friend.otherUser.id, friendRelationID);
                router.push("/dashboard/chats/" + friendRelationID);
            });

        }
    });
};

onBeforeMount(async () => {
    loading.value = true;
});

onMounted(async () => {

    await getFriends();

    const convertedFriends = convertFriends(friends.value);
    friends.value = convertedFriends;

    loading.value = false;
});



</script>

<template>
    <div v-if="loading">

    </div>
    <div v-else class="container">
        <div v-if="friends.length<1" class="row">
            <div class="col-12">
                <p>There are no friends yet.</p>
            </div>
        </div>

    
        <div v-else v-for="friend in friends" class="flex flex-1">
            <UserDisp
            @click=" () => { if(friend.pending===false) {openChatFromFriend(friend, friend.id)}}"
            :id="friend.user.id"
            :key="friend.id" 
            :user="friendCheck(friend.user.id)" 
            :username="friend.user.username"
            :avatar="friend.user.avatar"
            :pending="friend.pending" >
            </UserDisp>
            <div v-if="friend.pending && friend.userID !== localUserStore.user.id" class="inline-flex">
                <button @click="acceptFriend(friend)" class="btn btn-outline btn-success" style="margin-top: 14px; margin-left: 15px;">
                    <i class="bi bi-check" style="font-size: 25px;"></i>
                </button>
                <button @click="denyFriend(friend)" class="btn btn-outline btn-error" style="margin-top: 14px; margin-left: 15px;">
                    <i class="bi bi-x-lg" style="font-size: 20px;"></i>
                </button>
            </div>
            <div v-if="friend.pending&&friend.userID === localUserStore.user.id">
                Pending
            </div>

        </div>
    </div>
</template>