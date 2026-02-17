import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fundaluri
        cream: {
          DEFAULT: '#FAF8F5',
          50: '#FAF8F5',
          100: '#F5EFE7',
          200: '#E8DCC8',
        },
        // Accente aurii (PREMIUM)
        gold: {
          DEFAULT: '#A58625',
          light: '#F4E5C3',
          dark: '#7D6516',
        },
        // Accente verzi/calde
        olive: '#6B7B5E',
        'warm-brown': '#8B7355',
        sand: '#D4C4B0',
        // Text
        text: {
          DEFAULT: '#2D2D2D',
          secondary: '#736B66',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bebas Neue', 'sans-serif'],
        body: ['var(--font-body)', 'Montserrat', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['140px', { lineHeight: '1', letterSpacing: '0.04em' }],
        'display-lg': ['72px', { lineHeight: '1.1', letterSpacing: '0.03em' }],
        'display-md': ['48px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
        'display-sm': ['36px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(165, 134, 37, 0.3)',
        'gold-lg': '0 8px 40px rgba(165, 134, 37, 0.4)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-cream': 'linear-gradient(to bottom right, #FAF8F5, #F5EFE7, #E8DCC8)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 4s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(165, 134, 37, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(165, 134, 37, 0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
