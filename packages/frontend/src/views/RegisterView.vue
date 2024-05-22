<script setup>


import { ref } from "vue";
import API from "@/utils/apiWrapper";
import { useRouter } from "vue-router";

import CustomDialog from "@/components/CustomDialog.vue";

const router = useRouter();

const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");

const isLoading = ref(false);

const errorText = ref("Please enter a username and password.");

const dialog = ref(null);


const tryPasswordFields = () => {
    if (password.value !== confirmPassword.value) {
        errorText.value = "Passwords do not match.";
        dialog.value.show();
        return false;
    }
    if (password.value === "" || confirmPassword.value === "") {
        errorText.value = "Please enter email, username and password.";
        dialog.value.show();
        return false;
    } else {
        return true;
    
    }
}


const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const register = async () => {
    if(!tryPasswordFields()) {
        return;
    }

    if(!validateEmail(email.value)) {
        errorText.value = "Please enter a valid email.";
        dialog.value.show();
        return;
    }

    const response = await API.fireServer("/api/v1/users/create", {
        method: "POST",
        body: JSON.stringify({
            email: email.value,
            name: username.value,
            username: username.value,
            password: password.value,
            operator: false
        }),
    });

    response.data = await response.json();

    if (response.status === 200) {
        const loginRes = await API.fireServer("/api/v1/session/begin", {
            method: "POST",
            body: JSON.stringify({
                username: username.value,
                password: password.value,
            }),
        });

        if(!loginRes.ok) {
            errorText.value = "Failed to log in.";
            dialog.value.show();
            isLoading.value = false;
            return;
        }
        const response = await loginRes.json();

        API.setToken(response.token);
        router.push("/dashboard");
        isLoading.value = false;
        return;
    }

}

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
		<h1 class="text-2xl font-bold">Register</h1>
        <input class="input input-bordered" type="text" placeholder="email" v-model="email" />
		<input class="input input-bordered w-full max-w-xs" type="text" placeholder="Username" v-model="username" />
		<input ref="" class="input input-bordered w-full max-w-xs" type="password" placeholder="Password" v-model="password" />
        <input class="input input-bordered w-full max-w-xs" type="password" placeholder="Confirm Password" v-model="confirmPassword" />
		<button
			:class="isLoading ? 'btn btn-disabled btn-sm' : 'btn btn-primary btn-sm'"
			@click="register"
		>
			<span
				class="loading loading-spinner loading-md"
				v-if="isLoading"
			>
			</span>
			Register
		</button>
		</div>
	</div>
</template>