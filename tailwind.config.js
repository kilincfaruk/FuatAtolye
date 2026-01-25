/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#1e40af',
                    DEFAULT: '#1e3a8a',
                    dark: '#172554',
                },
                secondary: {
                    light: '#f59e0b',
                    DEFAULT: '#d97706',
                    dark: '#b45309',
                }
            }
        },
    },
    plugins: [],
}
