import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  safelist: [
    { pattern: /^bg-/ },
    { pattern: /^text-/ },
    { pattern: /^font-/ },
    'text-right',
    'font-sans',
    'font-serif',
    'font-pacifico',
  ],

  theme: {
    extend: {
      screens: {
        'xs': '360px',
      },
      spacing: {
        '1/3': '33%',
        '1/2': '50%',
        '16/9': '56.25%',
        full: '100%',
      },
      colors: {
        transparent: 'transparent',
        burgundy: '#9f3e52',
        brown: '#E8C188',
        sun: '#F8CD4D'
      },
      fontFamily: {
        body: ['Roboto', 'Open Sans', 'ui-sans-serif'],
        title: ['GT Sectra Bold', 'ui-serif'],
        serif: ['GT Sectra Regular', 'ui-serif'],
        pacifico: ['Pacifico', 'ui-cursive'],
        amman: ["ff-amman-serif-pro", 'serif'],
      },
      container: {
        center: false, // Prevents auto-centering
        padding: '0', // Removes default padding
        screens: {
          xs: '100%', // Forces `.container` to be full width
          sm: '100%',
          md: '100%',
          lg: '100%',
          xl: '100%',
          '2xl': '100%',
        },
      },
    },
  },

  plugins: [typography, forms, containerQueries, aspectRatio]
} satisfies Config;
