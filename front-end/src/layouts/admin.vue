<template>
  <div>
    <TheHeader />
    <div class="contain">
      <TheMenu @navigate="handleNavigate" />
      <section class="main">
        <router-view v-if="!isLoading"></router-view>
        <div class="loader-container">
          <div v-if="isLoading" class="loader"></div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import TheHeader from "../components/admin/TheHeader.vue";
import TheMenu from "../components/admin/TheMenu.vue";
import { ref, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";

export default {
  components: {
    TheHeader,
    TheMenu,
  },
  setup() {
    const isLoading = ref(false);
    const router = useRouter();

    const handleNavigate = () => {
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 1000);
    };

    // Watch for route changes
    router.beforeEach((to, from, next) => {
      handleNavigate();
      next();
    });

    return {
      isLoading,
      handleNavigate,
    };
  },
};
</script>

<style>
@import "../assets/css/admin.css";
@import "../assets/css/loading.css";
</style>
