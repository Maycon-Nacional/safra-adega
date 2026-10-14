import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { pt } from 'vuetify/locale'

export default createVuetify({
  locale: { locale: 'pt', messages: { pt } },
  theme: {
    defaultTheme: 'adega',
    themes: {
      adega: {
        dark: false,
        colors: {
          background: '#F4EEE4',
          surface: '#FFFCF6',
          'surface-variant': '#EDE3D3',
          'on-surface-variant': '#4A3A33',
          primary: '#5B1A2E',
          secondary: '#2F4A3A',
          accent: '#B08A4A',
          error: '#B3261E',
          success: '#3E6B4F',
          warning: '#B7793A',
          info: '#3F5C6E',
        },
        variables: {
          'border-color': '#5B1A2E',
          'border-opacity': 0.12,
          'hover-opacity': 0.06,
        },
      },
      adegaNoite: {
        dark: true,
        colors: {
          background: '#15100F',
          surface: '#1E1716',
          'surface-variant': '#2B2120',
          'on-surface-variant': '#E6D8C6',
          primary: '#D58A9C',
          secondary: '#8DB39A',
          accent: '#D4B06E',
          error: '#F2B8B5',
          success: '#8DB39A',
          warning: '#E2A86A',
          info: '#9DB8C9',
        },
        variables: {
          'border-color': '#E6D8C6',
          'border-opacity': 0.12,
        },
      },
    },
  },
  defaults: {
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VAutocomplete: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VBtn: { style: 'text-transform: none; letter-spacing: 0.01em;' },
    VCard: { rounded: 'lg' },
    VSwitch: { color: 'primary', inset: true },
  },
})
