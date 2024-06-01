<template>
  <button
    type="button"
    class="btn btn-primary ms-2 float-start"
    data-bs-toggle="modal"
    data-bs-target="#addSubjectModal"
  >
    Thêm mới môn học
  </button>
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
            Thêm mới môn học
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <Form :submit="addSubject" :validation-schema="subjectSchema">
            <div class="row">
              <div class="mb-3">
                <label class="form-label">Tên môn học</label>
                <Field
                  v-model="newSubject.subject_name"
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
                  v-model="newSubject.subject_code"
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
              <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from "vue";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { Field, Form, ErrorMessage } from "vee-validate";
import { subjectSchema } from "@/utils/validate";
import { showSuccess } from "@/utils/swalUtils";

export default {
  components: {
    Field,
    Form,
    ErrorMessage,
  },
  props: {
    newSubject: {
      type: Object,
      required: true,
    },
  },
  emits: ["refreshUpdate"],
  setup(props, { emit }) {
    const newSubject = ref(props.newSubject);
    const api = new ApiService();

    const addSubject = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.post("subject", newSubject.value, token);
      if (response?.status == 200) {
        newSubject.value = {
          subject_name: "",
          subject_code: "",
        };
        await showSuccess({
          text: "Dữ liệu đã được thêm mới thành công.",
        });
        $("#addSubjectModal").modal("hide");
        emit("refreshUpdate");
      }
    };

    return {
      newSubject,
      addSubject,
      subjectSchema,
    };
  },
};
</script>
