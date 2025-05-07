<script setup>
import { ref } from "vue";
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

const EnterVerifyCode = async () => {
  if (!inputcode.value || VerifyTry.value <= 0) return;

  const enteredCode = inputcode.value.toString().trim();

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
          <label>E-Mail</label>
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

      <!-- Verifizierungsformular -->
      <form @submit.prevent="EnterVerifyCode" v-if="VerifyCodeSent">
        <h2>Verifizierungscode eingeben</h2>
        <p>Wir haben einen Code an {{ LoginEmail }} gesendet</p>
        <br>
        <div class="Field group">
          <input class="input" id="code" v-model="inputcode" placeholder="" type="number" required
            :disabled="VerifyTry <= 0" />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>6-stelliger Code</label>
        </div>
        <br />
        <button class="SubmitButton" type="submit" :disabled="VerifyTry <= 0">
          {{ VerifyTry > 0 ? 'Bestätigen' : 'Keine Versuche übrig' }}
        </button>
        <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
        <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>

        <p v-if="VerifyTry <= 0" style="margin-top: 20px;">
          <a href="#" @click.prevent="VerifyCodeSent = false">Neuen Code anfordern</a>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.LoginContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
}

.Login {
  width: 20%;
  padding: 30px;
  text-align: center;
}

.Login h1 {
  color: var(--text);
  text-align: center;
}

form {
  justify-self: center;
  background-color: var(--primary);
  border-radius: 24px;
  padding: 25%;
  box-shadow: 0px 12px 19px 0px rgba(0, 0, 0, 0.75);
}

.SubmitButton {
  width: 100%;
  height: 30px;
  background-color: var(--secondary);
  border-style: none;
  border-radius: 30px;
  color: var(--text);
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
  border-bottom: 1px solid #515151;
  background: transparent;
}

.input:focus {
  outline: none;
}

label {
  color: #999;
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
  color: #22209b;
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
  background: #22209b;
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
    background: #22209b;
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
</style>