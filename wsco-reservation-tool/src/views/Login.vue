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
  <div class="LoginContainer">
    <div class="Login">
      <h1>Willkommen zurück</h1>

      <!-- Login Formular mit integriertem Loader -->
      <form class="LoginForm" @submit.prevent="Login" v-if="!VerifyCodeSent">
        <h1>Geben Sie Ihre E-Mail ein</h1>
        <div class="Field group">
          <input class="input" id="email" v-model="LoginEmail" placeholder="" type="email" required
            :disabled="isLoading || isSending" />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label :class="{ floated: LoginEmail }">E-Mail</label>
          <div v-if="isLoading" class="inline-spinner">
            <div v-for="i in 12" :key="i" class="spinner-blade"></div>
          </div>
        </div>
        <br />
        <button type="submit" :disabled="isLoading || isSending">
          <span v-if="!isLoading && !isSending">Überprüfen</span>
          <span v-else>Bitte warten...</span>
          <div class="arrow-wrapper">
            <div class="arrow"></div>
          </div>
        </button>
        <p v-if="ErrorMessage" class="Error">{{ ErrorMessage }}</p>
        <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
      </form>

      
      <form @submit.prevent="EnterVerifyCode" v-else>
        <!-- Verifizierungsformular -->
    <h1 class="verification-title">Enter Verification Code</h1>
    <p class="verification-description">
      We have sent a verification code to your email. Please check your
      <strong>inbox</strong> and <strong>spam</strong> folder.
    </p>
    <div class="code-input-wrapper">
      <input
        v-for="(digit, index) in code"
        :key="index"
        ref="inputs"
        type="text"
        maxlength="1"
        pattern="[0-9]*"
        inputmode="numeric"
        v-model="code[index]"
        class="code-input"
        @input="handleInput(index)"
        @keydown.delete="handleDelete(index)"
      />
    </div>
    <button class="verify-button" type="submit">
      <span v-if="!load">Verifizieren</span>
      <span v-else class="loading-wrapper">
        <div v-if="load" class="inline-spinner">
            <div v-for="i in 12" :key="i" class="spinner-blade"></div>
        </div> Warten...
      </span>
    </button>
  </form>

    </div>
  </div>
</template>

<style scoped>
.LoginContainer {
  background-image: url('/background.jpg'); /* Pfad zum Bild */
  background-size: cover;                   /* Bild skaliert auf gesamten Bereich */
  background-position: center;              /* Bild zentrieren */
  background-repeat: no-repeat;             /* Kein Wiederholen */
  backdrop-filter: blur(2px);               /* Optional: leichter Blur */
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.Login {
  width: 20%;
  padding: 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.Login h1 {
  color: #ffffff;
  text-align: center;
}

form {
background: rgba(255, 255, 255, 0.22);
border-radius: 16px;
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
backdrop-filter: blur(2.6px);
-webkit-backdrop-filter: blur(2.6px);
border: 1px solid rgba(255, 255, 255, 0.39);
padding: 25%;
min-width: 400px;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
}

.SubmitButton {
  width: 100%;
  height: 30px;
  background-color: var(--secondary);
  border-style: none;
  border-radius: 30px;
  color: #fff;
  font-size: large;
}

/* Integrierter Spinner */
.inline-spinner {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  width: 1em;
  height: 1em;
}

.inline-spinner .spinner-blade {
  position: absolute;
  left: 0.4629em;
  bottom: 0;
  width: 0.074em;
  height: 0.2777em;
  border-radius: 0.0555em;
  background-color: #69717d;
  transform-origin: center -0.2222em;
  animation: spinner-fade9234 1s infinite linear;
}

label.floated {
  top: -20px;
  font-size: 14px;
  color: #cecdcd;
}

@keyframes spinner-fade9234 {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.2;
  }
}

/* Positionierung der Blades */
.inline-spinner .spinner-blade:nth-child(1) {
  transform: rotate(0deg);
  animation-delay: 0s;
}

.inline-spinner .spinner-blade:nth-child(2) {
  transform: rotate(30deg);
  animation-delay: 0.083s;
}

.inline-spinner .spinner-blade:nth-child(3) {
  transform: rotate(60deg);
  animation-delay: 0.166s;
}

.inline-spinner .spinner-blade:nth-child(4) {
  transform: rotate(90deg);
  animation-delay: 0.249s;
}

.inline-spinner .spinner-blade:nth-child(5) {
  transform: rotate(120deg);
  animation-delay: 0.332s;
}

.inline-spinner .spinner-blade:nth-child(6) {
  transform: rotate(150deg);
  animation-delay: 0.415s;
}

.inline-spinner .spinner-blade:nth-child(7) {
  transform: rotate(180deg);
  animation-delay: 0.498s;
}

.inline-spinner .spinner-blade:nth-child(8) {
  transform: rotate(210deg);
  animation-delay: 0.581s;
}

.inline-spinner .spinner-blade:nth-child(9) {
  transform: rotate(240deg);
  animation-delay: 0.664s;
}

.inline-spinner .spinner-blade:nth-child(10) {
  transform: rotate(270deg);
  animation-delay: 0.747s;
}

.inline-spinner .spinner-blade:nth-child(11) {
  transform: rotate(300deg);
  animation-delay: 0.83s;
}

.inline-spinner .spinner-blade:nth-child(12) {
  transform: rotate(330deg);
  animation-delay: 0.913s;
}

/* Form Field Styles */
.group {
  position: relative;
}

.input {
  font-size: 16px;
  padding: 10px 30px 10px 5px;
  /* Rechts mehr Platz für Spinner */
  display: block;
  width: 200px;
  border: none;
  border-bottom: 1px solid #ffffff;
  background: transparent;
  color: #fff;
}

.input:focus {
  outline: none;
}

label {
  color: #ffffff;
  font-size: 18px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 5px;
  top: 10px;
  transition: 0.2s ease all;
}

.input:focus~label,
.input:valid~label {
  top: -20px;
  font-size: 14px;
  color: #cecdcd;
}

.bar {
  position: relative;
  display: block;
  width: 200px;
}

.bar:before,
.bar:after {
  content: "";
  height: 2px;
  width: 0;
  bottom: 1px;
  position: absolute;
  background: #cecdcd;
  transition: 0.2s ease all;
}

.bar:before {
  left: 50%;
}

.bar:after {
  right: 50%;
}

.input:focus~.bar:before,
.input:focus~.bar:after {
  width: 50%;
}

.highlight {
  position: absolute;
  height: 60%;
  width: 100px;
  top: 25%;
  left: 0;
  pointer-events: none;
  opacity: 0.5;
}

.input:focus~.highlight {
  animation: inputHighlighter 0.3s ease;
}

@keyframes inputHighlighter {
  from {
    background: #cecdcd;
  }

  to {
    width: 0;
    background: transparent;
  }
}

button {
  --primary-color: #ffff;
  --secondary-color: #002152;
  --hover-color: #eceff2;
  --arrow-width: 10px;
  --arrow-stroke: 2px;
  box-sizing: border-box;
  border: 0;
  border-radius: 50px;
  color: var(--secondary-color);
  padding: 1em 1.8em;
  background: var(--primary-color);
  display: flex;
  transition: 0.2s background;
  align-items: center;
  gap: 0.6em;
  font-weight: bold;
}

button .arrow-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

button .arrow {
  margin-top: 1px;
  width: var(--arrow-width);
  background: var(--primary-color);
  height: var(--arrow-stroke);
  position: relative;
  transition: 0.2s;
}

button .arrow::before {
  content: "";
  box-sizing: border-box;
  position: absolute;
  border: solid var(--secondary-color);
  border-width: 0 var(--arrow-stroke) var(--arrow-stroke) 0;
  display: inline-block;
  top: -3px;
  right: 3px;
  transition: 0.2s;
  padding: 3px;
  transform: rotate(-45deg);
}

button:hover {
  background-color: var(--hover-color);
}

button:hover .arrow {
  background: var(--secondary-color);
}

button:hover .arrow:before {
  right: 0;
}

.verification-title {
  font-size: 1.875rem; /* text-3xl */
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  color: #fff;
}

.verification-description {
  text-align: center;
  color: #fff; /* text-gray-600 */
  margin-bottom: 1.5rem;
}

.code-input-wrapper {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.code-input {
  width: 3rem;   /* w-12 */
  height: 3rem;  /* h-12 */
  font-size: 1.5rem; /* text-2xl */
  text-align: center;
  border: 2px solid #d1d5db; /* border-gray-300 */
  border-radius: 0.375rem; /* rounded */
  background-color: #f3f4f6; /* bg-gray-100 */
  outline: none;
}

.code-input:focus {
  border-color: #e8e6e6; /* focus:border-[#77aca2] */
}

.verify-button {
  background-color: #fff;
  color: #002152;
  font-weight: bold;
  padding: 0.5rem 1rem;
  width: 100%;
  border: none;
  border-radius: 0.375rem; /* rounded */
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s;
}

.verify-button:hover {
  background-color: #e8e6e6;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.loader {
  animation: spin 1s linear infinite;
}

/* Spinner animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>