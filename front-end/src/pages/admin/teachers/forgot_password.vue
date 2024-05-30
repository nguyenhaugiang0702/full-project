<template>
  <div class="container-fluid text-center py-4 bg-primary text-white fs-3">
    Welcome to admin control panel
  </div>
  <div class="center">
    <h1>Quên mật khẩu</h1>
    <Form class="form" @submit="sendEMail" :validation-schema="forgotPasswordSchema">
      <div class="txt_field">
        <Field
          as="input"
          class="input"
          type="email"
          name="admin_email"
          v-model="email.admin_email"
          required
        />
        <span></span>
        <label>Email</label>
        <ErrorMessage name="admin_email" class="text-danger"/>
      </div>
      <button class="btn_login mt-4" :disabled="isLoading">
        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span v-else>Gửi</span>
      </button>
      <div class="text_bottom">
        Quay lại đăng nhập.
        <a
          class="forgot_route"
          @click="$router.push({ name: 'login' })"
          >Click Here</a
        >
        <br />
      </div>
    </Form>
  </div>
</template>

<script>
import ApiService from "@/service/ApiService";
import { showSuccess } from "@/utils/swalUtils";
import { ref } from "vue";
import { forgotPasswordSchema } from "@/utils/validate";
import { Form, Field, ErrorMessage } from "vee-validate";
export default {
  components:{Form, Field, ErrorMessage},
  setup() {
    const email = ref({
      admin_email: "",
    });
    const api = new ApiService();
    const isLoading = ref(false);

    const sendEMail = async () => {
      isLoading.value = true;
      try {
        const response = await api.post("admin/forgotpassword", email.value);
        if (response?.status === 200) {
          email.value = {
            admin_email: ''
          };
          await showSuccess({
            text: "Yêu cầu của bạn đã được gửi đi, vui lòng kiểm tra hộp thư",
            timer: 1500
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    };
    return {
      sendEMail,
      email,
      isLoading,
      forgotPasswordSchema
    };
  },
};
</script>

<style scoped>
@import "../../../assets/css/login.css";
.text-danger {
  position: absolute;
  top: 45px;
  left: 0;
}
</style>