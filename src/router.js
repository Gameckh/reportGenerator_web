// src/router.js
import { createRouter, createWebHashHistory } from 'vue-router';
import TemplateManagerPage from './views/Templates.vue';
import ReportGeneratorPage from './views/Reports.vue';

const routes = [
  {
    path: '/',
    name: 'ReportGeneratorPage',
    component: ReportGeneratorPage,
  },
  {
    path: '/templates',
    name: 'TemplateManagerPage',
    component: TemplateManagerPage,
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
