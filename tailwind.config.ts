import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Prototype design tokens — warm teal brand, warm ink palette
        ink: {
          DEFAULT: '#34302A',   // ink-700 body text
          muted:   '#6E6759',   // ink-500 secondary
          faint:   '#9B9486',   // ink-400 tertiary
          50:      '#F7F5F2',
          100:     '#EFECE7',
          200:     '#E2DED6',
        },
        brand: {
          DEFAULT: '#0F766E',   // brand-700 primary action (teal)
          hover:   '#115E59',   // brand-800
          50:      '#ECFDF5',
          100:     '#D1FAE5',
          200:     '#A7F3D0',
          400:     '#34D399',
          500:     '#14B8A6',
          600:     '#0D9488',
          700:     '#0F766E',
          800:     '#115E59',
          900:     '#134E4A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt:     '#FBFAF9',   // canvas warm off-white
          raised:  '#F7F5F2',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
    },
  },
  plugins: [],
};

export default config;
