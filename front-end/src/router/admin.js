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
