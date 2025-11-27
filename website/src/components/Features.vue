<template>
  <section class="py-8 bg-white rounded-xl shadow-md border border-gray-200 relative overflow-hidden">
    <!-- Subtle background pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="h-full w-full" style="background-image: radial-gradient(circle at 2px 2px, #3B82F6 1px, transparent 0); background-size: 40px 40px;"></div>
    </div>

    <div class="container mx-auto px-4 relative overflow-hidden">
      <div class="text-center mb-8">
        <div class="inline-flex items-center px-6 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200/50 shadow-sm mb-4">
          <div class="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
          <span class="text-sm font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent tracking-wide uppercase">
            Other Salient Features
          </span>
          <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full ml-3"></div>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Proven Excellence in 
          <span class="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Action
          </span>
        </h2>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Beyond our philosophy lies concrete advantages that make DVM the right choice for your child's future
        </p>
        <div class="w-20 h-0.5 bg-gradient-to-r from-green-600 to-blue-600 mx-auto mt-4 rounded-full"></div>
      </div>

      <!-- Key Benefits Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto overflow-hidden px-1">
        <!-- 100 Years Legacy -->
        <div class="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-amber-100 max-w-full overflow-hidden">
          <div class="w-full h-32 overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
            <img 
              src="/images/student1.jpg" 
              alt="100 Years Legacy" 
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-4 text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-4">100+ Years Legacy</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              A century of educational excellence and proven track record in shaping successful lives
            </p>
            <div class="mt-4 text-amber-600 font-semibold text-sm">
              Established Heritage
            </div>
          </div>
        </div>

        <!-- Expert Faculty Network -->
        <div class="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100 max-w-full overflow-hidden">
          <div class="w-full h-32 overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
            <img 
              src="/images/avroom.jpg" 
              alt="AV Room Excellence" 
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-6 text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-4">AV Room Excellence</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Interactive remote learning with expert guest faculty from across the globe via our advanced AV facility
            </p>
            <div class="mt-4 text-blue-600 font-semibold text-sm">
              Global Expertise Access
            </div>
          </div>
        </div>

        <!-- Individual Focus -->
        <div class="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-100 max-w-full overflow-hidden">
          <div class="w-full h-32 overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
            <img 
              src="/images/student2.jpg" 
              alt="Small Class Advantage" 
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-6 text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Small Class Advantage</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Maximum 25 students per class ensuring personalized attention and customized learning paths
            </p>
            <div class="mt-4 text-purple-600 font-semibold text-sm">
              Personal Mentorship
            </div>
          </div>
        </div>

        <!-- Holistic Development -->
        <div class="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-green-100 max-w-full overflow-hidden">
          <div class="w-full h-32 overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
            <img 
              src="/images/sports.jpg" 
              alt="Complete Development" 
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-6 text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Complete Development</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Academic excellence + Sports champions + Arts mastery = Well-rounded individuals ready for life
            </p>
            <div class="mt-4 text-green-600 font-semibold text-sm">
              Future-Ready Citizens
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Stats -->
      <div class="mt-8 bg-gradient-to-r from-gray-900 to-blue-900 rounded-xl p-6 text-white">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div class="text-2xl md:text-3xl font-bold text-blue-300 mb-1">100+</div>
            <div class="text-xs text-gray-300 uppercase tracking-wide">Years of Excellence</div>
          </div>
          <div>
            <div class="text-2xl md:text-3xl font-bold text-green-300 mb-1">1:25</div>
            <div class="text-xs text-gray-300 uppercase tracking-wide">Teacher-Student Ratio</div>
          </div>
          <div>
            <div class="text-2xl md:text-3xl font-bold text-purple-300 mb-1">360°</div>
            <div class="text-xs text-gray-300 uppercase tracking-wide">Holistic Development</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Icons removed - now using images
</script>
