import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			screens: {
				md: "800px",
				xs: "475px",
			},
			backgroundImage: {
				'hero-pattern': "url('/assets/hero-section.png')",
				'footer-pattern': "url('/assets/footer-bg.png')",
				'gradient-custom': "linear-gradient(90deg, hsla(214, 100%, 21%, 1) 31%, hsla(87, 71%, 44%, 1) 100%)",
			},
			colors: {
				primary: {
					"100": "#3974C1",
					DEFAULT: "#002f6c",
				},
				secondary: "#78be20",
				black: {
					"100": "#333333",
					"200": "#141413",
					"300": "#7D8087",
					DEFAULT: "#1e1e1e",
				},
				white: {
					"100": "#F7F7F7",
					"200": "#D4D4D4",
					DEFAULT: "#FFFFFF",
				},
				grad: {},
			},
			fontFamily: {
				"work-sans": ["var(--font-plus-jakarta-sans)"],
			},
			boxShadow: {
				100: "10px 5px 5px 2px rgba(0, 0, 0, 0.15)",
				200: "2px 2px 30px 2px rgba(0, 0, 0, 0.15)",
				300: "2px 2px 0px 2px rgb(238, 43, 105)",

			},
		},
	},
};


  
export default config;
