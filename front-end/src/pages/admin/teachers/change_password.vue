<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline">
      <span class="text-decoration-underline">Thông tin chi tiết:</span>
    </h3>
  </div>
  <div class="container">
    <Form @submit="changePassword" :validation-schema="changePasswordSchema">
      <div class="mb-3 col-sm-5">
        <label for="exampleFormControlInput1" class="form-label">ID</label>
        <input
          type="email"
          class="form-control border border-dark border-1"
          id="exampleFormControlInput1"
          placeholder="name@example.com"
          v-model="teacherInfo.admin_id"
          readonly
        />
      </div>
      <div class="mb-3 col-sm-5">
        <label for="exampleFormControlInput1" class="form-label">Tên</label>
        <input
          type="email"
          class="form-control border border-dark border-1"
          id="exampleFormControlInput1"
          placeholder="name@example.com"
          v-model="teacherInfo.admin_name"
          readonly
        />
      </div>
      <div class="mb-3 col-sm-5">
        <label for="exampleFormControlInput1" class="form-label">Email:</label>
        <input
          type="email"
          class="form-control border border-dark border-1"
          id="exampleFormControlInput1"
          placeholder="name@example.com"
          v-model="teacherInfo.admin_email"
          readonly
        />
      </div>
      <div class="mb-3 col-sm-5">
        <label for="exampleFormControlInput1" class="form-label">New Password</label>
        <Field
          type="email"
          class="form-control border border-dark border-1"
          id="exampleFormControlInput1"
          placeholder="ví dụ: abc@@123"
          v-model="newPass.admin_password"
          name="admin_password"
        />
        <ErrorMessage name="admin_password" class="text-danger" />
      </div>
      <div class="mb-3 col-sm-5">
        <label for="exampleFormControlInput1" class="form-label">Confirm Password</label>
        <Field
          type="email"
          class="form-control border border-dark border-1"
          id="exampleFormControlInput1"
          placeholder="ví dụ: abc@@123"
          name="confirm_admin_password"
        />
        <ErrorMessage name="confirm_admin_password" class="text-danger" />
      </div>
      <div class="col-sm-5">
        <div class="d-flex justify-content-center">
          <button
            type="submit"
            class="btn btn-primary col-sm-1 col-md-2"
            @click="changePassword"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else>Lưu</span>
          </button>
        </div>
      </div>
    </Form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import ApiService from "@/service/ApiService";
import Cookies from "js-cookie";
import { changePasswordSchema } from "@/utils/validate";
import { Form, Field, ErrorMessage } from "vee-validate";
import { showSuccess } from "@/utils/swalUtils";
import { useRouter } from "vue-router";
import axios from "axios";
export default {
  components: { Form, Field, ErrorMessage },
  setup() {
    const teacherInfo = ref({});
    const newPass = ref({
      admin_password: "",
    });
    const router = useRouter();
    const api = new ApiService();
    const isLoading = ref(false);

    const getTeacher = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.get(`admin/${token}`);
      if (response?.status == 200) {
        teacherInfo.value = response.data;
      }
    };

    const changePassword = async () => {
      try {
        isLoading.value = true;
        const token = Cookies.get("accessToken");
        const response = await api.put(`admin/changepassword/${token}`, newPass.value);
        if (response?.status === 200) {
          document.cookie = "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
          document.cookie = "user_name=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
          delete axios.defaults.headers.common["Authorization"];
          await showSuccess({
            text: "Bạn đã đổi mật khẩu thành công",
          });
          router.push({ name: "login" });
        }
      } catch (error) {
        console.log(error);
      } finally {
        isLoading.value = false;
      }
    };
    onMounted(() => {
      getTeacher();
    });
    return {
      getTeacher,
      teacherInfo,
      newPass,
      changePasswordSchema,
      changePassword,
      isLoading,
    };
  },
};
</script>
