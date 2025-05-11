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
const Calendar = () => import(/* webpackChunkName: "Dashboard" */ '../components/Calendar.vue')
const AdminDashboard = () => import(/* webpackChunkName: "AdminDashboard" */ '../components/Admin/AdminDashboard.vue');

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
                path: 'admin',
                component: AdminDashboard
            },
            {
                path: 'hilfe',
                component: AdminDashboard
            },
            {
                path: 'settings',
                component: AdminDashboard
            }
        ]
    },
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