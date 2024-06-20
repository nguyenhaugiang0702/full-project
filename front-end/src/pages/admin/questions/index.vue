<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline">
      <span class="text-decoration-underline">Các câu hỏi của môn học:</span>
      {{ subjectInfo.subject_code }} ({{ subjectInfo.subject_name }})
    </h3>
  </div>

  <!-- Modal -->
  <div
    class="modal fade"
    id="infoModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="infoModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="infoModalLabel">Quy tắt thêm câu hỏi</h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <Carousel :value="images">
            <template #item="slotProps">
              <img class="w-100" :src="slotProps.data" alt="Slide" />
            </template>
          </Carousel>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="row d-flex align-items-end mb-4">
    <div class="col-md-6">
      <!-- Button add question -->
      <ModalAddQuestion
        :newQuestion="newQuestion"
        :subject_id="subject_id"
        @refreshUpdate="getQuestions"
      />
      <!-- End Button add question -->

      <!-- Button tron cau hoi -->
      <button
        type="button"
        class="btn btn-success ms-2 float-start my-2"
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
        class="btn btn-secondary ms-2 float-start my-2"
        @click="handleFileButtonClick"
      >
        Upload File câu hỏi
      </button>

      <button
        type="button"
        class="btn ms-1 float-start my-2 rounded-circle border border-dark"
        data-bs-toggle="modal"
        data-bs-target="#infoModal"
      >
        <i class="fa-solid fa-question text-warning"></i>
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
    <div class="col-md-6 my-2">
      <Search
        :subject_id="subject_id"
        :searchName="'questions'"
        @updateSearch="handleSearchValue"
      />
    </div>
  </div>
  <hr />

  <div class="row my-2">
    <SelectedAll
      :selectedName="'questions'"
      :documents="questions"
      :checked="checked"
      :checkedAll="checkedAll"
      :subject_id="subject_id"
      @update:checkedAll="updateCheckedAll"
      @update:checked="updateChecked"
      @update:isLoading="handleLoading"
      @refreshUpdated="getQuestions"
    />
  </div>
  <div v-if="isLoading || isLoadingDelete" class="loader_documents"></div>
  <div v-if="!isLoading && !isLoadingDelete" class="subjects row">
    <QuestionsCard
      v-for="question in paginatedQuestions"
      :key="question._id"
      :question="question"
      :checked="checked"
      :toggleChecked="toggleChecked"
      :editQuestion="editQuestion"
      :deleteQuestion="deleteQuestion"
    />
  </div>
  <ModalUpdateQuestion :currentQuestion="currentQuestion" @refreshUpdate="getQuestions" />
  <ModalDetailQuestion :currentQuestion="currentQuestion" />
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
import Search from "@/components/admin/search/Search.vue";
import SelectedAll from "@/components/admin/SelectedAll.vue";
import QuestionsCard from "@/components/admin/card/questions/QuestionsCard.vue";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import Mammoth from "mammoth";
import Carousel from "primevue/carousel";
import { showConfirmation, showSuccess, showWarning } from "@/utils/swalUtils";
import QuestionName from "@/assets/images/QuestionName.png";
import Answer from "@/assets/images/Answer.png";

export default {
  components: {
    ModalAddQuestion,
    ModalUpdateQuestion,
    ModalDetailQuestion,
    Paginition,
    Search,
    SelectedAll,
    QuestionsCard,
    Carousel,
  },
  setup() {
    const images = ref([QuestionName, Answer]);

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
    const paginatedQuestions = ref([]);
    const fileInputRef = ref(null);
    const parsedQuestions = ref([]);
    const api = new ApiService();

    const checked = ref({});
    const checkedAll = ref(false);
    const selectedIds = ref([]);
    const isLoading = ref(false);
    const isLoadingDelete = ref(false);

    const getQuestions = async () => {
      isLoading.value = true;
      try {
        const token = Cookies.get("accessToken");
        const response = await api.get(`question/subject/${subject_id}`, token);
        if (response.status == 200) {
          questions.value = response.data;
        }
      } catch (error) {
        console.log(error);
      } finally {
        isLoading.value = false;
      }
    };

    const toggleChecked = () => {
      const allChecked = Object.values(checked.value).every((value) => value === true);
      selectedIds.value = Object.keys(checked.value).filter((key) => checked.value[key]);
      if (selectedIds.value.length === questions.value.length && allChecked) {
        checkedAll.value = true;
      } else {
        checkedAll.value = false;
      }
    };

    const updateCheckedAll = (value) => {
      checkedAll.value = value;
    };

    const updateChecked = (value) => {
      checked.value = value;
    };

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

    const deleteQuestion = async (questionID) => {
      const result = await showConfirmation({
        title: "Bạn có chắc chắn muốn xóa câu hỏi này không?",
        text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      });
      if (result.isConfirmed) {
        try {
          isLoadingDelete.value = true;
          const token = Cookies.get("accessToken");
          const response = await api.delete(`question/${questionID}`, token);
          if (response.status == 200) {
            isLoadingDelete.value = false;
            await showSuccess({
              text: "Dữ liệu đã được xóa thành công.",
            });
            getQuestions();
          }
        } catch (error) {
          console.log(error);
        } finally {
          isLoadingDelete.value = false;
        }
      }
    };

    const handleSearchValue = (value) => {
      questions.value = value;
    };

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
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".doc,.docx,.txt";
      fileInput.style.display = "none";
      fileInput.addEventListener("change", handleFileUpload);
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
          Mammoth.convertToHtml({ arrayBuffer }) // Pass arrayBuffer here
            .then(async (result) => {
              const html = result.value;
              const data = await parseFileContent(html);
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

    const parseFileContent = (htmlContent) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const questions = [];

      let currentQuestion = null;
      let optionIndex = 0;

      doc.querySelectorAll("p").forEach((p) => {
        const strongElement = p.querySelector("strong");
        const emElement = p.querySelector("em");

        if (strongElement && !emElement) {
          if (currentQuestion && optionIndex === 4) {
            questions.push(currentQuestion);
          }
          // Loại bỏ các số thứ tự câu hỏi ví dụ 1. 1+1₫?
          let questionText = strongElement.textContent.trim();
          questionText = questionText.replace(/^\d+\.\s*/, "");

          currentQuestion = {
            question_name: questionText,
            options: [
              { answer: "", is_correct: false },
              { answer: "", is_correct: false },
              { answer: "", is_correct: false },
              { answer: "", is_correct: false },
            ],
          };

          optionIndex = 0;
        } else if (currentQuestion && optionIndex < 4) {
          // Xử lý các đáp án
          let optionText = p.textContent.trim();
          optionText = optionText.replace(/^[A-D]\.\s+|^\d+\.\s+/, ""); // Loại bỏ A. B. C. D.
          const isCorrect = p.querySelector("strong em") !== null;
          currentQuestion.options[optionIndex] = {
            answer: optionText,
            is_correct: isCorrect,
          };
          optionIndex++;
        }
      });

      // Đảm bảo câu hỏi cuối cùng cũng được thêm vào nếu đủ 4 đáp án
      if (currentQuestion && optionIndex === 4) {
        questions.push(currentQuestion);
      }
      console.log(questions);
      return questions;
    };

    const handleLoading = (value) => {
      isLoading.value = value;
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
      subject_id,
      questions,
      currentQuestion,
      subjectInfo,
      handlePaginatedDocumentUpdate,
      paginatedQuestions,
      handleFileUpload,
      parseFileContent,
      handleFileButtonClick,
      parsedQuestions,
      getSubject,
      uploadQuestions,
      checked,
      checkedAll,
      toggleChecked,
      selectedIds,
      fileInputRef,
      addFileInputToDOM,
      handleSearchValue,
      updateChecked,
      updateCheckedAll,
      images,
      isLoading,
      handleLoading,
      isLoadingDelete,
    };
  },
};
</script>

<style scoped>
@import "../../../assets/css/loading.css";

.main-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.subjects {
  flex-grow: 1;
}

.deleteSelected {
  position: relative;
  left: -100px;
}
</style>
