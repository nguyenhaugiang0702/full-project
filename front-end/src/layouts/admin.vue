<template>
  <div v-if="!token">
    <Login />
  </div>
  <div v-else>
    <TheHeader />
    <div class="contain">
      <TheMenu />
      <section class="main">
        <router-view></router-view>
      </section>
    </div>
  </div>
</template>
<script>
import TheHeader from "../components/admin/TheHeader.vue";
import TheMenu from "../components/admin/TheMenu.vue";
import Login from "../components/admin/Login.vue";
import Cookies from "js-cookie";
import { ref, onMounted, watchEffect } from "vue";
export default {
  components: {
    TheHeader,
    TheMenu,
    Login,
  },
  setup() {
    const token = Cookies.get("accessToken");

    return {
      token,
    };
  },
};
</script>

<style>
@import "../assets/css/admin.css";
</style>
