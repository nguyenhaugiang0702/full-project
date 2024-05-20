<template>
  <!-- Modal add -->
  <div
    class="modal fade"
    id="staticBackdrop"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="staticBackdropLabel">
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
            <form @submit.prevent="addQuestion">
              <div class="mb-3">
                <label for="exampleFormControlTextarea1" class="form-label"
                  >Noi dung cau hoi</label
                >
                <textarea
                  class="form-control border border-dark border-1"
                  id="exampleFormControlTextarea1"
                  rows="3"
                  v-model="newQuestion.question_name"
                ></textarea>
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
                    <textarea
                      class="form-control border border-dark border-1"
                      :id="'textarea' + index"
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
  setup(props) {
    const { newQuestion } = toRefs(props);
    const { subject_id } = props;
    const correctOption = ref(0);

    const addQuestion = async () => {
      newQuestion.value.options.forEach((option, index) => {
        option.is_correct = index === correctOption.value;
      });
      const newQuestionData = {
        ...newQuestion.value,
        subject_id,
      };
      const token = Cookies.get("accessToken");
      await axios
        .post("http://127.0.0.1:3000/api/question", newQuestionData, {
          headers: { Authorization: "Bearer " + token },
        })
        .then(async (response) => {
          if (response.status == 200) {
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
        })
        .catch((error) => {
          if (error.response) {
            Swal.fire({
              title: "Thất bại",
              text: error.response.data.message,
              icon: "error",
              timer: 1500,
              showConfirmButton: false,
              position: "top-end",
            });
          }
        });
    };

    return {
      newQuestion,
      addQuestion,
      correctOption,
      subject_id
    };
  },
};
</script>