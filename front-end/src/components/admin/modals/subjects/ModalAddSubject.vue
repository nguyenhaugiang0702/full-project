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
          <Form
            :submit="addSubject"
            :validation-schema="subjectSchema"
          >
            <div class="row">
              <div class="mb-3">
                <label class="form-label">Ten mon hoc</label>
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
                <label class="form-label">Ma mon hoc</label>
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
import { ref, toRefs } from "vue";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
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
  setup(props) {
    const { newSubject } = toRefs(props);
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
          title: "Thành công!",
          text: "Dữ liệu đã được thêm mới thành công.",
        });
        window.location.reload();
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
