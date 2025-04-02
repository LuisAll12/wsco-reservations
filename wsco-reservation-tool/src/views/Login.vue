<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import emailjs from 'emailjs-com';
import {setSessionKey} from '../services/sessionKeyService.js';

const baseId = "appzBNlFfIJC6865x";
const tableName = "tblalxalwt9C0cFxl";

const router = useRouter();
const LoginEmail = ref('');
const ErrorMessage = ref("");
const successMessage = ref("");
const errorMessage = ref("");
const VerifyCodeSent = ref(false);
const VerifyTry = ref(3);
const inputcode = ref();
const verificationCode = ref(0);
const isLoading = ref(false);
const isSending = ref(false); // Neu: Verhindert Mehrfachversand

const generateVerificationCode = () => {
  verificationCode.value = Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email) => {
  if (isSending.value) return; // Verhindert Mehrfachversand
  
  isSending.value = true;
  generateVerificationCode();

  const templateParams = {
    to_email: email,
    message: `Ihr Verifizierungscode lautet: ${verificationCode.value}`,
  };
  const serviceID = "service_wzhmwmh";
  const templateID = "template_z8u5xt3";
  const userID = "n5sGkJrXJbUIwcaC6";

  try {
    await emailjs.send(serviceID, templateID, templateParams, userID);
    successMessage.value = "Verifizierungscode wurde an Ihre E-Mail gesendet!";
    errorMessage.value = "";
    VerifyCodeSent.value = true;
    VerifyTry.value = 3; // Reset der Versuche
  } catch (error) {
    errorMessage.value = "Fehler beim Senden des Codes. Bitte versuchen Sie es später erneut.";
    successMessage.value = "";
    console.error("EmailJS Error:", error);
  } finally {
    isSending.value = false;
  }
};

const Login = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  ErrorMessage.value = "";
  
  // Einfache E-Mail-Validierung
  if (!LoginEmail.value || !LoginEmail.value.includes('@')) {
    ErrorMessage.value = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    isLoading.value = false;
    return;
  }

  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  const headers = {
    Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
  };

  try {
    const response = await axios.get(url, { headers });
    const user = response.data.records.find(
      (record) => record.fields.Email?.toLowerCase() === LoginEmail.value.toLowerCase()
    );

    if (user) {
      await sendVerificationEmail(LoginEmail.value);
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

const EnterVerifyCode = () => {
  if (!inputcode.value || VerifyTry.value <= 0) return;

  // Trim und Typ-Sicherheit
  const enteredCode = inputcode.value.toString().trim();
  const expectedCode = verificationCode.value.toString().trim();

  if (enteredCode === expectedCode) {
    const Loginvalid = setSessionKey(LoginEmail.value);
    if (Loginvalid) {
      successMessage.value = "Erfolgreich verifiziert!";
      errorMessage.value = "";
      router.push("/dashboard");
    }
  } else {
    VerifyTry.value -= 1;
    if (VerifyTry.value > 0) {
      errorMessage.value = `Falscher Code. Noch ${VerifyTry.value} Versuch${VerifyTry.value !== 1 ? 'e' : ''} übrig.`;
    } else {
      errorMessage.value = "Keine Versuche mehr übrig. Bitte starten Sie den Vorgang neu.";
      VerifyCodeSent.value = false;
      LoginEmail.value = "";
    }
    inputcode.value = ""; // Eingabe zurücksetzen
  }
};
</script>

<template>
  <div class="LoginContainer">
    <div class="Login">
      <h1>Willkommen zurück</h1>
      
      <!-- Ladeanimation -->
      <form v-if="isLoading">
        <div class="spinner center">
          <div v-for="i in 12" :key="i" class="spinner-blade"></div>
        </div>
        <p>Überprüfe E-Mail...</p>
      </form>

      <!-- Login Formular -->
      <form class="LoginForm" @submit.prevent="Login" v-if="!VerifyCodeSent && !isLoading">
        <h1>Geben Sie Ihre E-Mail ein</h1>
        <div class="Field group">
          <input
            class="input"
            id="email"
            v-model="LoginEmail"
            placeholder=""
            type="email"
            required
            :disabled="isSending"
          />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>E-Mail</label>
        </div>
        <br />
        <button type="submit" :disabled="isSending">
          <span v-if="!isSending">Überprüfen</span>
          <span v-else>Wird gesendet...</span>
          <div class="arrow-wrapper">
            <div class="arrow"></div>
          </div>
        </button>
        <p v-if="ErrorMessage" class="Error">{{ ErrorMessage }}</p>
        <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
      </form>

      <!-- Verifizierungsformular -->
      <form @submit.prevent="EnterVerifyCode" v-if="VerifyCodeSent && !isLoading">
        <h2>Verifizierungscode eingeben</h2>
        <p>Wir haben einen Code an {{ LoginEmail }} gesendet</p>
        <br>
        <div class="Field group">
          <input
            class="input"
            id="code"
            v-model="inputcode"
            placeholder=""
            type="number"
            required
            :disabled="VerifyTry <= 0"
          />
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
/* Form Field Styles */
.group {
  position: relative;
}
.input {
  font-size: 16px;
  padding: 10px 10px 10px 5px;
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
.input:focus ~ label,
.input:valid ~ label {
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
.input:focus ~ .bar:before,
.input:focus ~ .bar:after {
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
.input:focus ~ .highlight {
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
.spinner {
  font-size: 28px;
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
}

.spinner.center {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}

.spinner .spinner-blade {
  position: absolute;
  left: 0.4629em;
  bottom: 0;
  width: 0.074em;
  height: 0.2777em;
  border-radius: 0.0555em;
  background-color: transparent;
  -webkit-transform-origin: center -0.2222em;
  -ms-transform-origin: center -0.2222em;
  transform-origin: center -0.2222em;
  animation: spinner-fade9234 1s infinite linear;
}

.spinner .spinner-blade:nth-child(1) {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
  -webkit-transform: rotate(0deg);
  -ms-transform: rotate(0deg);
  transform: rotate(0deg);
}

.spinner .spinner-blade:nth-child(2) {
  -webkit-animation-delay: 0.083s;
  animation-delay: 0.083s;
  -webkit-transform: rotate(30deg);
  -ms-transform: rotate(30deg);
  transform: rotate(30deg);
}

.spinner .spinner-blade:nth-child(3) {
  -webkit-animation-delay: 0.166s;
  animation-delay: 0.166s;
  -webkit-transform: rotate(60deg);
  -ms-transform: rotate(60deg);
  transform: rotate(60deg);
}

.spinner .spinner-blade:nth-child(4) {
  -webkit-animation-delay: 0.249s;
  animation-delay: 0.249s;
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  transform: rotate(90deg);
}

.spinner .spinner-blade:nth-child(5) {
  -webkit-animation-delay: 0.332s;
  animation-delay: 0.332s;
  -webkit-transform: rotate(120deg);
  -ms-transform: rotate(120deg);
  transform: rotate(120deg);
}

.spinner .spinner-blade:nth-child(6) {
  -webkit-animation-delay: 0.415s;
  animation-delay: 0.415s;
  -webkit-transform: rotate(150deg);
  -ms-transform: rotate(150deg);
  transform: rotate(150deg);
}

.spinner .spinner-blade:nth-child(7) {
  -webkit-animation-delay: 0.498s;
  animation-delay: 0.498s;
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}

.spinner .spinner-blade:nth-child(8) {
  -webkit-animation-delay: 0.581s;
  animation-delay: 0.581s;
  -webkit-transform: rotate(210deg);
  -ms-transform: rotate(210deg);
  transform: rotate(210deg);
}

.spinner .spinner-blade:nth-child(9) {
  -webkit-animation-delay: 0.664s;
  animation-delay: 0.664s;
  -webkit-transform: rotate(240deg);
  -ms-transform: rotate(240deg);
  transform: rotate(240deg);
}

.spinner .spinner-blade:nth-child(10) {
  -webkit-animation-delay: 0.747s;
  animation-delay: 0.747s;
  -webkit-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  transform: rotate(270deg);
}

.spinner .spinner-blade:nth-child(11) {
  -webkit-animation-delay: 0.83s;
  animation-delay: 0.83s;
  -webkit-transform: rotate(300deg);
  -ms-transform: rotate(300deg);
  transform: rotate(300deg);
}

.spinner .spinner-blade:nth-child(12) {
  -webkit-animation-delay: 0.913s;
  animation-delay: 0.913s;
  -webkit-transform: rotate(330deg);
  -ms-transform: rotate(330deg);
  transform: rotate(330deg);
}

@keyframes spinner-fade9234 {
  0% {
    background-color: #69717d;
  }

  100% {
    background-color: transparent;
  }
}
</style>
