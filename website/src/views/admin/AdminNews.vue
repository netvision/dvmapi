<script setup lang="ts">
const erpDashboardUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:4000'

const openERP = () => {
  window.open(`${erpDashboardUrl}/news`, '_blank')
}
</script>

<template>
  <div class="p-8">
    <div class="max-w-2xl mx-auto text-center py-16">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-8">
        <svg class="w-16 h-16 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Manage News Articles</h2>
        
        <p class="text-gray-600 mb-6">
          For full content management capabilities, please use the ERP Dashboard.
          <br />
          The ERP provides advanced features for creating, editing, and managing news articles with image galleries, categories, and more.
        </p>
        
        <button
          @click="openERP"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open ERP Dashboard
        </button>
      </div>
    </div>
  </div>
</template>
