<script setup>
import { onMounted, ref, computed } from "vue";
import API from "@/utils/apiWrapper";
import { useLocalUserStore } from "@/stores/localUser";
import AvatarCircle from "@/components/AvatarCircle.vue";
import config from "@/../config";


const app_name = config.app_name;
const notifPermCheckboxInput = ref(null);

const tryNotificationPermission = async () => {
	if (!("Notification" in window)) {
		console.error("This browser does not support desktop notification");
		return;
	}

	if (Notification.permission === "granted") {
		return;
	}

	if (Notification.permission !== "denied") {
		const permission = await Notification.requestPermission();
		if (permission === "granted") {
			return;
		}
	}
};

const onSettingsRoute = computed(() => {
	if(router.currentRoute.value.path === "/dashboard") {
		changeTitle(onTitleRoute.value);
	}
	return router.currentRoute.value.path === "/dashboard";
});

const localUserStore = useLocalUserStore();

const filePicker = ref(null);

const isPasswordChanging = ref(false);
const passwordFields = ref({
	currentPassword: "",
	newPassword: "",
	confirmNewPassword: "",
});

const signOutAllFields = ref({
	currentPassword: "",
});

const changePassword = async () => {
	if (isPasswordChanging.value) return;
	isPasswordChanging.value = true;

	if (
		passwordFields.value.newPassword !== passwordFields.value.confirmNewPassword ||
		passwordFields.value.newPassword === "" || passwordFields.value.currentPassword === "" ||
		passwordFields.value.confirmNewPassword === ""
	) {
		isPasswordChanging.value = false;
		return;
	}


	try {
		await API.fireServer("/api/v1/users/password", {
			method: "POST",
			body: JSON.stringify({
				currentPassword: passwordFields.value.currentPassword,
				password: passwordFields.value.newPassword,
			}),
		});
	} catch (e) {
		console.error(e);
	}

	isPasswordChanging.value = false;
};

const signOutAll = async () => {
	try {
		const res = await API.fireServer("/api/v1/session/end_all", {
			method: "POST",
			body: JSON.stringify({
				password: signOutAllFields.value.currentPassword,
			}),
		});

		if (res.ok) {
			localStorage.clear();
			window.location.reload();
		}
	} catch (e) {
		console.error(e);
	}
};

const uploadImage = async () => {
	const file = filePicker.value.files[0];
	const formData = new FormData();
	formData.append("image", file);

	try {
		const res = await API.fireServer(`/api/v1/avatars/${localUserStore.user.id}`, {
			method: "POST",
			body: formData,
			headers: {
				"Content-Type": false,
			},
		});

		localUserStore.user.avatar = localUserStore.user.avatar + "?t=" + Date.now();
	} catch (e) {
		console.error(e);
	}
};

const removingAvatar = ref(false);
const removeAvatar = async () => {
	if (removingAvatar.value) return;
	removingAvatar.value = true;
	try {
		const res = await API.fireServer(`/api/v1/avatars/${localUserStore.user.id}`, {
			method: "DELETE",
			body: JSON.stringify({}),
		});

		localUserStore.user.avatar = null;
		removingAvatar.value = false;
	} catch (e) {
		console.error(e);
	}
};


const saveTheme = () => {
	const theme = document.getElementById("theme-select").value;
	localStorage.setItem("theme", theme);
	refreshTheme();
};

const refreshTheme = () => {
	const actualTheme = localStorage.getItem("theme");
	if (actualTheme === "Dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
};

const swapLanguage = () => {
	const currentLang = localStorage.getItem("lang");
	if (currentLang === "en") {
		

	} else {
		localStorage.setItem("lang", "en");
	}
};

onMounted(async () => {	
	await localUserStore.init();

	notifPermCheckboxInput.value.checked = Notification.permission === "granted";

	document.title = `${t('dashboard.settings.title')} - ` + app_name;

	// reload theme
	refreshTheme();
});

</script>

<template>
	<div class="w-full p-6">
		<h1 class="text-2xl font-bold">
			{{ $t("dashboard.settings.title") }}
		</h1>

		<div class="divider my-4"></div>

		<h2 class="text-xl font-bold">{{ $t("dashboard.notifications.title") }}</h2>

		<div class="flex flex-col gap-4 mb-4 mt-2">
			<div class="flex flex-box items-center">
				<h3>{{ $t("dashboard.settings.notifications.toggleNotifs") }} &nbsp;</h3>
				<input ref="notifPermCheckboxInput" type="checkbox" class="toggle" checked @change="tryNotificationPermission" />
			</div>
		</div>

		<h2 class="text-xl font-bold">{{ $t("dashboard.settings.profile.profilePicture") }}</h2>

		<div class="flex flex-col gap-4 mt-4">
			<div class="flex gap-4 items-center">
				<AvatarCircle :id="localUserStore.user.id" :avatar="localUserStore.user.avatar"/>
				<button
					:class="removingAvatar || localUserStore.user.avatar === null ? 'btn btn-error max-w-64 btn-disabled' : 'btn btn-error max-w-64'"
					@click="removeAvatar()"
				>
					<span class="loading loading-spinner loading-md" v-if="removingAvatar"></span>
					<i v-else class="bi bi-trash text-xl"></i>
					{{ $t("dashboard.settings.profile.remove") }}
				</button>
			</div>

			<label for="dropzone-file" class="flex flex-col items-center justify-center w-64 max-w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
				<div class="flex flex-col items-center justify-center pt-5 pb-6">
					<i class="bi bi-cloud-upload text-4xl"></i>
					<p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">{{ $t("dashboard.settings.profile.clickToUpload") }}</span></p>
					<p class="text-xs text-gray-500 dark:text-gray-400">{{ $t("dashboard.settings.profile.uploadDesc") }}</p>
				</div>
				<input ref="filePicker" id="dropzone-file" type="file" class="hidden" accept="image/gif, image/png, image/jpeg" @change="uploadImage()"/>
			</label>
		</div>

		<h2 class="text-xl font-bold mt-8">
			{{ $t("dashboard.settings.theme.title") }}
		</h2>

		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<label for="theme-select" class="text-sm font-semibold">{{ $t("dashboard.settings.theme.select") }}</label>
				<select id="theme-select" class="select select-bordered max-w-64" @change="saveTheme()" v-model="theme">
					<option value="Light">{{ $t("dashboard.settings.theme.light") }}</option>
					<option value="Dark">{{ $t("dashboard.settings.theme.dark") }}</option>
				</select>
			</div>
		</div>

		<button class="btn btn-primary max-w-32 mt-4" @click="saveTheme()">
			{{ $t("dashboard.settings.theme.save") }}
		</button>

		<h2 class="text-xl font-bold mt-4">
			{{ $t("dashboard.settings.user.password") }}
		</h2>

		<div class="flex flex-col gap-4">
			<input
				type="password"
				:placeholder="$t('dashboard.settings.user.currentPassword')"
				class="input input-sm input-bordered my-2 max-w-64"
				v-model="passwordFields.currentPassword"
			/>
			<input
				type="password"
				:placeholder="$t('dashboard.settings.user.newPassword')"
				class="input input-sm input-bordered my-2 max-w-64"
				v-model="passwordFields.newPassword"
			/>
			<input
				type="password"
				:placeholder="$t('dashboard.settings.user.confirmNewPassword')"
				class="input input-sm input-bordered my-2 max-w-64"
				v-model="passwordFields.confirmNewPassword"
			/>

			<button
				:class="isPasswordChanging ? 'btn btn-primary max-w-48 btn-disabled' : 'btn btn-primary max-w-48'"
				@click="changePassword();"
			>
				<span class="loading loading-spinner loading-md" v-if="isPasswordChanging"></span>
				{{ $t("dashboard.settings.user.changePassword") }}
			</button>
		</div>

		<h2 class="text-xl font-bold mt-8">
			{{ $t("dashboard.settings.language.title") }}
		</h2>
		<p class="mb-4">
			{{ $t("dashboard.settings.language.description") }}
		</p>
		<div class="flex flex-col gap-4 mb-4 mt-2">
			<select v-model="$i18next.language" class="select select-bordered max-w-64" @change="$i18next.changeLanguage($i18next.language)">
				<option v-for="locale in $i18next.languages" :key="`locale-${locale}`" :value="locale">
					{{ $t("dashboard.settings.language." + locale) }}
				</option>
			</select>
		</div>

		<h2 class="text-xl font-bold mt-8">
			{{ $t("dashboard.settings.session.title") }}
		</h2>

		<div class="flex flex-col gap-4">
			<p>
				{{$t("dashboard.settings.session.sessionsSignout.description")}}
			</p>
			<input
				type="password"
				:placeholder="$t('dashboard.settings.user.currentPassword')"
				class="input input-sm input-bordered my-2 max-w-64"
				v-model="signOutAllFields.currentPassword"
			/>
			<button
				class="btn btn-error max-w-32"
				@click="signOutAll();"
			>
				{{ $t("dashboard.settings.session.sessionsSignout.signOut") }}
			</button>
		</div>
	</div>
</template>