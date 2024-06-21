<template>
  <div class="container-fluid text-center py-4 bg-primary text-white fs-3">
    Welcome to admin control panel
  </div>
  <div class="center">
    <h1>Đặt lại mật khẩu</h1>
    <Form class="form" @submit="resetPassword" :validation-schema="changePasswordSchema">
      <div class="txt_field">
        <Field
          as="input"
          class="input"
          v-model="password.admin_password"
          :type="showPassword ? 'text' : 'password'"
          name="admin_password"
          required
        />
        <span class="under-line"></span>
        <label>Mật khẩu mới</label>
        <button type="button" @click="togglePasswordVisibility">
          <i v-if="!showPassword" class="fa-solid fa-eye-slash text-dark"></i>
          <i v-else class="fa-solid fa-eye text-dark"></i>
        </button>
        <ErrorMessage name="admin_password" class="text-danger text" />
      </div>
      <div class="txt_field mt-5">
        <Field
          as="input"
          class="input"
          v-model="confirmPassword"
          :type="showCfPassword ? 'text' : 'password'"
          name="confirm_admin_password"
          required
        />
        <ErrorMessage name="confirm_admin_password" class="text-danger" />
        <span class="under-line"></span>
        <label>Xác nhận mật khẩu mới</label>
        <button type="button" @click="toggleCfPasswordVisibility">
          <i v-if="!showCfPassword" class="fa-solid fa-eye-slash text-dark"></i>
          <i v-else class="fa-solid fa-eye text-dark"></i>
        </button>
      </div>
      <button class="btn_login mt-4" :disabled="isLoading">
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        <span v-else>Đặt lại mật khẩu</span>
      </button>
      <div class="text_bottom">
        Quay lại quên mật khẩu.
        <a class="forgot_route" @click="$router.push({ name: 'forgotpassword' })"
          >Click Here</a
        >
        <br />
      </div>
    </Form>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ApiService from "@/service/ApiService";
import { showSuccess } from "@/utils/swalUtils";
import { changePasswordSchema } from "@/utils/validate";
import { Form, Field, ErrorMessage } from "vee-validate";
export default {
  components: { Form, Field, ErrorMessage },
  setup() {
    const password = ref({
      admin_password: "",
    });
    const confirmPassword = ref("");
    const isLoading = ref(false);
    const route = useRoute();
    const router = useRouter();
    const api = new ApiService();
    const showPassword = ref(false);
    const showCfPassword = ref(false);

    const resetPassword = async () => {
      isLoading.value = true;
      const token = route.params.token;
      try {
        const apiCall = await api.put(
          `admin/resetpassword/${token}`,
          password.value,
          token
        );
        const delay = new Promise((resolve) => setTimeout(resolve, 1500));
        const [response] = await Promise.all([apiCall, delay]);
        if (response.status === 200) {
          await showSuccess({
            text: "Bạn đã đổi mật khẩu thành công",
          });
          router.push({ name: "login" });
        }
      } catch (error) {
        console.log("Lỗi khi đặt lại mật khẩu. Vui lòng thử lại." + error);
      } finally {
        isLoading.value = false;
      }
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const toggleCfPasswordVisibility = () => {
      showCfPassword.value = !showCfPassword.value;
    };

    return {
      password,
      confirmPassword,
      resetPassword,
      isLoading,
      showPassword,
      showCfPassword,
      togglePasswordVisibility,
      toggleCfPasswordVisibility,
      changePasswordSchema,
    };
  },
};
</script>

<style scoped>
@import "../../../assets/css/login.css";
@import "@fortawesome/fontawesome-free/css/all.min.css";
.text-danger {
  position: absolute;
  top: 45px;
  left: 0;
}
</style>
