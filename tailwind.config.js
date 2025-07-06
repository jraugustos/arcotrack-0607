/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'2xl': '400px',
			},
		},
		extend: {
			fontFamily: {
				'dm-sans': ['Anke Devanagari', 'sans-serif'],
			},
			colors: {
				// ArcoTrack Modern Design System - Inspired by Fitme
				arco: {
					// Primary Colors (Modern Clean)
					primary: '#080706', // Preto principal (textos, headers)
					secondary: '#FAFAFA', // Branco/Off-white (backgrounds)
					
					// Grays (Neutral Scale)
					gray: {
						900: '#080706', // Texto principal
						700: '#5E514D', // Texto secundário
						500: '#A8A8A8', // Elementos de suporte
						300: '#E2E2E2', // Bordas sutis
						100: '#FAFAFA', // Background claro
					},
					
					// Accent Colors
					accent: '#43C6AC', // Verde água (novo accent)
					success: '#55BD4E', // Verde para indicadores positivos
					
					// Legacy colors (manter compatibilidade)
					white: '#FFFFFF',
					black: '#080706',
					light: '#FAFAFA',
					navy: '#080706', // Atualizado para novo preto
				},
				// Cores oficiais do alvo de tiro com arco (mantidas)
				target: {
					white: '#D9D9D9', // 1,2 pontos
					black: '#434343', // 3,4 pontos
					blue: '#4FA3D9', // 5,6 pontos
					red: '#F86B4F', // 7,8 pontos
					gold: '#FFD66B', // 9,10 pontos (centro)
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#080706', // Preto moderno
					foreground: '#FAFAFA', // Branco para contraste
				},
				secondary: {
					DEFAULT: '#FAFAFA', // Branco/off-white
					foreground: '#080706', // Preto para contraste
				},
				accent: {
					DEFAULT: '#43C6AC', // Verde água (novo accent)
					foreground: '#080706', // Preto para contraste
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},

			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				arco: '8px', // Radius padrão do ArcoTrack
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'pulse-target': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-target': 'pulse-target 0.3s ease-in-out',
			},
			fontWeight: {
				light: '300',
				semibold: '500',
				bold: '600',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
