import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/users',
            component: () => import('@/pages/users/UsersListPage.vue'),
        },
        {
            path: '/users/new',
            component: () => import('@/pages/users/UserCreatePage.vue'),
        },
        {
            path: '/users/:id/edit',
            component: () => import('@/pages/users/UserEditPage.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/users',
        },
    ],
});

export default router;