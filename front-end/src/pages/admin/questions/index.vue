<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline"><span class="text-decoration-underline">Các câu hỏi của môn học:</span> {{ subjectInfo.subject_code }} ({{ subjectInfo.subject_name }})</h3>
  </div>
  <!-- Button trigger modal -->
  <button
    type="button"
    class="btn btn-primary ms-2 my-2"
    data-bs-toggle="modal"
    data-bs-target="#staticBackdrop"
  >
    Them cau hoi
  </button>
  <ModalAddQuestion :newQuestion="newQuestion" :subject_id="subject_id"/>
  <ModalUpdateQuestion :currentQuestion="currentQuestion"/>
  <ModalDetailQuestion :currentQuestion="currentQuestion"/>
  <div class="subjects row">
    <div v-for="question in questions" :key="question._id" class="card">
      <div class="card-body">
        <span>
          {{
            question.isExpanded
              ? question.question_name
              : truncatedQuestionContent(question.question_name)
          }}
        </span>
        <span v-if="question.question_name.length > 100" class="fw-bold hover-text ms-2" @click="expandQuestion(question)">
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
            Sua
          </button>

          <button
            class="col-5 mx-auto btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#showDetailQuestionModal"
            @click="editQuestion(question)"
          >
            <i class="fa-solid fa-circle-info"></i>
            Xem chi tiet
          </button>
          <button
            class="edit_student col-3 mx-auto btn btn-danger"
            name="edit_teacher"
            @click="deleteQuestion(question._id)"
          >
            <i class="fa-solid fa-trash"></i>
            Xoa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ModalAddQuestion from "@/components/admin/modals/questions/ModalAddQuestion.vue";
import ModalUpdateQuestion from "@/components/admin/modals/questions/ModalUpdateQuestion.vue";
import ModalDetailQuestion from "@/components/admin/modals/questions/ModalDetailQuestion.vue";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import axios from "axios";
export default {
  components:{
    ModalAddQuestion,
    ModalUpdateQuestion,
    ModalDetailQuestion
  },
  setup(props) {
    const newQuestion = ref({
      question_name: "",
      options: [
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
      ],
    });

    const route = useRoute();
    const subject_id = route.params.id;
    const questions = ref([]);
    const currentQuestion = ref({});
    const subjectInfo = ref({})

    const getQuestions = async () => {
      const token = Cookies.get("accessToken");
      await axios
        .get(`http://127.0.0.1:3000/api/question/subject/${subject_id}`, {
          headers: { Authorization: "Bearer " + token },
        })
        .then(async (response) => {
          if (response.status == 200) {
            questions.value = response.data;
            subjectInfo.value = questions.value[0].subjectInfo;
            console.log(subjectInfo);
            console.log(response.data);
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

    const editQuestion = (question) => {
      currentQuestion.value = { ...question };
    };

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

    const deleteQuestion = async (questionID) => {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn muốn xóa câu hỏi này không?",
        text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });
      if (result.isConfirmed) {
        const token = Cookies.get("accessToken");
        await axios
          .delete(`http://127.0.0.1:3000/api/question/${questionID}`, {
            headers: { Authorization: "Bearer " + token },
          })
          .then(async (response) => {
            if (response.status == 200) {
              await Swal.fire({
                title: "Thành công!",
                text: "Dữ liệu đã được xóa thành công.",
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
      }
    };

    onMounted(() => {
      getQuestions();
    });

    return {
      getQuestions,
      newQuestion,
      editQuestion,
      deleteQuestion,
      expandQuestion,
      truncatedQuestionContent,
      subject_id,
      questions,
      currentQuestion,
      subjectInfo,
    };
  },
};
</script>
