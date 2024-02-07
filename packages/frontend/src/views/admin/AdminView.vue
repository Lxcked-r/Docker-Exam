<script setup>
import { computed } from "vue";
import API from "@/utils/apiWrapper";
import { useLocalUserStore } from "@/stores/localUser";

import HomeSquare from "@/components/HomeSquare.vue";

import { useRouter } from "vue-router";
const router = useRouter();


const localUserStore = useLocalUserStore();

const onMainRoute = computed(() => {
	return router.currentRoute.value.path === "/dashboard/admin";
});

const headerText = computed(() => {
	switch (router.currentRoute.value.path) {
	case "/dashboard/admin/users":
		return "Users";
	case "/dashboard/admin/templates":
		return "Templates";
	case "/dashboard/admin/tasks":
		return "Tasks";
	default:
		return "Administration";
	}
});

if (localUserStore.user.operator === false) {
	router.replace("/dashboard");
}

</script>

<template>
	<div class="w-full h-full flex flex-col p-6">
		<h1 class="text-2xl font-bold">
			<i
				class="bi bi-arrow-left-short text-2xl"
				@click="router.back()"
			></i>
			{{ headerText }}
		</h1>

		<div class="divider my-4"></div>

		<div class="flex gap-4 justify-center md:flex-row flex-col" v-if="onMainRoute">
			<HomeSquare
				to="/dashboard/admin/users"
				icon="bi-people"
				text="Users"
			/>
			<HomeSquare
				to="/dashboard/admin/templates"
				icon="bi-card-list"
				text="Templates"
			/>
			<HomeSquare
				to="/dashboard/admin/tasks"
				icon="bi-list-task"
				text="Tasks"
			/>
		</div>

		<div v-show="!onMainRoute">
			<RouterView />
		</div>
	</div>
</template>