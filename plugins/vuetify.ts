import { createVuetify, ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const customLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#EFEBE9',
    font: '#4a4a4a',
    main: '#795548',
    accent: '#d1baaf'
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    ssr: false,
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'customLightTheme',
      themes: {
        customLightTheme,
      }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
