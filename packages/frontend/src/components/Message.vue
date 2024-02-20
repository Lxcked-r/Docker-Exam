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
    });
</script>

<template>
        <div class="message">
            <div class="message_content">

                <div v-if="!isOwnMessage&&isFirst" class="chat-header">
                    
                    {{ userName }}
                    <time class="text-xs opacity-50">{{ createdAt }}</time>
                </div>
                <div v-if="isOwnMessage&&isFirst" class="chat chat-end">
                    <div class="chat-header">
                        You
                    </div>
                </div>

                <div v-if="!isOwnMessage" class="chat chat-start">
                    <div class="chat-image avatar">
                        <div class="w-10 rounded-full">
                            <AvatarCircle v-if="isLast" :id="userID" :force-fallback="true" :name="userName" />
                        </div>
                    </div>
                    <span class="chat-bubble">{{ text }}</span>
                </div>

                <div v-else class="chat chat-end">
                    <span class="chat-bubble chat-bubble-primary">{{ text }}</span>
                </div>

            </div>
        </div>
</template>