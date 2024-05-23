<template>
  <div class="container-fluid text-center py-4 bg-primary text-white fs-3">
    Welcome to admin control panel
  </div>
  <div class="center">
    <h1>Login by Teacher</h1>
    <form class="form" @submit.prevent="loginAdmin()">
      <div class="txt_field">
        <input
          class="input"
          v-model="admin.admin_id"
          type="text"
          name="id_number"
          required
        />
        <span></span>
        <label>ID Number</label>
      </div>
      <div class="txt_field">
        <input
          class="input"
          v-model="admin.admin_email"
          type="email"
          name="email"
          required
        />
        <span></span>
        <label>Email</label>
      </div>
      <div class="txt_field">
        <input
          class="input"
          v-model="admin.admin_password"
          type="password"
          name="password"
          required
        />
        <span></span>
        <label>Password</label>
      </div>
      <button class="btn_login">Login</button>
      <div class="text_bottom">
        Forgot Password. Please contact your teacher or IT Team.
        <br />
      </div>
    </form>
    <button class="back_home" onclick="window.location.href='/'">Home</button>
  </div>
</template>
<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";

export default {
  setup(_, { emit }) {
    const admin = ref({
      admin_id: "",
      admin_email: "",
      admin_password: "",
    });
    const router = useRouter();
    const api = new ApiService();

    const loginAdmin = async () => {
      const adminData = {
        ...admin.value,
        admin_id: Number(admin.value.admin_id),
      };
      const response = await api.post("admin/login", adminData);
      if (response.status == 200) {
        admin.value = {
          admin_id: "",
          admin_email: "",
          admin_password: "",
        };
        const token = response.data.accessToken;
        Cookies.set("accessToken", token, { expires: 24 });
        await Swal.fire({
          title: "Thành công!",
          text: "Đăng nhập thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        window.location.reload();
        router.push({ name: "admin-subjects" });
      }
    };

    return {
      loginAdmin,
      admin,
    };
  },
};
</script>

<style scoped>
@import "../../../src/assets/css/login.css";
</style>
