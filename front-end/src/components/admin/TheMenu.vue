<template>
  <nav class="sidebar border-right">
    <li @click="window.location.reload()">
      <a>
        <div class="row py-4 d-flex">
          <i
            class="fa-solid fa-user-gear col-1 fs-4 align-items-center ms-4"
          ></i>
          <div class="text-uppercase fw-bold col-7 ms-4 fs-4 text-break">
            {{ admin.admin_name }}
          </div>
        </div>
      </a>
    </li>
    <li>
      <router-link
        :to="{ name: 'admin-subjects' }"
        :class="{
          active:
            isActive('admin-subjects') ||
            isActive('admin-questions') ||
            isActive('admin-questions-radndom'),
        }"
      >
        <i class="fas fa-list"></i>
        <span class="nav-item">Môn Học</span>
      </router-link>
    </li>
    <li>
      <router-link
        :to="{ name: 'admin-teachers-changepassword' }"
        :class="{
          active: isActive('admin-teachers-changepassword'),
        }"
      >
        <i class="fas fa-list"></i>
        <span class="nav-item">Đổi mật khẩu</span>
      </router-link>
    </li>
    <li>
      <router-link
        v-if="admin.admin_role == 'admin'"
        :to="{ name: 'admin-teachers' }"
        :class="{ active: isActive('admin-teachers') }"
      >
        <i class="fas fa-user-tie"></i>
        <span class="nav-item">Giảng Viên</span>
      </router-link>
    </li>
    <li>
      <a @click="logout" class="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span class="nav-item">Đăng xuất</span>
      </a>
    </li>
  </nav>
</template>
<script>
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useMenu } from "../../store/use-menu.js";
import { defineComponent, toRefs, onMounted, ref } from "vue";
import { showConfirmation } from "@/utils/swalUtils.js";
import axios from "axios";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";

export default defineComponent({
  setup() {
    const store = useMenu();
    const route = useRoute();
    const router = useRouter();
    const isActive = (name) => route.name === name;
    const admin = ref({});
    const api = new ApiService();

    const logout = async () => {
      const result = await showConfirmation({
        title: "Bạn có chắc chắn muốn thoát không?",
        confirmButtonText: "Có",
        cancelButtonText: "Không"
      });
      if (result.isConfirmed) {
        document.cookie =
          "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
        document.cookie =
          "user_name=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
        delete axios.defaults.headers.common["Authorization"];
        router.push({ name: "login" });
      }
    };

    onMounted(async () => {
      const token = Cookies.get("accessToken");
      const response = await api.get(`admin/${token}`);
      if (response?.status == 200) {
        admin.value = response.data;
      }
    });

    const { selectedKeys, openKeys } = store;
    return {
      logout,
      isActive,
      ...storeToRefs(store),
      admin,
    };
  },
});
</script>

<style scoped>
.active {
  color: blue;
  font-weight: bold;
}

.sidebar {
  background-color: #f4f4f4;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
