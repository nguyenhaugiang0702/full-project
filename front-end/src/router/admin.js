const admin = [
  {
    path: "/admin",
    component: () => import("../layouts/admin.vue"),
    prop: true,
    children: [
      {
        path: "",
        name: "admin-subjects",
        component: () => import("../pages/admin/subjects/index.vue"),
        prop: true,
      },
      {
        path: "teachers",
        name: "admin-teachers",
        component: () => import("../pages/admin/teachers/index.vue"),
        prop: true,
      },
      {
        path: "subjects/:id",
        name: "admin-questions",
        component: () => import("../pages/admin/questions/index.vue"),
      },
      {
        path: "subjects/random-question/:id",
        name: "admin-questions-radndom",
        component: () => import("../pages/admin/questions/random-question.vue"),
      },
    ],
  },
];

export default admin;
