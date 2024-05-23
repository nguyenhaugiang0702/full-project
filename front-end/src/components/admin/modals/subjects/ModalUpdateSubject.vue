<template>
  <!-- Modal update -->
  <div
    class="modal fade"
    id="updateSubjectModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="updateSubjectModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="updateSubjectModalLabel">
            Cap nhat mon hoc
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateSubject">
            <div class="row">
              <div class="mb-3">
                <label class="form-label">Ten mon hoc</label>
                <input
                  v-model="currentSubject.subject_name"
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
                  v-model="currentSubject.subject_code"
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
    currentSubject: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { currentSubject } = toRefs(props);
    const api = new ApiService();

    const updateSubject = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.put(
        `subject/${currentSubject.value._id}`,
        currentSubject.value,
        token
      );
      if (response.status == 200) {
        await Swal.fire({
          title: "Thành công!",
          text: "Dữ liệu đã được cập nhật thành công.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          position: "top-end",
        });
        window.location.reload();
      }
    };

    return {
      currentSubject,
      updateSubject,
    };
  },
};
</script>
