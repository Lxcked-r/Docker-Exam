<script setup>
import CustomDatalist from './CustomDatalist.vue';
import { onMounted, ref, watch } from 'vue';

const inputValue = ref('');

const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: 'Enter text'
    },
    value: {
        type: String,
        default: ''
    },
    list: {
        type: String,
        default: ''
    },
    customClass: {
        type: String,
        default: ''
    }
});

watch(() => props.value, (newValue) => {
    console.log('Input value changed:', newValue);
}, { immediate: true });

onMounted(() => {
    // Initialize inputValue with the value prop
    inputValue.value = props.value;
    console.log('Component mounted, initial value:', inputValue.value);
});

</script>

<template>
    <input
        :type="type"
        :placeholder="placeholder"
        :value="value"
        :class="customClass"
        @change="inputValue = $event.target.value"
        />
    <CustomDatalist
        v-if="list"
        :items="list"
        :search="inputValue"
        class="custom-select"
    />
</template>