<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { authCheck, logoutUser } from '../services/auth';
import router from '../router/router';

const isAdmin = ref(false);
const isLoggedin = async () => { return await authCheck(); }
const isBurgerActive = ref(false);

const closeDropdown = (e) => {
    if (!e.target.closest('.Burger')) {
        isBurgerActive.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
});

async function logout() {
    try {
        await logoutUser();
        router.push('/login');
    } catch (error) {
        console.error('Logout failed:', error);
    }
}
</script>
<template>
    <div class="Navbar-Container">
        <div class="NormalNavbar">
            <div class="Logo">
                <h1>WSCO Reservationen</h1>
            </div>
            <div class="Items">
                <ul>
                    <li>Neue Reservation</li>
                    <li>Meine Reservationen</li>
                    <li>Home</li>
                </ul>
            </div>
            <div class="Login-Logout">
                <RouterLink to="/login">
                    <button v-if="!isLoggedin">
                        Einloggen
                        <div class="arrow-wrapper">
                            <div class="arrow"></div>

                        </div>
                    </button>
                </RouterLink>
                <button v-if="isLoggedin" @click="logout">
                    Ausloggen
                    <div class="arrow-wrapper">
                        <div class="arrow"></div>

                    </div>
                </button>
            </div>
        </div>
        <div class="MediaNavbar">
            <div class="Logo">
                <h1>WSCO <span class="Reser">Reservationen</span></h1>
            </div>
            <div class="Burger">
                <span @click="isBurgerActive = !isBurgerActive">Menu</span>
                <div class="Media-Items" :class="{ active: isBurgerActive }">
                    <p>Neue Reservation</p>
                    <p>Meine Reservationen</p>
                    <p>Home</p>
                </div>
            </div>
            <div class="Login-Logout">
                <button v-if="!isLoggedin">
                    Einloggen
                    <div class="arrow-wrapper">
                        <div class="arrow"></div>

                    </div>
                </button>
                <button v-if="isLoggedin">
                    Ausloggen
                    <div class="arrow-wrapper">
                        <div class="arrow"></div>

                    </div>
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
@import '../assets/css/global.css';
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

h1,
h2,
h3,
h4,
h5,
h6,
p,
a,
span,
div,
li,
ul,
ol,
input,
button {
    font-family: "Roboto", serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-style: normal;
}

body,
html {
    margin: 0;
    padding: 0;
}

.NormalNavbar,
.MediaNavbar {
    display: flex;
    justify-content: center;
    /* Zentriere die Items horizontal */
    align-items: center;
    /* Zentriere die Items vertikal */
    padding: 1rem;
    background-color: #22209b;
    color: #fff;
    gap: 2rem;
    /* Abstand zwischen den Hauptblöcken */
}

.MediaNavbar {
    display: none;
}

ul {
    margin: 0;
    /* Entfernt Standardabstände */
    padding: 0;
    /* Entfernt Standardabstände */
    list-style: none;
    /* Entfernt Bullet Points */
    display: flex;
    justify-content: center;
    /* Horizontale Zentrierung */
    gap: 1.5rem;
    /* Abstand zwischen Items */
}

.Items {
    display: flex;
    justify-content: center;
    /* Horizontale Zentrierung */
    align-items: center;
    /* Vertikale Zentrierung */
    gap: 1rem;
    /* Abstand zwischen den Items */
    flex-grow: 1;
    /* Lässt die Items den verfügbaren Platz nutzen */
    text-align: center;
}

.Items ul {
    display: flex;
    gap: 1rem;
}

ul li {
    list-style: none;
}

ul li,
.Logo:hover {
    cursor: pointer;
}

.Login-Logout {
    position: relative;
    right: 0;
}

@media screen and (max-width: 840px) {
    .NormalNavbar {
        display: none;
    }

    .MediaNavbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #22209b;
    }

    .MediaNavbar .Media-Items {
        display: flex;
        /* Verwende Flexbox für die Zentrierung */
        flex-direction: column;
        /* Vertikale Anordnung */
        align-items: center;
        /* Zentriere die Items */
        gap: 1rem;
        /* Abstand zwischen den Items */
    }

    .MediaNavbar ul {
        display: flex;
        gap: 1rem;
    }

    .MediaNavbar ul li {
        list-style: none;
    }

    .MediaNavbar .Login-Logout {
        position: relative;
        right: 0;
    }

    .Logo {
        width: 170px;
    }

    .Reser {
        display: none;
    }
}

.Burger {
    position: relative;
    display: inline-block;
}

.Media-Items {
    position: absolute;
    background-color: #191880;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    padding: 12px 16px;
    z-index: 1;
    display: none;
    /* Hide by default */
}

.Media-Items p:hover {
    cursor: pointer;
}

.Media-Items.active {
    display: block;
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