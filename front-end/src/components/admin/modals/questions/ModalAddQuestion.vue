<template>
  <!-- Modal add -->
  <div
    class="modal fade"
    id="addQuestionModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="addQuestionModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="addQuestionModalLabel">
            Them moi cau hoi
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <Form @submit="addQuestion" :validation-schema="questionSchema">
              <div class="mb-3">
                <label for="exampleFormControlTextarea_add1" class="form-label"
                  >Noi dung cau hoi</label
                >
                <Field
                  as="textarea"
                  class="form-control border border-dark border-1"
                  id="exampleFormControlTextarea_add1"
                  rows="3"
                  name="question_name"
                  v-model="newQuestion.question_name"
                />
                <ErrorMessage class="text-danger" name="question_name" />
              </div>
              <div class="mb-3">
                <label for="exampleFormControlTextarea2" class="form-label"
                  >Cac dap an</label
                >
                <div
                  class="row my-2"
                  v-for="(option, index) in newQuestion.options"
                  :key="index"
                >
                  <div
                    class="form-check col-2 d-flex justify-content-center align-items-center"
                  >
                    <input
                      class="form-check-input border border-dark border-1 input-option"
                      type="radio"
                      name="correctOption"
                      :id="'option' + String.fromCharCode(65 + index)"
                      :value="index"
                      v-model="correctOption"
                    />
                    <label
                      class="form-check-label ms-2 mt-1"
                      for="exampleRadios1"
                    >
                      {{ String.fromCharCode(65 + index) }}
                    </label>
                  </div>
                  <div class="col-10">
                    <Field
                      as="textarea"
                      class="form-control border border-dark border-1"
                      :id="'textarea' + index"
                      :name="'options[' + index + '].answer'"
                      rows="2"
                      v-model="option.answer"
                    />
                    <ErrorMessage
                      class="text-danger"
                      :name="'options[' + index + '].answer'"
                    />
                  </div>
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
  </div>
</template>
<script>
import { ref, toRefs } from "vue";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { Form, Field, ErrorMessage } from "vee-validate";
import { questionSchema } from "@/utils/validate";
import { showSuccess } from "@/utils/swalUtils";
export default {
  props: {
    newQuestion: {
      type: Object,
      required: true,
    },
    subject_id: {
      type: String,
      required: true,
    },
  },
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  setup(props) {
    const { newQuestion } = toRefs(props);
    const { subject_id } = props;
    const correctOption = ref(0);
    const api = new ApiService();

    const addQuestion = async () => {
      newQuestion.value.options.forEach((option, index) => {
        option.is_correct = index === correctOption.value;
      });
      const newQuestionData = {
        ...newQuestion.value,
        subject_id,
      };
      const token = Cookies.get("accessToken");
      const response = await api.post("question", newQuestionData, token);
      if (response?.status == 200) {
        newQuestion.value = {
          question_name: "",
          options: [
            { answer: "", is_correct: false },
            { answer: "", is_correct: false },
            { answer: "", is_correct: false },
            { answer: "", is_correct: false },
          ],
        };
        correctOption.value = 0;
        await showSuccess({
          title: "Thành công!",
          text: "Dữ liệu đã được thêm mới thành công.",
        });
        window.location.reload();
      }
    };

    return {
      newQuestion,
      addQuestion,
      correctOption,
      subject_id,
      questionSchema,
    };
  },
};
</script>
