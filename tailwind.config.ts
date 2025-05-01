
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				coffee: {
					DEFAULT: 'hsl(28 34% 40%)', 
					50: 'hsl(28, 34%, 95%)',
					100: 'hsl(28, 34%, 90%)',
					200: 'hsl(28, 34%, 80%)',
					300: 'hsl(28, 34%, 70%)',
					400: 'hsl(28, 34%, 60%)',
					500: 'hsl(28, 34%, 50%)',
					600: 'hsl(28, 34%, 40%)',
					700: 'hsl(28, 34%, 30%)',
					800: 'hsl(28, 34%, 20%)',
					900: 'hsl(28, 34%, 10%)'
				},
				beige: {
					DEFAULT: 'hsl(30 24% 90%)',
					50: 'hsl(30, 24%, 98%)',
					100: 'hsl(30, 24%, 95%)',
					200: 'hsl(30, 24%, 90%)',
					300: 'hsl(30, 24%, 80%)',
					400: 'hsl(30, 24%, 70%)',
					500: 'hsl(30, 24%, 60%)',
					600: 'hsl(30, 24%, 50%)',
					700: 'hsl(30, 24%, 40%)',
					800: 'hsl(30, 24%, 30%)',
					900: 'hsl(30, 24%, 20%)'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				pulse: {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.5 },
				},
				shimmer: {
					'100%': {
						transform: 'translateX(100%)',
					},
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				shimmer: 'shimmer 1s infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
