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
        canvas: '#ECF0F3',
        surface: '#EFF2F9',
        ink: {
          primary: '#2C343C',
          muted: '#6E7F8D',
        },
        brand: {
          primary: '#6E7F8D',
          hover: '#536574',
        },
        coral: '#D99C8E',
        status: {
          present: '#6EA985',
          pending: '#C9A96C',
          leave: '#8B86B8',
          danger: '#C77777',
        },
        border: {
          hairline: '#B5BFC6',
        },
      },
      borderRadius: {
        card: '28px',
      },
      boxShadow: {
        card: '18px 18px 30px #D1D9E6, -18px -18px 30px #FFFFFF',
        'card-hover': '10px 10px 20px rgba(22,27,29,0.23), -10px -10px 20px #FAFBFB',
      },
    },
  },
  plugins: [],
};
