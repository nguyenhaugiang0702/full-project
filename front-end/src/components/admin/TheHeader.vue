<template>
  <div class="container-fluid bg-primary">
    <div class="row">
      <div
        class="col-1 d-flex d-sm-none align-items-center justify-content-center"
      >
        <span @click="showDrawerMenu()">
          <i class="fa-solid fa-bars fa-xl text-white"></i>
        </span>
      </div>
      <div
        class="col-10 col-sm-9 d-flex align-items-center justify-content-center justify-content-sm-start p-4"
      >
        <span class="d-none d-sm-flex text-white fw-bold fs-5"
          >Trường chính trị Thành phố Cần Thơ | Quản Trị
        </span>
      </div>
      <div
        class="col-sm-3 d-none d-sm-flex align-items-center justify-content-sm-end"
      >
        <div class="dropdown me-5">
          <div
            class="dropdown-toggle text-white"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Admin
          </div>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" @click="logout" href="#">Đăng Xuất</a>
            </li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
      </div>
      <div
        class="col-1 d-flex d-sm-none align-items-center justify-content-center"
      >
        <span @click="showDrawerAdmin()">
          <i class="fa-solid fa-user fa-xl me-2 text-white"></i>
        </span>
      </div>
    </div>
  </div>
  <a-drawer v-model:open="open_menu" title="Danh Mục" placement="left">
    <TheMenuResponsive />
  </a-drawer>
  <a-drawer v-model:open="open_admin" title="Admin" placement="right">
    <div>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </div>
  </a-drawer>
</template>
<script>
import { ref } from "vue";
import TheMenuResponsive from "./TheMenuResponsive.vue";
export default {
  components: {
    TheMenuResponsive,
  },
  setup() {
    const open_menu = ref(false);
    const open_admin = ref(false);
    const showDrawerMenu = () => {
      open_menu.value = true;
    };

    const showDrawerAdmin = () => {
      open_admin.value = true;
    };

    const logout = () => {
      document.cookie =
        "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
      document.cookie =
        "user_name=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
      delete axios.defaults.headers.common["Authorization"];
      window.location.href = "/";
    };
    return {
      open_menu,
      open_admin,
      showDrawerAdmin,
      showDrawerMenu,
      logout,
    };
  },
};
</script>
<style scoped>
.dropdown:hover .dropdown-menu {
  display: block;
  animation: fadeInUp 0.35s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
