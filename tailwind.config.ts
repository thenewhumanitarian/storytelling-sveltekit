import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

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
      },
      fontFamily: {
        body: ['Roboto', 'Open Sans', 'ui-sans-serif'],
        title: ['GT Sectra Bold', 'ui-serif'],
        serif: ['GT Sectra Regular', 'ui-serif'],
      },
    },
  },

  plugins: [typography, forms, containerQueries, aspectRatio]
} satisfies Config;
