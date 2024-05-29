<template>
  <!-- Modal update -->
  <div
    class="modal fade"
    id="updateQuestionModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="updateQuestionModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="updateQuestionModalLabel">
            Cập nhật câu hỏi
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
            <Form @submit="updateQuestion" :validation-schema="questionSchema">
              <div class="mb-3">
                <label
                  for="exampleFormControlTextarea_update1"
                  class="form-label"
                  >Nội dung câu hỏi</label
                >
                <Field
                  as="textarea"
                  class="form-control border border-dark border-1"
                  id="exampleFormControlTextarea_update1"
                  rows="3"
                  name="question_name"
                  v-model="currentQuestion.question_name"
                />
                <ErrorMessage class="text-danger" name="question_name" />
              </div>
              <div class="mb-3">
                <label
                  for="exampleFormControlTextarea_update2"
                  class="form-label"
                  >Các đáp án</label
                >
                <div
                  class="row my-2"
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                >
                  <div
                    class="form-check col-2 d-flex justify-content-center align-items-center"
                  >
                    <input
                      class="form-check-input border border-dark border-1 input-option"
                      type="radio"
                      name="correctOption"
                      :id="'option_update' + String.fromCharCode(65 + index)"
                      :value="index"
                      :checked="option.is_correct"
                      @input="setCorrectOption(index)"
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
                      :id="'textarea_update' + index"
                      rows="2"
                      :name="'options[' + index + '].answer'"
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
                  Đóng
                </button>
                <button type="submit" class="btn btn-primary">Lưu</button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { toRefs } from "vue";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { Form, Field, ErrorMessage } from "vee-validate";
import { questionSchema } from "@/utils/validate";
import { showSuccess } from "@/utils/swalUtils";
export default {
  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },
  },
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  setup(props) {
    const { currentQuestion } = toRefs(props);
    const api = new ApiService();
    const updateQuestion = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.put(
        `question/${currentQuestion.value._id}`,
        currentQuestion.value,
        token
      );
      if (response?.status == 200) {
        await showSuccess({
          text: "Dữ liệu đã được cập nhật thành công.",
        });
        window.location.reload();
      }
    };

    const setCorrectOption = (index) => {
      currentQuestion.value.options.forEach((option, i) => {
        option.is_correct = i === index;
      });
    };
    return {
      currentQuestion,
      updateQuestion,
      setCorrectOption,
      questionSchema,
    };
  },
};
</script>
