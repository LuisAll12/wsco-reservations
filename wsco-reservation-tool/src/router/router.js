import { createRouter, createWebHistory } from 'vue-router';
import Cookies from 'js-cookie';
import { authCheck, getUserRole } from '../services/auth';


const HomeView = () => import(/* webpackChunkName: "Home" */ '../views/Home.vue');
const Login = () => import(/* webpackChunkName: "Login" */ '../views/Login.vue');
const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '../views/DashboardView.vue');
const ReportDamage = () => import(/* webpackChunkName: "ReportDamage" */ '../components/ReportDamage.vue');
const ClubBoats = () => import(/* webpackChunkName: "ClubBoats" */ '../components/ClubBoats.vue');
const MyReservations = () => import(/* webpackChunkName: "MyReservations" */ '../components/MyReservations.vue');
const BoatDetail = () => import(/* webpackChunkName: "BoatDetail" */ '../components/BoatDetail.vue');
const Calendar = () => import(/* webpackChunkName: "Dashboard" */ '../components/Calendar.vue')

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        children: [
            {
                path: '',
                name: 'DashboardCalendar',
                component: Calendar
            },
            {
                path: 'schaden-melden',
                component: ReportDamage
            },
            {
                path: 'unsere-boote',
                component: ClubBoats
            },
            {
                path: 'meine-reservierungen',
                component: MyReservations
            },
            {
                path: 'unsere-boote/:id',
                component: BoatDetail
            },
            {
                path: 'hilfe',
                component: MyReservations
            },
            {
                path: 'settings',
                component: MyReservations
            }
        ]
    },
    {
        path: '/impressum',
        name: 'Impressum',
        component: () => import(/* webpackChunkName: "Impressum" */ '../views/Impressum.vue')
    },
    {
        path: '/datenschutz',
        name: 'Datenschutz',
        component: () => import(/* webpackChunkName: "Datenschutz" */ '../views/Datenschutz.vue')
    },
    {
        path: '/agb',
        name: 'AGB',
        component: () => import(/* webpackChunkName: "AGB" */ '../views/AGB.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

let adminRouteAdded = false;

router.beforeEach(async (to, from, next) => {
    const isAuthenticated = await authCheck();
    const isLoginPage = to.name === 'Login';

    if (isAuthenticated && !adminRouteAdded) {
        const role = await getUserRole();
        if (role === 'admin') {
            router.addRoute('Dashboard', {
                name: 'admin',
                path: 'admin',
                component: () => import('../components/Admin/AdminDashboard.vue')
            });
        }
        adminRouteAdded = true;
        return next({ ...to, replace: true });
    }

    if (isAuthenticated && isLoginPage) {
        next({ name: 'Dashboard' });
    } else if (!isAuthenticated && !isLoginPage) {
        next({ name: 'Login' });
    } else {
        next();
    }
});


export default router;