<template>
  <div class="facilities-page">
    <!-- Hero Section -->
    <div class="relative h-80 bg-gradient-to-r from-green-600 to-teal-600">
      <div class="absolute inset-0 bg-black opacity-30"></div>
      <div class="container mx-auto px-4 h-full flex items-center relative z-10">
        <div class="text-white">
          <h1 class="text-5xl font-bold mb-4">Facilities</h1>
          <p class="text-xl">World-Class Infrastructure for Holistic Development</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-16">
      <!-- Campus Overview -->
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-bold text-blue-900 mb-6">Modern Campus Infrastructure</h2>
        <p class="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto mb-8">
          Our state-of-the-art campus spans across 15 acres, providing a conducive environment for learning, 
          sports, and overall personality development. Every facility is designed with student safety and 
          comfort in mind.
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-900">15</div>
            <div class="text-sm text-gray-600">Acres Campus</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-900">60</div>
            <div class="text-sm text-gray-600">Classrooms</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-900">25</div>
            <div class="text-sm text-gray-600">Laboratories</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-900">100%</div>
            <div class="text-sm text-gray-600">Wi-Fi Coverage</div>
          </div>
        </div>
      </div>

      <!-- Academic Facilities -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Academic Infrastructure</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div class="space-y-6">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold text-blue-900 mb-4">📚 Smart Classrooms</h3>
              <ul class="text-gray-700 space-y-2">
                <li>• Interactive whiteboards in every classroom</li>
                <li>• Audio-visual learning systems</li>
                <li>• Air-conditioned environment</li>
                <li>• Ergonomic furniture for comfort</li>
                <li>• Digital content library access</li>
              </ul>
            </div>
            <div class="bg-green-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold text-blue-900 mb-4">🔬 Science Laboratories</h3>
              <ul class="text-gray-700 space-y-2">
                <li>• Separate labs for Physics, Chemistry, Biology</li>
                <li>• Modern equipment and instruments</li>
                <li>• Safety measures and protocols</li>
                <li>• Research project facilities</li>
                <li>• Digital microscopy setup</li>
              </ul>
            </div>
            <div class="bg-purple-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold text-blue-900 mb-4">💻 Computer Center</h3>
              <ul class="text-gray-700 space-y-2">
                <li>• 100+ latest computers</li>
                <li>• High-speed internet connectivity</li>
                <li>• Programming and robotics lab</li>
                <li>• Multimedia editing suites</li>
              </ul>
            </div>
          </div>
          <div>
            <img 
              src="/images/building.jpg" 
              alt="Smart Classroom" 
              class="w-full h-64 object-cover rounded-lg shadow-lg mb-6"
            />
            <img 
              src="/images/labs.jpg" 
              alt="Science Laboratory" 
              class="w-full h-64 object-cover rounded-lg shadow-lg"
            />
            <img 
              src="/images/computer.jpg" 
              alt="Science Laboratory" 
              class="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <!-- Library & Resources -->
      <div class="mb-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <img 
              src="/images/slide2.jpg" 
              alt="School Library" 
              class="w-full h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 class="text-3xl font-bold text-blue-900 mb-6">📖 Central Library</h2>
            <p class="text-gray-700 leading-relaxed mb-6">
              Our expansive library houses over 25,000 books, magazines, journals, and digital resources. 
              It serves as the knowledge hub of our institution, promoting reading culture and research skills.
            </p>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-blue-100 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-900">25,000+</div>
                <div class="text-sm text-gray-600">Books & Journals</div>
              </div>
              <div class="bg-green-100 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-900">500+</div>
                <div class="text-sm text-gray-600">Digital Resources</div>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center">
                <span class="text-green-600 mr-2">✓</span>
                <span>Separate reading areas for different age groups</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-600 mr-2">✓</span>
                <span>Digital catalog and online book search</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-600 mr-2">✓</span>
                <span>Reference section and research assistance</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-600 mr-2">✓</span>
                <span>Quiet study zones and group discussion areas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sports Facilities -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">🏃‍♂️ Sports & Recreation</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-red-50 p-6 rounded-lg text-center">
            <img 
              src="/images/sports.jpg" 
              alt="Playground" 
              class="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 class="text-xl font-semibold text-blue-900 mb-3">Outdoor Sports</h3>
            <ul class="text-gray-700 text-sm space-y-1">
              <li>• Football & Cricket Ground</li>
              <li>• Basketball & Volleyball Courts</li>
              <li>• Athletics Track (400m)</li>
              <li>• Badminton Courts</li>
            </ul>
          </div>
          <div class="bg-blue-50 p-6 rounded-lg text-center">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=300&fit=crop" 
              alt="Gymnasium" 
              class="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 class="text-xl font-semibold text-blue-900 mb-3">Indoor Sports</h3>
            <ul class="text-gray-700 text-sm space-y-1">
              <li>• Multi-purpose Gymnasium</li>
              <li>• Table Tennis Room</li>
              <li>• Chess & Carrom Hall</li>
              <li>• Yoga & Meditation Center</li>
              <li>• Martial Arts Dojo</li>
            </ul>
          </div>
          <div class="bg-green-50 p-6 rounded-lg text-center">
            <img 
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=300&fit=crop" 
              alt="AV Room Auditorium" 
              class="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 class="text-xl font-semibold text-blue-900 mb-3">Audio Visual & Remote Learning</h3>
            <ul class="text-gray-700 text-sm space-y-1">
              <li>• AV Room - Interactive Remote Teaching (New)</li>
              <li>• Guest expert faculty sessions</li>
              <li>• Live interactive classes with remote teachers</li>
              <li>• Audio visual programmes & events</li>
              <li>• Cultural activities & performances</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Student Amenities -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Student Amenities</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-blue-50 p-6 rounded-lg text-center">
            <div class="text-4xl mb-3">🏫</div>
            <h4 class="text-lg font-semibold text-blue-900 mb-2">Clean Infrastructure</h4>
            <p class="text-sm text-gray-600">Well-maintained classrooms and campus with regular cleaning</p>
          </div>
          <div class="bg-purple-50 p-6 rounded-lg text-center">
            <div class="text-4xl mb-3">📹</div>
            <h4 class="text-lg font-semibold text-blue-900 mb-2">CCTV Surveillance</h4>
            <p class="text-sm text-gray-600">Complete campus monitoring with 24/7 security coverage</p>
          </div>
          <div class="bg-green-50 p-6 rounded-lg text-center">
            <div class="text-4xl mb-3">🔒</div>
            <h4 class="text-lg font-semibold text-blue-900 mb-2">Campus Security</h4>
            <p class="text-sm text-gray-600">Trained security personnel and controlled access points</p>
          </div>
        </div>
      </div>

      <!-- Special Facilities -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Special Facilities</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 class="text-xl font-semibold mb-4">🌱 Eco-Friendly Campus</h3>
            <ul class="text-sm space-y-2">
              <li>• Solar power generation</li>
              <li>• Rainwater harvesting system</li>
              <li>• Waste segregation & recycling</li>
              <li>• Organic garden & greenhouse</li>
              <li>• Energy-efficient LED lighting</li>
            </ul>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-lg">
            <h3 class="text-xl font-semibold mb-4">🔬 Future Innovation Labs (Planned)</h3>
            <ul class="text-sm space-y-2">
              <li>• Computer programming lab (expansion planned)</li>
              <li>• Science project workstations</li>
              <li>• Student innovation corner</li>
              <li>• Technology integration spaces</li>
              <li>• Digital learning resources center</li>
            </ul>
          </div>
          <div class="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-lg">
            <h3 class="text-xl font-semibold mb-4">🎨 Creative Spaces</h3>
            <ul class="text-sm space-y-2">
              <li>• Art studios with natural lighting</li>
              <li>• Photography darkroom</li>
              <li>• Pottery & ceramics workshop</li>
              <li>• Music recording studio</li>
              <li>• Fashion design lab</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Virtual Tour CTA -->
      <div class="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-8 rounded-lg text-center">
        <h2 class="text-3xl font-bold mb-4">Experience Our Campus</h2>
        <p class="text-xl mb-6">Take a virtual tour or schedule a personal visit to see our facilities firsthand!</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#" 
            class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Virtual Campus Tour
          </a>
          <a 
            href="#" 
            class="bg-white hover:bg-gray-100 text-blue-900 font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Schedule Visit
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Facilities page component
</script>
