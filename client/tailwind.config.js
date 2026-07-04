/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        canvas: '#F6F8FC',
        surface: '#FFFFFF',
        ink: {
          primary: '#1B2559',
          muted: '#6B7594',
        },
        brand: {
          primary: '#3454D1',
          hover: '#28409F',
        },
        coral: '#FF6B4A',
        status: {
          present: '#22C55E',
          pending: '#F5A623',
          leave: '#8B5CF6',
          danger: '#EF4444',
        },
        border: {
          hairline: '#E3E8F4',
        },
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(27,37,89,0.06)',
        'card-hover': '0 6px 20px rgba(27,37,89,0.10)',
      },
    },
  },
  plugins: [],
};
