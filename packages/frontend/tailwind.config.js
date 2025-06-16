import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{vue,js,ts,jsx,tsx}",
	],
	variants: {
		extend: {
			display: ["group-hover"],
			backgroundOpacity: ['active', 'hover'],
		}
	},
	theme: {
		extend: {},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				light: {
					"primary": "#38bdf8",
					"secondary": "#fef08a",
					"accent": "#0891b2",
					"neutral": "#2b3440",
					"base-100": "#ffffff",
					"info": "#a5f3fc",
					"success": "#36d399",
					"warning": "#fbbd23",
					"error": "#f87272",
				},
				dark: {
					"primary": "#38bdf8",
					"secondary": "#fef08a",
					"accent": "#0891b2",
					"neutral": "#f3f4f6",
					"base-100": "#1f2937",
					"info": "#a5f3fc",
					"success": "#36d399",
					"warning": "#fbbd23",
					"error": "#f87272",
				},
			},
		],
		defaultTheme: "dark",
	},
};