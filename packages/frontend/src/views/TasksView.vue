<script setup>
import { onMounted, ref } from "vue";
import API from "@/utils/apiWrapper";
import TodoItem from "@/components/TodoItem.vue";

const tasks = ref({});
const templates = ref({});

const isLoaded = ref(false);

const getTasks = async () => {
	const res = await API.fireServer(`/api/v1/tasks/list`, {
		method: "GET",
	});
	const tempVal = await res.json();
	return tempVal.tasks;
};

const getTemplates = async () => {
	const res = await API.fireServer(`/api/v1/templates/list`, {
		method: "GET",
	});
	const tempVal = await res.json();
	return tempVal.templates;
};

onMounted(async () => {
	tasks.value = await getTasks();
	templates.value = await getTemplates();

	isLoaded.value = true;
});
</script>

<template>
	<div class="w-full p-6">
		<h1 class="text-2xl font-bold">
			Tasks
		</h1>

		<div class="divider my-4"></div>

		<div
		v-if="isLoaded"
		class="flex flex-col gap-4"
		>
			<TodoItem
				v-for="task in tasks"
				:key="task.id"
				:name="templates[task.templateId].name"
				:details="templates[task.templateId].body"
				complete
			/>
		</div>
	</div>
</template>