/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './node_modules/flowbite-react/**/*.js',
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        fontFamily: {
            sans: ['var(--font-inter)', 'sans-serif'],
            display: ['var(--font-epilogue)', 'sans-serif'],
        },
        extend: {},
    },
    darkMode: 'class',
    plugins: [require('flowbite/plugin')],
};
