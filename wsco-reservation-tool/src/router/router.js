import { createRouter, createWebHistory } from 'vue-router';

const HomeView = () => import(/* webpackChunkName: "Home" */ '../views/Home.vue');
const Login = () => import(/* webpackChunkName: "Login" */ '../views/Login.vue');
const MyRes = () => import(/* webpackChunkName: "Login" */ '../views/MyRes.vue');



const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/meine-reservationen',
        name: 'MyRes',
        component: MyRes
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});


export default router;