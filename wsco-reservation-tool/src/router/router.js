import { createRouter, createWebHistory } from 'vue-router';
import Cookies from 'js-cookie';


const HomeView = () => import(/* webpackChunkName: "Home" */ '../views/Home.vue');
const Login = () => import(/* webpackChunkName: "Login" */ '../views/Login.vue');
const MyRes = () => import(/* webpackChunkName: "Login" */ '../views/MyRes.vue');
const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '../views/DashboardView.vue');
const ReportDamage = () => import(/* webpackChunkName: "ReportDamage" */ '../components/ReportDamage.vue');


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
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/dashboard/schaden-melden',
        name: 'ReportDamage',
        component: ReportDamage
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const isAuthenticated = Cookies.get("sessionKey") !== undefined;
    const isLoginPage = to.name === 'Login';

    if (isAuthenticated && isLoginPage) {
        next({ name: 'Dashboard' });
    } else if (!isAuthenticated && !isLoginPage) {
        next({ name: 'Login' });
    } else {
        next();
    }
}
);

export default router;