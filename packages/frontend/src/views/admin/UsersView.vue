<script setup>
import { computed, onMounted, ref } from "vue";
import { Schedule } from "@/utils/rschedule.js";
import { useRouter } from "vue-router";
import { useLocalUserStore } from "@/stores/localUser";
import API from "@/utils/apiWrapper";

import UserDisp from "@/components/UserDisp.vue";
import CustomDialog from "@/components/CustomDialog.vue";
import AvatarCircle from "@/components/AvatarCircle.vue";
import AvatarUploader from "@/components/AvatarUploader.vue";

const localUserStore = useLocalUserStore();
const router = useRouter();

if (localUserStore.user.operator === false) {
	router.replace("/dashboard");
}

// data
const users = ref([]); 						// the list of users from the server
const selectedUser = ref(null); 			// the user selected for the editor
const diffedSelectedUser = ref(null); 		// the user selected for the editor, but with the changes made. it is compared to the original user to see if it has changed
const passwordFields = ref({ 				// the password fields for the reset password dialog
	newPassword: "",
	confirmNewPassword: "",
});

// control variables
const isLoaded = ref(false); 				// general loading state. controls the user list display
const hasEditorLoaded = ref(false); 		// whether the editor has loaded
const isEditorSaving = ref(false); 			// whether changes are being uploaded to the server
const isResettingPassword = ref(false); 	// whether a password is being reset
const isDeletingUser = ref(false); 			// whether a user is being deleted

// template refs
const editorRef = ref(null); 				// the editor component
const avatarUploaderRef = ref(null); 		// the avatar uploader component
const resetPasswordDialogRef = ref(null); 	// the reset password dialog component
const deleteUserDialogRef = ref(null); 		// the delete user dialog component
const scheduleEditorRef = ref(null); 		// the schedule editor component. it is too large to fit in the editor, so it is in a separate dialog


const isScheduleValid = computed(() => { 	// controls the UI of the schedule editor and form sending
	if (
		diffedSelectedUser.value?.schedule === null ||
		diffedSelectedUser.value?.schedule === undefined ||
		diffedSelectedUser.value?.schedule === ""
	) return false;

	// if there is a schedule, we need to now try to pass it to rschedule. if this doesnt throw an error, then the schedule is valid
	try {
		new Schedule(JSON.parse(diffedSelectedUser.value.schedule));
	} catch (e) {
		return false;
	}

	return true;
});

const openEditor = () => {
	selectedUser.value = JSON.parse(JSON.stringify(selectedUser.value));
	diffedSelectedUser.value = JSON.parse(JSON.stringify(selectedUser.value));

	hasEditorLoaded.value = true;
	editorRef.value.show();
};

const closeEditorAndSave = async () => {
	if (isEditorSaving.value) return;
	isEditorSaving.value = true;

	const res = await API.fireServer(`/api/v1/users/${diffedSelectedUser.value.id}`, {
		method: "PATCH",
		body: JSON.stringify({
			name: diffedSelectedUser.value.name,
			username: diffedSelectedUser.value.username,
			operator: diffedSelectedUser.value.operator,
		}),
	});

	res.data = await res.json();

	if (res.status === 200) {
		await loadList();
	} else {
		console.error(res);
	}

	isEditorSaving.value = false;

	// this forcefully closes the dialog
	editorRef.value.hide(true);
};

const resetPassword = async () => {
	if (isResettingPassword.value) return;
	isResettingPassword.value = true;

	if (
		passwordFields.value.newPassword !== passwordFields.value.confirmNewPassword ||
		passwordFields.value.newPassword === ""
	) {
		isResettingPassword.value = false;
		return;
	}

	const res = await API.fireServer(`/api/v1/users/${diffedSelectedUser.value.id}`, {
		method: "PATCH",
		body: JSON.stringify({
			password: passwordFields.value.newPassword,
		}),
	});

	res.data = await res.json();

	if (res.status === 200) {
		await loadList();
	} else {
		console.error(res);
	}

	isResettingPassword.value = false;

	// this forcefully closes the dialog
	resetPasswordDialogRef.value.hide(true);
};

const deleteUser = async () => {
	if (isDeletingUser.value) return;
	isDeletingUser.value = true;
	const res = await API.fireServer(`/api/v1/users/${diffedSelectedUser.value.id}`, {
		method: "DELETE",
		body: JSON.stringify({}),
	});

	res.data = await res.json();

	if (res.status === 200) {
		await loadList();
	} else {
		console.error(res);
	}

	isDeletingUser.value = false;
	deleteUserDialogRef.value.hide(true);
};

const loadList = async () => {
	const res = await API.fireServer("/api/v1/users/list", {
		method: "GET",
	});

	res.data = await res.json();

	users.value = res.data.users;
};

onMounted(async () => {
	await loadList();
	isLoaded.value = true;
});
</script>

<template>
	<Teleport to="#dash">
		<!-- Editor -->
		<CustomDialog
			ref="editorRef"
			confirm-name="Save"
			cancel-name="Cancel"
			@cancel="editorRef.hide()"
			@confirm="closeEditorAndSave();"
			:confirm-locked="isEditorSaving"
		>
			<template #title>
				Editing "{{ diffedSelectedUser?.name }}"
			</template>
			<template #content>
				<AvatarUploader
					:target="diffedSelectedUser?.id || '0'"
					class="hidden"
					ref="avatarUploaderRef"

					@upload="diffedSelectedUser.avatar = true; loadList();"
				/>
				<div class="flex flex-col" v-if="hasEditorLoaded">

					<div class="flex gap-1 flex-wrap justify-center">
						<button
							class="btn btn-sm btn-primary"
							@click="avatarUploaderRef.clickFilePicker();"
						>
							Change Avatar
						</button>
						<button
							:class="!diffedSelectedUser?.avatar ? 'btn btn-sm btn-disabled' : 'btn btn-sm btn-error'"
							@click="avatarUploaderRef.removeAvatar(); diffedSelectedUser.avatar = false;"
						>
							Remove Avatar
						</button>
						<button
							class="btn btn-sm btn-warning"
							@click="editorRef.hide(); resetPasswordDialogRef.show();"
						>
							Reset Password
						</button>
						<button
							class="btn btn-sm btn-error btn-outline hover:bg-red-500 hover:text-white"
							@click="
								editorRef.hide();
								deleteUserDialogRef.show();
							"
						>
							Delete user
						</button>
					</div>

					<div class="divider"></div>

					<div class="flex gap-4">
						<AvatarCircle
							:force-fallback="diffedSelectedUser?.avatar === null"
							:name="diffedSelectedUser?.name"
							:id="diffedSelectedUser?.id"
							class="w-12 h-12"
						/>
						<div class="flex flex-col gap-2">
							<div class="flex flex-col gap-1">
								<label for="name" class="text-sm">
									Name
								</label>
								<div class="flex items-center gap-2">
									<input
									type="text"
									class="input input-bordered input-sm"
									v-model="diffedSelectedUser.name"
									/>
									<div
										class="badge badge-info gap-2"
										v-if="diffedSelectedUser.name !== selectedUser.name"
									>
										Modified
									</div>
								</div>
							</div>
							<div class="flex flex-col gap-1">
								<label for="username" class="text-sm">
									Username
								</label>
								<div class="flex items-center gap-2">
									<input
									type="text"
									class="input input-bordered input-sm"
									v-model="diffedSelectedUser.username"
									/>
									<div
										class="badge badge-info gap-2"
										v-if="diffedSelectedUser.username !== selectedUser.username"
									>
										Modified
									</div>
								</div>
							</div>
							<div class="flex flex-col gap-1">
								<label for="operator" class="text-sm">
									Operator
								</label>
								<div class="flex items-center gap-2">
									<input
									type="checkbox"
									class="toggle"
									v-model="diffedSelectedUser.operator"
									/>
									<div
										class="badge badge-info gap-2"
										v-if="diffedSelectedUser.operator !== selectedUser.operator"
									>
										Modified
									</div>
								</div>
							</div>
						</div>

					</div>

					<button
						class="btn btn-sm btn-primary mt-4"
						@click="editorRef.hide(); scheduleEditorRef.show();"
					>
						Edit attendance schedule
					</button>
				</div>
			</template>
		</CustomDialog>

		<!-- Reset password dialog -->
		<CustomDialog
			ref="resetPasswordDialogRef"
			confirm-name="Reset"
			cancel-name="Cancel"
			@cancel="resetPasswordDialogRef.hide(); editorRef.show();"
			@confirm="resetPassword();"
			:confirm-locked="isResettingPassword"
		>
			<template #title>
				Resetting password for "{{ diffedSelectedUser?.name }}"
			</template>
			<template #content>
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<label for="newPassword" class="text-sm">
							New password
						</label>
						<input
							type="password"
							class="input input-bordered input-sm"
							v-model="passwordFields.newPassword"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label for="confirmNewPassword" class="text-sm">
							Confirm new password
						</label>
						<input
							type="password"
							class="input input-bordered input-sm"
							v-model="passwordFields.confirmNewPassword"
						/>
					</div>
				</div>
			</template>
		</CustomDialog>

		<!-- Delete user dialog -->
		<CustomDialog
			ref="deleteUserDialogRef"
			confirm-name="Delete"
			cancel-name="Cancel"
			@cancel="deleteUserDialogRef.hide(); editorRef.show();"
			@confirm="deleteUser();"
			:confirm-locked="isDeletingUser"
		>
			<template #title>
				Delete "{{ diffedSelectedUser?.name }}"
			</template>
			<template #content>
				<div class="flex flex-col gap-4">
					<p>
						Are you sure you want to delete this user? All of their data will be lost.
					</p>
					<p>
						This action cannot be undone.
					</p>
				</div>
			</template>
		</CustomDialog>

		<!-- Schedule editor -->
		<CustomDialog
			ref="scheduleEditorRef"
			confirm-name="Save"
			cancel-name="Cancel"
			@confirm="scheduleEditorRef.hide(); editorRef.show();"
			@cancel="scheduleEditorRef.hide(); editorRef.show();"
		>
			<template #title>
				Schedule
			</template>

			<template #content>
				<div class="flex flex-col gap-2">
					<div class="alert alert-success" v-if="isScheduleValid">
						<i class="bi bi-check-circle-fill"></i>
						<p>
							This schedule is valid. If changes were made, they will be uploaded to the server.
						</p>
					</div>
					<div class="alert alert-error" v-else>
						<i class="bi bi-exclamation-triangle-fill"></i>
						<p>
							This schedule is not valid. Changes will not be saved.
						</p>
					</div>
					<div class="divider m-0.5"></div>
					<div class="flex flex-col gap-4 md:grid md:grid-cols-3 md:min-w-[30rem]">
						<div class="flex flex-col gap-0.5">
							<h3>Monday</h3>
							<div class="flex flex-col gap-0.5">
								<label class="text-sm">
									Start time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
								<label class="text-sm">
									End time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
							</div>
						</div>
						<div class="flex flex-col gap-0.5">
							<h3>Tuesday</h3>
							<div class="flex flex-col gap-0.5">
								<label class="text-sm">
									Start time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
								<label class="text-sm">
									End time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
							</div>
						</div>
						<div class="flex flex-col gap-0.5">
							<h3>Wednesday</h3>
							<div class="flex flex-col gap-0.5">
								<label class="text-sm">
									Start time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
								<label class="text-sm">
									End time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
							</div>
						</div>
						<div class="flex flex-col gap-0.5">
							<h3>Thursday</h3>
							<div class="flex flex-col gap-0.5">
								<label class="text-sm">
									Start time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
								<label class="text-sm">
									End time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
							</div>
						</div>
						<div class="flex flex-col gap-0.5">
							<h3>Friday</h3>
							<div class="flex flex-col gap-0.5">
								<label class="text-sm">
									Start time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
								<label class="text-sm">
									End time
								</label>
								<input
									type="time"
									class="input input-bordered input-sm"
								/>
							</div>
						</div>
					</div>
				</div>
			</template>
		</CustomDialog>
	</Teleport>

	<div class="flex flex-col gap-4">
		<h2>
			Click on a user to edit them.
		</h2>
		<div v-if="!isLoaded" class="flex flex-col items-center gap-2">
			<span class="loading loading-spinner"></span>
			<p>
				Getting the latest data...
			</p>
		</div>
		<div v-else-if="users.length === 0">
			<p>
				No users found.
			</p>
		</div>
		<UserDisp
			v-for="user in users"
			v-else
			:key="user.id"
			:id="user.id"
			:name="user.name"
			:username="user.username"
			:avatar="user.avatar"
			:operator="user.operator"

			@click="selectedUser = user; openEditor();"
		/>
	</div>
</template>