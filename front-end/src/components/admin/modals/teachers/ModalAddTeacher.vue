<template>
  <div
    class="modal fade"
    id="addTeacherModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="addTeacherModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="addTeacherModalLabel">
            Thêm mới giảng viên
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <Form @submit="addTeacher" :validation-schema="createTeacherSchema">
            <div class="row">
              <div class="mb-3">
                <label class="form-label">ID</label>
                <Field
                  v-model="newTeacher.admin_id"
                  type="text"
                  name="admin_id"
                  class="form-control"
                  placeholder="vi du: 125"
                />
                <ErrorMessage name="admin_id" class="text-danger" />
              </div>
              <div class="mb-3">
                <label class="form-label">Tên</label>
                <Field
                  v-model="newTeacher.admin_name"
                  type="text"
                  name="admin_name"
                  class="form-control"
                  placeholder="vi du: Nguyen van A"
                />
                <ErrorMessage name="admin_name" class="text-danger" />
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <Field
                  class="form-control"
                  type="email"
                  name="admin_email"
                  placeholder="vi du: vanA@gmail.com"
                  v-model="newTeacher.admin_email"
                />
                <ErrorMessage name="admin_email" class="text-danger" />
              </div>
              <div class="mb-3 row">
                <label class="form-label">Mật khẩu</label>
                <div class="col-11">
                  <Field
                    class="form-control"
                    :type="showPassword ? 'text' : 'password'"
                    name="admin_password"
                    v-model="newTeacher.admin_password"
                  />
                </div>
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="col-1 bg-white fs-4"
                >
                  <i v-if="!showPassword" class="fa-solid fa-eye-slash"></i>
                  <i v-else class="fa-solid fa-eye"></i>
                </button>
                <ErrorMessage name="admin_password" class="text-danger" />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Đóng
              </button>
              <button
                type="submit"
                class="btn btn-primary"
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
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, toRefs } from "vue";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { createTeacherSchema } from "@/utils/validate";
import { Form, Field, ErrorMessage } from "vee-validate";
import { showSuccess } from "@/utils/swalUtils";
export default {
  components: { Form, Field, ErrorMessage },
  props: {
    newTeacher: {
      type: Object,
      required: true,
    },
  },
  setup(props, {emit}) {
    const { newTeacher } = toRefs(props);
    const api = new ApiService();
    const showPassword = ref(false);
    const isLoading = ref(false);

    const addTeacher = async () => {
      isLoading.value = true;
      try {
        const token = Cookies.get("accessToken");
        const response = await api.post("admin", newTeacher.value, token);
        if (response?.status == 200) {
          newTeacher.value = {
            admin_id: "",
            admin_name: "",
            admin_email: "",
            admin_password: "",
          };
          await showSuccess({
            text: "Dữ liệu đã được thêm mới thành công.",
          });
          $("#addTeacherModal").modal("hide");
          emit('refreshTeacher');
        }
      } catch (error) {
        console.log(error);
      } finally {
        isLoading.value = false;
      }
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      newTeacher,
      addTeacher,
      showPassword,
      createTeacherSchema,
      togglePasswordVisibility,
      isLoading,
    };
  },
};
</script>
<style scoped>
.txt_field button {
  position: absolute;
  top: 30%;
  right: 0px;
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  margin-left: 5px;
}
</style>
