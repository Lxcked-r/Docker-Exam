<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import API from "../utils/apiWrapper";
import TodoItem from "../components/TodoItem.vue";

const detailsModal = ref(null);

const targetTaskID = ref("0");

const switchTaskState = async (id) => {
	let finalState;
	retrievedList.value.forEach(element => {
		if (element.id === id) {
			finalState = !element.complete;
		}
	});

	await API.fireServer("/api/v1/tasks/update", {
		method: "POST",
		body: JSON.stringify({
			id: id,
			complete: finalState,
		}),
	});
	updateList();
};

const sortFilters = ref({
	assignee: "any",
	type: "in_progress",
});

const retrievedList = ref(null);
const finishedLoading = ref(false);

const sortedList = computed(() => {
	if (retrievedList.value) {
		const { compare } = Intl.Collator("en-US");
		const tempArr = retrievedList.value;
		tempArr.sort((a, b) => compare(b.createdAt, a.createdAt));

		const tempArr2 = tempArr;
		switch (sortFilters.value.type) {
		case "complete":
			return tempArr2.filter(function(e) { return e.complete === true; });
		case "in_progress":
			return tempArr2.filter(function(e) { return e.complete === false; });
		}

		return tempArr2;
	} else {
		return null;
	}
});

const updateList = async () => {
	const res = await API.fireServer("/api/v1/tasks/list", {
		method: "GET",
	});

	res.data = await res.json();

	retrievedList.value = res.data;

	emit("updated");

	finishedLoading.value = true;
};

const intervalID = ref(null);

onMounted(async () => {
	updateList();

	intervalID.value = setInterval(() => {
		updateList();
	}, 10000);
});

onUnmounted(() => {
	clearInterval(intervalID.value);
});

const emit = defineEmits([
	"updated",
]);

defineExpose({
	updateList,
});
</script>

<template>
	<dialog
		ref="detailsModal"
		class="modal"
	>
		<div class="modal-box" v-if="retrievedList && finishedLoading && retrievedList.length > 0">
			<div>
				<div class="flex">
					<h1 class="flex-1 text-4xl">
						{{ retrievedList[targetTaskID].name }}
					</h1>
					<p class="text-neutral" v-if="retrievedList[targetTaskID].recurring">
						<i class="bi bi-arrow-repeat"></i>
						Every {{ retrievedList[targetTaskID].frequency }}
					</p>
					<p>
						<i class="bi bi-people-fill"></i>
						{{ retrievedList[targetTaskID].assignee1 }},
						{{ retrievedList[targetTaskID].assignee2 }}
					</p>
				</div>
				<br>
				<p>
					{{ retrievedList[targetTaskID].details }}
				</p>
			</div>

			<button
				class="btn btn-md mt-4"
				@click="detailsModal.close()"
			>
				Close
			</button>
		</div>
	</dialog>
	<div class="selects pl-2 pr-2 pt-2 sm:pl-8 sm:pr-8">
		<p class="">
		Showing
		</p>
		<select class="select select-bordered" v-model="sortFilters.type">
			<option disabled>Pick a type...</option>
			<option value="all">complete and unfinished</option>
			<option value="complete">complete</option>
			<option value="in_progress">unfinished</option>
		</select>
		<p class="">
			tasks for
		</p>
		<select class="select select-bordered" v-model="sortFilters.assignee">
			<option disabled>Pick someone...</option>
			<option value="any">Everyone</option>
		</select>
		<div class="flex-1 flex justify-end">
			<slot name="buttons">
			</slot>
		</div>
	</div>
	<div class="content">
		<div class="taskdisplay">
			<p v-if="!finishedLoading">
				Loading tasks...
			</p>
			<p v-else-if="finishedLoading && sortedList.length <= 0">
				There's no tasks to display right now.
			</p>
			<TodoItem
				v-else
				v-for="task in sortedList"
				:key="task.id"
				class="cursor-pointer"

				@click="() => {
					targetTaskID = retrievedList.map(e => e.id).indexOf(task.id);
					detailsModal.showModal()
				}"

				:name="task.name"
				:details="task.details"
				:assignee1="task.assignee1"
				:assignee2="task.assignee2"
				:recurring="task.recurring"
				:frequency="task.every"
				:complete="task.complete"

				@checked="switchTaskState(task.id)"
			/>
		</div>
	</div>
</template>

<style scoped>
	.content {
		padding: 1rem;
		max-height: 60vh;
		overflow: auto;
	}

	.taskdisplay{
		height: 100%;
		width: 100%;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.selects {
		display: flex;
		gap: 1rem;
		align-items: baseline;
		flex-wrap: wrap;
	}


	@media (max-width: 640px) {
		.content {
			padding: 0.5rem;
		}
	}
</style>