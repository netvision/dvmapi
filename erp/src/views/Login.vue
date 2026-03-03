<template>
  <div class="min-h-screen flex">

    <!-- ── Left branding panel ── -->
    <div class="hidden lg:flex lg:w-[45%] flex-col items-center justify-center bg-[#0f172a] px-12 relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/10"></div>
      <div class="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-blue-600/5"></div>

      <div class="relative z-10 text-center">
        <div class="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6 overflow-hidden">
          <img src="/images/dvm-logo-white.png" alt="Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-3xl font-bold text-white leading-tight">Dalmia Vidya Mandir</h1>
        <p class="text-slate-400 text-base mt-3 leading-relaxed max-w-xs mx-auto">
          Empowering education through integrated school management.
        </p>
      </div>

      <!-- Bottom tagline -->
      <p class="absolute bottom-8 text-slate-600 text-xs">ERP System &mdash; Internal Use Only</p>
    </div>

    <!-- ── Right form panel ── -->
    <div class="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6">
      <div class="w-full max-w-sm">

        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-8">
          <div class="w-14 h-14 rounded-xl bg-[#0f172a] flex items-center justify-center mx-auto mb-3 overflow-hidden">
            <img src="/images/dvm-logo-white.png" alt="Logo" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-xl font-bold text-slate-900">Dalmia Vidya Mandir</h1>
        </div>

        <h2 class="text-2xl font-semibold text-slate-900">Sign in</h2>
        <p class="text-slate-500 text-sm mt-1 mb-7">Enter your credentials to access the dashboard</p>

        <form @submit.prevent="handleLogin" class="space-y-4">

          <div v-if="error" class="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            <AlertCircle :size="16" class="mt-0.5 flex-shrink-0" />
            <span>{{ error }}</span>
          </div>

          <div>
            <label class="form-label" for="email">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              class="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="form-label" for="password">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="form-input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Eye v-if="!showPassword" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary justify-center py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" :size="15" class="animate-spin" />
            <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
          </button>

        </form>

        <p class="text-center text-slate-400 text-xs mt-8">
          &copy; {{ new Date().getFullYear() }} Dalmia Vidya Mandir. All rights reserved.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
