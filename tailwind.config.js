/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // You can extend colors here if needed, consistent with your existing design
            },
        },
    },
    plugins: [
        require('tailwindcss-rtl'),
    ],
}
