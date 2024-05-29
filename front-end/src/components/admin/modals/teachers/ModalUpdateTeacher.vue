<template>
  <div
    class="modal fade"
    id="updateTeacherModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="updateTeacherModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="updateTeacherModalLabel">
            Cập nhật giảng viên
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <Form @submit="updateTeacher" :validation-schema="updateTeacherSchema">
            <div class="row">
              <div class="mb-3">
                <label class="form-label">ID</label>
                <Field
                  v-model="currentTeacher.admin_id"
                  type="text"
                  name="admin_id"
                  class="form-control"
                  placeholder="vi du: 00125"
                />
                <ErrorMessage name="admin_id" class="text-danger" />
              </div>
              <div class="mb-3">
                <label class="form-label">Tên</label>
                <Field
                  v-model="currentTeacher.admin_name"
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
                  v-model="currentTeacher.admin_email"
                />
                <ErrorMessage name="admin_email" class="text-danger" />
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
              <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { toRefs } from "vue";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { updateTeacherSchema } from "@/utils/validate";
import { Form, Field, ErrorMessage } from "vee-validate";
import { showSuccess } from "@/utils/swalUtils";
export default {
  components: { Form, Field, ErrorMessage },
  props: {
    currentTeacher: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { currentTeacher } = toRefs(props);
    const api = new ApiService();

    const updateTeacher = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.put(
        `admin/${currentTeacher.value._id}`,
        currentTeacher.value,
        token
      );
      if (response?.status == 200) {
        await showSuccess({
          text: "Dữ liệu đã được cập nhật thành công.",
        });
        window.location.reload();
      }
    };

    return {
      currentTeacher,
      updateTeacher,
      updateTeacherSchema,
    };
  },
};
</script>
