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

  <div class="subjects row mx-auto">
    <div v-for="subject in paginatedSubjects" :key="subject._id" class="card">
      <h4 class="text-uppercase text-center">{{ subject.subject_code }}</h4>
      <h4 class="text-uppercase text-center">{{ subject.subject_name }}</h4>
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
          Sua
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
          Xem chi tiet
        </button>
        <button
          class="edit_student col-3 col-sm-3 mx-auto btn btn-danger"
          name="edit_teacher"
          @click="deleteSubject(subject._id)"
        >
          <i class="fa-solid fa-trash"></i>
          Xoa
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
import { onMounted, ref } from "vue";
import { debounce } from "lodash";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import ApiService from "@/service/ApiService";
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

    const getSubjects = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.get("subject", token);
      if (response.status == 200) {
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
      const result = await Swal.fire({
        title:
          "Bạn có chắc chắn muốn xóa môn học này không, các câu hỏi cũng sẽ bị xóa theo ?",
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
        const response = await api.delete(`subject/${subjectId}`, token);
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
      }
    };

    const searchSubjects = async (searchValue) => {
      const token = Cookies.get("accessToken");
      const response = await api.get(
        `subject?search_value=${searchValue}`,
        token
      );
      if (response.status == 200) {
        ubjects.value = response.data;
      }
    };

    const debouncedSearch = debounce(async () => {
      await searchSubjects(searchValue.value);
    }, 300);

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
    };
  },
};
</script>

<style scoped></style>
