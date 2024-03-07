<script setup>
import AvatarCircle from "@/components/AvatarCircle.vue";

const props = defineProps({
	id: { type: String, required: false },
	name: { type: String, required: false },
	username: { type: String, required: true },
	operator: { type: Boolean, required: false },
	avatar: { type: String, required: false },
	pending: { type: Boolean, default: false },
});

defineEmits(["checked"]);
</script>

<template>
    <div class="card" tabindex="0">
		<AvatarCircle :id="props.id" :force-fallback="props.avatar === null" :name="props.username" :avatar="props.avatar" debug="userDisp" />
		<div class="content select-none">
			<div class="title">
				<p class="text-lg font-bold flex-1">
					{{ props.username }} <span class="font-normal text-gray-500">({{ props.username }})</span>
				</p>
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