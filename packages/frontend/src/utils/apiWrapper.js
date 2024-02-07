import config from "@/../config.json";
const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

/**
 * A collection of functions to make API usage easier.
 */
const API = {};

/**
 * Set a new token in local storage. This also sets the token as a cookie, so that it can be used for static resources such as avatars.
 * @param {String} token - The token to set.
 * @returns {void}
 */
API.setToken = function(token) {
	localStorage.setItem("token", token);

	// Also set the token as a cookie, so that it can be used for static resources such as avatars
	document.cookie = `token=${token};path=/;SameSite=Strict;Secure`;
};

/**
 * Get the token from local storage.
 * @returns {String} The token.
 */
API.getToken = function() {
	localStorage.getItem("token");
};

/**
 * Clear the token from local storage. Removes the token cookie as well.
 * @returns {void}
 */
API.clearToken = function() {
	localStorage.removeItem("token");

	// Also clear the token cookie
	document.cookie = "token=;path=/;SameSite=Strict;Secure";
};

/**
 * Call a server endpoint using the credentials previously set with setToken.
 * @param {String} endpoint - The endpoint to send the request to.
 * @param {JSON} inputJson - A JSON object describing the request. Must contain at least a method.
 * @returns {Promise} A fetch promise that may or may not resolve.
 */
API.fireServer = async function(endpoint, inputJson) {
	const allowedMethods = ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD"];

	// validation
	if (!inputJson) {
		console.error("[api/fireServer] Refusing to process a function call without a request body.");
		return null;
	}

	if (!inputJson.method) {
		console.error("[api/fireServer] Refusing to process a function call without a valid method.");
		return null;
	}

	if (!allowedMethods.includes(inputJson.method)) {
		console.error("[api/fireServer] Refusing to process a function call without a valid method.");
		return null;
	}

	if ((inputJson.method === "GET" || inputJson.method === "HEAD") && inputJson.body) {
		console.error("[api/fireServer] Refusing to process a GET or HEAD request with a body.");
		return null;
	}

	// actual request
	const token = localStorage.getItem("token");
	if (token) {
		inputJson.headers = {
			...inputJson.headers,
			"Authorization": token,
		};
	}

	if (inputJson.method === "GET" || inputJson.method === "HEAD") {
		return fetch(baseUrl + endpoint, {
			method: inputJson.method,
			headers: {
				...inputJson.headers,
				"Accept": "application/json",
				"Content-Type": inputJson.headers?.["Content-Type"] ?? "application/json;charset=utf-8",
			},
		});
	} else {
		// if we have Content-type explicitly set as false, we don't want to set it at all

		let newHeaders = {
			...inputJson.headers,
			"Accept": "application/json",
		};

		// we only set the content type if it's not false. if it is false AND a boolean, we don't set it at all
		if (inputJson.headers?.["Content-Type"] !== false && typeof inputJson.headers?.["Content-Type"] !== "boolean") {
			newHeaders = {
				...newHeaders,
				"Content-Type": inputJson.headers?.["Content-Type"] ?? "application/json;charset=utf-8",
			};
		} else {
			delete newHeaders["Content-Type"];
		}

		return fetch(baseUrl + endpoint, {
			method: inputJson.method,
			headers: {
				...newHeaders,
			},
			body: inputJson.body ?? {},
		});
	}
};

export default API;