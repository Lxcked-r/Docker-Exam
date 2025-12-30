<script setup>
import { ref } from "vue";
import API from "@/utils/apiWrapper";

import { useLocalUserStore } from "@/stores/localUser";

const props = defineProps({
	target: {
		type: String,
		required: true,
	},
});


const localUserStore = useLocalUserStore();

const filePicker = ref(null);


const uploadImage = async () => {
	const file = filePicker.value.files[0];
	const formData = new FormData();
	formData.append("image", file);

	try {
		await API.fireServer(`/api/v1/avatars/${props.target}`, {
			method: "POST",
			body: formData,
			headers: {
				"Content-Type": false,
			},
		});

		if (props.target === localUserStore.user.id) {
			localUserStore.user.avatar = localUserStore.user.avatar + "?t=" + Date.now();
		}

		emit("upload");
	} catch (e) {
		console.error(e);
	}
};

const removeAvatar = async () => {
	try {
		await API.fireServer(`/api/v1/avatars/${props.target}`, {
			method: "DELETE",
			body: JSON.stringify({}),
		});

		if (props.target === localUserStore.user.id) {
			localUserStore.user.avatar = null;
		}
	} catch (e) {
		console.error(e);
	}
};

const emit = defineEmits(["upload"]);

defineExpose({
	uploadImage,
	removeAvatar,
	clickFilePicker: () => {
		filePicker.value.click();
	},
});
</script>

<template>
	<label
		for="dropzone-file"
		class="flex flex-col items-center justify-center w-64 max-w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
	>
		<div class="flex flex-col items-center justify-center pt-5 pb-6">
			<i class="bi bi-cloud-upload text-4xl"></i>
			<p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
			<p class="text-xs text-gray-500 dark:text-gray-400"> PNG, JPG or GIF (max. 2 MB)</p>
		</div>
		<input ref="filePicker" id="dropzone-file" type="file" class="hidden" accept="image/gif, image/png, image/jpeg" @change="uploadImage()"/>
	</label>
</template>

<style scoped>
</style>