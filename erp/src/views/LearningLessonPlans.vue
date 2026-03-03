<template>
  <div class="space-y-6">

    <!-- ─── Page Header ─────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <span v-if="isAdmin">Subject Assignments</span>
          <span v-else>Lesson Plans</span>
        </h1>
        <p class="page-subtitle">
          <span v-if="isAdmin">Assign subjects to teachers for the current academic year.</span>
          <span v-else>Select your assigned subject, then manage chapters, concepts and lesson plans.</span>
        </p>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════
         ADMIN — Teacher ↔ Subject Assignments
    ════════════════════════════════════════════════════════════════ -->
    <section v-if="isAdmin" class="space-y-5">

      <div class="card p-5">
        <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Assign Teacher to Subject</h2>
        <form @submit.prevent="createAssignment" class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select v-model="assignmentForm.teacher_id" required class="form-input">
            <option value="">Select Teacher</option>
            <option v-for="t in assignmentOptions.teachers" :key="t.id" :value="t.id">
              {{ t.first_name }} {{ t.last_name }}
            </option>
          </select>
          <select v-model="assignmentForm.class_id" required class="form-input" @change="onAssignmentClassChange">
            <option value="">Select Class</option>
            <option v-for="cls in assignmentOptions.classes" :key="cls.id" :value="cls.id">
              {{ cls.display_name || cls.name }}
            </option>
          </select>
          <select v-model="assignmentForm.subject_id" required class="form-input">
            <option value="">Select Subject</option>
            <option v-for="s in assignmentSubjectsForClass" :key="s.subject_id" :value="s.subject_id">
              {{ s.subject_name }}
            </option>
          </select>
          <select v-model="assignmentForm.section_id" class="form-input">
            <option value="">Section (optional)</option>
            <option v-for="sec in assignmentSectionsForClass" :key="sec.id" :value="sec.id">
              {{ sec.name }}
            </option>
          </select>
          <button type="submit" class="btn-primary flex items-center justify-center gap-2">
            <Plus class="w-4 h-4" /> Assign
          </button>
        </form>
      </div>

      <div class="card overflow-hidden">
        <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-700">Current Assignments</h3>
          <span class="text-xs text-slate-400">{{ teacherAssignments.length }} total</span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Teacher</th><th>Class</th><th>Subject</th>
                <th>Section</th><th>Academic Year</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in teacherAssignments" :key="a.id">
                <td class="font-medium text-slate-800">{{ a.teacher_name }}</td>
                <td>{{ a.class_display_name || a.class_name }}</td>
                <td>{{ a.subject_name }}</td>
                <td>{{ a.section_name || '—' }}</td>
                <td>{{ a.academic_year_name || '—' }}</td>
                <td class="text-right">
                  <button @click="removeAssignment(a.id)"
                    class="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Remove</button>
                </td>
              </tr>
              <tr v-if="teacherAssignments.length === 0">
                <td colspan="6" class="text-center py-8 text-slate-400 text-sm">No assignments yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </section>

    <!-- ════════════════════════════════════════════════════════════
         TEACHER — Chapters → Key Concepts → Lesson Plan
    ════════════════════════════════════════════════════════════════ -->
    <section v-if="isTeacher" class="space-y-5">

      <!-- Cascading selectors card -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Select Subject &amp; Topic</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <!-- Class & Subject -->
          <div>
            <label class="form-label">Class &amp; Subject</label>
            <select v-model="selectedClassSubjectKey" @change="onClassSubjectChange" class="form-input">
              <option value="">Select…</option>
              <option v-for="row in classSubjects" :key="`${row.id}-${row.subject_id}`"
                :value="`${row.id}|${row.subject_id}`">
                {{ row.display_name || row.name }} — {{ row.subject_name }}
              </option>
            </select>
          </div>

          <!-- Chapter + Add / Edit / Delete buttons -->
          <div>
            <label class="form-label">Chapter</label>
            <div class="flex gap-2">
              <select v-model="selectedChapterId" @change="onChapterChange"
                class="form-input flex-1" :disabled="!selectedClassSubjectKey">
                <option value="">Select…</option>
                <option v-for="ch in chapters" :key="ch.id" :value="ch.id">
                  {{ ch.chapter_no ? `${ch.chapter_no}. ` : '' }}{{ ch.title }}
                </option>
              </select>
              <button type="button" @click="openChapterModal"
                :disabled="!selectedClassSubjectKey" title="Add new chapter"
                class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Plus class="w-4 h-4" />
              </button>
              <button type="button" @click="openChapterEditModal"
                :disabled="!selectedChapterId" title="Edit chapter"
                class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Pencil class="w-4 h-4" />
              </button>
              <button type="button" @click="deleteChapter"
                :disabled="!selectedChapterId" title="Delete chapter"
                class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Key Concept + Add / Edit / Delete buttons -->
          <div>
            <label class="form-label">Key Concept</label>
            <div class="flex gap-2">
              <select v-model="selectedKeyConceptId" @change="onConceptChange"
                class="form-input flex-1" :disabled="!selectedChapterId">
                <option value="">Select…</option>
                <option v-for="kc in keyConcepts" :key="kc.id" :value="kc.id">
                  {{ kc.title }}
                </option>
              </select>
              <button type="button" @click="openKeyConceptModal"
                :disabled="!selectedChapterId" title="Add new key concept"
                class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Plus class="w-4 h-4" />
              </button>
              <button type="button" @click="openKeyConceptEditModal"
                :disabled="!selectedKeyConceptId" title="Edit key concept"
                class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Pencil class="w-4 h-4" />
              </button>
              <button type="button" @click="deleteKeyConcept"
                :disabled="!selectedKeyConceptId" title="Delete key concept"
                class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Lesson plan editor -->
      <div v-if="selectedKeyConceptId" class="rounded-2xl shadow-lg overflow-hidden border border-slate-200">

        <!-- Gradient header with breadcrumb + tabs -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-5 pb-0">
          <div class="flex items-center gap-2 flex-wrap mb-3">
            <span class="text-xs font-medium text-blue-100 bg-white/20 rounded-full px-2.5 py-0.5">
              {{ selectedConceptLabel.split(' › ')[0] ?? '' }}
            </span>
            <span class="text-blue-300 text-xs">›</span>
            <span class="text-xs font-medium text-blue-100 bg-white/20 rounded-full px-2.5 py-0.5">
              {{ selectedConceptLabel.split(' › ')[1] ?? selectedConceptLabel }}
            </span>
            <span v-if="selectedConceptLabel.split(' › ')[2]" class="text-blue-300 text-xs">›</span>
            <span v-if="selectedConceptLabel.split(' › ')[2]" class="text-xs font-medium text-white bg-white/20 rounded-full px-2.5 py-0.5">
              {{ selectedConceptLabel.split(' › ')[2] }}
            </span>
          </div>
          <h2 class="text-base font-bold text-white mb-4">Lesson Plan Editor</h2>
          <nav class="flex gap-1">
            <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" type="button"
              class="px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors"
              :class="activeTab === tab
                ? 'bg-white text-blue-600'
                : 'text-white/70 hover:text-white hover:bg-white/10'">
              {{ tab }}
            </button>
          </nav>
        </div>

        <form class="bg-slate-50/60 p-5 space-y-4" data-lesson-editor @submit.prevent="saveLessonPlan">

          <!-- ── Planning ─────────────────────────────────────── -->
          <template v-if="activeTab === 'Planning'">
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Learning Outcomes</p>
              </div>
              <div class="p-4">
                <RichTextEditor v-model="lessonPlan.learningOutcomesCsv"
                  placeholder="e.g. Students will understand photosynthesis…" min-height="120px" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Teaching Method</p>
                </div>
                <div class="p-4">
                  <select v-model="lessonPlan.teachingMethod" class="form-input">
                    <option value="lecture">Lecture</option>
                    <option value="activity">Activity</option>
                    <option value="discussion">Discussion</option>
                    <option value="project">Project</option>
                  </select>
                </div>
              </div>

              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Instructional Steps</p>
                </div>
                <div class="p-4">
                  <textarea v-model="lessonPlan.instructionalStepsCsv" rows="3" class="form-input resize-none"
                    placeholder="One step per line&#10;e.g. Introduction (5 min)&#10;Demonstration (15 min)" />
                </div>
              </div>

              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Teaching Aids</p>
                </div>
                <div class="p-4">
                  <textarea v-model="lessonPlan.teachingAidsCsv" rows="2" class="form-input resize-none"
                    placeholder="e.g. Blackboard, Charts, Models" />
                </div>
              </div>

              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Required Materials</p>
                </div>
                <div class="p-4">
                  <textarea v-model="lessonPlan.requiredMaterialsCsv" rows="2" class="form-input resize-none"
                    placeholder="e.g. Textbook, Worksheets, Markers" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Student Activities</p>
              </div>
              <div class="p-4">
                <RichTextEditor v-model="lessonPlan.studentActivitiesCsv" placeholder="Describe student activities, group work, experiments…" min-height="80px" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Cross-subject Integration</p>
                </div>
                <div class="p-4">
                  <textarea v-model="lessonPlan.integration" rows="2" class="form-input resize-none"
                    placeholder="e.g. Link to Mathematics — area &amp; perimeter" />
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Library References</p>
                </div>
                <div class="p-4">
                  <textarea v-model="lessonPlan.libraryReferencesCsv" rows="2" class="form-input resize-none"
                    placeholder="e.g. NCERT Science Ch. 7, Author Name" />
                </div>
              </div>
              <div class="md:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Life Lessons / Values</p>
                </div>
                <div class="p-4">
                  <textarea v-model="lessonPlan.lifeLessons" rows="2" class="form-input resize-none"
                    placeholder="e.g. Environmental responsibility, importance of conservation" />
                </div>
              </div>
            </div>
          </template>

          <!-- ── Delivery ─────────────────────────────────────── -->
          <template v-if="activeTab === 'Delivery'">
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Content / Notes</p>
              </div>
              <div class="p-4">
                <RichTextEditor v-model="lessonPlan.actualContent" placeholder="Write the full lesson content here…" min-height="200px" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Images</p>
                </div>
                <div class="p-4">
                  <MediaUpload v-model="uploadedImages" media-type="image" />
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Videos</p>
                </div>
                <div class="p-4">
                  <MediaUpload v-model="uploadedVideos" media-type="video" />
                </div>
              </div>
            </div>
          </template>

          <!-- ── Evaluation ───────────────────────────────────── -->
          <template v-if="activeTab === 'Evaluation'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Assessment Method</p>
                </div>
                <div class="p-4">
                  <input v-model="lessonPlan.assessmentMethod" type="text" class="form-input" placeholder="Oral quiz, Written test" />
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Rubric</p>
                </div>
                <div class="p-4">
                  <input v-model="lessonPlan.rubric" type="text" class="form-input" placeholder="Scoring criteria" />
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Homework Assigned</p>
                </div>
                <div class="p-4">
                  <input v-model="lessonPlan.homeworkAssigned" type="text" class="form-input" placeholder="Page 45, Q1-5" />
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Remarks</p>
                </div>
                <div class="p-4">
                  <input v-model="lessonPlan.assessmentRemarks" type="text" class="form-input" placeholder="Additional notes…" />
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Progress Status</p>
                </div>
                <div class="p-4">
                  <select v-model="lessonPlan.progressStatus" class="form-input">
                    <option value="notStarted">Not Started</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </template>

          <!-- ── Reflection ───────────────────────────────────── -->
          <template v-if="activeTab === 'Reflection'">
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Teacher Reflection</p>
              </div>
              <div class="p-4">
                <textarea v-model="lessonPlan.teacherReflection" rows="4" class="form-input resize-none" placeholder="What went well? What could improve?" />
              </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Improvements for Next Time</p>
              </div>
              <div class="p-4">
                <textarea v-model="lessonPlan.improvementsForNextTime" rows="3" class="form-input resize-none" placeholder="Actions to take next time…" />
              </div>
            </div>
          </template>

          <div class="flex justify-end pt-2 bg-white rounded-xl border border-slate-200 px-4 py-3">
            <button type="submit" class="btn-primary">Save Lesson Plan</button>
          </div>
        </form>
      </div>

      <!-- Empty state -->
      <div v-else-if="selectedClassSubjectKey" class="card p-10 text-center text-slate-400">
        <FileText class="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p class="text-sm">Select or create a chapter and key concept to begin.</p>
      </div>

      <!-- ── My Lesson Plans table ───────────────────────────────────── -->
      <div v-if="myLessonPlans.length > 0" class="card overflow-hidden mt-4">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-800">My Lesson Plans</h2>
          <span class="text-xs text-slate-400">{{ myLessonPlans.length }} plan{{ myLessonPlans.length === 1 ? '' : 's' }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table w-full">
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Chapter</th>
                <th>Key Concept</th>
                <th>Difficulty</th>
                <th>Progress</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in myLessonPlans" :key="plan.id">
                <td class="whitespace-nowrap">{{ plan.class_display_name || plan.class_name }}</td>
                <td class="whitespace-nowrap">{{ plan.subject_name }}</td>
                <td class="whitespace-nowrap text-slate-500">
                  <span v-if="plan.chapter_no" class="text-xs text-slate-400 mr-1">Ch.{{ plan.chapter_no }}</span>
                  {{ plan.chapter_title }}
                </td>
                <td>{{ plan.key_concept_title }}</td>
                <td>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-emerald-50 text-emerald-700': plan.difficulty_level === 'easy',
                      'bg-amber-50 text-amber-700':    plan.difficulty_level === 'medium',
                      'bg-red-50 text-red-700':        plan.difficulty_level === 'hard',
                    }">
                    {{ plan.difficulty_level || '—' }}
                  </span>
                </td>
                <td>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-slate-100 text-slate-600':    plan.progress_status === 'notStarted',
                      'bg-amber-50 text-amber-700':     plan.progress_status === 'ongoing',
                      'bg-emerald-50 text-emerald-700': plan.progress_status === 'completed',
                    }">
                    {{ plan.progress_status === 'notStarted' ? 'Not Started' : plan.progress_status === 'ongoing' ? 'Ongoing' : 'Completed' }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center justify-end gap-1">
                    <button @click="openViewModal(plan)" title="View"
                      class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button @click="editFromTable(plan)" title="Edit"
                      class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button @click="deleteFromTable(plan)" title="Delete"
                      class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </section>
  </div>

  <!-- ════════════════════════════════════════════════════════════════
       MODAL — New Chapter
  ════════════════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <div v-if="showChapterModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @mousedown.self="closeChapterModal">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h3 class="text-base font-bold text-white">{{ chapterModalMode === 'edit' ? 'Edit Chapter' : 'New Chapter' }}</h3>
          <button @click="closeChapterModal" class="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="submitChapter" class="px-6 py-5 space-y-4 bg-slate-50/60">

          <!-- Chapter No + Title -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Chapter No. <span class="normal-case font-normal text-slate-300">(optional)</span></p>
              </div>
              <div class="p-3">
                <input v-model="chapterForm.chapterNo" type="text" class="form-input" placeholder="e.g. 1" />
              </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Title <span class="text-red-400">*</span></p>
              </div>
              <div class="p-3">
                <input v-model="chapterForm.title" type="text" class="form-input" placeholder="Chapter title" required />
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="px-3 py-2 border-b border-slate-100 bg-slate-50">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Description <span class="normal-case font-normal text-slate-300">(optional)</span></p>
            </div>
            <div class="p-3">
              <textarea v-model="chapterForm.description" rows="2" class="form-input resize-none"
                placeholder="Brief description of this chapter…" />
            </div>
          </div>

          <!-- PDF Upload -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="px-3 py-2 border-b border-slate-100 bg-slate-50">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Chapter Content PDF <span class="normal-case font-normal text-slate-300">(optional)</span></p>
            </div>
            <div class="p-3">
              <!-- existing PDF link in edit mode -->
              <div v-if="chapterModalMode === 'edit' && chapterForm.pdfUrl && !chapterPdfFile"
                class="flex items-center gap-3 mb-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <FileText class="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <a :href="chapterForm.pdfUrl" target="_blank"
                  class="text-sm text-emerald-700 truncate flex-1 hover:underline">Current PDF</a>
                <button type="button" @click="chapterForm.pdfUrl = ''"
                  class="text-emerald-400 hover:text-red-500 transition-colors" title="Remove PDF">
                  <X class="w-4 h-4" />
                </button>
              </div>
              <!-- File selected preview -->
              <div v-if="chapterPdfFile" class="flex items-center gap-3 mb-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <FileText class="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span class="text-sm text-blue-700 truncate flex-1">{{ chapterPdfFile.name }}</span>
                <button type="button" @click="chapterPdfFile = null; if (chapterPdfInputRef) chapterPdfInputRef.value = ''"
                  class="text-blue-400 hover:text-red-500 transition-colors">
                  <X class="w-4 h-4" />
                </button>
              </div>
              <!-- Upload button -->
              <label class="flex items-center gap-2 cursor-pointer w-fit px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <UploadCloud class="w-4 h-4" />
                <span>{{ chapterPdfFile ? 'Replace PDF' : 'Upload PDF' }}</span>
                <input ref="chapterPdfInputRef" type="file" accept="application/pdf" class="sr-only"
                  @change="(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) chapterPdfFile = f }" />
              </label>
              <p class="text-xs text-slate-400 mt-1.5">PDF only — max 20 MB</p>
            </div>
          </div>

          <!-- XLSX Upload -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="px-3 py-2 border-b border-slate-100 bg-slate-50">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Lesson Plan XLSX <span class="normal-case font-normal text-slate-300">(optional)</span></p>
            </div>
            <div class="p-3">
              <!-- existing XLSX link in edit mode -->
              <div v-if="chapterModalMode === 'edit' && chapterForm.xlsxUrl && !chapterXlsxFile"
                class="flex items-center gap-3 mb-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <FileText class="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <a :href="chapterForm.xlsxUrl" target="_blank"
                  class="text-sm text-emerald-700 truncate flex-1 hover:underline">Current XLSX</a>
                <button type="button" @click="chapterForm.xlsxUrl = ''"
                  class="text-emerald-400 hover:text-red-500 transition-colors" title="Remove XLSX">
                  <X class="w-4 h-4" />
                </button>
              </div>
              <!-- File selected preview -->
              <div v-if="chapterXlsxFile" class="flex items-center gap-3 mb-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <FileText class="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span class="text-sm text-blue-700 truncate flex-1">{{ chapterXlsxFile.name }}</span>
                <button type="button" @click="chapterXlsxFile = null; if (chapterXlsxInputRef) chapterXlsxInputRef.value = ''"
                  class="text-blue-400 hover:text-red-500 transition-colors">
                  <X class="w-4 h-4" />
                </button>
              </div>
              <!-- Upload button -->
              <label class="flex items-center gap-2 cursor-pointer w-fit px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                <UploadCloud class="w-4 h-4" />
                <span>{{ chapterXlsxFile ? 'Replace XLSX' : 'Upload XLSX' }}</span>
                <input ref="chapterXlsxInputRef" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" class="sr-only"
                  @change="(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) chapterXlsxFile = f }" />
              </label>
              <p class="text-xs text-slate-400 mt-1.5">Excel (.xlsx/.xls) only — max 10 MB</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <button type="button" @click="closeChapterModal" class="btn-secondary flex-1">Cancel</button>
            <button type="submit" class="btn-primary flex-1 flex items-center justify-center gap-2" :disabled="chapterPdfUploading">
              <span v-if="chapterPdfUploading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              {{ chapterPdfUploading ? 'Uploading…' : chapterModalMode === 'edit' ? 'Save Changes' : 'Create Chapter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- ════════════════════════════════════════════════════════════════
       MODAL — New Key Concept
  ════════════════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <div v-if="showKeyConceptModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @mousedown.self="closeKeyConceptModal">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-base font-semibold text-slate-800">
            {{ keyConceptModalMode === 'edit' ? 'Edit Key Concept' : 'New Key Concept' }}
          </h3>
          <button @click="closeKeyConceptModal" class="text-slate-400 hover:text-slate-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="submitKeyConcept" class="px-6 py-5 space-y-4">
          <div>
            <label class="form-label">Title <span class="text-red-400">*</span></label>
            <input v-model="keyConceptForm.title" type="text" class="form-input" placeholder="Key concept title" required />
          </div>
          <div>
            <label class="form-label">Description <span class="text-slate-400 font-normal">(optional)</span></label>
            <textarea v-model="keyConceptForm.description" rows="2" class="form-input resize-none"
              placeholder="What this concept covers…" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Total Sessions <span class="text-red-400">*</span></label>
              <input v-model.number="keyConceptForm.totalSessionsRequired" type="number" min="1"
                class="form-input" placeholder="e.g. 3" required />
            </div>
            <div>
              <label class="form-label">Difficulty</label>
              <select v-model="keyConceptForm.difficultyLevel" class="form-input">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 pt-1">
            <button type="button" @click="closeKeyConceptModal" class="btn-secondary flex-1">Cancel</button>
            <button type="submit" class="btn-primary flex-1">
              {{ keyConceptModalMode === 'edit' ? 'Save Changes' : 'Create Key Concept' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- ════════════════════════════════════════════════════════════════
       MODAL — View Lesson Plan
  ════════════════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <div v-if="showViewModal"
      class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8"
      @mousedown.self="closeViewModal">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">

        <!-- ── Header ───────────────────────────────────────────── -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-5 pb-0">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 pr-4">
              <div class="flex items-center gap-1.5 flex-wrap mb-2" v-if="viewingPlan">
                <span class="text-xs font-medium text-blue-100 bg-white/20 rounded-full px-2.5 py-0.5">
                  {{ viewingPlan.class_display_name || viewingPlan.class_name }}
                </span>
                <span class="text-blue-300 text-xs">›</span>
                <span class="text-xs font-medium text-blue-100 bg-white/20 rounded-full px-2.5 py-0.5">
                  {{ viewingPlan.subject_name }}
                </span>
                <span class="text-blue-300 text-xs">›</span>
                <span class="text-xs font-medium text-blue-100 bg-white/20 rounded-full px-2.5 py-0.5">
                  <span v-if="viewingPlan.chapter_no">Ch.{{ viewingPlan.chapter_no }} – </span>{{ viewingPlan.chapter_title }}
                </span>
              </div>
              <h2 class="text-lg font-bold text-white leading-snug">{{ viewingPlan?.key_concept_title }}</h2>
            </div>
            <button @click="closeViewModal"
              class="mt-0.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors flex-shrink-0">
              <X class="w-5 h-5" />
            </button>
          </div>
          <!-- tabs flush to header bottom -->
          <div class="flex gap-1 mt-4" v-if="viewingPlan">
            <button v-for="t in tabs" :key="t" @click="viewTab = t"
              class="px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors"
              :class="viewTab === t
                ? 'bg-white text-blue-600'
                : 'text-white/70 hover:text-white hover:bg-white/10'">
              {{ t }}
            </button>
          </div>
        </div>

        <!-- ── Content ──────────────────────────────────────────── -->
        <div class="px-6 py-6 space-y-4 bg-slate-50/60 min-h-[200px]" v-if="viewingPlan">

          <!-- Planning -->
          <template v-if="viewTab === 'Planning'">
            <div v-if="viewingPlan.learning_outcomes?.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Learning Outcomes</p>
              </div>
              <div class="px-4 py-3">
                <div v-for="(o, i) in viewingPlan.learning_outcomes" :key="i"
                  class="prose prose-sm max-w-none text-slate-700" v-html="o" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-if="viewingPlan.teaching_method" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Teaching Method</p>
                <p class="text-sm font-medium text-slate-800 capitalize">{{ viewingPlan.teaching_method }}</p>
              </div>
              <div v-if="viewingPlan.total_sessions_required" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Sessions</p>
                <p class="text-sm font-medium text-slate-800">{{ viewingPlan.total_sessions_required }}</p>
              </div>
            </div>
          </template>

          <!-- Delivery -->
          <template v-if="viewTab === 'Delivery'">
            <div v-if="viewingPlan.instructional_steps?.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Instructional Steps</p>
              </div>
              <ol class="divide-y divide-slate-100">
                <li v-for="(s, i) in viewingPlan.instructional_steps" :key="i"
                  class="flex items-start gap-3 px-4 py-2.5">
                  <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">{{ i + 1 }}</span>
                  <span class="text-sm text-slate-700">{{ s }}</span>
                </li>
              </ol>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="viewingPlan.teaching_aids?.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Teaching Aids</p>
                </div>
                <ul class="divide-y divide-slate-100">
                  <li v-for="(a, i) in viewingPlan.teaching_aids" :key="i" class="flex items-center gap-2 px-4 py-2.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                    <span class="text-sm text-slate-700">{{ a }}</span>
                  </li>
                </ul>
              </div>
              <div v-if="viewingPlan.required_materials?.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Required Materials</p>
                </div>
                <ul class="divide-y divide-slate-100">
                  <li v-for="(m, i) in viewingPlan.required_materials" :key="i" class="flex items-center gap-2 px-4 py-2.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                    <span class="text-sm text-slate-700">{{ m }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="viewingPlan.student_activities?.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Student Activities</p>
              </div>
              <ul class="divide-y divide-slate-100">
                <li v-for="(a, i) in viewingPlan.student_activities" :key="i" class="flex items-center gap-2 px-4 py-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                  <span class="text-sm text-slate-700">{{ a }}</span>
                </li>
              </ul>
            </div>

            <div v-if="viewingPlan.actual_content" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Content / Notes</p>
              </div>
              <div class="px-4 py-4 prose prose-sm max-w-none text-slate-700"
                v-html="viewingPlan.actual_content" />
            </div>
            <div v-if="viewingPlan.content_text" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Content / Notes</p>
              </div>
              <div class="px-4 py-4 prose prose-sm max-w-none text-slate-700"
                v-html="viewingPlan.content_text" />
            </div>

            <div v-if="viewingPlan.content_images?.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Images</p>
              </div>
              <div class="p-4 flex flex-wrap gap-3">
                <img v-for="(url, i) in viewingPlan.content_images" :key="i" :src="url"
                  class="w-36 h-28 object-cover rounded-lg border border-slate-200 shadow-sm" />
              </div>
            </div>
            <div v-if="viewingPlan.content_videos?.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Videos</p>
              </div>
              <div class="p-4 flex flex-col gap-3">
                <video v-for="(url, i) in viewingPlan.content_videos" :key="i" :src="url"
                  controls class="w-full rounded-lg border border-slate-200" />
              </div>
            </div>
          </template>

          <!-- Evaluation -->
          <template v-if="viewTab === 'Evaluation'">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="viewingPlan.integration" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Integration</p>
                <p class="text-sm font-medium text-slate-800">{{ viewingPlan.integration }}</p>
              </div>
              <div v-if="viewingPlan.other_subjects?.length" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Other Subjects</p>
                <p class="text-sm font-medium text-slate-800">{{ viewingPlan.other_subjects.join(', ') }}</p>
              </div>
              <div v-if="viewingPlan.assessment_method" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Assessment Method</p>
                <p class="text-sm font-medium text-slate-800">{{ viewingPlan.assessment_method }}</p>
              </div>
              <div v-if="viewingPlan.homework_assigned" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Homework Assigned</p>
                <p class="text-sm font-medium text-slate-800">{{ viewingPlan.homework_assigned }}</p>
              </div>
            </div>

            <div v-if="viewingPlan.library_references?.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Library References</p>
              </div>
              <ul class="divide-y divide-slate-100">
                <li v-for="(r, i) in viewingPlan.library_references" :key="i" class="flex items-center gap-2 px-4 py-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                  <span class="text-sm text-slate-700">{{ r }}</span>
                </li>
              </ul>
            </div>

            <div v-if="viewingPlan.life_lessons" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Life Lessons / Values</p>
              <p class="text-sm text-slate-700">{{ viewingPlan.life_lessons }}</p>
            </div>
            <div v-if="viewingPlan.rubric" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Rubric</p>
              <p class="text-sm text-slate-700">{{ viewingPlan.rubric }}</p>
            </div>
            <div v-if="viewingPlan.assessment_remarks" class="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Assessment Remarks</p>
              <p class="text-sm text-slate-700">{{ viewingPlan.assessment_remarks }}</p>
            </div>
          </template>

          <!-- Reflection -->
          <template v-if="viewTab === 'Reflection'">
            <div v-if="viewingPlan.teacher_reflection" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Teacher Reflection</p>
              </div>
              <p class="px-4 py-3 text-sm text-slate-700 leading-relaxed">{{ viewingPlan.teacher_reflection }}</p>
            </div>
            <div v-if="viewingPlan.improvements_for_next_time" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Improvements for Next Time</p>
              </div>
              <p class="px-4 py-3 text-sm text-slate-700 leading-relaxed">{{ viewingPlan.improvements_for_next_time }}</p>
            </div>
          </template>

        </div>

        <!-- ── Footer ──────────────────────────────────────────── -->
        <div class="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
          <button @click="editFromTable(viewingPlan!); closeViewModal()" class="btn-secondary">Edit</button>
          <button @click="closeViewModal" class="btn-primary">Close</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Eye, FileText, Pencil, Plus, Trash2, UploadCloud, X } from 'lucide-vue-next'
import RichTextEditor from '@/components/RichTextEditor.vue'
import MediaUpload from '@/components/MediaUpload.vue'
import learningService, {
  type LearningChapter,
  type LearningClassSubject,
  type LearningKeyConcept,
  type MyLessonPlan,
  type TeacherAssignment,
  type TeacherAssignmentOptionData,
} from '@/services/learning.service'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isAdmin   = computed(() => authStore.user?.role === 'admin')
const isTeacher = computed(() => authStore.user?.role === 'teacher')

// ── tabs ──────────────────────────────────────────────────────────────
const tabs     = ['Planning', 'Delivery', 'Evaluation', 'Reflection']
const activeTab = ref('Planning')

// ── shared selectors ──────────────────────────────────────────────────
const classSubjects           = ref<LearningClassSubject[]>([])
const chapters                = ref<LearningChapter[]>([])
const keyConcepts             = ref<LearningKeyConcept[]>([])
const selectedClassSubjectKey = ref('')
const selectedClassId         = ref('')
const selectedSubjectId       = ref('')
const selectedChapterId       = ref('')
const selectedKeyConceptId    = ref('')

// ── my lesson plans table ─────────────────────────────────────────────
const myLessonPlans  = ref<MyLessonPlan[]>([])
const showViewModal  = ref(false)
const viewingPlan    = ref<MyLessonPlan | null>(null)
const viewTab        = ref('Planning')

// Separate refs for media uploads (not stored in lessonPlan CSV fields)
const uploadedImages = ref<string[]>([])
const uploadedVideos = ref<string[]>([])

const selectedConceptLabel = computed(() =>
  keyConcepts.value.find(k => k.id === selectedKeyConceptId.value)?.title ?? ''
)

// ── admin assignment state ────────────────────────────────────────────
const assignmentOptions  = ref<TeacherAssignmentOptionData>({
  teachers: [], classes: [], classSubjects: [], sections: [], academicYears: [],
})
const teacherAssignments = ref<TeacherAssignment[]>([])
const assignmentForm     = ref({ teacher_id: '', class_id: '', subject_id: '', section_id: '' })

const assignmentSubjectsForClass = computed(() =>
  assignmentOptions.value.classSubjects.filter(s => s.class_id === assignmentForm.value.class_id)
)
const assignmentSectionsForClass = computed(() =>
  assignmentOptions.value.sections.filter(s => s.class_id === assignmentForm.value.class_id)
)

// ── chapter modal ─────────────────────────────────────────────────────
const showChapterModal    = ref(false)
const chapterModalMode    = ref<'create' | 'edit'>('create')
const editingChapterId    = ref('')
const chapterForm         = ref({ chapterNo: '', title: '', description: '', pdfUrl: '', xlsxUrl: '' })
const chapterPdfFile      = ref<File | null>(null)
const chapterPdfUploading = ref(false)
const chapterPdfInputRef  = ref<HTMLInputElement>()
const chapterXlsxFile     = ref<File | null>(null)
const chapterXlsxInputRef = ref<HTMLInputElement>()

function openChapterModal() {
  chapterModalMode.value = 'create'
  editingChapterId.value = ''
  chapterForm.value = { chapterNo: '', title: '', description: '', pdfUrl: '', xlsxUrl: '' }
  chapterPdfFile.value = null
  chapterXlsxFile.value = null
  showChapterModal.value = true
}

function openChapterEditModal() {
  const ch = chapters.value.find(c => c.id === selectedChapterId.value)
  if (!ch) return
  chapterModalMode.value = 'edit'
  editingChapterId.value = ch.id
  chapterForm.value = {
    chapterNo:   ch.chapter_no || '',
    title:       ch.title,
    description: ch.description || '',
    pdfUrl:      ch.pdf_url || '',
    xlsxUrl:     ch.xlsx_url || '',
  }
  chapterPdfFile.value = null
  chapterXlsxFile.value = null
  showChapterModal.value = true
}

function closeChapterModal() {
  showChapterModal.value = false
  chapterForm.value = { chapterNo: '', title: '', description: '', pdfUrl: '', xlsxUrl: '' }
  chapterPdfFile.value = null
  chapterPdfUploading.value = false
  if (chapterPdfInputRef.value) chapterPdfInputRef.value.value = ''
  chapterXlsxFile.value = null
  if (chapterXlsxInputRef.value) chapterXlsxInputRef.value.value = ''
}

// ── key concept modal ─────────────────────────────────────────────────
const showKeyConceptModal    = ref(false)
const keyConceptModalMode    = ref<'create' | 'edit'>('create')
const editingKeyConceptId    = ref('')
const keyConceptForm         = ref({
  title: '',
  description: '',
  totalSessionsRequired: 1,
  difficultyLevel: 'medium' as 'easy' | 'medium' | 'hard',
})

function openKeyConceptModal() {
  keyConceptModalMode.value = 'create'
  editingKeyConceptId.value = ''
  keyConceptForm.value = { title: '', description: '', totalSessionsRequired: 1, difficultyLevel: 'medium' }
  showKeyConceptModal.value = true
}

function openKeyConceptEditModal() {
  const kc = keyConcepts.value.find(k => k.id === selectedKeyConceptId.value)
  if (!kc) return
  keyConceptModalMode.value = 'edit'
  editingKeyConceptId.value = kc.id
  keyConceptForm.value = {
    title: kc.title,
    description: kc.description ?? '',
    totalSessionsRequired: kc.total_sessions_required ?? 1,
    difficultyLevel: (kc.difficulty_level ?? 'medium') as 'easy' | 'medium' | 'hard',
  }
  showKeyConceptModal.value = true
}

function closeKeyConceptModal() {
  showKeyConceptModal.value = false
  keyConceptModalMode.value = 'create'
  editingKeyConceptId.value = ''
  keyConceptForm.value = { title: '', description: '', totalSessionsRequired: 1, difficultyLevel: 'medium' }
}

// ── lesson plan state ─────────────────────────────────────────────────
const lessonPlan = ref({
  learningOutcomesCsv: '',
  teachingMethod: 'lecture' as 'lecture' | 'activity' | 'discussion' | 'project',
  instructionalStepsCsv: '', teachingAidsCsv: '', requiredMaterialsCsv: '',
  actualContent: '', text: '', imagesCsv: '', audioCsv: '', videosCsv: '',
  studentActivitiesCsv: '', integration: '', otherSubjectsCsv: '',
  libraryReferencesCsv: '', lifeLessons: '', assessmentMethod: '', rubric: '',
  homeworkAssigned: '', assessmentRemarks: '',
  progressStatus: 'notStarted' as 'notStarted' | 'ongoing' | 'completed',
  teacherReflection: '', improvementsForNextTime: '',
})

function resetLessonPlan() {
  lessonPlan.value = {
    learningOutcomesCsv: '', teachingMethod: 'lecture',
    instructionalStepsCsv: '', teachingAidsCsv: '', requiredMaterialsCsv: '',
    actualContent: '', text: '', imagesCsv: '', audioCsv: '', videosCsv: '',
    studentActivitiesCsv: '', integration: '', otherSubjectsCsv: '',
    libraryReferencesCsv: '', lifeLessons: '', assessmentMethod: '', rubric: '',
    homeworkAssigned: '', assessmentRemarks: '', progressStatus: 'notStarted',
    teacherReflection: '', improvementsForNextTime: '',
  }
  uploadedImages.value = []
  uploadedVideos.value = []
}

// ── bootstrap ─────────────────────────────────────────────────────────
onMounted(async () => {
  await loadClassesSubjects()
  if (isAdmin.value) {
    await loadAssignmentOptions()
    await loadTeacherAssignments()
  }
  if (isTeacher.value) {
    await loadMyLessonPlans()
  }
})

async function loadClassesSubjects() {
  const res = await learningService.getClassesSubjects()
  classSubjects.value = res.data
}
async function loadAssignmentOptions() {
  const res = await learningService.getAssignmentOptions()
  assignmentOptions.value = res.data
}
async function loadTeacherAssignments() {
  const res = await learningService.getTeacherAssignments()
  teacherAssignments.value = res.data
}

// ── admin actions ─────────────────────────────────────────────────────
function onAssignmentClassChange() {
  assignmentForm.value.subject_id = ''
  assignmentForm.value.section_id = ''
}

async function createAssignment() {
  try {
    await learningService.createTeacherAssignment({
      teacher_id: assignmentForm.value.teacher_id,
      class_id:   assignmentForm.value.class_id,
      subject_id: assignmentForm.value.subject_id,
      section_id: assignmentForm.value.section_id || null,
    })
    assignmentForm.value = { teacher_id: '', class_id: '', subject_id: '', section_id: '' }
    await loadTeacherAssignments()
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to create assignment')
  }
}

async function removeAssignment(id: string) {
  if (!confirm('Remove this assignment?')) return
  try {
    await learningService.deleteTeacherAssignment(id)
    await loadTeacherAssignments()
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to remove assignment')
  }
}

// ── teacher selector cascade ──────────────────────────────────────────
async function onClassSubjectChange() {
  selectedChapterId.value    = ''
  selectedKeyConceptId.value = ''
  keyConcepts.value          = []
  resetLessonPlan()

  const [classId, subjectId]  = selectedClassSubjectKey.value.split('|')
  selectedClassId.value       = classId   || ''
  selectedSubjectId.value     = subjectId || ''

  if (!selectedClassId.value || !selectedSubjectId.value) { chapters.value = []; return }
  const res = await learningService.getChapters({ class_id: selectedClassId.value, subject_id: selectedSubjectId.value })
  chapters.value = res.data
}

async function onChapterChange() {
  selectedKeyConceptId.value = ''
  resetLessonPlan()
  if (!selectedChapterId.value) { keyConcepts.value = []; return }
  const res = await learningService.getKeyConcepts(selectedChapterId.value)
  keyConcepts.value = res.data
}

async function onConceptChange() {
  if (!selectedKeyConceptId.value) { resetLessonPlan(); return }
  try {
    const res  = await learningService.getLessonPlan(selectedKeyConceptId.value)
    const plan = res.data
    lessonPlan.value = {
      learningOutcomesCsv:     (plan.learning_outcomes    || []).join(', '),
      teachingMethod:           plan.teaching_method       || 'lecture',
      instructionalStepsCsv:   (plan.instructional_steps  || []).join(', '),
      teachingAidsCsv:         (plan.teaching_aids         || []).join(', '),
      requiredMaterialsCsv:    (plan.required_materials    || []).join(', '),
      actualContent:            plan.actual_content         || '',
      text:                     plan.content_text           || '',
      imagesCsv:               '',
      audioCsv:                (plan.content_audio          || []).join(', '),
      videosCsv:               '',
      studentActivitiesCsv:    (plan.student_activities    || []).join(', '),
      integration:              plan.integration            || '',
      otherSubjectsCsv:        (plan.other_subjects         || []).join(', '),
      libraryReferencesCsv:    (plan.library_references    || []).join(', '),
      lifeLessons:              plan.life_lessons           || '',
      assessmentMethod:         plan.assessment_method      || '',
      rubric:                   plan.rubric                 || '',
      homeworkAssigned:         plan.homework_assigned      || '',
      assessmentRemarks:        plan.assessment_remarks     || '',
      progressStatus:           plan.progress_status        || 'notStarted',
      teacherReflection:        plan.teacher_reflection     || '',
      improvementsForNextTime:  plan.improvements_for_next_time || '',
    }
    uploadedImages.value = plan.content_images || []
    uploadedVideos.value = plan.content_videos || []
  } catch (err: any) {
    if (err?.response?.status === 404) { resetLessonPlan(); return }
    alert(err?.response?.data?.message || 'Failed to load lesson plan')
  }
}

// ── chapter modal submit ──────────────────────────────────────────────
async function submitChapter() {
  if (chapterModalMode.value === 'create' && (!selectedClassId.value || !selectedSubjectId.value)) return
  try {
    // Upload PDF if a new one was selected
    let pdfUrl: string | null = chapterModalMode.value === 'edit' ? (chapterForm.value.pdfUrl || null) : null
    if (chapterPdfFile.value) {
      chapterPdfUploading.value = true
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')
      const token = localStorage.getItem('accessToken') || ''
      const fd = new FormData()
      fd.append('file', chapterPdfFile.value)
      const res = await fetch(`${API_BASE}/api/v1/core/upload/single?type=learning`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      chapterPdfUploading.value = false
      if (!res.ok) throw new Error('PDF upload failed')
      const result = await res.json()
      pdfUrl = result.data.url
    }

    // Upload XLSX if a new one was selected
    let xlsxUrl: string | null = chapterModalMode.value === 'edit' ? (chapterForm.value.xlsxUrl || null) : null
    if (chapterXlsxFile.value) {
      chapterPdfUploading.value = true
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')
      const token = localStorage.getItem('accessToken') || ''
      const fd = new FormData()
      fd.append('file', chapterXlsxFile.value)
      const res = await fetch(`${API_BASE}/api/v1/core/upload/single?type=learning`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      chapterPdfUploading.value = false
      if (!res.ok) throw new Error('XLSX upload failed')
      const result = await res.json()
      xlsxUrl = result.data.url
    }

    if (chapterModalMode.value === 'edit') {
      await learningService.updateChapter(editingChapterId.value, {
        chapterNo:   chapterForm.value.chapterNo,
        title:       chapterForm.value.title,
        description: chapterForm.value.description,
        pdf_url:     pdfUrl,
        xlsx_url:    xlsxUrl,
      })
    } else {
      await learningService.createChapter({
        class_id:    selectedClassId.value,
        subject_id:  selectedSubjectId.value,
        chapterNo:   chapterForm.value.chapterNo,
        title:       chapterForm.value.title,
        description: chapterForm.value.description,
        pdf_url:     pdfUrl,
        xlsx_url:    xlsxUrl,
      })
    }

    closeChapterModal()
    const res = await learningService.getChapters({ class_id: selectedClassId.value, subject_id: selectedSubjectId.value })
    chapters.value = res.data
    if (chapterModalMode.value === 'edit') {
      // keep same chapter selected
      await onChapterChange()
    } else {
      const created = res.data[res.data.length - 1]
      if (created) { selectedChapterId.value = created.id; await onChapterChange() }
    }
  } catch (err: any) {
    chapterPdfUploading.value = false
    alert(err?.response?.data?.message || err?.message || 'Failed to save chapter')
  }
}

async function deleteChapter() {
  const ch = chapters.value.find(c => c.id === selectedChapterId.value)
  if (!ch) return
  if (!confirm(`Delete chapter "${ch.title}"? This will also delete all its key concepts and lesson plans.`)) return
  try {
    await learningService.deleteChapter(selectedChapterId.value)
    selectedChapterId.value = ''
    selectedKeyConceptId.value = ''
    keyConcepts.value = []
    resetLessonPlan()
    const res = await learningService.getChapters({ class_id: selectedClassId.value, subject_id: selectedSubjectId.value })
    chapters.value = res.data
    await loadMyLessonPlans()
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to delete chapter')
  }
}

// ── key concept modal submit ──────────────────────────────────────────
async function submitKeyConcept() {
  if (!selectedChapterId.value) return
  try {
    if (keyConceptModalMode.value === 'edit') {
      await learningService.updateKeyConcept(editingKeyConceptId.value, {
        title:                 keyConceptForm.value.title,
        description:           keyConceptForm.value.description,
        totalSessionsRequired: keyConceptForm.value.totalSessionsRequired,
        difficultyLevel:       keyConceptForm.value.difficultyLevel,
      })
      closeKeyConceptModal()
      const res = await learningService.getKeyConcepts(selectedChapterId.value)
      keyConcepts.value = res.data
      // keep the same concept selected
    } else {
      await learningService.createKeyConcept({
        chapter_id:            selectedChapterId.value,
        title:                 keyConceptForm.value.title,
        description:           keyConceptForm.value.description,
        totalSessionsRequired: keyConceptForm.value.totalSessionsRequired,
        difficultyLevel:       keyConceptForm.value.difficultyLevel,
        prerequisites:         [],
      })
      closeKeyConceptModal()
      const res = await learningService.getKeyConcepts(selectedChapterId.value)
      keyConcepts.value = res.data
      const created = res.data[res.data.length - 1]
      if (created) { selectedKeyConceptId.value = created.id; await onConceptChange() }
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to save key concept')
  }
}

async function deleteKeyConcept() {
  if (!selectedKeyConceptId.value) return
  const kc = keyConcepts.value.find(k => k.id === selectedKeyConceptId.value)
  if (!confirm(`Delete key concept "${kc?.title ?? ''}"? This will also delete its lesson plan.`)) return
  try {
    await learningService.deleteKeyConcept(selectedKeyConceptId.value)
    selectedKeyConceptId.value = ''
    resetLessonPlan()
    const res = await learningService.getKeyConcepts(selectedChapterId.value)
    keyConcepts.value = res.data
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to delete key concept')
  }
}

// ── my lesson plans ─────────────────────────────────────────────────
async function loadMyLessonPlans() {
  try {
    const res = await learningService.getMyLessonPlans()
    myLessonPlans.value = res.data
  } catch { /* silent */ }
}

function openViewModal(plan: MyLessonPlan) {
  viewingPlan.value = plan
  viewTab.value = 'Planning'
  showViewModal.value = true
}
function closeViewModal() {
  showViewModal.value = false
  viewingPlan.value = null
}

function editFromTable(plan: MyLessonPlan) {
  // Set class/subject selector
  selectedClassSubjectKey.value = `${plan.class_id}|${plan.subject_id}`
  onClassSubjectChange()
  // After cascade loads, set chapter and concept
  setTimeout(async () => {
    selectedChapterId.value = plan.chapter_id
    await onChapterChange()
    setTimeout(async () => {
      selectedKeyConceptId.value = plan.key_concept_id
      await onConceptChange()
      // Scroll to the editor
      const el = document.querySelector('[data-lesson-editor]')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }, 300)
}

async function deleteFromTable(plan: MyLessonPlan) {
  if (!confirm(`Delete lesson plan for "${plan.key_concept_title}"? This cannot be undone.`)) return
  try {
    await learningService.deleteLessonPlan(plan.id)
    await loadMyLessonPlans()
    // If currently editing this plan, reset editor
    if (selectedKeyConceptId.value === plan.key_concept_id) {
      selectedKeyConceptId.value = ''
      resetLessonPlan()
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to delete lesson plan')
  }
}

// ── save lesson plan ──────────────────────────────────────────────────
async function saveLessonPlan() {
  if (!selectedKeyConceptId.value) return
  try {
    await learningService.upsertLessonPlan(selectedKeyConceptId.value, {
      learningOutcomes:        learningService.parseCSV(lessonPlan.value.learningOutcomesCsv),
      teachingMethod:          lessonPlan.value.teachingMethod,
      instructionalSteps:      learningService.parseCSV(lessonPlan.value.instructionalStepsCsv),
      teachingAids:            learningService.parseCSV(lessonPlan.value.teachingAidsCsv),
      requiredMaterials:       learningService.parseCSV(lessonPlan.value.requiredMaterialsCsv),
      actualContent:           lessonPlan.value.actualContent,
      text:                    lessonPlan.value.text,
      images:                  uploadedImages.value,
      audio:                   learningService.parseCSV(lessonPlan.value.audioCsv),
      videos:                  uploadedVideos.value,
      studentActivities:       learningService.parseCSV(lessonPlan.value.studentActivitiesCsv),
      integration:             lessonPlan.value.integration,
      otherSubjects:           learningService.parseCSV(lessonPlan.value.otherSubjectsCsv),
      libraryReferences:       learningService.parseCSV(lessonPlan.value.libraryReferencesCsv),
      lifeLessons:             lessonPlan.value.lifeLessons,
      assessmentMethod:        lessonPlan.value.assessmentMethod,
      rubric:                  lessonPlan.value.rubric,
      homeworkAssigned:        lessonPlan.value.homeworkAssigned,
      assessmentRemarks:       lessonPlan.value.assessmentRemarks,
      progressStatus:          lessonPlan.value.progressStatus,
      teacherReflection:       lessonPlan.value.teacherReflection,
      improvementsForNextTime: lessonPlan.value.improvementsForNextTime,
    })
    alert('Lesson plan saved successfully.')
    if (isTeacher.value) await loadMyLessonPlans()
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to save lesson plan')
  }
}
</script>
