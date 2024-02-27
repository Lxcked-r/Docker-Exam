import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
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
			path: "/admin/users",
			name: "admin-users",

			component: () => import("../views/admin/UsersView.vue"),
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
					path: "settings",
					name: "settings",

					component: () => import("../views/settings/SettingsView.vue"),
				},
			]
		},
	],
});

export default router;
