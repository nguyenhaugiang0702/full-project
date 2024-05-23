<template>
  <div
    class="modal fade"
    id="addSubjectModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="addSubjectModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="addSubjectModalLabel">
            Them moi mon hoc
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addSubject">
            <div class="row">
              <div class="mb-3">
                <label class="form-label">Ten mon hoc</label>
                <input
                  v-model="newSubject.subject_name"
                  type="text"
                  name="subject_name"
                  class="form-control"
                  placeholder="vi du: Tu Tuong Ho Chi Minh"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Ma mon hoc</label>
                <input
                  class="form-control"
                  v-model="newSubject.subject_code"
                  type="text"
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
    newSubject: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { newSubject } = toRefs(props);
    const api = new ApiService();

    const addSubject = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.post("subject", newSubject.value, token);
      if (response.status == 200) {
        newSubject.value = {
          subject_name: "",
          subject_code: "",
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
      newSubject,
      addSubject,
    };
  },
};
</script>
