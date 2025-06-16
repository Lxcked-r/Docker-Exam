import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: () => import("../views/HomeView.vue"),
		},
		{
			path: "/login",
			name: "login",
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import("../views/LoginView.vue"),
		},
		{
			path: "/register",
			name: "register",

			component: () => import("../views/RegisterView.vue"),
		},
		{
			path: "/admin/users",
			name: "admin-users",

			component: () => import("../views/admin/UsersView.vue"),
		},
		{

			path: "/terms",
			name: "terms",

			component: () => import("../views/TermsView.vue"),
		},
		{
			path: "/forgot-password",
			name: "forgot-password",

			component: () => import("../views/ForgotPasswordView.vue"),
		},
		{
			path: "/dashboard",
			name: "dashboard",

			component: () => import("../views/DashboardView.vue"),
			children: [
				{
					path : "chats",
					name : "chats",

					component: () => import("../views/ChatsListView.vue"),
					children: [
						{
							path: ":id",
							name: "chat",
				
							component: () => import("../views/ChatView.vue"),
						},
					]
				},
				{
					path: "meteo",
					name: "meteo",

					component: () => import("../views/MeteoView.vue"),
				},
				{
					path: "friends",
					name: "friends",

					component: () => import("../views/FriendsView.vue"),
				},
				{
					path: "settings",
					name: "settings",

					component: () => import("../views/settings/SettingsView.vue"),
				},
				{
					path: "pong",
					name: "pong",

					component: () => import("../views/PongView.vue"),
				},
				{
					path: "memory",
					name: "memory",

					component: () => import("../views/MemoryView.vue"),
				},
			]
		},
	],
});

export default router;
