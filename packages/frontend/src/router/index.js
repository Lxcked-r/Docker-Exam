import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
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
			path: "/dashboard",
			name: "dashboard",
			component: () => import("../views/DashboardView.vue"),
			children: [
				{
					path: "tasks",
					name: "tasks",
					component: () => import("../views/TasksView.vue"),
				},
				{
					path: "settings",
					name: "settings",
					component: () => import("../views/settings/SettingsView.vue"),
				},
				{
					path: "admin",
					name: "admin",
					component: () => import("../views/admin/AdminView.vue"),
					children: [
						{
							path: "users",
							name: "adminUsers",
							component: () => import("../views/admin/UsersView.vue"),
						},
						{
							path: "templates",
							name: "adminTemplates",
							component: () => import("../views/admin/TemplatesView.vue"),
						},
						{
							path: "tasks",
							name: "adminTasks",
							component: () => import("../views/admin/TasksView.vue"),
						},
					],
				},
			],
		},
	],
});

export default router;
