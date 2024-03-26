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
    id: String,
});

onBeforeMount(() => {
    loading.value = false;
});

</script>

<template>
    <div class="flex items-start gap-2.5]">
        <AvatarCircle v-if="isFirst" :id="userID" :force-fallback="true" :name="userName":avatar="avatar" @click="$emit('showUser')"/>
        <li class="group/item flex flex-col leading-1.5 mb-2">
                <span v-if="isFirst" class="text-sm font-semibold text-gray-900 dark:text-white">{{ userName }}<div v-if="isOwnMessage" class="text-sm text-500 dark:text-gray-400">(You)</div></span>
                <span v-if="isFirst" class="text-sm font-normal text-gray-500 dark:text-gray-400">{{ createdAt }}</span>
            <p v-if="isFirst" :id="id" class="text-sm font-normal pt-1 mt-0 text-gray-900 dark:text-white max-w-[64rem]" @mouseover="$emit('showMessageOptions')">{{ text }}</p>
            <p v-else :id="id" class="text-sm font-normal text-gray-900 -mt-6 dark:text-white ml-[48px] max-w-[64rem]" @mouseover="$emit('showMessageOptions')">{{ text }}</p>
        </li>
    </div>
</template>