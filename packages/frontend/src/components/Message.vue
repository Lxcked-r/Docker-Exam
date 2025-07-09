<script setup>
import API from '@/utils/apiWrapper';
import AvatarCircle from './AvatarCircle.vue';
import { onBeforeMount, onMounted, ref, watch, inject } from 'vue';
import config from "@/../config";
import { useFriendsStore } from '@/stores/friends';
import { useLocalUserStore } from '@/stores/localUser';

import crypter from '@/utils/crypter.js';

import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    typographer: true,
});



const encryptData = () => crypter.encrypt();


const localUserStore = useLocalUserStore();
const socket = inject('socket');

const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

const imgRef = ref(null);

const fileTitle = ref('');

const fileSize = ref('');

const loading = ref(false);

const friends = ref([]);

const mode = ref('view');

const parsed = ref([]);

const content = ref('');

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
    if (data < const_term ** 2) { 
        return (data / const_term).toFixed(2) + "KB"; 
    } else { 
        return (data / const_term ** 2).toFixed(2) + "MB"; 
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
    isEdited: {
        type: String,
        default: false,
    },
    isOP: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        default: 'text',
    
    },
    id: String,
});

//check if message is edited after load
watch(() => props.isEdited, async (newValue) => {
    if (newValue) {
        const data = await reloadMessage();
        document.getElementById(props.id).value = data.text;
    }
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

const setEditMode = () => {
    if (mode.value === 'edit') {
        mode.value = 'view';
        return;
    }
    mode.value = 'edit';
}

const saveEdit = async () => {
    const text = document.getElementById(props.id).value;

    const encryptedMessage = encryptData(text);

    const response = await API.fireServer('/api/v1/messages/' + props.id, {
        method: "PUT",
        body: JSON.stringify({ text }),
    });
    const jsonRes = await response.json();
    if (jsonRes.error) {
        console.error(jsonRes.error);
        return;
    }


    socket.emit('editMessage', { id: props.id, userID: localUserStore.user.id, text });
    mode.value = 'view';
}

const reloadMessage = async () => {
    const response = await API.fireServer('/api/v1/messages/' + props.id, {
        method: "GET",
    });
    const jsonRes = await response.json();
    if (jsonRes.error) {
        console.error(jsonRes.error);
        return;
    }
    return jsonRes;
}



onBeforeMount(async () => {
    loading.value = false;
});

const parse = (text) => {

    //everytime that a link is found, it should be replaced by a markdown link so https://example.com becomes [https://example.com](https://example.com)
    if (text.includes('http://') || text.includes('https://')) {
        const linksFound = text.match(/(https?:\/\/[^\s]+)/g);
        if (linksFound) {
            for (let link of linksFound) {
                //force the visual link to be underlined
                text = text.replace(link, `[${link}](${link})`);
            }
        }
    }

    return text;

};


onMounted(async () => {

    if (props.type !== 'text' && props.type !== 'jpg' && props.type !== 'png' && props.type !== 'webp' && props.type !== 'gif' ) {
        const data = await getFile(props.text);
        fileTitle.value = data.name;
        fileSize.value = data.size;
    }
    parsed.value = md.parse(props.text)? md.parse(parse(props.text)) : [];
    content.value = parsed.value[1] ? md.render((parsed.value[1].content)) : '';
    // detect all link balises in the content.value and force them to be underlined without the function containsLinkBalise
    
    
});


</script>

<template>
    <div  class="flex items-start group relative">
        <AvatarCircle v-if="isFirst||isEdited" :id="userID" :force-fallback="true" :name="userName":avatar="avatar" @click="$emit('showUser')" :is-online="isOnline"/>
        
        <li class="group/item flex flex-col leading-1.5 mb-2 ml-2">
            <span v-if="isFirst||isEdited" class="text-sm font-semibold text-gray-900 dark:text-white">{{ userName + ' ' }}<span v-if="isFirst||isEdited" class="text-sm font-normal text-gray-500 dark:text-gray-400">{{ createdAt }}<span v-if="isEdited">(edited)</span></span></span>
            
            <div v-if="type==='text' && mode==='edit'" class="">
                <input :id="id" class="input input-bordered w-full" @mouseover="$emit('showMessageOptions')" :value="props.text"></input>
                <a @click="setEditMode" class="btn btn-xs btn-outline hover:btn-primary">Cancel</a>
                <a @click="saveEdit" class="btn btn-xs btn-primary">Save</a>
            </div> 

            <div v-else-if="type=='text'" class="">
                <p v-if="isFirst||isEdited" :id="id" class="text-sm font-normal pt-1 mt-0 text-gray-900 dark:text-white max-w-[64rem]" @mouseover="$emit('showMessageOptions')" markdown="1" ><p v-if="content" v-html="content"></p></p>
                <p v-else  :id="id" class="text-sm font-normal text-gray-900 dark:text-white ml-[48px] max-w-[64rem]" @mouseover="$emit('showMessageOptions')" markdown="1" ><p v-if="content" v-html="content"></p></p>
            </div>


            <div v-else-if="type=='jpg' || type=='png' ||type=='webp' || type=='gif'">
                <img v-bind:style="{cursor:'pointer'}" v-if="isFirst" ref="imgRef" :id="id" class="rounded-lg max-w-[30%]" :src="getImg(text)" @click="$emit('showImage', imgRef)"/>
                <img v-bind:style="{cursor:'pointer'}" v-else :id="id" ref="imgRef" class="rounded-lg max-w-[28%] ml-[48px]" :src="getImg(text)" @click="$emit('showImage', imgRef)"/>
            </div>

            <div v-else-if="type=='mp4' || type=='webm' || type=='mov'">
                <video :id="id" class="rounded-lg max-w-[30%]" controls>
                    {{ text }}
                    <source :src="getImg(text)" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div v-else-if="type=='ogg' || type=='wav' || type=='mp3' || type=='opus'">
                <audio v-if="isFirst" :id="id" class="rounded-lg" controls>
                        <source :src="getImg(text)" type="audio/ogg">
                        <source :src="getImg(text)" type="audio/wav">
                        <source :src="getImg(text)" type="audio/mpeg">
                        <source :src="getImg(text)" type="audio/mp3">
                        <source :src="getImg(text)" type="audio/opus">
                        Your browser does not support the audio tag.
                </audio>
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
                            {{bytes(fileSize,'KB') }}
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
                            {{bytes(fileSize,'KB') }}
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
        <button v-if="isOwnMessage" @click="deleteMessage" class="hidden group-hover:block absolute top-0 right-5 btn btn-xs btn-outline hover:btn-error"><i class="bi bi-trash"></i></button>
        <button v-else-if="isOP" @click="deleteMessage" class="hidden group-hover:block absolute top-0 right-5 btn btn-xs btn-outline hover:btn-error"><i class="bi bi-trash"></i></button>
        
        <button v-if="isOwnMessage" @click="setEditMode" class="hidden group-hover:block absolute top-0 right-14 btn btn-xs btn-outline hover:btn-primary"><i class="bi bi-pencil"></i></button>

        </div>
</template>

<style scoped>
audio {
    max-height: 50px;
    max-width: 500px;
}
</style>