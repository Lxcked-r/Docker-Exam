<script setup>
import { ref, onMounted } from 'vue';
import API from '@/utils/apiWrapper';
import AvatarCircle from './AvatarCircle.vue';
const props = defineProps({
    message: String,
    user: Object,
    userID: String,
});
</script>

<template>
    <div class="flex flex-col">
            <p class="text-sm font-semibold">New Friend Request</p>
            <AvatarCircle :id="userID" :force-fallback="true" :avatar="user.avatar"/>
            <div>
                <p class="text-sm font-semibold">{{ user.username }}</p>
            </div>
    </div>
</template>