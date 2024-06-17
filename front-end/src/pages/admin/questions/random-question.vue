<template>
  <div class="container">
    <h4>
      Môn học: {{ subjectInfo.subject_name }} - Mã môn:
      {{ subjectInfo.subject_code }} - Số câu: {{ subjectInfo.questionCount }}
    </h4>
    <div class="header text-center border border-dark">
      <h2 class="mt-3">Trộn câu hỏi</h2>
      <div class="text-center mt-4">
        <button
          class="btn btn-danger"
          @click="shuffleQuestions"
          :disabled="isLoading"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-else>Bắt đầu</span>
        </button>
        <input
          type="number"
          v-model="numberRandom"
          class="ms-3 text-dark number-random text-center border border-dark"
          min="1"
          @keypress.enter="shuffleQuestions"
        />
        <button
          class="btn btn-info ms-3"
          @click="exportToWord"
          :disabled="isExporting"
        >
          <span
            v-if="isExporting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-else>Xuất ra file Word</span>
        </button>
        <button class="btn btn-success ms-3 my-3" @click="saveWorkbook" :disabled="isSavingExcel">
          <span
            v-if="isSavingExcel"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-else>Xuất ra file đáp án Excel</span>
        </button>
      </div>
    </div>
    <div class="exam-content">
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
import * as XLSX from "xlsx";
import { showWarning, showSuccess } from "@/utils/swalUtils";
export default {
  setup() {
    const questionsRandom = ref([]);
    const subject_id = useRoute().params.id;
    const isLoading = ref(false);
    const isExporting = ref(false);
    const isSavingExcel = ref(false);
    const numberRandom = ref(1);
    const api = new ApiService();
    const subjectInfo = ref([]);
    const currentDocxIndex = ref(101);
    const workbook = ref(XLSX.utils.book_new());


    const getQuestionsRandom = async (numberRandom) => {
      const token = Cookies.get("accessToken");
      isLoading.value = true;
      try {
        const apiCall = api.get(
          `question/subject/${subject_id}/random?numberRandom=${numberRandom}`,
          token
        );
        const delay = new Promise((resolve) => setTimeout(resolve, 1500));
        const [response] = await Promise.all([apiCall, delay]);
        if (response.status === 200) {
          questionsRandom.value = response.data;
        }
      } catch (error) {
        console.error("Failed to fetch questions", error);
      } finally {
        isLoading.value = false;
      }
    };

    const getSubject = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.get(`subject/${subject_id}`, token);
      if (response.status == 200) {
        subjectInfo.value = response.data;
      }
    };

    const shuffleQuestions = async () => {
      await getQuestionsRandom(numberRandom.value);
    };

    onMounted(() => {
      getSubject();
    });

    const exportToWord = async () => {
      if (questionsRandom.value.length === 0) {
        showWarning({
          text: "Chưa có câu hỏi nào được random. Vui lòng nhấn nút 'Bắt đầu' để random câu hỏi trước.",
        });
        return;
      }

      isExporting.value = true;
      try {
        // Thêm độ trễ 1.5 giây
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const examCode = currentDocxIndex.value; // Sử dụng chỉ số đề làm mã đề
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Mã đề: ${examCode}`,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  alignment: "center",
                  spacing: { after: 400 }, // khoảng cách sau đoạn văn bản
                }),
                ...questionsRandom.value
                  .map((question, index) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index + 1}. ${question.question_name}`,
                          bold: true,
                        }),
                      ],
                    }),
                    ...question.options.map(
                      (option, i) =>
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${String.fromCharCode(65 + i)}. ${
                                option.answer
                              }`,
                              // bold: option.is_correct,
                            }),
                          ],
                          indent: { left: 720 },
                        })
                    ),
                    new Paragraph(""), // thêm khoảng cách giữa các câu hỏi
                  ])
                  .flat(),
              ],
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Đề_${examCode}.docx`);
        addToWorkbook(examCode);
        currentDocxIndex.value++;
      } catch (error) {
        console.error("Failed to export to Word", error);
      } finally {
        isExporting.value = false;
      }
    };

    const addToWorkbook = (examCode) => {
      const worksheet = XLSX.utils.aoa_to_sheet([]);
      // Số câu mỗi vùng
      const chunkSize = 10;
      // Tạo các vùng dữ liệu
      for (let i = 0; i < questionsRandom.value.length; i += chunkSize) {
        // Tạo dữ liệu cho vùng hiện tại
        const chunkData = [["Câu", "Đáp án"]];
        questionsRandom.value
          .slice(i, i + chunkSize)
          .forEach((question, index) => {
            const rowData = [`${i + index + 1}`];
            question.options.forEach((option, idx) => {
              if (option.is_correct) {
                rowData.push(String.fromCharCode(65 + idx));
              }
            });
            chunkData.push(rowData);
          });

        // Xác định vị trí bắt đầu của vùng hiện tại trong worksheet
        const startRow = 0; // +1 để tạo khoảng cách giữa các vùng
        const startCol = Math.floor(i / chunkSize) * 3; // +3 để tạo khoảng cách giữa các vùng

        // Điền dữ liệu vào worksheet
        chunkData.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            XLSX.utils.sheet_add_aoa(worksheet, [[cell]], {
              origin: { r: startRow + rowIndex, c: startCol + colIndex },
            });
          });
        });
      }

      // Thêm Worksheet vào Workbook
      XLSX.utils.book_append_sheet(workbook.value, worksheet, `Đề ${examCode}`);

      // Hiển thị thông báo thành công
      showSuccess({
        text: `Đã tạo thành công đề thi và sheet đáp án Đề ${examCode}.`,
        timer: 1500,
      });
    };

    const saveWorkbook = async () => {
      if (workbook.value.SheetNames.length === 0) {
        showWarning({
          text: "Chưa có đề nào. Vui lòng thêm đề trước khi lưu.",
        });
        return;
      }

      isSavingExcel.value = true;
      try {
        // Thêm độ trễ 1.5 giây
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Xuất Workbook ra file Excel
        XLSX.writeFile(workbook.value, "questions.xlsx");
      } catch (error) {
        console.error("Failed to save workbook", error);
      } finally {
        isSavingExcel.value = false;
      }
    };

    return {
      getQuestionsRandom,
      shuffleQuestions,
      questionsRandom,
      isLoading,
      isExporting,
      isSavingExcel,
      numberRandom,
      exportToWord,
      saveWorkbook,
      subjectInfo,
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
.number-random {
  width: 75px;
  height: 30px;
}
</style>
