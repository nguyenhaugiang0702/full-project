<template>
  <div class="form-check col-sm-2 ms-3 my-2">
    <input
      class="form-check-input border border-dark"
      type="checkbox"
      checked
      id="flexCheckIndeterminate"
      v-model="localCheckedAll"
      @change="toggleSelectAll"
    />
    <label class="form-check-label fw-bold" for="flexCheckIndeterminate">
      Chọn tất cả
    </label>
  </div>
  <button
    type="button"
    class="btn btn-danger ms-2 float-start col-sm-1 deleteSelected"
    @click="deleteSelected"
    :disabled="!anyChecked"
  >
    Xóa
  </button>
</template>
<script>
import { ref, toRefs, computed, watch } from "vue";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";
import { showConfirmation, showSuccess } from "@/utils/swalUtils";
export default {
  props: {
    checked: {
      type: Object,
      required: true,
    },
    selectedName: {
      required: true,
      type: String,
    },
    documents: {
      required: true,
      type: Array,
    },
    checkedAll: {
      type: Boolean,
      required: true,
    },
    subject_id: {
      type: String,
    },
  },
  emits: ["update:checkedAll", "update:checked", "refreshUpdated", "update:isLoading"],
  setup(props, { emit }) {
    const selectedIds = ref([]);
    const api = new ApiService();
    const { documents, checked } = toRefs(props);
    const localCheckedAll = ref(props.checkedAll);

    watch(
      () => props.checkedAll,
      (newValue) => {
        localCheckedAll.value = newValue;
      }
    );

    const toggleSelectAll = () => {
      documents.value.forEach((document) => {
        checked.value[document._id] = localCheckedAll.value;
      });
      updateSelectedIds();
      emit("update:checked", { ...checked.value });
    };

    const updateSelectedIds = () => {
      selectedIds.value = Object.keys(checked.value).filter((key) => checked.value[key]);
    };

    const resetChecked = () => {
      Object.keys(checked.value).forEach((key) => {
        checked.value[key] = false;
      });
      documents.value.forEach((document) => {
        checked.value[document._id] = false;
      });
      localCheckedAll.value = false;
      emit("update:checked", { ...checked.value });
      emit("update:checkedAll", false);
    };

    const anyChecked = computed(() => {
      return Object.values(checked.value).some((isChecked) => isChecked);
    });

    const deleteMap = {
      subjects: `subject/admin/`,
      questions: `question/subject/${props.subject_id}`,
      // teachers: `admin/`
    };

    const deleteSelected = async () => {
      const result = await showConfirmation({
        title: "Bạn có chắc chắn muốn xóa không?",
        text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      });
      if (result.isConfirmed) {
        try {
          emit("update:isLoading", true);
          const token = Cookies.get("accessToken");
          let url;
          if (props.selectedName == "questions") {
            url = deleteMap[props.selectedName];
          } else {
            url = deleteMap[props.selectedName] + `${token}`;
          }
          const apiCall = await api.put(url, selectedIds.value, token);
          const delay = new Promise((resolve) => setTimeout(resolve, 1500));
          const [response] = await Promise.all([apiCall, delay]);
          if (response?.status === 200) {
            resetChecked();
            showSuccess({
              text: "Dữ liệu đã được xóa thành công.",
            });
            emit("refreshUpdated");
          }
        } catch (error) {
          console.log(error);
        } finally {
          emit("update:isLoading", false);
        }
      }
    };

    watch(checked.value, () => {
      updateSelectedIds();
      emit("update:checkedAll", localCheckedAll.value);
    });

    return {
      anyChecked,
      toggleSelectAll,
      deleteSelected,
      localCheckedAll,
    };
  },
};
</script>
<style scoped>
.deleteSelected {
  position: relative;
  left: -100px;
}

@media (max-width: 768px) {
  .deleteSelected {
    position: absolute;
    width: 15%;
    left: 140px;
  }
}
</style>
