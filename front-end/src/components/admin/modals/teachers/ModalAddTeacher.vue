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
          <form @submit.prevent="addTeacher">
            <div class="row">
              <div class="mb-3">
                <label class="form-label">ID</label>
                <input
                  v-model="newTeacher.admin_id"
                  type="text"
                  name="admin_id"
                  class="form-control"
                  placeholder="vi du: 00125"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Ten</label>
                <input
                  v-model="newTeacher.admin_name"
                  type="text"
                  name="admin_name"
                  class="form-control"
                  placeholder="vi du: Nguyen van A"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                  class="form-control"
                  type="email"
                  placeholder="vi du: vanA@gmail.com"
                  v-model="newTeacher.admin_email"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Mat khau</label>
                <input
                  class="form-control"
                  type="password"
                  v-model="newTeacher.admin_password"
                />
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
          </form>
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
export default {
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
      if (response.status == 200) {
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
    };
  },
};
</script>
