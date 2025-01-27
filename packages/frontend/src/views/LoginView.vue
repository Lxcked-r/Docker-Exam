<script setup>
import { ref, onMounted } from "vue";
import API from "@/utils/apiWrapper";
import { useRouter } from "vue-router";

import CustomDialog from "@/components/CustomDialog.vue";

import config from "@/../config";

const app_name = config.app_name;

const router = useRouter();

const username = ref("");
const password = ref("");
const isLoading = ref(false);

const errorText = ref("Please enter a username and password.");

const dialog = ref(null);

// Try to log the user in.
// If the session was created, redirect them to the dashboard.
const login = async () => {
	if (isLoading.value) return;
	isLoading.value = true;

	errorText.value = "Please enter a username and password.";

	if (
		username.value === "" ||
		password.value === "" ||
		username.value === undefined ||
		password.value === undefined
	) {
		dialog.value.show();
		return;
	}

	const response = await API.fireServer("/api/v1/session/begin", {
		method: "POST",
		body: JSON.stringify({
			username: username.value,
			password: password.value,
		}),
	});

	response.data = await response.json();

	if (response.status === 200) {
		API.setToken(response.data.token);
		router.push("/dashboard");
		isLoading.value = false;
		return;
	}

	if (!response.ok) {
		errorText.value = "Invalid username or password.";
		dialog.value.show();
		isLoading.value = false;
	}
};

onMounted(() => {
	document.title = `Login - ${app_name} `;
});

</script>

<template>
	<CustomDialog
		:easy-cancel="false"
		:is-acknowledgement="true"
		:confirm-name="'OK'"
		ref="dialog"

		@confirm="dialog.hide()"
		>
			<template #title>
				Error
			</template>
			<template #content>
				{{ errorText }}
			</template>
	</CustomDialog>

	<div class="h-screen w-screen flex flex-col justify-center items-center">
		<div class="p-2 bg-primary-300 flex flex-col gap-4">
			<h1 class="text-2xl font-bold">Login</h1>
			<input class="input input-bordered w-full max-w-xs" type="text" placeholder="Username" v-model="username" />
			<input class="input input-bordered w-full max-w-xs" type="password" placeholder="Password" v-model="password" />
			<button type="submit"
				:class="isLoading ? 'btn btn-disabled btn-sm' : 'btn btn-primary btn-sm'"
				@click="login"
			>
				<span
					class="loading loading-spinner loading-md"
					v-if="isLoading"
				>
				</span>
				Login
			</button>
		</div>
		<div>
			Dont have an account? <router-link to="/register">Register</router-link>
		</div>
		<div>
			<router-link to="/forgot-password">Forgot Password</router-link>
		</div>
	</div>
</template>
