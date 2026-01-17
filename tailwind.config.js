/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: [
    "./*.html",
    "./*.js",
    "./src/*.css"
  ],
  safelist: [
    // Header
    'bg-blue-600', 'text-white', 'text-center', 'py-4', 'text-2xl', 'font-bold',
    // Table
    'table-auto', 'w-full', 'border-collapse', 'border', 'border-gray-300', 'bg-gray-200', 'px-4', 'py-2',
    // Loading
    'flex', 'justify-center', 'items-center', 'h-full', 'animate-spin', 'rounded-full', 'h-16', 'w-16', 'h-8', 'w-8', 'border-b-2', 'border-blue-600', 'mt-2', 'text-gray-600',
    // Error
    'text-red-600',
    // Footer
    'bg-gray-200', 'p-2', 'text-sm', 'mt-auto',
    // Body/Layout
    'flex', 'flex-col', 'min-h-screen', 'overflow-x-hidden', 'overflow-y-auto', 'px-4', 'h-2/3', 'h-1/3', 'flex-1', 'bg-gray-100'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}