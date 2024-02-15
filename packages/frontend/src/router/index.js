import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: () => import("../views/DashboardView.vue"),
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
			path: "/chat",
			name: "chat",

			component: () => import("../views/ChatView.vue"),
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
		},
		{
			path: "/dashboard/chats",
			name: "Chats List",

			component: () => import("../views/ChatsListView.vue"),
		},
		{
			path: "/dashboard/settings",
			name: "Settings",

			component: () => import("../views/settings/SettingsView.vue"),
		}
	],
});

export default router;
