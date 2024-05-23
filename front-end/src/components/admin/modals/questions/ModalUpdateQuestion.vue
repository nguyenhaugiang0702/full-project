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
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="updateQuestionModalLabel">
            Cap nhat cau hoi
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
            <form @submit.prevent="updateQuestion">
              <div class="mb-3">
                <label
                  for="exampleFormControlTextarea_update1"
                  class="form-label"
                  >Noi dung cau hoi</label
                >
                <textarea
                  class="form-control border border-dark border-1"
                  id="exampleFormControlTextarea_update1"
                  rows="3"
                  v-model="currentQuestion.question_name"
                ></textarea>
              </div>
              <div class="mb-3">
                <label
                  for="exampleFormControlTextarea_update2"
                  class="form-label"
                  >Cac dap an</label
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
                    <textarea
                      class="form-control border border-dark border-1"
                      :id="'textarea_update' + index"
                      rows="2"
                      v-model="option.answer"
                    ></textarea>
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
            </form>
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
export default {
  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },
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

    const setCorrectOption = (index) => {
      currentQuestion.value.options.forEach((option, i) => {
        option.is_correct = i === index;
      });
    };
    return {
      currentQuestion,
      updateQuestion,
      setCorrectOption,
    };
  },
};
</script>
