<template>
  <div
    class="modal fade"
    id="detailTeacherModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="detailTeacherModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="detailTeacherModalLabel">
            Chi tiết giảng viên
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="row">
              <div class="mb-3">
                <label class="form-label">ID</label>
                <input
                  v-model="currentTeacher.admin_id"
                  type="text"
                  name="admin_id"
                  class="form-control"
                  readonly
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Tên</label>
                <input
                  v-model="currentTeacher.admin_name"
                  type="text"
                  name="admin_name"
                  class="form-control"
                  readonly
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                  class="form-control"
                  type="email"
                  name="admin_email"
                  readonly
                  v-model="currentTeacher.admin_email"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Đóng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { toRefs } from "vue";
export default {
  props: {
    currentTeacher: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { currentTeacher } = toRefs(props);

    return {
      currentTeacher,
    };
  },
};
</script>
