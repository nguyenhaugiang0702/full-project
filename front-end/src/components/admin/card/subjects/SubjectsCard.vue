<template>
  <div class="card">
    <div class="row">
      <h4 class="col-4"></h4>
      <h4 class="text-uppercase text-center col-4">
        {{ subject.subject_code }}
      </h4>
      <div class="form-check col-4">
        <input
          class="form-check-input float-end border border-dark"
          type="checkbox"
          :id="'check' + subject._id"
          v-model="checked[subject._id]"
          @change="toggleChecked"
        />
      </div>
    </div>
    <div class="card-body">
      <span class="fs-4 fw-bold text-uppercase">
        {{
          subject.isExpanded
            ? subject.subject_name
            : truncatedSubjectContent(subject.subject_name)
        }}
      </span>
      <span
        v-if="subject.subject_name.length > 20"
        class="fw-bold hover-text ms-2"
        @click="expandSubject(subject)"
      >
        {{ subject.isExpanded ? "Thu gọn" : "Xem thêm" }}
      </span>
    </div>
    <div class="text-center">Số câu hỏi: {{ subject.questionCount }}</div>
    <div class="row mt-2">
      <button
        class="edit_student col-3 mx-auto btn btn-warning ms-2"
        name="edit_teacher"
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#updateSubjectModal"
        @click="editSubject(subject)"
      >
        <i class="fa-solid fa-pen-to-square"></i>
        Sửa
      </button>

      <button
        class="edit_student col-5 mx-auto btn btn-primary"
        name="edit_teacher"
        @click="
          $router.push({
            name: 'admin-questions',
            params: { id: subject._id },
          })
        "
      >
        <i class="fa-solid fa-circle-info"></i>
        Xem chi tiết
      </button>
      <button
        class="edit_student col-3 col-sm-3 mx-auto btn btn-danger"
        name="edit_teacher"
        @click="deleteSubject(subject._id)"
      >
        <i class="fa-solid fa-trash"></i>
        Xóa
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    subject: {
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
    editSubject: {
      type: Function,
      required: true,
    },
    deleteSubject: {
      type: Function,
      required: true,
    },
  },
  setup() {
    const expandSubject = (subject) => {
      subject.isExpanded = !subject.isExpanded;
    };
    
    const truncatedSubjectContent = (content) => {
      const maxLength = 20;
      if (content.length <= maxLength) {
        return content;
      } else {
        return content.slice(0, maxLength) + "...";
      }
    };

    return {
      expandSubject,
      truncatedSubjectContent,
    };
  },
};
</script>
