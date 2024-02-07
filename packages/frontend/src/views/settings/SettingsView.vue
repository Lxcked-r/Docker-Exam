<script setup>
import { ref, inject } from "vue";
import API from "@/utils/apiWrapper";
import { useLocalUserStore } from "@/stores/localUser";
import AvatarCircle from "@/components/AvatarCircle.vue";
import AvatarUploader from "@/components/AvatarUploader.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const notify = inject("notify");

const localUserStore = useLocalUserStore();

const avatarUploader = ref(null);

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
	notify({
		title: "Password changed",
		body: "Your password has been changed successfully.",
		icon: "bi bi-check-circle",
		level: "success",
		timeout: 5000,
	});
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

const removingAvatar = ref(false);
</script>

<template>
	<div class="w-full p-6">
		<h1 class="text-2xl font-bold">
			<i
				class="bi bi-arrow-left-short text-2xl"
				@click="router.back()"
			></i>
			Settings
		</h1>

		<div class="divider my-4"></div>

		<h2 class="text-xl font-bold">Profile Picture</h2>

		<div class="flex flex-col gap-4 mt-4">
			<div class="flex gap-4 items-center">
				<AvatarCircle />
				<button
					:class="removingAvatar || localUserStore.user.avatar === null ? 'btn btn-error max-w-32 btn-disabled' : 'btn btn-error max-w-32'"
					@click="avatarUploader.removeAvatar()"
				>
					<span class="loading loading-spinner loading-md" v-if="removingAvatar"></span>
					<i v-else class="bi bi-trash text-xl"></i>
					Remove
				</button>
			</div>

			<AvatarUploader
				ref="avatarUploader"
				:target="localUserStore.user.id"
			/>
		</div>

		<h2 class="text-xl font-bold mt-4">
			Password
		</h2>

		<div class="flex flex-col gap-4">
			<input
				type="password"
				placeholder="Current password"
				class="input input-sm input-bordered my-2 max-w-64"
				v-model="passwordFields.currentPassword"
			/>
			<input
				type="password"
				placeholder="New password"
				class="input input-sm input-bordered my-2 max-w-64"
				v-model="passwordFields.newPassword"
			/>
			<input
				type="password"
				placeholder="Confirm new password"
				class="input input-sm input-bordered my-2 max-w-64"
				v-model="passwordFields.confirmNewPassword"
			/>

			<button
				:class="isPasswordChanging ? 'btn btn-primary max-w-48 btn-disabled' : 'btn btn-primary max-w-48'"
				@click="changePassword();"
			>
				<span class="loading loading-spinner loading-md" v-if="isPasswordChanging"></span>
				Change password
			</button>
		</div>

		<h2 class="text-xl font-bold mt-8">
			Sessions
		</h2>

		<div class="flex flex-col gap-4">
			<p>
				Click this button to sign out of all other sessions.<br>
				You'll need to sign in again on your other devices.
			</p>
			<input
				type="password"
				placeholder="Current password"
				class="input input-sm input-bordered my-2 max-w-64"
				v-model="signOutAllFields.currentPassword"
			/>
			<button
				class="btn btn-error max-w-32"
				@click="signOutAll();"
			>
				Sign out
			</button>
		</div>
	</div>
</template>