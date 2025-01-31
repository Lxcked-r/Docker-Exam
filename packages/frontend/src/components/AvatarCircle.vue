<script setup>
import { useLocalUserStore } from "@/stores/localUser";
import { useSessionStateStore } from "@/stores/sessionState";
import { ref, watch, computed, onMounted, onBeforeMount } from "vue";
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
	sizeOverride: {
		type: String,
		default: "w-12",
	},
	isChan: {
		type: Boolean,
		default: false,
	},
	debug: {
		type: String,
		default: null,
	},
	isOnline: {
		type: Boolean,
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

watch(() => props.avatar, () => {
	hasChangedOnce.value = true;
	gotAvatar();
});

watch(() => props.debug, () => {
	hasChangedOnce.value = true;
	gotAvatar();

});

const gotAvatar = () => {
	if(props.avatar === null)
	{
	}
	if(props.avatar && props.avatar.length >0 && props.avatar !== null) {
		url.value = `${baseUrl}/api/v1/avatars/${props.id}`;
	} else {
		url.value = `${baseUrl}/api/v1/avatars/null`;
	}
	if(props.debug)
	{
		url.value = url.value + "?debug=" + props.debug;
	}
	loading.value = false;
};

onBeforeMount(async () => {
	gotAvatar();
});

onMounted(async () => {
});


</script>

<template>

<div class="avatar placeholder gl">
	<div
		:class="'rounded-full ' + props.sizeOverride"
	>
		<img 
			v-if="props"
			:src="hasChangedOnce ? `${url}` : `${url}`"
			:class="props.id"
		/>
	</div>
</div>


</template>


<style scoped>
.gl {

	position: relative;
}

.isOnline {
	position: absolute;
	bottom: 7px;
	right: 7px;
	border-radius: 50%;
	width: 0.4rem;
	height: 0.4rem;
}

</style>