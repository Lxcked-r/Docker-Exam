<script setup>
import { ref, onMounted } from 'vue';
import API from '@/utils/apiWrapper';
import AvatarCircle from './AvatarCircle.vue';
const props = defineProps({
    message: String,
    user: String,
    channel: Object,
    userID: String,
});
</script>

<template>
    <div class="flex flex-col">
            <AvatarCircle :id="userID" :force-fallback="true"/>
            <div>
            {{ user }} in Channel :
            {{ channel.name }}</div>
    </div>
</template>