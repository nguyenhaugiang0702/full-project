<template>
  <span>Search</span>
  <input
    class="form-control border border-dark"
    list="datalistOptions"
    id="exampleDataList"
    placeholder="Type to search..."
    v-model="searchValue"
    @input="debouncedSearch"
  />
</template>

<script>
import { ref } from "vue";
import { debounce } from "lodash";
import Cookies from "js-cookie";
import ApiService from "@/service/ApiService";

export default {
  props: {
    subject_id: {
      type: String,
    },
    searchName: {
      required: true,
      type: String,
    },
  },
  emits: ["updateSearch", "refreshSearch"],
  setup(props, { emit }) {
    const api = new ApiService();
    const documents = ref([]);
    const searchValue = ref("");

    const searchMap = {
      questions: `question/subject/${props.subject_id}?search_value=`,
      subjects: "subject?search_value=",
      teachers: "admin?search_value=",
    };

    const searchQuestions = async (searchValue) => {
      try {
        const token = Cookies.get("accessToken");
        const apiCall = await api.get(
          `${searchMap[props.searchName]}${searchValue}`,
          token
        );
        const delay = new Promise((resolve) => setTimeout(resolve, 500));
        const [response] = await Promise.all([apiCall, delay]);
        if (response?.status === 200) {
          documents.value = response.data;
          emit("updateSearch", documents.value);
        }
      } catch (error) {
        console.log(error);
      } finally {
      }
    };

    const debouncedSearch = debounce(async () => {
      await searchQuestions(searchValue.value);
    }, 300);

    return { debouncedSearch, searchValue };
  },
};
</script>
