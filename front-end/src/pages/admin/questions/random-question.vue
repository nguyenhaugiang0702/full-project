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
        <button class="btn btn-info ms-3" @click="addToWorkbook">
          Thêm vào Workbook
        </button>
        <button class="btn btn-info ms-3" @click="saveWorkbook">
          Lưu Workbook
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
import * as XLSX from "xlsx";
import { data } from "jquery";
export default {
  setup() {
    const questionsRandom = ref([]);
    const subject_id = useRoute().params.id;
    const loading = ref(false);
    const numberRandom = ref(1);
    const api = new ApiService();
    const currentSheetIndex = ref(101);
    const workbook = ref(XLSX.utils.book_new());

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
      if (questionsRandom.value.length === 0) {
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
            children: questionsRandom.value
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
                          bold: option.is_correct,
                        }),
                      ],
                      indent: { left: 720 },
                    })
                ),
                new Paragraph(""), // thêm khoảng cách giữa các câu hỏi
              ])
              .flat(),
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, "questions.docx");
      });
    };

    const addToWorkbook = () => {
      if (questionsRandom.value.length === 0) {
        // Hiển thị cảnh báo nếu không có câu hỏi
        Swal.fire({
          title: "Cảnh báo",
          text: "Chưa có câu hỏi nào được random. Vui lòng nhấn nút 'Bắt đầu' để random câu hỏi trước.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

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

      // Tạo một mảng chứa dữ liệu cho file Excel
      // const excelData = [["Câu", "Đáp án"]];

      // Điền dữ liệu câu hỏi và đáp án vào mảng dữ liệu
      // questionsRandom.value.forEach((question, index) => {
      //   const rowData = [`${index + 1}`];

      //   // Thêm các đáp án vào hàng tiếp theo
      //   question.options.forEach((option, i) => {
      //     rowData.push(option.is_correct ? String.fromCharCode(65 + i) : "");
      //   });

      //   // Thêm hàng dữ liệu vào mảng dữ liệu
      //   excelData.push(rowData);
      // });

      // Loại bỏ các phần tử rỗng trong mảng excelData
      // const cleanedExcelData = excelData.map((row) =>
      //   row.filter((data) => data !== "")
      // );

      // // Lọc các hàng có ít hơn 2 phần tử (bao gồm cả tiêu đề và cột 101)
      // const filteredExcelData = cleanedExcelData.filter(
      //   (row) => row.length >= 2
      // );

      // Tạo một Worksheet mới từ dữ liệu
      // const worksheet = XLSX.utils.aoa_to_sheet(filteredExcelData);

      // Thêm Worksheet vào Workbook
      XLSX.utils.book_append_sheet(
        workbook.value,
        worksheet,
        `Đề ${currentSheetIndex.value}`
      );

      // Tăng chỉ số đề
      currentSheetIndex.value++;

      // Hiển thị thông báo thành công
      Swal.fire({
        title: "Thành công",
        text: `Đã thêm thành công Đề ${
          currentSheetIndex.value - 1
        } vào Workbook.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    };

    const saveWorkbook = () => {
      if (workbook.value.SheetNames.length === 0) {
        Swal.fire({
          title: "Cảnh báo",
          text: "Chưa có đề nào trong workbook. Vui lòng thêm đề trước khi lưu.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
      // Xuất Workbook ra file Excel
      XLSX.writeFile(workbook.value, "questions.xlsx");
    };

    return {
      getQuestionsRandom,
      shuffleQuestions,
      questionsRandom,
      loading,
      numberRandom,
      exportToWord,
      addToWorkbook,
      saveWorkbook,
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
