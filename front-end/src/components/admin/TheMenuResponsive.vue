<template>
  <a-menu
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    mode="inline"
  >
    <a-menu-item key="admin-subjects">
      <router-link :to="{ name: 'admin-subjects' }">
        <i class="fa-solid fa-user-gear me-2"></i>
        <span class="text-uppercase">{{ admin.admin_name }}</span>
      </router-link>
    </a-menu-item>
    <a-menu-item key="admin-subjects">
      <router-link
        :to="{ name: 'admin-subjects' }"
        :class="{
          active:
            isActive('admin-subjects') ||
            isActive('admin-questions') ||
            isActive('admin-questions-radndom'),
        }"
      >
      <div class="ms-4">
        <i class="fas fa-list me-2"></i>
        <span class="">Môn Học</span>
      </div>
      </router-link>
    </a-menu-item>
    <a-menu-item key="admin-teachers">
      <router-link
        v-if="admin.admin_role == 'admin'"
        :to="{ name: 'admin-teachers' }"
        :class="{ active: isActive('admin-teachers') }"
      >
      <div class="ms-4">
        <i class="fas fa-user-tie me-2"></i>
        <span class="">Teachers</span>
      </div>
      </router-link>
    </a-menu-item>
    <a-menu-item>
    <div class="ms-4">
      <a @click="logout" class="logout">
        <i class="fas fa-sign-out-alt me-2"></i>
        <span class="">Log out</span>
      </a>
    </div>
    </a-menu-item>
  </a-menu>
</template>
<script>
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useMenu } from "../../store/use-menu.js";
import { defineComponent, toRefs, onMounted, ref } from "vue";
import Cookies from "js-cookie";

export default defineComponent({
  setup() {
    const store = useMenu();
    const route = useRoute();
    const isActive = (name) => route.name === name;
    const admin = ref({});
    const logout = () => {
      document.cookie =
        "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
      document.cookie =
        "user_name=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
      delete axios.defaults.headers.common["Authorization"];
      window.location.href = "/admin";
    };

    onMounted(async () => {
      const token = Cookies.get("accessToken");
      await axios
        .get(`http://127.0.0.1:3000/api/admin/${token}`)
        .then((response) => {
          if (response.status == 200) {
            admin.value = response.data;
          }
        })
        .catch((err) => {
          console.log(err);
        });
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
