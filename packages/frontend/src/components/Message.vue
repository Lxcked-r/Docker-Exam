<script setup>
    const props = defineProps({
        text: String,
        userID: String,
        isOwnMessage: Boolean,
        isLast: Boolean,
        userName: String,
        createdAt: String,
    });
</script>

<template>
    <div class="message">
        <div class="message_content">
            <div v-if="!isOwnMessage" class="chat-header">
                {{ userName }}
                <time class="text-xs opacity-50">{{ createdAt }}</time>
            </div>
            <div v-if="!isOwnMessage" class="flex items-end" >
                <span class="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600">{{ text }}</span>
            </div>
            <div v-else class="flex items-end justify-end">
                <span class="px-4 py-2 rounded-lg inline-block bg-blue-500 text-white">{{ text }}</span>
            </div>
        </div>
    </div>
</template>