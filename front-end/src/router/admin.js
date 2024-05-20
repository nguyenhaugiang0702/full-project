const admin = [
  {
    path: "/admin",
    component: () => import("../layouts/admin.vue"),
    children: [
      {
        path: "",
        name: "admin-subjects",
        component: () => import("../pages/admin/subjects/index.vue"),
        prop: true,
      },
      {
        path: "subjects/:id",
        name: "admin-questions-id",
        component: () => import("../pages/admin/questions/index.vue"),
      },
    ],
  },
];

export default admin;
