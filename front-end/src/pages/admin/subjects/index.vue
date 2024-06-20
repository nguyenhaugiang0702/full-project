<template>
  <div class="main-top">
    <h3 class="ms-2 text-underline">
      <span class="text-decoration-underline">Các môn học:</span>
    </h3>
  </div>

  <div class="row d-flex align-items-end mb-4">
    <div class="col-md-6 my-2">
      <ModalAddSubject :newSubject="newSubject" @refreshUpdate="getSubjects" />
    </div>
    <div class="col-md-6 my-2">
      <Search :searchName="'subjects'" @updateSearch="handleSearchValue" />
    </div>
  </div>
  <hr />

  <ModalUpdateSubject :currentSubject="currentSubject" @refreshUpdate="getSubjects" />

  <div class="row my-2">
    <SelectedAll
      :selectedName="'subjects'"
      :documents="subjects"
      :checked="checked"
      :checkedAll="checkedAll"
      @update:checkedAll="updateCheckedAll"
      @update:checked="updateChecked"
      @update:isLoading="handleLoading"
      @refreshUpdated="getSubjects"
    />
  </div>
  <div v-if="isLoading" class="loader_documents"></div>
  <div v-if="isLoadingDelete" class="loader_documents"></div>
  <div v-if="!isLoading || !isLoadingDelete" class="subjects row">
    <SubjectsCard
      v-for="subject in paginatedSubjects"
      :key="subject._id"
      :subject="subject"
      :checked="checked"
      :toggleChecked="toggleChecked"
      :editSubject="editSubject"
      :deleteSubject="deleteSubject"
    />
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
import SubjectsCard from "@/components/admin/card/subjects/SubjectsCard.vue";
import { onMounted, ref, computed, watchEffect } from "vue";
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
    SubjectsCard,
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
    const isLoading = ref(false);
    const isLoadingDelete = ref(false);

    const toggleChecked = () => {
      const allChecked = Object.values(checked.value).every((value) => value === true);
      selectedIds.value = Object.keys(checked.value).filter((key) => checked.value[key]);
      if (selectedIds.value.length === subjects.value.length && allChecked) {
        checkedAll.value = true;
      } else {
        checkedAll.value = false;
      }
    };

    const getSubjects = async () => {
      const token = Cookies.get("accessToken");
      isLoading.value = true;
      try {
        const response = await api.get("subject", token);
        if (response?.status == 200) {
          subjects.value = response.data;
        }
      } catch (error) {
        console.error("Error while fetching subjects:", error);
      } finally {
        isLoading.value = false;
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
        try {
          isLoadingDelete.value = true;
          const token = Cookies.get("accessToken");
          const response = await api.delete(`subject/${subjectId}`, token);
          if (response.status == 200) {
            await showSuccess({
              text: "Dữ liệu đã được xóa thành công.",
            });
            await getSubjects();
          }
        } catch (error) {
          console.log(error);
        } finally {
          isLoadingDelete.value = false;
        }
      }
    };

    const handleSearchValue = (value) => {
      subjects.value = value;
    };

    const updateCheckedAll = (value) => {
      checkedAll.value = value;
    };

    const updateChecked = (value) => {
      checked.value = value;
    };

    const handleLoading = (value) => {
      isLoading.value = value;
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
      checked,
      checkedAll,
      toggleChecked,
      handleSearchValue,
      updateCheckedAll,
      updateChecked,
      isLoading,
      handleLoading,
      isLoadingDelete,
    };
  },
};
</script>

<style scoped>
@import "../../../assets/css/loading.css";
</style>
