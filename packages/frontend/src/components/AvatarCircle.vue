<script setup>
import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import { ref, watch, computed, onMounted } from "vue";
import config from "@/../config";

const lastAvatar = ref(null);

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
	avatar: {
		type: String,
		default: null,
	},
});

const url = ref(null);
const loading = ref(true);

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


onMounted(async () => {
	if(props.avatar) {
		url.value = `${baseUrl}/api/v1/avatars/${props.id}`;
		loading.value = false;
	} else {
		url.value = `${baseUrl}/api/v1/avatars/null`;
		loading.value = false;
	}
});


</script>

<template>

<div v-if="!loading" class="avatar placeholder">
	<div
		:class="showPlaceholderInstead ? 'bg-neutral text-neutral-content rounded-full w-12' : 'rounded-full w-12'"
	>
		<img
			v-if="props"
			:src="hasChangedOnce ? `${url}?t=${timestamp}` : `${url}`"
		/>
		<span v-else class="select-none">
			{{ usedName ? usedName.split(' ').map((item) => item.charAt(0)).join('').toUpperCase() : '?' }}
		</span>
	</div>
</div>

</template>