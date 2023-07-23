import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      title: 'マツモトーク',
      titleTemplate: 'マツモトーク',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: "manifest", href: "/manifest.webmanifest" },
      ],
      htmlAttrs: {
        lang: 'ja'
      },
    }
  },
  build: {
    transpile: ['vuetify'],
  },
  hooks: {
    'vite:extendConfig': (config) => {
      config.plugins!.push(vuetify())
    },
  },
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
    define: {
      'process.env.DEBUG': false,
    },
  },
  css: ['@/assets/main.scss'],
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectID: process.env.FIREBASE_PROJECT_ID,
      firebaseStoragebucket: process.env.FIREBASE_STORAGEBUCKET,
      firebaseMessagingSenderID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppID: process.env.FIREBASE_APP_ID,
      roomId: process.env.ROOM_ID,
      vapidKey: process.env.VAPID_KEY
    }
  },
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico"],
    client: {
      installPrompt: true,
    },
    manifest: {
      name: 'マツモトーク',
      description: "マツモトーク",
      theme_color: "#795548",
      lang: "ja",
      short_name: "マツモトーク",
      start_url: "/",
      display: "standalone",
      background_color: "#795548",
      icons: [
        {
          src: "icons/512.png",
          sizes: "512x512",
          type: "image/png"
        },
      ]
    },
    workbox: {
      navigateFallback: null
    },
  }
})
