<script setup>
import API from '@/utils/apiWrapper';
import AvatarCircle from './AvatarCircle.vue';
import { onBeforeMount, onMounted, ref, watch, inject } from 'vue';
import config from "@/../config";
import { useFriendsStore } from '@/stores/friends';
import { useLocalUserStore } from '@/stores/localUser';

const localUserStore = useLocalUserStore();
const socket = inject('socket');

const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

const imgRef = ref(null);

const fileTitle = ref('');

const fileSize = ref('');

const loading = ref(false);

const friends = ref([]);

const getFile = async (id) => {
    if(id === 'undefined') return;
    if(id === 'null') return;
    if(id === null) return;
    if(id === undefined) return;
    if(id === '') return;
    const response = await API.fireServer('/api/v1/files/name/' + id, {
		method: "GET",
	});
    const jsonRes = await response.json();
    return jsonRes;
}

const validURL = (str) => {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

const downloadFile = async (id) => {
    const response = await API.fireServer('/api/v1/files/' + id, {
        method: "GET",
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileTitle.value;
    a.click();
}

const bytes = (data, to) => {
    const const_term = 1024;
    if(data < const_term) return data + "B";
    if (to === "KB") { 
        return ~~(data / const_term).toFixed(3) + "KB"; 
      } else if (to === "MB") { 
        return ~~(data / const_term ** 2).toFixed(3) + "MB"; 
      } else if (to === "GB") { 
        return ~~(data / const_term ** 3).toFixed(3) + "GB"; 
      } else if (to === "TB") { 
        return ~~(data / const_term ** 4).toFixed(3) + "TB"; 
      }
}

const props = defineProps({
    text: String,
    userID: String,
    isOwnMessage: Boolean,
    isLast: Boolean,
    userName: String,
    createdAt: String,
    isFirst: Boolean,
    url: String,
    avatar: String,
    isOnline: Boolean,
    type: {
        type: String,
        default: 'text',
    
    },
    id: String,
});

watch(() => props.type, async (newValue) => {
    if (newValue !== 'text' && newValue !== 'jpg' && newValue !== 'png' && newValue !== 'webp' && newValue !== 'gif') {
        const data = await getFile(props.text);
        fileTitle.value = data.name;
        fileSize.value = data.size;
    }
});

const getImg = (tryer) => {
    return `${baseUrl}/api/v1/files/${tryer}`;

}

const deleteMessage = async () => {
    
    socket.emit('deleteMessage', { id: props.id, user: localUserStore.user.id });
}

const containsLinkBalise = (text) => {
    return text.includes('<a href=');
}

const getLinkBalise = (text) => {

    // text is like this <a href="https://youtube.com" target="_blank">https://youtube.com</a>
    const link = text.match(/<a href="([^"]+)" target="_blank">([^<]+)<\/a>/);
    return link[1];
}

const removeLinkBalise = (text) => {
    return text.replace(/<a href="([^"]+)" target="_blank">([^<]+)<\/a>/, '');
}

onBeforeMount(async () => {
    loading.value = false;
});

onMounted(async () => {

    if (props.type !== 'text' && props.type !== 'jpg' && props.type !== 'png' && props.type !== 'webp' && props.type !== 'gif') {
        const data = await getFile(props.text);
        fileTitle.value = data.name;
        fileSize.value = data.size;
    }
});


</script>

<template>
    <div class="flex items-start group relative">
        <AvatarCircle v-if="isFirst" :id="userID" :force-fallback="true" :name="userName":avatar="avatar" @click="$emit('showUser')" :is-online="isOnline"/>
        
        <li class="group/item flex flex-col leading-1.5 mb-2 ml-2">
            <span v-if="isFirst" class="text-sm font-semibold text-gray-900 dark:text-white">{{ userName + ' ' }}<span v-if="isFirst" class="text-sm font-normal text-gray-500 dark:text-gray-400">{{ createdAt }}</span></span>
            
            <div v-if="type=='text'" class="">
                <p v-if="isFirst" :id="id" class="text-sm font-normal pt-1 mt-0 text-gray-900 dark:text-white max-w-[64rem]" @mouseover="$emit('showMessageOptions')"><a class="link link-primary" v-if="containsLinkBalise(text)" :href="getLinkBalise(text)" target="_blank">{{ getLinkBalise(text) }}</a>&nbsp;{{ removeLinkBalise(text)}}</p>
                <p v-else :id="id" class="text-sm font-normal text-gray-900 dark:text-white ml-[48px] max-w-[64rem]" @mouseover="$emit('showMessageOptions')"><a class="link link-primary" v-if="containsLinkBalise(text)" :href="getLinkBalise(text)" target="_blank">{{ getLinkBalise(text) }}</a>&nbsp;{{ removeLinkBalise(text) }}</p>
            </div> 
            <div v-else-if="type=='jpg' || type=='png' ||type=='webp' || type=='gif'">
                <img v-bind:style="{cursor:'pointer'}" v-if="isFirst" ref="imgRef" :id="id" class="rounded-lg max-w-[30%]" :src="getImg(text)" @click="$emit('showImage', imgRef)"/>
                <img v-bind:style="{cursor:'pointer'}" v-else :id="id" ref="imgRef" class="rounded-lg max-w-[28%] ml-[48px]" :src="getImg(text)" @click="$emit('showImage', imgRef)"/>
            </div>
            <div v-else> 
                <div v-if="isFirst" class="flex items-start bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
                    <div class="me-2">
                        <span class="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white pb-2">
                            <i v-if="type!=='zip' && type!=='rar'" :class="'bi bi-filetype-'+type"></i>
                            <i v-else class="bi bi-file-earmark-zip"></i>
                            {{ fileTitle }}
                        </span>
                        <span class="flex text-xs font-normal text-gray-500 dark:text-gray-400 gap-2">
                            {{bytes(fileSize,'MB') }}
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="self-center" width="3" height="4" viewBox="0 0 3 4" fill="none">
                                <circle cx="1.5" cy="2" r="1.5" fill="#6B7280"/>
                            </svg>
                            {{ type }}
                            <button>
                                <i @click="downloadFile(text)" class="bi bi-download"></i>
                            </button>
                        </span>
                    </div>
                </div>
                <div v-else class="flex items-start ml-[48px] bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
                    <div class="me-2">
                        <span class="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white pb-2">
                            <i v-if="type!=='zip' && type!=='rar'" :class="'bi bi-filetype-'+type"></i>
                            <i v-else class="bi bi-file-earmark-zip"></i>
                            {{ fileTitle }}
                        </span>
                        <span class="flex text-xs font-normal text-gray-500 dark:text-gray-400 gap-2">
                            {{bytes(fileSize,'MB') }}
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="self-center" width="3" height="4" viewBox="0 0 3 4" fill="none">
                                <circle cx="1.5" cy="2" r="1.5" fill="#6B7280"/>
                            </svg>
                            {{ type }}
                            <button>
                                <i @click="downloadFile(text)" class="bi bi-download"></i>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </li>
        <button @click="deleteMessage" class="hidden group-hover:block absolute top-0 right-5 btn btn-xs btn-outline hover:btn-error"><i class="bi bi-trash"></i></button>
    </div>
</template>