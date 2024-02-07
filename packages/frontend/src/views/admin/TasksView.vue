<script setup>
import { useLocalUserStore } from "@/stores/localUser";
const localUserStore = useLocalUserStore();

import { useRouter } from "vue-router";
const router = useRouter();

if (localUserStore.user.operator === false) {
	router.replace("/dashboard");
}

</script>

<template>
	test
</template>