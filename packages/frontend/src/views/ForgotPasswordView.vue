<script setup>
import { ref, onMounted } from "vue";
import API from "@/utils/apiWrapper";
import { useRouter } from "vue-router";

import CustomDialog from "@/components/CustomDialog.vue";

import config from "@/../config";

const app_name = config.app_name;

const router = useRouter();

const email = ref("");
const isLoading = ref(false);

const errorText = ref("Please enter your email address.");

const dialog = ref(null);

// Try to send the user a password reset email.

const forgotPassword = async () => {
    if (isLoading.value) return;
    isLoading.value = true;

    errorText.value = "Please enter your email address.";

    if (email.value === "" || email.value === undefined) {
        dialog.value.show();
        return;
    }

    const response = await API.fireServer("/api/v1/session/forgot", {
        method: "POST",
        body: JSON.stringify({
            email: email.value,
        }),
    });

    response.data = await response.json();

    if (response.status === 200) {
        router.push("/login");
        isLoading.value = false;
        return;
    }

    if (!response.ok) {
        errorText.value = "Invalid email address.";
        dialog.value.show();
        isLoading.value = false;
    }
};

onMounted(() => {
    document.title = `Forgot Password - ${app_name}`;
});

</script>

<template>
    <div>
        <CustomDialog
            ref="dialog"
            title="Error"
            :text="errorText"
            @close="dialog.value.hide()"
        />
    </div>

    <div class="h-screen w-screen flex flex-col justify-center items-center">
        <label class="label">Forgot Password</label>
        <input
            type="email"
            v-model="email"
            placeholder="Email"
            class="input mt-4 form-control input input-bordered"
        />

        <button @click="forgotPassword" class="button mt-4 btn btn-primary">
            Send Reset Email
        </button>

        <router-link to="/login" class="button mt-4">
            Back to Login
        </router-link>
    </div>

</template>