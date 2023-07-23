<template>
  <v-app v-show="isShow" style="background: rgb(var(--v-theme-background))">
    <v-app-bar
      app
      fixed
      flat
      density="compact"
      color="main"
    >
      <template v-slot:prepend>
        <v-img
          :src="titleIcon"
          width="40"
          cover
        ></v-img>
      </template>

      <!-- <v-toolbar-title class="text-body-1 font-weight-bold">
        {{ title }}
      </v-toolbar-title> -->
    </v-app-bar>

    <v-main>
      <v-container>
        <div style="overflow: auto;">
          <div
            v-for="(message, i) in chat?.messages || []"
            :key="i"
          >
            <v-card
              variant="flat"
              color="background"
              :class="{ 'text-right': message.userId === user.id }"
            >
              <v-card-title
                class="pa-0 pb-1 text-body-1 text-font"
              >
                <v-avatar
                  size="45px"
                  color="main"
                >
                  <v-img
                    alt="Avatar"
                    :src="userOfId(message.userId)?.image"
                    cover
                  ></v-img>
                </v-avatar>

                <span
                  class="ml-3"
                >
                  {{ userOfId(message.userId)?.name }}
                </span>
              </v-card-title>

              <v-card-text>
                <div
                  class="bubble text-body-1"
                  :class="{ 'accent': message.userId === user.id }"
                >
                  {{ message.message }}
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-container>
    </v-main>

    <v-footer
      app
      color="background"
    >
      <v-row
        v-if="!isEdit"
        dense
        style="width: 100%;"
        justify="center"
      >
        <v-col
          cols="12"
        >
          <v-btn
            size="x-large"
            rounded="lg"
            :ripple="false"
            block
            @click="onClickEditText"
          >
            <v-icon
              :icon="mdiPencil"
              color="main"
              size="large"
            ></v-icon>

            <span class="text-main font-weight-bold">
              文字を入力
            </span>
          </v-btn>
        </v-col>

        <!-- <v-col
          cols="6"
        >
          <v-btn
            size="x-large"
            rounded="lg"
            :ripple="false"
            block
            @click="onClickEditVoice"
          >
            <v-icon
              :icon="mdiMicrophone"
              color="main"
              size="large"
            ></v-icon>

            <span class="text-main font-weight-bold">
              音声を録音
            </span>
          </v-btn>
        </v-col> -->
      </v-row>

      <v-row
        v-if="isEdit && isEditText"
        dense
      >
        <v-col
          cols="12"
        >
          <v-textarea
            v-if="isEdit && isEditText"
            v-model="editText"
            class="text-font"
            type="text"
            variant="outlined"
            color="main"
            density="compact"
            hide-details
            placeholder="ここに文字を入力"
            rounded="lg"
            autofocus
            rows="3"
          ></v-textarea>
        </v-col>

        <v-col
          cols="6"
        >
          <v-btn
            style="min-width: 0px; width: 100%;"
            size="x-large"
            :ripple="false"
            rounded="lg"
            @click="onClickCloseEditText"
          >
            <v-icon
              :icon="mdiClose"
              size="large"
              color="main"
            ></v-icon>

            <span class="text-main font-weight-bold">
              やめる
            </span>
          </v-btn>
        </v-col>

        <v-col
          cols="6"
        >
          <v-btn
            style="min-width: 0px; width: 100%;"
            size="x-large"
            :ripple="false"
            rounded="lg"
            @click="onClickSendEditText"
          >
            <v-icon
              :icon="mdiSendVariantOutline"
              size="large"
              color="main"
            ></v-icon>

            <span class="text-main font-weight-bold">
              送る
            </span>
          </v-btn>
        </v-col>
      </v-row>

      <v-row
        v-if="isEdit && isEditVoice"
        dense
        no-gutters
      >
        <v-col
          cols="2"
        >
          <v-btn
            class="pa-0 ma-0"
            style="min-width: 0px; top: 20%;"
            variant="text"
            color="main"
            size="large"
            :ripple="false"
            @click="onClickCloseEditVoice"
          >
            <v-icon
              :icon="mdiClose"
              size="large"
            ></v-icon>
          </v-btn>
        </v-col>

        <v-col
          cols="10"
        >
          <div
            class="mb-2 text-font text-caption text-center"
          >
            {{ recordingText }}
          </div>

          <div
            class="text-font text-body-1 text-center"
          >
            <v-btn
              variant="plain"
              style="min-width: 0px; width: 100%;"
              size="large"
              rounded="lg"
              :ripple="false"
              @click="onClickRecordingBtn"
            >
              <v-icon
                :icon="recordingIcon"
                :color="recordingIconColor"
                size="60"
              ></v-icon>

              <audio ref="audioPlayer" controls></audio>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { getAuth, signInAnonymously, signOut, onAuthStateChanged } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs, orderBy, limit, doc, setDoc, serverTimestamp, DocumentData, updateDoc, getDoc, onSnapshot } from "firebase/firestore"

import {
  mdiPencil,
  mdiClose,
  mdiMicrophone,
  mdiSendVariantOutline,
  mdiRecordCircleOutline,
  mdiStopCircle,
  mdiPlayCircleOutline
} from '@mdi/js'

const nuxtApp = useNuxtApp()
const firebase: any = nuxtApp.$firebase
const db = getFirestore(firebase)
const router = useRouter()
const route = useRoute()

const title = ref('マツモトーク')
const titleIcon = ref('/icons/512.png')

const user: any = ref(null)
const users: any = ref([])
const room: any = ref(null)
const chat: any = ref(null)
const isShow: any = ref(false)

const isEdit = ref(false)

const isEditText = ref(false)
const editText = ref('')

const isEditVoice = ref(false)
const recordingStatus = ref('yet')
const recordingIcon = ref(mdiRecordCircleOutline)
const recordingIconColor = ref('accent')
const recordingText = ref('下のボタンで録音開始')
const audioPlayer = ref()

let recorder: Ref<any> = ref(null)
let mimeType: Ref<string> = ref('')
let chunks: Ref<Array<any>> = ref([])

const userOfId = (userId: string) => {
  return users.value.find((u: any) => u.id === userId)
}

const goToBottom = () => {
  nextTick(() => {
    const el = document.getElementById('__nuxt')
    window.scrollTo({
      top: el?.clientHeight,
      left: 0,
      behavior: 'smooth'
    })
  })
}

const onClickEditText = () => {
  isEdit.value = true
  isEditText.value = true
  goToBottom()
}

const onClickCloseEditText = () => {
  resetEditText()
}

const onClickSendEditText = async () => {
  const docRef = doc(db, "chats", chat.value.id)
  chat.value.messages.push({
    userId: user.value.id,
    message: editText.value
  })

  await updateDoc(docRef, {
    messages: chat.value.messages,
    updatedAt: serverTimestamp(),
  })

  goToBottom()
  resetEditText()
}

const resetEditText = () => {
  editText.value= ''
  isEdit.value = false
  isEditText.value = false
}

const onClickEditVoice = () => {
  initAudio()
  isEdit.value = true
  isEditVoice.value = true
}

const initAudio = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.')
    navigator.mediaDevices.getUserMedia ({ audio: true })
      .then((stream) => {
        recorder.value = new MediaRecorder(stream)

        recorder.value.ondataavailable = (e: any) => {
          mimeType.value = e.data.type
          chunks.value.push(e.data)
        }

        recorder.value.onstart = () => {
          console.log('started')
        }

        recorder.value.onstop = () => {
          const blob = new Blob(chunks.value, { 'type' : mimeType.value })
          chunks.value = []
          const audioURL = window.URL.createObjectURL(blob)
          audioPlayer.value.src = audioURL
        }
      })
      .catch((err) => {
        console.log('The following getUserMedia error occured: ' + err)
      })
  } else {
    console.log('getUserMedia not supported on your browser!')
  }
}

const onClickCloseEditVoice = () => {
  resetEditVoice()
}

const resetEditVoice = () => {
  isEdit.value = false
  isEditVoice.value = false
  recordingStatus.value = 'yet'
  recordingIcon.value = mdiRecordCircleOutline
  recordingIconColor.value = 'accent'
  recordingText.value = '下のボタンで録音開始'
}

const onClickRecordingBtn = () => {
  switch(recordingStatus.value) {
    case 'yet':
      recordingStatus.value = 'recording'
      recordingIcon.value = mdiStopCircle
      recordingIconColor.value = 'main'
      recordingText.value = '録音中...下のボタンで録音停止'
      startRecording()
      break
    case 'recording':
      recordingStatus.value = 'stopped'
      recordingIcon.value = mdiPlayCircleOutline
      recordingIconColor.value = 'main'
      recordingText.value = '下のボタンで音声再生'
      stopRecording()
      break
    case 'stopped':
      recordingStatus.value = 'playing'
      recordingIcon.value = mdiStopCircle
      recordingIconColor.value = 'main'
      recordingText.value = '再生中...下のボタンで音声停止'
      playAudio()
      break
    case 'playing':
      recordingStatus.value = 'stopped'
      recordingIcon.value = mdiPlayCircleOutline
      recordingIconColor.value = 'main'
      recordingText.value = '下のボタンで音声再生'
      stopAudio()
      break
  }
}

const startRecording = () => {
  recorder.value?.start()
}

const stopRecording = () => {
  recorder.value?.stop()
}

const playAudio = () => {
  // recorder.value?.stop()
}

const stopAudio = () => {
  // recorder.value?.stop()
}

const login = async () => {
  const auth = getAuth()

  await signInAnonymously(auth)
    .then(async (user) => {
      await createUser({ uid: user.user.uid })
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ...
    })
}

const checkLoginState = async () => {
  return new Promise<void>((resolve) => {
    const auth = getAuth()

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await findUser({ uid: user.uid })
      } else {
        await login()
      }

      resolve()
    })
  })
}

const findUser = async (params: { uid: string }) => {
  const { uid } = params

  const querySnapshot = await getDocs(query(
    collection(db, 'users'),
    where("uid", "==", uid),
    limit(1)
  ))

  querySnapshot.forEach((doc) => {
    user.value = doc.data()
  })

  return user.value
}

const createUser = async (params: { uid: string }) => {
  const { uid } = params

  const docRef = doc(collection(db, "users"))

  await setDoc(docRef, {
    id: docRef.id,
    uid: uid,
    name: '',
    image: '',
    memo: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await findUser({ uid: uid })

  return user.value
}

const fetchData = async () => {
  if(route.query.roomId) {
    const querySnapshot = await getDocs(query(
      collection(db, 'rooms'),
      where("id", "==", route.query.roomId),
      where("userIds", "array-contains", user.value.id),
      limit(1)
    ))

    querySnapshot.forEach((doc) => {
      room.value = doc.data()
    })
  }

  if(room.value) {
    const q = query(collection(db, "chats"), where("roomId", "==", room.value.id), limit(1))

    onSnapshot(q, (querySnapshot: any) => {
      querySnapshot.forEach((doc: any) => {
        chat.value = doc.data()
      })
    })

    const querySnapshot = await getDocs(query(
      collection(db, 'users'),
      where("id", "in", room.value.userIds),
    ))

    querySnapshot.forEach((doc) => {
      users.value.push(doc.data())
    })
  }
}

onMounted(async () => {
  if(!route.query?.roomId) {
    const config = useRuntimeConfig()
    router.push({ path: '/', query: { roomId: config.public.roomId } })
  }

  await checkLoginState().then(async () => {
    await fetchData()

    if(room.value) {
      isShow.value = true
    } else {
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
    }

    goToBottom()
  })
})
</script>

<style scoped>
.bubble {
  background-color: #fff;
  color: #4a4a4a;
  display: inline-block;
  word-wrap: break-word;
  white-space: pre-wrap;
  border-radius: 16px;
  padding: 5px 10px;
  max-width: 70%;
}

.accent {
  background-color: rgb(var(--v-theme-accent));
}
</style>

<style>
body::-webkit-scrollbar {
  display: none;
}
</style>
