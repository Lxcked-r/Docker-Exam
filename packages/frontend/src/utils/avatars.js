
const avatars = ref([]);
const messagesAvatars = ref([]);
const checkAvatars = ref([]);

const avatarsUtils;

avatarsUtils.baseUrl = import.meta.env.VITE_APP_API_URL;

const getAvatar = (id) => {
    const avatar = avatars.value.find((avatar) => avatar.id === id);
    return avatar ? avatar.url : `${baseUrl}/api/v1/avatars/null`;
};

const getThisAvatar = (key, isFor) => {
    switch (isFor) {
        case "users":
            return avatars.value[key].url;
        case "messages":
            return messagesAvatars.value[key].url;
    }

};

const tryAvatar = async (id) => {
	let response;

	if(checkAvatars.value.includes(id)) {
		return `${baseUrl}/api/v1/avatars/${id}`;
	}

	response = await fetch(`${baseUrl}/api/v1/avatars/${id}`, {
		method: 'HEAD',
	});

	checkAvatars.value.push(id);
	if(response) {
		if (response.status === 200) {
            return response.url;
		}
	}
	return `${baseUrl}/api/v1/avatars/null`;
};

const getAvatars = async (isFor) => {
    switch (isFor) {
        case "users":
        for (let i = 0; i < props.channelUsers.length; i++) {
            const url = await tryAvatar(props.channelUsers[i].userID);
            avatars.value.push({id: props.channelUsers[i].userID, url: url});
        }
        case "messages":
        for (let i = 0; i < props.channelMessages.length; i++) {
            const url = await tryAvatar(props.channelMessages[i].userID);
            messagesAvatars.value.push({id: props.channelMessages[i].userID, url: url});
        }
    }
};