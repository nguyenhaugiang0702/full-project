<template>
  <!-- Modal show detail -->
  <div
    class="modal fade"
    id="showDetailQuestionModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="showDetailQuestionModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="showDetailQuestionModalLabel">
            Xem chi tiet cau hoi
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
            <div class="mb-3">
              <label for="exampleFormControlTextarea_update1" class="form-label"
                >Noi dung cau hoi</label
              >
              <textarea
                class="form-control border border-dark border-1"
                id="exampleFormControlTextarea_update1"
                rows="3"
                v-model="currentQuestion.question_name"
                readonly
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="exampleFormControlTextarea_update2" class="form-label"
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
                    disabled
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
                    readonly
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, toRefs } from "vue";
export default {
  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { currentQuestion } = toRefs(props);

    return {
      currentQuestion,
    };
  },
};
</script>
