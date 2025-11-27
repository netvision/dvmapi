<template>
  <div class="mandatory-disclosure-page">
    <!-- Hero Section -->
    <div class="relative h-80 bg-gradient-to-r from-blue-800 to-indigo-800">
      <div class="absolute inset-0 bg-black opacity-30"></div>
      <div class="container mx-auto px-4 h-full flex items-center relative z-10">
        <div class="text-white">
          <h1 class="text-5xl font-bold mb-4">Mandatory Disclosure</h1>
          <p class="text-xl">As per CBSE Guidelines and Right to Education Act</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-16">
      <!-- School Information -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">School Information</h2>
        <div class="bg-blue-50 p-8 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">Name of School:</span>
                <span class="text-gray-600">Dalmia Vidya Mandir</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">CBSE Affiliation No:</span>
                <span class="text-gray-600">1730422</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">School Code:</span>
                <span class="text-gray-600">10765</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">Complete Address:</span>
                <span class="text-gray-600">STATION ROAD CHIRAWA, JHUNJHUNU, RAJASTHAN - 333026</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">Principal Name:</span>
                <span class="text-gray-600">Mr. Shakti Singh</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">Principal Qualification:</span>
                <span class="text-gray-600">M.A., B.Ed.</span>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">School Email ID:</span>
                <span class="text-gray-600">10765@cbsesiksha.in, info@dalmiavidyamandir.org.in</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">Contact Details:</span>
                <span class="text-gray-600">+91-1596-220602</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">Total Campus Area:</span>
                <span class="text-gray-600">14500 Sq. Mtrs.</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">Total Number of Students:</span>
                <span class="text-gray-600">949</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold text-gray-700">Total Number of Teachers:</span>
                <span class="text-gray-600">52</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Documents -->
    <div id="documents" class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Mandatory Documents</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div id="cbse-affiliation" class="bg-white p-6 rounded-lg shadow-md">
            <h4 class="text-lg font-semibold text-blue-900 mb-3">📄 CBSE Affiliation Certificate</h4>
            <p class="text-gray-600 text-sm mb-4">Certificate of Affiliation issued by CBSE</p>
            <a href="/pdfs/cbse_affiliation.pdf" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">Open PDF</a>
            <div class="mt-4 border rounded overflow-hidden">
              <iframe src="/pdfs/cbse_affiliation.pdf" class="w-full h-40" />
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h4 class="text-lg font-semibold text-blue-900 mb-3">🏗️ Building Safety Certificate</h4>
            <p class="text-gray-600 text-sm mb-4">Fire Safety & Building Safety Certificates</p>
            <a href="/pdfs/building_safety.pdf" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">Open PDF</a>
            <div class="mt-4 border rounded overflow-hidden">
              <iframe src="/pdfs/building_safety.pdf" class="w-full h-40" />
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h4 class="text-lg font-semibold text-blue-900 mb-3">💧 Water & Health Certificates</h4>
            <p class="text-gray-600 text-sm mb-4">Water Quality & Health Sanitation Certificates</p>
            <a href="/pdfs/WATER_TESTING_CERTIFICATE_2025.pdf" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">Open PDF</a>
            <div class="mt-4 border rounded overflow-hidden">
              <iframe src="/pdfs/WATER_TESTING_CERTIFICATE_2025.pdf" class="w-full h-40" />
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h4 class="text-lg font-semibold text-blue-900 mb-3">📋 DEO/State NOC</h4>
            <p class="text-gray-600 text-sm mb-4">No Objection Certificate from State Authorities</p>
            <a href="/pdfs/noc.pdf" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">Open PDF</a>
            <div class="mt-4 border rounded overflow-hidden">
              <iframe src="/pdfs/noc.pdf" class="w-full h-40" />
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h4 class="text-lg font-semibold text-blue-900 mb-3">⚖️ Trust/Society Registration</h4>
            <p class="text-gray-600 text-sm mb-4">Trust/Society Registration Certificate</p>
            <a href="/pdfs/Society-Registration.pdf" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">Open PDF</a>
            <div class="mt-4 border rounded overflow-hidden">
              <iframe src="/pdfs/Society-Registration.pdf" class="w-full h-40" />
            </div>
          </div>
        </div>
      </div>

      <!-- Faculty Information -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Faculty Information</h2>
        <div class="bg-green-50 p-8 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div class="text-3xl font-bold text-green-900 mb-2">52</div>
              <div class="text-gray-700">Total Teaching Staff</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-green-900 mb-2">100%</div>
              <div class="text-gray-700">Trained Graduate Teachers</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-green-900 mb-2">1:20</div>
              <div class="text-gray-700">Student-Teacher Ratio</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Infrastructure Details -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Infrastructure Details</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h4 class="text-xl font-semibold text-blue-900 mb-4">Academic Infrastructure</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-700">Total Classrooms:</span>
                <span class="font-semibold">105</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Science Laboratories:</span>
                <span class="font-semibold">6</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Computer Labs:</span>
                <span class="font-semibold">3</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Library Books:</span>
                <span class="font-semibold">25,000+</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">AV Room:</span>
                <span class="font-semibold">1 (Newly Added)</span>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h4 class="text-xl font-semibold text-blue-900 mb-4">Support Infrastructure</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-700">Playground Area:</span>
                <span class="font-semibold">8 Acres</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Medical Room:</span>
                <span class="font-semibold">Available</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Security System:</span>
                <span class="font-semibold">CCTV + Guards</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Power Backup:</span>
                <span class="font-semibold">100% Generator</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Internet Connectivity:</span>
                <span class="font-semibold">High-Speed Broadband</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fee Structure -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Academic Session Information</h2>
        <div class="bg-yellow-50 p-8 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 class="text-xl font-semibold text-blue-900 mb-4">Session Details</h4>
              <div class="space-y-3">
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold text-gray-700">Academic Session:</span>
                  <span class="text-gray-600">April to March</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold text-gray-700">Vacation Period:</span>
                  <span class="text-gray-600">May-June (Summer)</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold text-gray-700">Working Days:</span>
                  <span class="text-gray-600">220+ Days</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold text-gray-700">School Hours:</span>
                  <span class="text-gray-600">7:30 AM - 2:00 PM</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="text-xl font-semibold text-blue-900 mb-4">Admission Process</h4>
              <div class="space-y-3">
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold text-gray-700">Admission Notification:</span>
                  <span class="text-gray-600">January</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold text-gray-700">Form Submission:</span>
                  <span class="text-gray-600">February-March</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold text-gray-700">Age Criteria:</span>
                  <span class="text-gray-600">As per RTE Guidelines</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold text-gray-700">EWS/DG Quota:</span>
                  <span class="text-gray-600">25% as per RTE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Board Results -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Academic Performance</h2>
        <div class="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div class="text-3xl font-bold mb-2">98.69%</div>
              <div class="text-sm">Class X Pass Rate (2025)</div>
            </div>
            <div>
              <div class="text-3xl font-bold mb-2">92.85%</div>
              <div class="text-sm">Class XII Pass Rate (2025)</div>
            </div>
            <div>
              <div class="text-3xl font-bold mb-2">85%</div>
              <div class="text-sm">Students Above 80% (Class X)</div>
            </div>
            <div>
              <div class="text-3xl font-bold mb-2">78%</div>
              <div class="text-sm">Students Above 80% (Class XII)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="bg-blue-900 text-white p-8 rounded-lg">
        <h2 class="text-3xl font-bold mb-6 text-center">Contact Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-4xl mb-3">📧</div>
            <h4 class="text-lg font-semibold mb-2">Email</h4>
            <p class="text-sm text-blue-100">info@dalmiavidyamandir.edu.in</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-3">📞</div>
            <h4 class="text-lg font-semibold mb-2">Phone</h4>
            <p class="text-sm text-blue-100">+91-1596-220602</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-3">📍</div>
            <h4 class="text-lg font-semibold mb-2">Address</h4>
            <p class="text-sm text-blue-100">STATION ROAD CHIRAWA, JHUNJHUNU, RAJASTHAN - 333026</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mandatory Disclosure page component
</script>
