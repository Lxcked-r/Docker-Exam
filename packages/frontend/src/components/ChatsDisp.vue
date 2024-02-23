<script setup>
import AvatarCircle from "@/components/AvatarCircle.vue";
import { ref, defineProps, defineEmits, onMounted } from "vue";

const loading = ref(true);


const props = defineProps({
	id: { type: String, required: true },
	name: { type: String, required: true },
    notifs: { type: Number, required: false, default: 0 },
	avatar: { type: String, required: false, default: null },
});

defineEmits(["checked"]);

onMounted(() => {
	loading.value = false;
});

</script>

<template>
    <div v-if="!loading" class="card" tabindex="0">
		<AvatarCircle :id="props.id" :force-fallback="props.avatar === null" :name="props.name" :avatar="props.avatar"/>
		<div class="content select-none">
			<div class="title">
                {{ props.name }}
            </div>
		</div>
    </div>
</template>

<style scoped>
	.card {
		@apply flex flex-row items-center gap-1 w-full p-4;
		@apply cursor-pointer;
		@apply transition-all;
		@apply bg-base-200;
		@apply hover:bg-base-300;
		@apply hover:shadow-lg;
		@apply transform hover:scale-[1.01];
		@apply active:scale-100;
		@apply active:bg-base-200;
	}

	.content {
		@apply w-full px-2;
	}

	.checkbox {
		@apply scale-150;
	}

	.title {
		@apply flex flex-row items-center gap-1;
	}

	@media (max-width: 640px) {
		.title {
			@apply flex flex-col items-baseline gap-0;
		}
	}
</style>