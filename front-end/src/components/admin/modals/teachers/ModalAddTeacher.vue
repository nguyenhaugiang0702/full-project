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
            Them moi giang vien
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
                  placeholder="vi du: 00125"
                />
                <ErrorMessage name="admin_id" class="text-danger"/>
              </div>
              <div class="mb-3">
                <label class="form-label">Ten</label>
                <Field
                  v-model="newTeacher.admin_name"
                  type="text"
                  name="admin_name"
                  class="form-control"
                  placeholder="vi du: Nguyen van A"
                />
                <ErrorMessage name="admin_name" class="text-danger"/>
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
                <ErrorMessage name="admin_email" class="text-danger"/>
              </div>
              <div class="mb-3">
                <label class="form-label">Mat khau</label>
                <Field
                  class="form-control"
                  type="password"
                  name="admin_password"
                  v-model="newTeacher.admin_password"
                />
                <ErrorMessage name="admin_password" class="text-danger"/>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Dong
              </button>
              <button type="submit" class="btn btn-primary">Luu</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, toRefs } from "vue";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { createTeacherSchema } from "@/utils/validate";
import { Form, Field, ErrorMessage } from "vee-validate";

export default {
  components: { Form, Field, ErrorMessage },
  props: {
    newTeacher: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { newTeacher } = toRefs(props);
    const api = new ApiService();

    const addTeacher = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.post("admin", newTeacher.value, token);
      if (response?.status == 200) {
        newTeacher.value = {
          admin_id: "",
          admin_name: "",
          admin_email: "",
          admin_password: "",
        };
        await Swal.fire({
          title: "Thành công!",
          text: "Dữ liệu đã được thêm mới thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          position: "top-end",
        });
        window.location.reload();
      }
    };

    return {
      newTeacher,
      addTeacher,
      createTeacherSchema
    };
  },
};
</script>
