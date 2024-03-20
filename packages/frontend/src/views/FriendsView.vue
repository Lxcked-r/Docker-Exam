<script setup>
import { inject, onBeforeMount, onMounted, ref, watch } from "vue";

import { useLocalUserStore } from "@/stores/localUser";
import { useFriendsStore } from "@/stores/friends";
const localUserStore = useLocalUserStore();
const friendsStore = useFriendsStore();

import ContextMenu from '@imengyu/vue3-context-menu'

import UserDisp from "@/components/UserDisp.vue";

import router from "@/router";

import API from "@/utils/apiWrapper";
import AvatarCircle from "@/components/AvatarCircle.vue";
import CustomDialog from "@/components/CustomDialog.vue";

const loading = ref(true);
const friends = ref([]);
const contextMenuDialogRef = ref(null);
const actualFriend = ref(null);

const isShowedFriendID = ref(false);

const addFriendDialogRef = ref(null);

const getFriends = async () => {
    const res = await API.fireServer("/api/v1/friends/" + localUserStore.user.id, {
        method: "GET",
    });
    const data = await res.json();
    friends.value = data;
};

const showAddFriend = () => {
    addFriendDialogRef.value.show();
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
    if (res.status === 200) {
        await getFriends();
        convertFriends(friends.value);
    }
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

const changeIsFriendID = () => {
    isShowedFriendID.value = !isShowedFriendID.value;
};

const deleteFriend = async (friend) => {
    const res = await API.fireServer("/api/v1/friends/" + friend.id, {
        method: "DELETE",
        body: JSON.stringify({userFriendID: friend.userID}),
    });
    if (res.status === 200) {
        await getFriends();
        convertFriends(friends.value);
    }
};

const openContextMenu = (friend, e) => {
    actualFriend.value = friend;

    ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: "default dark",
    items: [
      { 
        label: "Open Chat", 
        onClick: () => {
          if(friend.pending)
          {
            return;
          }
        openChatFromFriend(friend, friend.id);
        }
      },
      { 
        label: "More", 
        children: [
          { label: "Delete Friend", onClick: () => deleteFriend(friend)}
        ]
      },
    ]
    });

    //contextMenuDialogRef.value.show();
};

onBeforeMount(async () => {
    loading.value = true;
});

onMounted(async () => {

    friendsStore.init();

    friends.value = friendsStore.friends;

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
    
        <div v-else>
            <ul class="menu menu-horizontal bg-base-200 m-2 center">
                <li><a>all friends</a></li>
                <li><a>online friends</a></li>
                <li><a>peding</a></li>
                <li><a>blocked</a></li>
                <li><a @click="showAddFriend()"><i class="bi bi-person-add"></i>Add Friend</a></li>
            </ul>
            <div @click="changeIsFriendID()">
                Your Own Friend ID : {{ isShowedFriendID? localUserStore.user.id + " (press to hide)" : "**************" + " (press to show)"}}  
            </div>
        <div v-for="friend in friends" class="flex flex-1 ml-6 mr-6">
            <UserDisp
            @contextmenu.prevent="openContextMenu(friend, $event)"
            @click="openContextMenu(friend, $event)"
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
    </div>
    <Teleport to="#dash">
        <CustomDialog
        ref="contextMenuDialogRef"
        :is-acknowledgement="true"
        confirm-name="cancel"
        @confirm="contextMenuDialogRef.hide()"
        >   
            <template #title>
                <div class="flex items
                -center">
                    <AvatarCircle :id="actualFriend?.user?.id" :avatar="actualFriend?.user?.avatar"/>
                    <h3 class="text-lg font-semibold">{{ actualFriend?.user?.username}}</h3>
                </div>
            </template>

            <template #content>
                <div class="flex flex-col gap-2">
                    <button @click="openChatFromFriend(actualFriend, actualFriend.id)" class="btn btn-primary">Open Chat</button>
                    <button @click="deleteFriend(actualFriend)" class="btn btn-error">Delete Friend</button>
                </div>
            </template>

        </CustomDialog>

        <CustomDialog
        ref="addFriendDialogRef"
        :is-acknowledgement="true"
        confirm-name="cancel"
        @confirm="addFriendDialogRef.hide()"
        >   
            <template #title>
                <h3 class="text-lg font-semibold">Add Friend</h3>
            </template>

            <template #content>
                <div class="flex flex-col gap-2">
                    <input type="text" class="input input-primary" placeholder="User friend ID"/>
                    <button class="btn btn-primary">Add</button>
                </div>
            </template>
        </CustomDialog>
    </Teleport>
</template>