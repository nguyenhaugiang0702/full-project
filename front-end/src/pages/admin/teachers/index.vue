<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline">
      <span class="text-decoration-underline">Tài khoản giảng viên</span>
    </h3>
  </div>

  <!-- Button trigger modal -->
  <div class="row d-flex align-items-end mb-4">
    <div class="col-md-6">
      <button
        type="button"
        class="btn btn-primary ms-2 float-start"
        data-bs-toggle="modal"
        data-bs-target="#addTeacherModal"
      >
        Thêm mới giáo viên danh
      </button>
    </div>
    <div class="col-md-6">
      <Search
        :searchName="'teachers'"
        @updateSearch="handleSearchValue"
        @refreshSearch="handleSearchLoading"
      />
    </div>
  </div>
  <hr />
  <ModalAddTeacher :newTeacher="newTeacher" @refreshTeacher="getTeachers" />
  <ModalUpdateTeacher :currentTeacher="currentTeacher" @refreshTeacher="getTeachers" />
  <ModalDetailTeacher :currentTeacher="currentTeacher" />
  <div class="loader-container" v-if="isLoading || isLoadingDelete || isLoadingSearch">
    <div class="loader_documents"></div>
  </div>
  <div
    v-if="!isLoading && !isLoadingDelete && !isLoadingSearch"
    class="subjects row mx-auto"
  >
    <div v-for="teacher in teachers" :key="teacher._id" class="card">
      <h4>ID: {{ teacher.admin_id }}</h4>
      <h4>{{ teacher.admin_name }}</h4>
      <div>Email: {{ teacher.admin_email }}</div>
      <div class="row mt-2">
        <button
          class="edit_student col-3 mx-auto btn btn-warning ms-2"
          name="edit_teacher"
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#updateTeacherModal"
          @click="editTeacher(teacher)"
        >
          <i class="fa-solid fa-pen-to-square"></i>
          Sửa
        </button>

        <button
          class="edit_student col-5 mx-auto btn btn-primary"
          name="edit_teacher"
          data-bs-toggle="modal"
          data-bs-target="#detailTeacherModal"
          @click="editTeacher(teacher)"
        >
          <i class="fa-solid fa-circle-info"></i>
          Xem chi tiết
        </button>
        <button
          class="edit_student col-3 mx-auto btn btn-danger"
          name="edit_teacher"
          @click="deleteTeacher(teacher._id)"
        >
          <i class="fa-solid fa-trash"></i>
          Xóa
        </button>
      </div>
    </div>
  </div>
  <Paginition
    :documents="teachers"
    @update:paginatedDocument="handlePaginatedDocumentUpdate"
  />
</template>
<script>
import ModalAddTeacher from "../../../components/admin/modals/teachers/ModalAddTeacher.vue";
import ModalUpdateTeacher from "../../../components/admin/modals/teachers/ModalUpdateTeacher.vue";
import ModalDetailTeacher from "../../../components/admin/modals/teachers/ModalDetailTeacher.vue";
import Paginition from "@/components/admin/Pagination.vue";
import Search from "@/components/admin/search/Search.vue";
import SelectedAll from "@/components/admin/SelectedAll.vue";
import { onMounted, ref } from "vue";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { showSuccess, showConfirmation } from "@/utils/swalUtils";
export default {
  components: {
    ModalAddTeacher,
    ModalUpdateTeacher,
    ModalDetailTeacher,
    Paginition,
    Search,
    SelectedAll,
  },
  setup() {
    const newTeacher = ref({
      admin_id: "",
      admin_name: "",
      admin_email: "",
      admin_password: "",
    });

    const currentTeacher = ref({
      _id: "",
      admin_id: "",
      admin_name: "",
      admin_email: "",
      admin_password: "",
      admin_role: "",
    });

    const teachers = ref([]);
    const paginatedTeachers = ref([]);
    const isLoading = ref(false);
    const isLoadingDelete = ref(false);
    const isLoadingSearch = ref(false);

    const api = new ApiService();

    const getTeachers = async () => {
      isLoading.value = true;
      const token = Cookies.get("accessToken");
      try {
        apiCall = await api.get("admin", token);
        const delay = new Promise((resolve) => setTimeout(resolve, 500));
        const [response] = await Promise.all([apiCall, delay]);
        if (response.status == 200) {
          teachers.value = response.data;
        }
      } catch (error) {
        console.log(error);
      } finally {
        isLoading.value = false;
      }
    };

    const handlePaginatedDocumentUpdate = (newPaginatedDocument) => {
      paginatedTeachers.value = newPaginatedDocument;
    };

    const editTeacher = (teacher) => {
      currentTeacher.value = { ...teacher };
    };

    const deleteTeacher = async (teacherId) => {
      const result = await showConfirmation({
        title:
          "Bạn có chắc chắn muốn xóa giảng viên này không, các câu hỏi và môn học cũng sẽ bị xóa theo ?",
        text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      });
      if (result.isConfirmed) {
        try {
          isLoadingDelete.value = true;
          const token = Cookies.get("accessToken");
          const apiCall = await api.delete(`admin/${teacherId}`, token);
          const delay = new Promise((resolve) => setTimeout(resolve, 1500));
          const [response] = await Promise.all([apiCall, delay]);
          if (response.status == 200) {
            isLoadingDelete.value = false;
            await showSuccess({
              text: "Dữ liệu đã được xóa thành công.",
            });
            getTeachers();
          }
        } catch (error) {
          console.log(error);
        } finally {
          isLoadingDelete.value = false;
        }
      }
    };

    const handleSearchValue = (value) => {
      teachers.value = value;
    };

    const handleSearchLoading = (value) => {
      isLoadingSearch.value = value;
    };

    onMounted(() => {
      getTeachers();
    });

    return {
      getTeachers,
      editTeacher,
      deleteTeacher,
      newTeacher,
      teachers,
      currentTeacher,
      handlePaginatedDocumentUpdate,
      paginatedTeachers,
      handleSearchValue,
      isLoading,
      isLoadingDelete,
      isLoadingSearch,
      handleSearchLoading,
    };
  },
};
</script>
