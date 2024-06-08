<template>
  <div class="card">
    <div class="row">
      <h4 class="col-4"></h4>
      <h4 class="text-uppercase text-center col-4"></h4>
      <div class="form-check col-4">
        <input
          class="form-check-input float-end border border-dark"
          type="checkbox"
          :id="'check' + question._id"
          v-model="checked[question._id]"
          @change="toggleChecked"
        />
      </div>
    </div>
    <div class="card-body">
      <span>
        {{
          question.isExpanded
            ? question.question_name
            : truncatedQuestionContent(question.question_name)
        }}
      </span>
      <span
        v-if="question.question_name.length > 100"
        class="fw-bold hover-text ms-2"
        @click="expandQuestion(question)"
      >
        {{ question.isExpanded ? "Thu gọn" : "Xem thêm" }}
      </span>
    </div>
    <div class="card-footer">
      <div class="options-container">
        <div
          v-for="(option, index) in question.options"
          :key="index"
          class="option-circle"
          :class="{ correct: option.is_correct }"
        >
          {{ String.fromCharCode(65 + index) }}
        </div>
      </div>
      <div class="row mt-2">
        <button
          class="edit_student col-3 mx-auto btn btn-warning ms-2"
          name="edit_teacher"
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#updateQuestionModal"
          @click="editQuestion(question)"
        >
          <i class="fa-solid fa-pen-to-square"></i>
          Sửa
        </button>

        <button
          class="col-5 mx-auto btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#showDetailQuestionModal"
          @click="editQuestion(question)"
        >
          <i class="fa-solid fa-circle-info"></i>
          Xem chi tiết
        </button>
        <button
          class="edit_student col-3 mx-auto btn btn-danger"
          name="edit_teacher"
          @click="deleteQuestion(question._id)"
        >
          <i class="fa-solid fa-trash"></i>
          Xóa
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    question: {
      type: Object,
      required: true,
    },
    checked: {
      type: Object,
      required: true,
    },
    toggleChecked: {
      type: Function,
      required: true,
    },
    editQuestion: {
      type: Function,
      required: true,
    },
    deleteQuestion: {
      type: Function,
      required: true,
    },
  },
  setup() {
    const expandQuestion = (question) => {
      // Đảo ngược trạng thái của isExpanded khi click vào nút "Xem thêm"
      question.isExpanded = !question.isExpanded;
    };

    const truncatedQuestionContent = (content) => {
      const maxLength = 100;
      if (content.length <= maxLength) {
        return content;
      } else {
        return content.slice(0, maxLength) + "...";
      }
    };

    return {
      expandQuestion,
      truncatedQuestionContent,
    };
  },
};
</script>
