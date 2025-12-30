<script setup>
import { ref } from "vue";

const notifications = ref([]);

const add = async (data) => {
	const dummy = {
		title: "No title",
		body: "No body",
		icon: "",
		level: "info",
		timeout: 5000,
		hiding: false,
		rid: Math.random().toString(36).replace(/^0\./, "_"),
	};

	dummy.title = data?.title;
	dummy.body = data?.body;
	dummy.icon = data?.icon;
	dummy.level = data?.level;
	dummy.timeout = data?.timeout?.length ? data.timeout : dummy.timeout;


	notifications.value.push(dummy);

	setTimeout(async () => {
		const n = notifications.value.find(x => x.rid === dummy.rid);

		n.hiding = true;

		await new Promise(r => setTimeout(r, 1000));

		notifications.value = notifications.value.filter(i => i.rid !== dummy.rid);
	}, dummy.timeout);
};

const getStyle = (level, hidden) => {
	let baseString = "alert";

	if (hidden) {
		baseString = baseString + " nm-hidden";
	}

	switch (level) {
	case "info":
		baseString = baseString + " alert-info";
		break;
	case "success":
		baseString = baseString + " alert-success";
		break;
	case "warning":
		baseString = baseString + " alert-warning";
		break;
	case "error":
		baseString = baseString + " alert-error";
		break;
	default:
		break;
	}

	return baseString;
};

defineExpose({
	add,
});
</script>

<template>
	<div class="toast z-[99999999]">
		<div
			:class="getStyle(n.level, n.hiding)"
			v-for="n in notifications" :key="n.rid">
			<i v-if="n.icon" :class="n.icon + ' text-2xl'"></i>
			<div>
				<h3 class="font-bold break-words">{{ n.title }}</h3>
				<div class="text-s break-words">{{ n.body }}</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.alert {
		transition:
			opacity 0.2s ease-out,
			scale 0.2s ease-out;
	}

	.alert.nm-hidden {
		opacity: 0;
		scale: 0.9;
	}
</style>