import { createRouter, createWebHistory } from 'vue-router';
import Cookies from 'js-cookie';
import { authCheck } from '../services/auth';


const HomeView = () => import(/* webpackChunkName: "Home" */ '../views/Home.vue');
const Login = () => import(/* webpackChunkName: "Login" */ '../views/Login.vue');
const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '../views/DashboardView.vue');
const ReportDamage = () => import(/* webpackChunkName: "ReportDamage" */ '../components/ReportDamage.vue');
const ClubBoats = () => import(/* webpackChunkName: "ClubBoats" */ '../components/ClubBoats.vue');
const MyReservations = () => import(/* webpackChunkName: "MyReservations" */ '../components/MyReservations.vue');
const BoatDetail = () => import(/* webpackChunkName: "BoatDetail" */ '../components/BoatDetail.vue');

const AdminDashboard = () => import(/* webpackChunkName: "AdminDashboard" */ '../components/Admin/AdminDashboard.vue');

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
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/dashboard/schaden-melden',
        name: 'ReportDamage',
        component: ReportDamage
    },
    {
        path: '/dashboard/unsere-boote',
        name: 'ClubBoats',
        component: ClubBoats
    },
    {
        path: '/dashboard/meine-reservierungen',
        name: 'MyReservations',
        component: MyReservations
    },
    {
        path: '/dashboard/unsere-boote/:id',
        name: 'BoatDetail',
        component: BoatDetail  // Datei siehe unten
    },
    {
        path: '/dashboard/admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const isAuthenticated = await authCheck();
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