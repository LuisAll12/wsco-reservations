<script setup>
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { setSessionKey } from '../services/sessionKeyService.js';

const router = useRouter();
const LoginEmail = ref('');
const ErrorMessage = ref("");
const successMessage = ref("");
const errorMessage = ref("");
const VerifyCodeSent = ref(false);
const VerifyTry = ref(3);
const inputcode = ref();
const isLoading = ref(false);
const isSending = ref(false);
const load = ref(false);  


const Login = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  ErrorMessage.value = "";
  LoginEmail.value = LoginEmail.value.trim();
  LoginEmail.value = LoginEmail.value.toLowerCase();

  if (!LoginEmail.value || !LoginEmail.value.includes('@')) {
    ErrorMessage.value = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    isLoading.value = false;
    return;
  }

  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: LoginEmail.value }),
    credentials: "include",
    redirect: "follow",
  });
  try {
    const data = await res.json();

    if (data.message === "success") {
      VerifyCodeSent.value = true;
      successMessage.value = "Ein Verifizierungscode wurde an Ihre E-Mail gesendet. Bitte überprüfen Sie Ihren Posteingang und Ihren Spam.";
      errorMessage.value = "";
    } else {
      ErrorMessage.value = "Diese E-Mail ist nicht registriert.";
    }
  } catch (error) {
    console.error("Login Error:", error.response ? error.response.data : error.message);
    ErrorMessage.value = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später noch einmal.";
  } finally {
    isLoading.value = false;
  }
};

const code = ref(["", "", "", "", "", ""]);
const inputs = ref(null)

function handleInput(index) {
   if (code.value[index].length === 1 && index < 5) {
      nextTick(() => inputs.value[index + 1]?.focus()); // Move to next input
   }
}

// Handle delete (backspace)
function handleDelete(index) {
   if (index > 0 && !code.value[index]) {
      nextTick(() => inputs.value[index - 1]?.focus()); // Move back
  }
}


const EnterVerifyCode = async () => {
  if (!inputs.value || VerifyTry.value <= 0) return;

  const enteredCode = code.value.join("");

  try {
    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/auth/finish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: LoginEmail.value, code: enteredCode }),
      credentials: "include",
    }
    );
    const data = await res.json();

    if (data.message === "success") {
      VerifyCodeSent.value = false;
      successMessage.value = "Erfolgreich verifiziert!";
      errorMessage.value = "";
      router.push("/dashboard");
    } else {
      VerifyTry.value -= 1;
      if (VerifyTry.value > 0) {
        errorMessage.value = `Falscher Code. Noch ${VerifyTry.value} Versuch${VerifyTry.value !== 1 ? 'e' : ''} übrig.`;
      } else {
        errorMessage.value = "Keine Versuche mehr übrig. Bitte starten Sie den Vorgang neu.";
        VerifyCodeSent.value = false;
        LoginEmail.value = "";
      }
      inputcode.value = "";
    }
  } catch (error) {
    console.error("Verification Error:", error.response ? error.response.data : error.message);
    errorMessage.value = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später noch einmal.";
  }
};
</script>

<template>
  <div class="min-h-screen w-full bg-cover bg-center flex items-center justify-center" style="background-image: url('/background.jpg')">
    <div class="w-full max-w-md px-6">
      <div class="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg p-8 text-center space-y-6">
        <h1 class="text-white text-2xl font-semibold">Willkommen zurück</h1>

        <!-- E-Mail Eingabe -->
        <form @submit.prevent="Login" v-if="!VerifyCodeSent" class="space-y-6">
          <div>
            <label for="email" class="block text-white text-sm mb-1 text-left">E-Mail</label>
            <div class="relative">
              <input
                id="email"
                type="email"
                v-model="LoginEmail"
                class="w-full px-4 py-2 rounded-md bg-white/30 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/70 disabled:opacity-50"
                :disabled="isLoading || isSending"
                placeholder="E-Mail eingeben"
              />
              <div v-if="isLoading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p v-if="ErrorMessage" class="text-red-300 mt-2 text-sm text-left">{{ ErrorMessage }}</p>
            <p v-if="successMessage" class="text-green-200 mt-2 text-sm text-left">{{ successMessage }}</p>
          </div>

          <button
            type="submit"
            :disabled="isLoading || isSending"
            class="w-full py-2 rounded-full font-bold bg-white text-[#002152] hover:bg-gray-100 transition disabled:opacity-50"
          >
            <span v-if="!isLoading">Überprüfen</span>
            <span v-else>Bitte warten…</span>
          </button>
        </form>

        <!-- Verifizierungscode -->
        <form @submit.prevent="EnterVerifyCode" v-else class="space-y-6">
          <div>
            <h2 class="text-white text-xl font-semibold">Verifizierungscode eingeben</h2>
            <p class="text-white/90 text-sm mt-2">Wir haben einen Code an Ihre E-Mail gesendet. Prüfen Sie bitte Ihren <strong>Posteingang</strong> und <strong>Spam-Ordner</strong>.</p>
          </div>

          <div class="flex justify-center gap-2">
            <input
              v-for="(digit, index) in code"
              :key="index"
              ref="inputs"
              type="text"
              maxlength="1"
              pattern="[0-9]*"
              inputmode="numeric"
              v-model="code[index]"
              @input="handleInput(index)"
              @keydown.delete="handleDelete(index)"
              class="w-12 h-12 text-center text-xl font-semibold bg-white/90 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#002152] text-[#002152]"
            />
          </div>

          <p v-if="errorMessage" class="text-red-200 text-sm">{{ errorMessage }}</p>

          <button
            type="submit"
            class="w-full py-2 rounded-full font-bold bg-white text-[#002152] hover:bg-gray-100 transition"
          >
            <span v-if="!load">Verifizieren</span>
            <span v-else class="flex justify-center items-center gap-2">
              <div class="w-4 h-4 border-2 border-[#002152] border-t-transparent rounded-full animate-spin"></div>
              Warten…
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
