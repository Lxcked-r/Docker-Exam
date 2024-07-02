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

const friendsListType = ref("all");

const isShowedFriendID = ref(false);

const addFriendDialogRef = ref(null);

const notify = inject("notify");

/**
 * Copy user ID
 */
const copyUserID = () => {
    navigator.clipboard.writeText(localUserStore.user.id);
    notify({title: "Copied", body: "Your user ID has been copied to the clipboard.", level: "success"});
};

/**
 * Get friends
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
 * Show add friend dialog
 */
const showAddFriend = () => {
    addFriendDialogRef.value.show();
};

/**
 * Convert friends
 * @param {Object} data friends object
 * @returns {Object} converted friends object
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
 * Check if user is friend
 * @param {String} userID user ID
 * @returns {Object} friend object
 */
const friendCheck = (userID) => {
    return friends.value.find((x) => x.id === userID);
};

/**
 * Accept friend
 * @param {Object} friend friend object
 * @returns {Promise<void>}
 */
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

/**
 * Deny friend
 * @param {Object} friend friend object
 * @returns {Promise<void>}
 */
const denyFriend = async (friend) => {
    const res = await API.fireServer("/api/v1/friends/" + friend.id, {
        method: "DELETE",
    });
    if (res.status === 200) {
        await getFriends();
        convertFriends(friends.value);
    }
}

/**
 * Create channel relation
 * @param {String} userID user ID
 * @param {String} channelID channel ID
 * @returns {Promise<void>}
 */
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

/**
 * Check channel
 * @param {String} friendRelationID friend relation ID
 * @returns {Promise<void>}
 */
const checkChannel = async (friendRelationID) => {
    const res = await API.fireServer("/api/v1/channelsrelations?channelID=" + friendRelationID, {
        method: "GET",
    });
    return await res.json();
};

/**
 * Create channel
 * @param {Object} friend friend object
 * @param {String} friendRelationID friend relation ID
 * @returns {Promise<void>}
 */
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

/**
 * Open chat from friend
 * @param {Object} friend friend object
 * @param {String} friendRelationID friend relation ID
 * @returns {Promise<void>}
 */
const openChatFromFriend = async (friend, friendRelationID) => {
    await checkChannel(friendRelationID).then(async (data) => {
        if (data.length > 0) {
            console.log(data);
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

/**
 * Delete friend
 * @param {Object} friend friend object
 * @returns {Promise<void>}
 */
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

/**
 * Open context menu
 * @param {Object} friend friend object
 * @param {Event} e 
 */
const openContextMenu = (friend, e) => {
    actualFriend.value = friend;

    ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: "default dark",
    items: [
      { 
        label: "Open Chat", 
        onClick: async () => {
          if(friend.pending)
          {
            return;
          }
        await openChatFromFriend(friend, friend.id);
        }
      },
      { 
        label: "More", 
        children: [
          { label: "Delete Friend", onClick: async () => await deleteFriend(friend)}
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
        "Loading..."
    </div>
    <div v-else class="container">
    
        <div>
            <ul class="menu menu-horizontal bg-base-200 m-2 center">
                <li><a @click="friendsListType='all'">all friends</a></li>
                <li><a @click="friendsListType='online'">online friends</a></li>
                <li><a @click="friendsListType='pending'">peding</a></li>
                <li><a @click="friendsListType='blocked'">blocked</a></li>
                <li><a @click="showAddFriend()"><i class="bi bi-person-add"></i>Add Friend</a></li>
            </ul>
            <div class="flex justify-center">
                Your friend ID:  {{ isShowedFriendID? localUserStore.user.id : "****************"}}<button class="btn btn-outline" @click="copyUserID()">Copy your ID</button>
                <button class="btn btn-outline" 
                    @click="changeIsFriendID()"
                > 
                    {{ isShowedFriendID? "Click to hide" : "Click to show"}} Friend ID
                </button>
            </div>

            <div v-if="friends.length<1" class="row">
                <div class="col-12">
                    <p>There are no friends yet.</p>
                </div>
            </div>
            <div v-else v-for="friend in friends" class="flex flex-1 ml-6 mr-6" >
                <UserDisp v-if="friendsListType === 'all' || (friendsListType === 'online' && friend.user.online) || (friendsListType === 'pending' && friend.pending) || (friendsListType === 'blocked' && friend.blocked)"
                @contextmenu.prevent="openContextMenu(friend, $event)"
                @click="openContextMenu(friend, $event)"
                :id="friend.user.id"
                :key="friend.id" 
                :user="friendCheck(friend.user.id)" 
                :username="friend.user.username"
                :avatar="friend.user.avatar"
                :pending="friend.pending" >
                </UserDisp>
                <div v-if="(friend.pending && friend.userID !== localUserStore.user.id )" class="inline-flex">
                        <button @click="acceptFriend(friend)" class="btn btn-outline btn-success" style="margin-top: 14px; margin-left: 15px;">
                            <i class="bi bi-check" style="font-size: 25px;"></i>
                        </button>
                        <button @click="denyFriend(friend)" class="btn btn-outline btn-error" style="margin-top: 14px; margin-left: 15px;">
                            <i class="bi bi-x-lg" style="font-size: 20px;"></i>
                        </button>
                    </div>
                    <div v-if="friend.pending&&friend.userID === localUserStore.user.id && friendsListType === 'all' || (friendsListType === 'online' && friend.user.online) || (friendsListType === 'pending' && friend.pending) || (friendsListType === 'blocked' && friend.blocked)">
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