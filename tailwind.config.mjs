/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'marki': {
          DEFAULT: '#007ACE',
          50: '#E6F4FF',
          100: '#CCE9FF',
          200: '#99D3FF',
          300: '#66BDFF',
          400: '#33A7FF',
          500: '#007ACE',
          600: '#0062A5',
          700: '#004A7C',
          800: '#003152',
          900: '#001929',
        },
      },
    },
  },
  plugins: [],
}
