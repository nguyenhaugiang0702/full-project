<template>
  <div class="pagination">
    <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
    <span>Page {{ currentPage }} of {{ totalPages }}</span>
    <button @click="nextPage" :disabled="currentPage === totalPages">
      Next
    </button>
  </div>
</template>

<script>
import { ref, computed, toRefs, watch } from "vue";
export default {
  props: {
    documents: {
      required: true,
    },
  },
  setup(props, { emit }) {
    const currentPage = ref(1);
    const documentPerPage = ref(9);
    const { documents } = toRefs(props);

    const paginatedDocument = computed(() => {
      const start = (currentPage.value - 1) * documentPerPage.value;
      const end = start + documentPerPage.value;
      return documents.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(documents.value.length / documentPerPage.value);
    });

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    watch(paginatedDocument, () => {
      emit("update:paginatedDocument", paginatedDocument.value);
    });

    return {
      currentPage,
      documentPerPage,
      paginatedDocument,
      totalPages,
      nextPage,
      prevPage,
    };
  },
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
.pagination button {
  margin: 10px 10px;
  padding: 5px 5px;
  border: 1px solid #000;
  border-radius: 10px;
}

.pagination button:hover {
  background-color: #0d6efd;
  color: white;
  border-radius: 10px;
  transition: 0.6s;
  cursor: pointer;
}
</style>
