<template>
  <nav style="border-right: 1px solid gray">
    <li>
      <router-link class="logo" :to="{ name: 'admin-subjects' }">
        <img src="../../assets/images/admin_icon.jpg" />
        <span class="nav-item">Admin</span>
      </router-link>
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
      <router-link v-if="admin.admin_role == 'admin'"
        :to="{ name: 'admin-teachers' }"
        :class="{ active: isActive('admin-teachers') }"
      >
        <i class="fas fa-user-tie"></i>
        <span class="nav-item">Teachers</span>
      </router-link>
    </li>
    <li>
      <a @click="logout" class="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span class="nav-item">Log out</span>
      </a>
    </li>
  </nav>
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
      await axios.get(`http://127.0.0.1:3000/api/admin/${token}`)
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
</style>
