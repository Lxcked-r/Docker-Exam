<script setup>
import AvatarCircle from "@/components/AvatarCircle.vue";
import { defineProps } from "vue";

const props = defineProps({
	id: { type: String, required: true },
	name: { type: String, required: true },
    notifs: { type: Number, required: false, default: 0 },
	avatar: { type: String, required: false, default: null },
});
</script>

<template>
    <div class="card" tabindex="0">
		<AvatarCircle
			:id="props.id"
			:force-fallback="props.avatar === null"
			:name="props.name"
			:avatar="props.avatar"
			size-override="w-10"
		/>
		<div class="content select-none">
			<div class="title">
                {{ props.name }}
            </div>
		</div>
    </div>
</template>

<style scoped>
	.card {
		@apply flex flex-row items-center gap-1 w-full p-2;
		@apply cursor-pointer;
		@apply transition-all;
		@apply bg-base-200;
		@apply hover:bg-base-100;
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