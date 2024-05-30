<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline">
      <span class="text-decoration-underline">Các môn học:</span>
    </h3>
  </div>
  <!-- Button trigger modal -->
  <div class="row d-flex align-items-end mb-4">
    <div class="col-md-6">
      <button
        type="button"
        class="btn btn-primary ms-2 float-start"
        data-bs-toggle="modal"
        data-bs-target="#addSubjectModal"
      >
        Thêm mới môn học
      </button>
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

  <ModalAddSubject :newSubject="newSubject" />

  <ModalUpdateSubject :currentSubject="currentSubject" />
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
      @click="deleteSelectedSubjects"
      :disabled="!anyChecked"
    >
      Xóa
    </button>
  </div>
  <div class="subjects row">
    <div v-for="subject in paginatedSubjects" :key="subject._id" class="card">
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
  </div>
  <Paginition
    :documents="subjects"
    @update:paginatedDocument="handlePaginatedDocumentUpdate"
  />
</template>

<script>
import ModalAddSubject from "../../../components/admin/modals/subjects/ModalAddSubject.vue";
import ModalUpdateSubject from "../../../components/admin/modals/subjects/ModalUpdateSubject.vue";
import Paginition from "@/components/admin/Pagination.vue";
import { onMounted, ref, computed } from "vue";
import { debounce } from "lodash";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { showSuccess, showConfirmation } from "@/utils/swalUtils";
export default {
  components: {
    ModalAddSubject,
    ModalUpdateSubject,
    Paginition,
  },
  setup() {
    const newSubject = ref({
      subject_name: "",
      subject_code: "",
    });

    const currentSubject = ref({
      _id: "",
      subject_name: "",
      subject_code: "",
    });

    const subjects = ref([]);
    const paginatedSubjects = ref([]);
    const searchValue = ref("");
    const api = new ApiService();
    const checked = ref({});
    const checkedAll = ref(false);
    const selectedIds = ref([]);

    const toggleSelectAll = () => {
      subjects.value.forEach((subject) => {
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
      if (selectedIds.value.length === subjects.value.length && allChecked) {
        checkedAll.value = true;
      } else {
        checkedAll.value = false;
      }
    };

    const updateSelectedIds = () => {
      console.log(checked.value);
      selectedIds.value = Object.keys(checked.value).filter(
        (key) => checked.value[key]
      );
      console.log(selectedIds.value);
    };

    const resetChecked = () => {
      checked.value = {};
      subjects.value.forEach((subject) => {
        checked.value[subject._id] = false;
      });
      checkedAll.value = false;
    };

    const anyChecked = computed(() => {
      return Object.values(checked.value).some((isChecked) => isChecked);
    });

    const getSubjects = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.get("subject", token);
      if (response?.status == 200) {
        subjects.value = response.data;
      }
    };

    const handlePaginatedDocumentUpdate = (newPaginatedDocument) => {
      paginatedSubjects.value = newPaginatedDocument;
    };

    const editSubject = (subject) => {
      currentSubject.value = { ...subject };
    };

    const deleteSubject = async (subjectId) => {
      const result = await showConfirmation({
        title:
          "Bạn có chắc chắn muốn xóa môn học này không, các câu hỏi cũng sẽ bị xóa theo ?",
        text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      });
      if (result.isConfirmed) {
        const token = Cookies.get("accessToken");
        const response = await api.delete(`subject/${subjectId}`, token);
        if (response.status == 200) {
          await showSuccess({
            text: "Dữ liệu đã được xóa thành công.",
          });
          getSubjects();
        }
      }
    };

    const deleteSelectedSubjects = async () => {
      const result = await showConfirmation({
        title: "Bạn có chắc chắn muốn xóa các môn học này không?",
        text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      });
      if (result.isConfirmed) {
        const token = Cookies.get("accessToken");
        const response = await api.put(
          `subject/admin/${token}`,
          selectedIds.value
        );
        if (response?.status === 200) {
          await showSuccess({
            text: "Các môn học đã được xóa thành công.",
          });
          resetChecked();
          getSubjects();
        }
      }
    };

    const searchSubjects = async (searchValue) => {
      const token = Cookies.get("accessToken");
      const response = await api.get(
        `subject?search_value=${searchValue}`,
        token
      );
      if (response?.status == 200) {
        subjects.value = response.data;
      }
    };

    const debouncedSearch = debounce(async () => {
      await searchSubjects(searchValue.value);
    }, 300);

    const expandSubject = (subject) => {
      // Đảo ngược trạng thái của isExpanded khi click vào nút "Xem thêm"
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

    onMounted(() => {
      getSubjects();
    });

    return {
      getSubjects,
      editSubject,
      deleteSubject,
      searchSubjects,
      debouncedSearch,
      newSubject,
      subjects,
      currentSubject,
      searchValue,
      handlePaginatedDocumentUpdate,
      paginatedSubjects,
      expandSubject,
      truncatedSubjectContent,
      checked,
      checkedAll,
      toggleSelectAll,
      toggleChecked,
      updateSelectedIds,
      deleteSelectedSubjects,
      anyChecked,
    };
  },
};
</script>
<style scoped>
.deleteSelected {
  position: relative;
  left: -100px;
}
</style>
