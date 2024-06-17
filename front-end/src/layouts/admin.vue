<template>
  <div>
    <TheHeader />
    <div class="contain">
      <TheMenu @navigate="handleNavigate" />
      <section class="main">
        <router-view v-if="!isLoading"></router-view>
        <div v-if="isLoading" class="loader"></div>
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
      }, 1500);
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
.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: 50px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 8px solid #0d6efd;
  animation: l20-1 0.8s infinite linear alternate, l20-2 1.6s infinite linear;
}

@keyframes l20-1 {
  0% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%);
  }
  12.5% {
    clip-path: polygon(
      50% 50%,
      0 0,
      50% 0%,
      100% 0%,
      100% 0%,
      100% 0%,
      100% 0%
    );
  }
  25% {
    clip-path: polygon(
      50% 50%,
      0 0,
      50% 0%,
      100% 0%,
      100% 100%,
      100% 100%,
      100% 100%
    );
  }
  50% {
    clip-path: polygon(
      50% 50%,
      0 0,
      50% 0%,
      100% 0%,
      100% 100%,
      50% 100%,
      0% 100%
    );
  }
  62.5% {
    clip-path: polygon(
      50% 50%,
      100% 0,
      100% 0%,
      100% 0%,
      100% 100%,
      50% 100%,
      0% 100%
    );
  }
  75% {
    clip-path: polygon(
      50% 50%,
      100% 100%,
      100% 100%,
      100% 100%,
      100% 100%,
      50% 100%,
      0% 100%
    );
  }
  100% {
    clip-path: polygon(
      50% 50%,
      50% 100%,
      50% 100%,
      50% 100%,
      50% 100%,
      50% 100%,
      0% 100%
    );
  }
}
@keyframes l20-2 {
  0% {
    transform: scaleY(1) rotate(0deg);
  }
  49.99% {
    transform: scaleY(1) rotate(135deg);
  }
  50% {
    transform: scaleY(-1) rotate(0deg);
  }
  100% {
    transform: scaleY(-1) rotate(-135deg);
  }
}
</style>
