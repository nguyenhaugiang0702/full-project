<template>
  <!-- <div v-if="!token && !showForgotPassword">
    <Login @show-forgot-password="handleShowForgotPassword"/>
  </div>
  <div v-else-if="!token && showForgotPassword">
    <ForgotPassword />
  </div>
  <div v-else>
    <TheHeader />
    <div class="contain">
      <TheMenu />
      <section class="main">
        <router-view></router-view>
      </section>
    </div>
  </div> -->
  <div>
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
import ForgotPassword from "../pages/admin/teachers/forgot_password.vue";
import Cookies from "js-cookie";
import { ref, onMounted, watchEffect } from "vue";
export default {
  components: {
    TheHeader,
    TheMenu,
    Login,
    ForgotPassword
  },
  setup() {
    const token = Cookies.get("accessToken");

    const handleShowForgotPassword = () => {
      showForgotPassword.value = true;
    };

    return {
      token,
      handleShowForgotPassword
    };
  },
};
</script>

<style>
@import "../assets/css/admin.css";
</style>
