<script setup>

import { ref } from 'vue';


const drag = ref(false);

const show = async () => {
    drag.value = true;
};

// Hides the dialog.
const hide = async (bypass = false) => {
    drag.value = false;
};

defineExpose({
    show,
    hide,
});

</script>

<template>
    <div style="z-index: 19999; position: absolute;" v-if="drag" id="loader" class="flex flex-col items-center justify-center opacity-50 w-[80%] h-[70%]" @dragover="drag = true" @dragleave="drag = false" @drop="drag = false">
        <div class="flex flex-col items-center justify-center w-full h-full" v-if="drag">
            <div class="flex flex-col items-center justify-center w-1/2 h-1/2 bg-gray-200 rounded-lg">
                <p class="text-2xl font-bold">Drop your file here</p>
            </div>
        </div>
    </div>
</template>