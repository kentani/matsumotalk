import { initializeApp } from 'firebase/app'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectID,
    storageBucket: config.public.firebaseStoragebucket,
    messagingSenderId: config.public.firebaseMessagingSenderID,
    appId: config.public.firebaseAppID,
  }

  const app = initializeApp(firebaseConfig)

  nuxtApp.provide('firebase', app)
})
