<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline">
      <span class="text-decoration-underline">Các môn học:</span>
    </h3>
  </div>
  <!-- Button trigger modal -->
  <div class="row d-flex align-items-end mb-4">
    <div class="col-md-6 my-2">
      <ModalAddSubject :newSubject="newSubject" @refreshUpdate="getSubjects"/>
    </div>
    <div class="col-md-6 my-2">
      <Search :searchName="'subjects'" @updateSearch="handleSearchValue" />
    </div>
  </div>
  <hr />

  <ModalUpdateSubject :currentSubject="currentSubject" @refreshUpdate="getSubjects"/>

  <div class="row my-2">
    <SelectedAll
      :selectedName="'subjects'"
      :documents="subjects"
      :checked="checked"
      :checkedAll="checkedAll"
      @update:checkedAll="updateCheckedAll"
      @update:checked="updateChecked"
      @refreshUpdated="getSubjects"
    />
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
import Search from "@/components/admin/search/Search.vue";
import SelectedAll from "@/components/admin/SelectedAll.vue";
import { onMounted, ref, computed } from "vue";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { showSuccess, showConfirmation } from "@/utils/swalUtils";
export default {
  components: {
    ModalAddSubject,
    ModalUpdateSubject,
    Paginition,
    Search,
    SelectedAll,
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
    const api = new ApiService();
    const checked = ref({});
    const checkedAll = ref(false);
    const selectedIds = ref([]);

    const toggleChecked = () => {
      const allChecked = Object.values(checked.value).every(
        (value) => value === true
      );
      selectedIds.value = Object.keys(checked.value).filter(
        (key) => checked.value[key]
      );
      if (selectedIds.value.length === subjects.value.length && allChecked) {
        checkedAll.value = true;
      } else {
        checkedAll.value = false;
      }
    };

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

    const handleSearchValue = (value) => {
      subjects.value = value;
    };

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

    const updateCheckedAll = (value) => {
      checkedAll.value = value;
    };

    const updateChecked = (value) => {
      checked.value = value;
    };

    onMounted(() => {
      getSubjects();
    });

    return {
      getSubjects,
      editSubject,
      deleteSubject,
      newSubject,
      subjects,
      currentSubject,
      handlePaginatedDocumentUpdate,
      paginatedSubjects,
      expandSubject,
      truncatedSubjectContent,
      checked,
      checkedAll,
      toggleChecked,
      handleSearchValue,
      updateCheckedAll,
      updateChecked,
    };
  },
};
</script>
