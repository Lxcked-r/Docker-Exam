<script setup>
import { RouterView } from "vue-router";
import { onMounted, provide, ref } from "vue";
import NotificationManager from "@/components/NotificationManager.vue";

import socket from "@/utils/socket";


const nm = ref(null);

onMounted(() => {
	// we provide the notify function to all components here. looks jank to do it in App.vue but this guarantees that it's available everywhere.
	provide("notify", nm.value.add);
	
	// provide the socket
	provide("socket", socket);
	
});
</script>

<template>
	<div>
		<NotificationManager ref="nm" />
		<RouterView />
	</div>
</template>

<style scoped>
</style>