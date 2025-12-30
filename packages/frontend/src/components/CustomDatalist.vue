<script setup>
import AvatarCircle from "@/components/AvatarCircle.vue";
import { computed, onMounted, watch } from "vue";
import UserDisp from "./UserDisp.vue";
import { ref } from "vue";

const filteredFriends = ref([]);

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    search: {
        type: String,
        default: ''
    }
});

const isMounted = ref(false);

watch(() => props.items, (newItems) => {
    if (props.search) {
        filteredFriends.value = newItems.filter(friend =>
            friend.name.toLowerCase().includes(props.search.toLowerCase())
        );
    } else {
        filteredFriends.value = newItems;
    }
}, { immediate: true });

//watch search term changes
watch(() => props.search, (newSearch) => {
    if (newSearch) {
        filteredFriends.value = props.items.filter(friend =>
            friend.name.toLowerCase().includes(newSearch.toLowerCase())
        );
    } else {
        filteredFriends.value = props.items;
    }
    console.log("Search term changed:", newSearch);
}, { immediate: true });

computed(() => {
    isMounted.value = true;
    return isMounted.value;
});

onMounted(() => {
    // Initial setup if needed
    console.log("CustomDatalist component mounted");
    console.log("Items:", props.items);
    console.log("Search term:", props.search);
    console.log("Filtered friends:", filteredFriends.value);
});

</script>

<template>
    <div v-if="isMounted"  class="custom-datalist">
        <div v-for="friend in filteredFriends" :key="friend.id" class="card">
            <UserDisp
                :id="friend.id"
                :name="friend.name"
                :avatar="friend.avatar"
                :notifs="friend.notifs"
                :type="friend.type"
                :userName="friend.userName"
                :userID="friend.userID"
            />
        </div>
    </div>
</template>