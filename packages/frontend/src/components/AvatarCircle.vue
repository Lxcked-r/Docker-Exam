<script setup>
import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import { ref, watch, computed } from "vue";
import config from "@/../config";

const props = defineProps({
	id: {
		type: String,
		default: null,
	},
	forceFallback: {
		type: Boolean,
		default: false,
	},
	name: {
		type: String,
		default: null,
	},
});


const localUserStore = useLocalUserStore();
const sessionStateStore = useSessionStateStore();
const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

const timestamp = ref(Date.now());
const hasChangedOnce = ref(false);

const usedId = computed(() => {
	if (props.id) {
		return props.id;
	} else {
		return localUserStore.user.id;
	}
});

const usedName = computed(() => {
	if (props.name) {
		return props.name;
	}
});

const showPlaceholderInstead = computed(() => {
	return !localUserStore.user.avatar || sessionStateStore.isOffline || props.forceFallback;
});

// watch the value of localUserStore.user.avatar. if it changes, append a timestamp to the end of the url to force a refresh
// we only want to refresh the image when it has changed from its previous value to avoid cache issues
watch(() => localUserStore.user.avatar, () => {
	hasChangedOnce.value = true;
	timestamp.value = Date.now();
});


</script>

<template>
<div class="avatar placeholder">
	<div
		:class="showPlaceholderInstead ? 'bg-neutral text-neutral-content rounded-full w-12' : 'rounded-full w-12'"
	>
		<img
			v-if="localUserStore.user.avatar && !sessionStateStore.isOffline && !forceFallback" class="select-none"
			:src="hasChangedOnce ? `${baseUrl}/api/v1/avatars/${usedId}?t=${timestamp}` : `${baseUrl}/api/v1/avatars/${usedId}`"
		/>
		<span v-else class="select-none">
			{{ usedName ? usedName.split(' ').map((item) => item.charAt(0)).join('').toUpperCase() : '?' }}
		</span>
	</div>
</div>

</template>