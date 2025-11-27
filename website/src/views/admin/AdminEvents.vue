<script setup lang="ts">
const erpDashboardUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:4000'

const openERP = () => {
  window.open(`${erpDashboardUrl}/events`, '_blank')
}
</script>

<template>
  <div class="p-8">
    <div class="max-w-2xl mx-auto text-center py-16">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-8">
        <svg class="w-16 h-16 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Manage Events</h2>
        
        <p class="text-gray-600 mb-6">
          For full content management capabilities, please use the ERP Dashboard.
          <br />
          The ERP provides advanced features for creating, editing, and managing events with image galleries, categories, and scheduling.
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
