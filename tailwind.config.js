/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Paleta neutra + UMA cor de destaque (verde-sálvia).
        base: {
          0: 'rgb(var(--c-base-0) / <alpha-value>)',
          50: 'rgb(var(--c-base-50) / <alpha-value>)',
          100: 'rgb(var(--c-base-100) / <alpha-value>)',
          200: 'rgb(var(--c-base-200) / <alpha-value>)',
          300: 'rgb(var(--c-base-300) / <alpha-value>)',
          500: 'rgb(var(--c-base-500) / <alpha-value>)',
          700: 'rgb(var(--c-base-700) / <alpha-value>)',
          900: 'rgb(var(--c-base-900) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--c-accent-50) / <alpha-value>)',
          100: 'rgb(var(--c-accent-100) / <alpha-value>)',
          300: 'rgb(var(--c-accent-300) / <alpha-value>)',
          500: 'rgb(var(--c-accent-500) / <alpha-value>)',
          600: 'rgb(var(--c-accent-600) / <alpha-value>)',
          700: 'rgb(var(--c-accent-700) / <alpha-value>)',
        },
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(0 0 0 / 0.08)',
        sheet: '0 -8px 40px -8px rgb(0 0 0 / 0.22)',
        lift: '0 2px 4px rgb(0 0 0 / 0.05), 0 12px 32px -8px rgb(0 0 0 / 0.14)',
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
        'safe-t': 'env(safe-area-inset-top, 0px)',
      },
      keyframes: {
        'slide-up': { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'slide-up': 'slide-up 180ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
