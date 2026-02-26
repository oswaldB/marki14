// Tailwind CSS Configuration for Marki Application
// This configuration extends Tailwind's default theme with Marki brand colors
// and ensures consistency across the application when using Tailwind via CDN

tailwind.config = {
    theme: {
        extend: {
            colors: {
                // Marki Primary Brand Color
                primary: {
                    DEFAULT: '#007ACE',
                    light: '#3399e6',
                    dark: '#005bb5',
                },
                // Extended Marki color palette
                marki: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                }
            },
            // Custom font family
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
            },
            // Custom box shadows
            boxShadow: {
                'marki': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'marki-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            },
            // Custom border radius
            borderRadius: {
                'marki': '0.375rem', // 6px
                'marki-lg': '0.5rem', // 8px
            }
        }
    },
    plugins: [
        // Custom plugin for Marki-specific utilities
        function({ addUtilities }) {
            const newUtilities = {
                '.bg-marki-primary': {
                    'background-color': '#007ACE',
                },
                '.text-marki-primary': {
                    'color': '#007ACE',
                },
                '.border-marki-primary': {
                    'border-color': '#007ACE',
                },
                '.hover\\:bg-marki-primary-dark:hover': {
                    'background-color': '#005bb5',
                },
                '.focus\\:ring-marki-primary:focus': {
                    'box-shadow': '0 0 0 3px rgba(0, 122, 206, 0.5)',
                    'border-color': '#007ACE',
                },
                '.marki-transition': {
                    'transition': 'all 0.2s ease-in-out',
                },
                '.marki-focus': {
                    'outline': 'none',
                    'box-shadow': '0 0 0 3px rgba(0, 122, 206, 0.5)',
                    'border-color': '#007ACE',
                }
            }
            addUtilities(newUtilities)
        }
    ]
}
