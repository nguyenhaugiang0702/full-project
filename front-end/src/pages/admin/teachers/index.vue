<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline">
      <span class="text-decoration-underline">Tai khoan giang vien</span>
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
        Thêm mới giao vien
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
  <ModalAddTeacher :newTeacher="newTeacher" />
  <ModalUpdateTeacher :currentTeacher="currentTeacher" />
  <ModalDetailTeacher :currentTeacher="currentTeacher" />
  <div class="subjects row mx-auto">
    <div v-for="teacher in teachers" :key="teacher._id" class="card">
      <h4>ID: {{ teacher.admin_id }}</h4>
      <h4>{{ teacher.admin_name }}</h4>
      <div>Email: {{ teacher.admin_email }}</div>
      <!-- <div>Số câu hỏi: {{ teacher.questionCount }}</div> -->
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
          Sua
        </button>

        <button
          class="edit_student col-5 mx-auto btn btn-primary"
          name="edit_teacher"
          data-bs-toggle="modal"
          data-bs-target="#detailTeacherModal"
          @click="editTeacher(teacher)"
        >
          <i class="fa-solid fa-circle-info"></i>
          Xem chi tiet
        </button>
        <button
          class="edit_student col-3 mx-auto btn btn-danger"
          name="edit_teacher"
          @click="deleteTeacher(teacher._id)"
        >
          <i class="fa-solid fa-trash"></i>
          Xoa
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
import { onMounted, ref } from "vue";
import { debounce } from "lodash";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import ApiService from "@/service/ApiService";
export default {
  components: {
    ModalAddTeacher,
    ModalUpdateTeacher,
    ModalDetailTeacher,
    Paginition,
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
    const searchValue = ref("");

    const api = new ApiService();

    const getTeachers = async () => {
      const token = Cookies.get("accessToken");
      const response = await api.get("admin", token);
      if (response.status == 200) {
        teachers.value = response.data;
      }
    };

    const handlePaginatedDocumentUpdate = (newPaginatedDocument) => {
      paginatedTeachers.value = newPaginatedDocument;
    };

    const editTeacher = (teacher) => {
      currentTeacher.value = { ...teacher };
    };

    const deleteTeacher = async (teacherId) => {
      const result = await Swal.fire({
        title:
          "Bạn có chắc chắn muốn xóa giảng viên này không, các câu hỏi và môn học cũng sẽ bị xóa theo ?",
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
        const response = await api.delete(`admin/${teacherId}`, token);
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

    const searchTeachers = async (searchValue) => {
      const token = Cookies.get("accessToken");
      const response = await api.get(
        `admin/?search_value=${searchValue}`,
        token
      );
      if (response.status == 200) {
        teachers.value = response.data;
      }
    };

    const debouncedSearch = debounce(async () => {
      await searchTeachers(searchValue.value);
    }, 300);

    onMounted(() => {
      getTeachers();
    });

    return {
      getTeachers,
      editTeacher,
      deleteTeacher,
      searchTeachers,
      debouncedSearch,
      newTeacher,
      teachers,
      currentTeacher,
      searchValue,
      handlePaginatedDocumentUpdate,
      paginatedTeachers,
    };
  },
};
</script>
