<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline">
      <span class="text-decoration-underline">Các câu hỏi của môn học:</span>
      {{ subjectInfo.subject_code }} ({{ subjectInfo.subject_name }})
    </h3>
  </div>

  <!-- Button trigger modal -->
  <div class="row d-flex align-items-end mb-4">
    <div class="col-md-6">
      <!-- Button add question -->
      <button
        type="button"
        class="btn btn-primary ms-2 float-start"
        data-bs-toggle="modal"
        data-bs-target="#addQuestionModal"
      >
        Thêm câu hỏi
      </button>
      <!-- End Button add question -->
      <!-- Button tron cau hoi -->
      <button
        type="button"
        class="btn btn-success ms-2 float-start"
        @click="
          $router.push({
            name: 'admin-questions-random',
            params: { id: subject_id },
          })
        "
      >
        Trộn câu hỏi
      </button>
      <!-- end Button tron cau hoi -->
      <!-- Button import file quesstion -->
      <button
        type="button"
        class="btn btn-secondary ms-2 float-start"
        @click="handleFileButtonClick"
      >
        Import Questions
      </button>
      <input
        ref="fileInputRef"
        type="file"
        id="fileInput"
        accept=".doc,.docx,.txt"
        @change="handleFileUpload"
        style="display: none"
      />
      <!-- end Button import file quesstion -->
    </div>
    <div class="col-md-6">
      <span>Search</span>
      <input
        class="form-control border border-dark"
        list="datalistOptions"
        id="exampleDataList"
        placeholder="Type to search..."
        v-model="searchValue"
        @input="debouncedSearch"
      />
    </div>
  </div>
  <hr />
  <ModalAddQuestion :newQuestion="newQuestion" :subject_id="subject_id" />
  <ModalUpdateQuestion :currentQuestion="currentQuestion" />
  <ModalDetailQuestion :currentQuestion="currentQuestion" />
  <div class="row my-2">
    <div class="form-check col-2 ms-3 my-auto">
      <input
        class="form-check-input border border-dark"
        type="checkbox"
        checked
        id="flexCheckIndeterminate"
        v-model="checkedAll"
        @change="toggleSelectAll"
      />
      <label class="form-check-label fw-bold" for="flexCheckIndeterminate">
        Chọn tất cả
      </label>
    </div>
    <button
      type="button"
      class="btn btn-danger ms-2 float-start col-sm-1 deleteSelected"
      @click="deleteSelectedQuestions"
      :disabled="!anyChecked"
    >
      Xóa
    </button>
  </div>
  <div class="subjects row">
    <div
      v-for="question in paginatedQuestions"
      :key="question._id"
      class="card"
    >
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
  </div>
  <Paginition
    :documents="questions"
    @update:paginatedDocument="handlePaginatedDocumentUpdate"
  />
</template>
<script>
import ModalAddQuestion from "@/components/admin/modals/questions/ModalAddQuestion.vue";
import ModalUpdateQuestion from "@/components/admin/modals/questions/ModalUpdateQuestion.vue";
import ModalDetailQuestion from "@/components/admin/modals/questions/ModalDetailQuestion.vue";
import Paginition from "@/components/admin/Pagination.vue";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { debounce } from "lodash";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import ApiService from "@/service/ApiService";
import Mammoth from "mammoth";
import { showConfirmation, showSuccess } from "@/utils/swalUtils";
import { error } from "jquery";

export default {
  components: {
    ModalAddQuestion,
    ModalUpdateQuestion,
    ModalDetailQuestion,
    Paginition,
  },
  setup() {
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
    const subjectInfo = ref({});
    const searchValue = ref("");
    const paginatedQuestions = ref([]);
    const fileInputRef = ref(null);
    const parsedQuestions = ref([]);
    const api = new ApiService();

    const checked = ref({});
    const checkedAll = ref(false);
    const selectedIds = ref([]);

    const getQuestions = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.get(`question/subject/${subject_id}`, token);
      if (response.status == 200) {
        questions.value = response.data;
      }
    };

    const toggleSelectAll = () => {
      questions.value.forEach((subject) => {
        checked.value[subject._id] = checkedAll.value;
      });
      updateSelectedIds();
    };

    const toggleChecked = () => {
      const allChecked = Object.values(checked.value).every(
        (value) => value === true
      );
      const someChecked = Object.values(checked.value).every(
        (value) => value === true
      );
      updateSelectedIds();
      if (selectedIds.value.length === questions.value.length && allChecked) {
        checkedAll.value = true;
      } else {
        checkedAll.value = false;
      }
    };

    const updateSelectedIds = () => {
      selectedIds.value = Object.keys(checked.value).filter(
        (key) => checked.value[key]
      );
    };

    const resetChecked = () => {
      checked.value = {};
      questions.value.forEach((question) => {
        checked.value[question._id] = false;
      });
      checkedAll.value = false;
    };

    const anyChecked = computed(() => {
      return Object.values(checked.value).some((isChecked) => isChecked);
    });

    const getSubject = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.get(`subject/${subject_id}`, token);
      if (response.status == 200) {
        subjectInfo.value = response.data;
      }
    };

    const handlePaginatedDocumentUpdate = (newPaginatedDocument) => {
      paginatedQuestions.value = newPaginatedDocument;
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
      const result = await showConfirmation({
        title: "Bạn có chắc chắn muốn xóa câu hỏi này không?",
        text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      });
      if (result.isConfirmed) {
        const token = Cookies.get("accessToken");
        const response = await api.delete(`question/${questionID}`, token);
        if (response.status == 200) {
          await showSuccess({
            text: "Dữ liệu đã được xóa thành công.",
          });
          getQuestions();
        }
      }
    };

    const deleteSelectedQuestions = async () => {
      const result = await showConfirmation({
        title: "Bạn có chắc chắn muốn xóa các câu hỏi này không?",
        text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      });
      if (result.isConfirmed) {
        const token = Cookies.get("accessToken");
        const response = await api.put(
          `question/subject/${subject_id}`,
          selectedIds.value,
          token
        );
        if (response?.status === 200) {
          getQuestions();
          resetChecked();
          await showSuccess({
            text: "Các môn học đã được xóa thành công.",
          });
        }
      }
    };

    const searchQuestions = async (searchValue) => {
      const token = Cookies.get("accessToken");
      const response = await api.get(
        `question/subject/${subject_id}?search_value=${searchValue}`,
        token
      );
      if (response.status == 200) {
        questions.value = response.data;
      }
    };

    const debouncedSearch = debounce(async () => {
      await searchQuestions(searchValue.value);
    }, 300);

    const handleFileButtonClick = () => {
      try {
        addFileInputToDOM();
        if (fileInputRef.value) {
          fileInputRef.value.click();
        }
      } catch (error) {
        console.log(error);
      }
    };

    const addFileInputToDOM = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.doc,.docx,.txt';
      fileInput.style.display = 'none';
      fileInput.addEventListener('change', handleFileUpload);
      document.body.appendChild(fileInput);

      // Làm mới ref với phần tử DOM mới
      fileInputRef.value = fileInput;
    };

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          Mammoth.extractRawText({ arrayBuffer }) // Pass arrayBuffer here
            .then(async (result) => {
              const text = result.value;
              const data = await parseFileContent(text);
              parsedQuestions.value = { ...data, subject_id };
              await uploadQuestions(parsedQuestions.value);
            })
            .catch((error) => {
              console.error("Error parsing file:", error);
            });
        };
        reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
      }
    };

    const uploadQuestions = async (data) => {
      const token = Cookies.get("accessToken");
      const response = await api.post(
        "question/subject/bulk",
        { ...data, subject_id },
        token
      );
      if (response?.status == 200) {
        await showSuccess({
          text: "Dữ liệu đã được tải thành công.",
        });
        getQuestions();
      }
    };

    const parseFileContent = (content) => {
      const questionsArray = content
        .split(/\d+\./)
        .filter((item) => item.trim() !== "");

      const questionsData = questionsArray.map((questionBlock) => {
        // Tìm vị trí của 'a -' để tách tên câu hỏi và các đáp án
        const indexOfFirstAnswer = questionBlock.indexOf("a -");

        // Tách tên câu hỏi từ đầu chuỗi đến ngay trước 'a -'
        const questionName = questionBlock
          .substring(0, indexOfFirstAnswer)
          .trim();

        // Phần còn lại là các đáp án
        const answersPart = questionBlock.substring(indexOfFirstAnswer).trim();

        // Sử dụng regex để tìm tất cả các đáp án
        const answerLines = answersPart.match(
          /([a-d] - .+?)(?=[a-d] - |\s*ĐÁP ÁN|$)/gs
        );

        // Tìm đáp án đúng, chú ý cả dấu cách hoặc dấu gạch ngang khác nhau
        const correctAnswerMatch = answersPart.match(
          /ĐÁP ÁN\s*[-–]\s*([a-d])/i
        );
        const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1] : null;

        // Tạo một đối tượng question mới
        const newQuestion = {
          question_name: questionName,
          options: [],
        };

        // Lặp qua các câu trả lời và đánh dấu đáp án đúng
        answerLines.forEach((answer) => {
          const option = answer[0]; // Ký tự đầu tiên là a, b, c hoặc d
          const content = answer.substring(3).trim(); // Bỏ qua 'a - ' hoặc 'b - ' để lấy nội dung
          const isCorrect = correctAnswer === option.toUpperCase(); // So sánh đáp án đúng
          newQuestion.options.push({
            answer: content,
            is_correct: isCorrect,
          });
        });

        return newQuestion;
      });

      return questionsData;
    };

    onMounted(() => {
      getQuestions();
      getSubject();
      addFileInputToDOM();
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
      searchQuestions,
      debouncedSearch,
      searchValue,
      handlePaginatedDocumentUpdate,
      paginatedQuestions,
      handleFileUpload,
      parseFileContent,
      handleFileButtonClick,
      parsedQuestions,
      getSubject,
      uploadQuestions,
      anyChecked,
      checked,
      checkedAll,
      toggleSelectAll,
      toggleChecked,
      updateSelectedIds,
      deleteSelectedQuestions,
      selectedIds,
      fileInputRef,
      addFileInputToDOM
    };
  },
};
</script>

<style>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
.pagination button {
  margin: 10px 10px;
  padding: 5px 5px;
  border: 1px solid #000;
  border-radius: 10px;
}

.pagination button:hover {
  background-color: #0d6efd;
  color: white;
  border-radius: 10px;
  transition: 0.6s;
  cursor: pointer;
}

.main-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.subjects {
  flex-grow: 1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.pagination button {
  margin: 0 5px;
}

.deleteSelected {
  position: relative;
  left: -100px;
}
</style>
