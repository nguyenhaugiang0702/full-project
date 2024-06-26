import { createWebHistory, createRouter } from "vue-router";
import admin from "./admin.js";
import Cookies from 'js-cookie';

const routes = [...admin];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Guard để kiểm tra token trước khi truy cập vào trang đăng nhập
router.beforeEach((to, from, next) => {
  const token = Cookies.get('accessToken');
  if (token && to.name === 'login') {
    next({ name: 'admin' });
  } else {
    next();
  }
});

export default router;
