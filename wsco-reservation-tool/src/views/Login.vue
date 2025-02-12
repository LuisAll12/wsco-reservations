<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import emailjs from 'emailjs-com';

const baseId = "appzBNlFfIJC6865x";
const tableName = "tblalxalwt9C0cFxl";

const router = useRouter();
const LoginEmail = ref("");
const ErrorMessage = ref("");
const successMessage = ref("");
const errorMessage = ref("");
const VerifyCodeSent = ref(false);
const VerifyTry = ref(3);
const inputcode = ref();
const verificationCode = ref(0);
const isLoading = ref(false);

const generateVerificationCode = () => {
  verificationCode.value = Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email) => {
  generateVerificationCode();

  const templateParams = {
    to_email: email,
    message: `Your verification code is: ${verificationCode.value}`,
  };
  const serviceID = "service_wzhmwmh";
  const templateID = "template_z8u5xt3";
  const userID = "n5sGkJrXJbUIwcaC6";

  try {
    await emailjs.send(serviceID, templateID, templateParams, userID);
    successMessage.value = "Verification code sent successfully!";
    errorMessage.value = "";
    VerifyCodeSent.value = true;
  } catch (error) {
    errorMessage.value = "Failed to send verification code. Please try again.";
    successMessage.value = "";
    console.error(error);
  }
};

const Login = async () => {
    isLoading.value = true;
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  const headers = {
    Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
  };

  try {
    const response = await axios.get(url, { headers });
    const user = response.data.records.find(
      (record) => record.fields.Email === LoginEmail.value
    );

    if (user) {
        isLoading.value = false;
      ErrorMessage.value = "";
      sendVerificationEmail(LoginEmail.value);
    } else {
      ErrorMessage.value = "Invalid email.";
    }
  } catch (error) {
    console.error("Error during login:", error.response ? error.response.data : error.message);
    ErrorMessage.value = "An error occurred. Please try again later.";
  }
};

const EnterVerifyCode = () => {
    if (inputcode.value.toString().trim() === verificationCode.value.trim()) {
        successMessage.value = "Verification successful!";
        VerifyCodeSent.value = false;
        router.push("/meine-reservationen");
    } else {
        VerifyTry.value -= 1;
        errorMessage.value = `Wrong verification code. ${VerifyTry.value} tries left.`;
    }

    if (VerifyTry.value <= 0) {
        errorMessage.value = "Wrong verification code. No more tries left.";
        VerifyCodeSent.value = false;
    }
};
</script>

<template>
  <div class="LoginContainer">
    <!-- Login -->
    <div class="Login">

      <h1>Willkommen zurück</h1>
        <form action="" v-if="isLoading">
            <div class="spinner center">
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
            </div>
        </form>
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
          />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>E-Mail</label>
        </div>
        <br />
        <br />
        <button  type="submit">
                Überprüfen 
                    <div class="arrow-wrapper">
                        <div class="arrow"></div>

                    </div>
                </button>
        <p v-if="ErrorMessage" class="Error">{{ ErrorMessage }}</p>
      </form>

      <!-- Verification -->
      <form @submit.prevent="EnterVerifyCode" v-if="VerifyCodeSent">
        <h2>Geben Sie den Verifizierungscode ein</h2>
        <br>
        <div class="Field group">
          <input
            class="input"
            id="code"
            v-model="inputcode"
            placeholder=""
            type="number"
            required
          />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Verifizierungscode</label>
        </div>
        <br />
        <button class="SubmitButton" type="submit">Bestätigen</button>
        <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
      </form>

      <p v-if="successMessage">{{ successMessage }}</p>
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
