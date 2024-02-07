<script setup>
const props = defineProps({
	name: { type: String, required: true },
	details: { type: String, required: false, default: null },
	complete: { type: Boolean, required: false, default: false },
});

defineEmits(["checked"]);
</script>

<template>
    <div class="card bg-base-200" tabindex="0">
		<input type="checkbox" :checked="props.complete" class="checkbox checkbox-lg" @click.prevent.stop="$emit('checked', $event)" />
		<div class="content select-none">
			<div class="title">
				<p class="text-lg font-bold flex-1">
					{{ props.name }}
				</p>
			</div>
			<p>
				{{ props.details.length > 500 ? props.details.slice(0, 500) + '...' : props.details }}
			</p>
		</div>
    </div>
</template>

<style scoped>
	.card {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1rem;
	}

	.content {
		width: 100%;
	}

	.checkbox {
		scale: 1.5;
	}

	.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}

	@media (max-width: 640px) {
		.title {
			flex-direction: column;
			align-items: baseline;
			gap: 0rem;
		}
	}
</style>