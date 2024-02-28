<script setup>
import AvatarCircle from './AvatarCircle.vue';



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

</script>

<template>
    <div class="flex items-start gap-2.5">
        <AvatarCircle v-if="isFirst" :id="userID" :force-fallback="true" :name="userName" :url="url" :avatar="avatar" @click="$emit('showUser')"/>
        <div class="flex flex-col w-full max-w-[320px] leading-1.5">                            
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
                <span v-if="isFirst" class="text-sm font-semibold text-gray-900 dark:text-white">{{ userName }}<div v-if="isOwnMessage" class="text-sm text-500 dark:text-gray-400">(You)</div></span>
                <span v-if="isFirst" class="text-sm font-normal text-gray-500 dark:text-gray-400">{{ createdAt }}</span>
            </div>
            <span v-if="isFirst" class="text-sm font-normal pt-1 mt-0 text-gray-900 dark:text-white">{{ text }}</span>
            <span v-else class="text-sm font-normal text-gray-900 -mt-6 dark:text-white ml-[58px]">{{ text }}</span>
            <div class="mb-2"></div>
            </div>
        </div>
</template>