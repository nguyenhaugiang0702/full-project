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
            Cập nhật môn học
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <Form @submit="updateSubject" :validation-schema="subjectSchema">
            <div class="row">
              <div class="mb-3">
                <label class="form-label">Tên môn học</label>
                <Field
                  v-model="currentSubject.subject_name"
                  type="text"
                  name="subject_name"
                  class="form-control"
                  placeholder="vi du: Tu Tuong Ho Chi Minh"
                />
                <ErrorMessage name="subject_name" class="text-danger" />
              </div>
              <div class="mb-3">
                <label class="form-label">Mã môn học</label>
                <Field
                  class="form-control"
                  name="subject_code"
                  v-model="currentSubject.subject_code"
                  type="text"
                />
                <ErrorMessage name="subject_code" class="text-danger" />
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
import { toRefs, ref } from "vue";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { subjectSchema } from "@/utils/validate";
import { Form, Field, ErrorMessage } from "vee-validate";
import { showSuccess } from "@/utils/swalUtils";
export default {
  components: { Form, Field, ErrorMessage },
  props: {
    currentSubject: {
      type: Object,
      required: true,
    },
  },
  emits: ["refreshUpdate"],
  setup(props, { emit }) {
    const { currentSubject } = toRefs(props);
    const isLoading = ref(false);
    const api = new ApiService();

    const updateSubject = async () => {
      try {
        isLoading.value = true;
        const token = Cookies.get("accessToken");
        const apiCall = await api.put(
          `subject/${currentSubject.value._id}`,
          currentSubject.value,
          token
        );
        const delay = new Promise(resolve => setTimeout(resolve, 1500));
        const [response] = await Promise.all([apiCall, delay]);
        if (response?.status == 200) {
          await showSuccess({
            text: "Dữ liệu đã được cập nhật thành công.",
          });
          $("#updateSubjectModal").modal("hide");
          emit("refreshUpdate");
        }
      } catch (error) {
        console.log(error);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      currentSubject,
      updateSubject,
      subjectSchema,
      isLoading,
    };
  },
};
</script>
