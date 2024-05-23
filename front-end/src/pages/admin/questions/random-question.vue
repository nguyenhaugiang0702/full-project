<template>
  <div class="container mt-4">
    <div class="header text-center border border-dark">
      <h1>Trộn câu hỏi</h1>
      <div class="text-center mt-4">
        <button
          class="btn btn-danger"
          @click="shuffleQuestions"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Bắt đầu</span>
        </button>
        <input
          type="number"
          v-model="numberRandom"
          class="ms-3 text-dark number-random text-center border border-dark"
          min="1"
        />
        <button class="btn btn-info ms-3" @click="exportToWord">
          Xuất ra file Word
        </button>
      </div>
    </div>
    <div class="exam-content" :class="{ loading: loading }">
      <div
        v-for="(question, index) in questionsRandom"
        :key="index"
        class="mb-4"
      >
        <h5>{{ index + 1 }}. {{ question.question_name }}</h5>
        <div class="options ms-3">
          <div
            v-for="(option, i) in question.options"
            :key="i"
            class="form-check"
          >
            <label
              class="form-check-label"
              :class="{ 'fw-bold': option.is_correct }"
            >
              {{ String.fromCharCode(65 + i) }}. {{ option.answer }}
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
export default {
  setup() {
    const questionsRandom = ref([]);
    const subject_id = useRoute().params.id;
    const loading = ref(false);
    const numberRandom = ref(1);
    const api = new ApiService();

    const getQuestionsRandom = async (numberRandom) => {
      loading.value = true;
      const token = Cookies.get("accessToken");
      try {
        const response = await api.get(
          `question/subject/${subject_id}/random?numberRandom=${numberRandom}`,
          token
        );
        if (response.status === 200) {
          questionsRandom.value = response.data;
        }
      } catch (error) {
        console.error("Failed to fetch questions", error);
      } finally {
        loading.value = false;
      }
    };

    const shuffleQuestions = async () => {
      await getQuestionsRandom(numberRandom.value);
    };

    const exportToWord = () => {
      if(questionsRandom.value.length === 0){
        Swal.fire({
          title: "Cảnh báo",
          text: "Chưa có câu hỏi nào được random. Vui lòng nhấn nút 'Bắt đầu' để random câu hỏi trước.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: questionsRandom.value.map((question, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${question.question_name}`,
                    bold: true,
                  }),
                ],
              }),
              ...question.options.map((option, i) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${String.fromCharCode(65 + i)}. ${option.answer}`,
                      bold: option.is_correct,
                    }),
                  ],
                  indent: { left: 720 },
                })
              ),
              new Paragraph(""), // thêm khoảng cách giữa các câu hỏi
            ]).flat(),
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, "questions.docx");
      });
    };

    return {
      getQuestionsRandom,
      shuffleQuestions,
      questionsRandom,
      loading,
      numberRandom,
      exportToWord
    };
  },
};
</script>

<style scoped>
.header {
  background-color: #007bff;
  color: white;
  border-radius: 5px;
}
.exam-content {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading {
  position: relative;
}

.loading::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-top: -25px;
  margin-left: -25px;
}
.number-random {
  width: 75px;
  height: 30px;
}
</style>
