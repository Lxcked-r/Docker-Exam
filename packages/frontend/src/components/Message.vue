<script setup>
import AvatarCircle from './AvatarCircle.vue';
import { onBeforeMount, onMounted, ref } from 'vue';

const loading = ref(false);

const props = defineProps({
    text: String,
    userID: String,
    isOwnMessage: Boolean,
    isLast: Boolean,
    userName: String,
    createdAt: String,
    isFirst: Boolean,
    url: String,
    avatar: String,
});

onBeforeMount(() => {
    loading.value = false;
});

</script>

<template>
    <div class="flex items-start gap-2.5">
        <AvatarCircle v-if="isFirst" :id="userID" :force-fallback="true" :name="userName":avatar="avatar" @click="$emit('showUser')"/>
        <div class="flex flex-col w-full max-w-[320px] leading-1.5 mb-2">
                <span v-if="isFirst" class="text-sm font-semibold text-gray-900 dark:text-white">{{ userName }}<div v-if="isOwnMessage" class="text-sm text-500 dark:text-gray-400">(You)</div></span>
                <span v-if="isFirst" class="text-sm font-normal text-gray-500 dark:text-gray-400">{{ createdAt }}</span>
            <span v-if="isFirst" class="text-sm font-normal pt-1 mt-0 text-gray-900 dark:text-white">{{ text }}</span>
            <span v-else class="text-sm font-normal text-gray-900 -mt-6 dark:text-white ml-[58px]">{{ text }}</span>
        </div>
    </div>
</template>