<script setup>
const props = defineProps({
	to: {
		type: String,
		required: true,
	},

	icon: {
		type: String,
		required: true,
	},

	text: {
		type: String,
		required: true,
	},

	styles: {
		type: String,
		default: "",
	},

	notification: {
		type: Boolean,
		default: false,
	},
});

</script>

<template>
    <RouterLink
        :to="props.to"
		class="flex"
    >
		<div
			:class="'square ' + props.styles"
		>
			<div class="notifications">
				<slot name="notification" v-if="props.notification">
					<!-- default notification tile -->
					<div class="absolute top-0 right-0">
						<i class="bi bi-bell"></i>
					</div>
				</slot>
			</div>
			<div class="text">
				<div class="absolute left-0 bottom-0 flex flex-col">
					<i :class="'bi ' + props.icon"></i>
					<p>
						{{ props.text }}
					</p>
				</div>
			</div>
		</div>
	</RouterLink>
</template>

<style scoped>
.square {
	@apply cursor-pointer;
	@apply bg-gray-300 dark:bg-gray-600;
	@apply hover:bg-gray-500 dark:hover:bg-gray-700;
	@apply hover:text-white;
	@apply rounded-lg;
	@apply p-2;
	@apply font-bold;
	@apply min-h-44;
	@apply min-w-44;
	@apply transition-all;
	@apply duration-100;
	@apply shadow-lg hover:shadow-none;
	@apply text-2xl;

	/* align the text here to the bottom left corner of the parent square div */
	@apply flex flex-col flex-1;
}

.text {
	@apply relative;
	@apply flex-1;
}

.half-v {
	@apply min-h-24;
}

.half-h {
	@apply min-w-20;
}

.notifications {
	@apply relative;
}
</style>