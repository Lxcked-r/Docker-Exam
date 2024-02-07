<script setup>
import { ref } from "vue";

const props = defineProps({
	easyCancel: { type: Boolean, default: true },
	confirmName: { type: String },
	confirmLocked: { type: Boolean, default: false },
	cancelName: { type: String },
	isAcknowledgement: { type: Boolean, default: false },
});

const emit = defineEmits(["confirm", "cancel"]);

// Shows the dialog.
const show = async () => {
	hostRef.value.classList.add("shown");
	dialogRef.value.classList.add("shown");
};

// Hides the dialog.
const hide = async (bypass = false) => {
	if (props.confirmLocked && !bypass) {
		return;
	}

	hostRef.value.classList.remove("shown");
	dialogRef.value.classList.remove("shown");
};

// template refs
const hostRef = ref(null);
const dialogRef = ref(null);
// template refs

// This wraps the hide() function to allow or prevent dismissing
// the dialog when the user clicks outside of it.
const doEasyCancel = async () => {
	if (props.isAcknowledgement) {
		hide();
		emit("confirm");
		return;
	}

	if (props.easyCancel) {
		hide();
		emit("cancel");
	}
};

defineExpose({
	show,
	hide,
});
</script>

<template>
	<div
		class="host"
		ref="hostRef"
		@click="doEasyCancel()"
	>
		<div class="dialog bg-base-100" ref="dialogRef" @click.stop="null">
			<h1 class="text-2xl">
				<slot name="title"></slot>
			</h1>
			<div class="py-4">
				<slot name="content"></slot>
			</div>
			<div class="flex flex-row gap-2 justify-center">
				<button :class="confirmLocked ? 'btn btn-primary btn-disabled' : 'btn btn-primary'"
					@click="emit('confirm');"
				>
					<span class="loading loading-spinner" v-if="confirmLocked"></span>
					{{ props.confirmName }}
				</button>
				<button class="btn"
					v-if="!isAcknowledgement"
					@click="emit('cancel');"
				>
					{{ props.cancelName }}
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.host {
		opacity: 0;

		position: absolute;
		height: 100%;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 99999;

		display: flex;
		align-items: center;
		justify-content: center;

		transition: opacity 0.1s ease-out;

		pointer-events: none;
	}

	.dialog {
		padding: 1rem;
		margin: 1rem;
		border-radius: 1rem;
		scale: 0.9;

		max-width: 95%;
		max-height: 95%;

		overflow: auto;

		transition: scale 0.1s ease-out;
	}

	.host.shown {
		opacity: 1;
		pointer-events: all;
	}
	.dialog.shown {
		scale: 1;
		pointer-events: all;
	}
</style>