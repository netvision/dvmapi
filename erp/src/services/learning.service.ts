import apiClient from '@/api/client'

export interface LearningClassSubject {
  id: string
  name: string
  display_name: string | null
  sequence_order: number | null
  subject_id: string
  subject_name: string
  subject_code: string | null
}

export interface LearningChapter {
  id: string
  class_id: string
  subject_id: string
  chapter_no: string | null
  title: string
  description: string | null
  pdf_url: string | null
  xlsx_url: string | null
}

export interface TeacherAssignmentOptionData {
  teachers: Array<{ id: string; first_name: string; last_name: string; email: string }>
  classes: Array<{ id: string; name: string; display_name: string | null; sequence_order: number | null }>
  classSubjects: Array<{ class_id: string; subject_id: string; subject_name: string; subject_code: string | null }>
  sections: Array<{ id: string; class_id: string; name: string }>
  academicYears: Array<{ id: string; name: string; is_current: boolean }>
}

export interface TeacherAssignment {
  id: string
  teacher_id: string
  class_id: string
  subject_id: string
  section_id: string | null
  academic_year_id: string | null
  teacher_name: string
  teacher_email: string
  class_display_name: string | null
  class_name: string
  subject_name: string
  subject_code: string | null
  section_name: string | null
  academic_year_name: string | null
}

export interface MyLessonPlan {
  id: string
  key_concept_id: string
  key_concept_title: string
  progress_status: 'notStarted' | 'ongoing' | 'completed'
  teaching_method: string
  learning_outcomes: string[]
  actual_content: string | null
  content_text: string | null
  instructional_steps: string[]
  teaching_aids: string[]
  required_materials: string[]
  content_images: string[]
  content_audio: string[]
  content_videos: string[]
  student_activities: string[]
  integration: string | null
  other_subjects: string[]
  library_references: string[]
  life_lessons: string | null
  assessment_method: string | null
  rubric: string | null
  homework_assigned: string | null
  assessment_remarks: string | null
  teacher_reflection: string | null
  improvements_for_next_time: string | null
  total_sessions_required: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  chapter_id: string
  chapter_title: string
  chapter_no: string | null
  class_id: string
  class_name: string
  class_display_name: string | null
  subject_id: string
  subject_name: string
  created_at: string
  updated_at: string
}

export interface LearningKeyConcept {
  id: string
  chapter_id: string
  title: string
  description: string | null
  total_sessions_required: number
  session_duration_minutes: number | null
  difficulty_level: 'easy' | 'medium' | 'hard'
  prerequisites: string[]
  lesson_plan_id?: string | null
  progress_status?: 'notStarted' | 'ongoing' | 'completed'
}

export interface LessonPlanPayload {
  learningOutcomes: string[]
  teachingMethod: 'lecture' | 'activity' | 'discussion' | 'project'
  instructionalSteps: string[]
  teachingAids: string[]
  requiredMaterials: string[]
  actualContent: string
  text: string
  images: string[]
  audio: string[]
  videos: string[]
  studentActivities: string[]
  integration: string
  otherSubjects: string[]
  libraryReferences: string[]
  lifeLessons: string
  assessmentMethod: string
  rubric: string
  homeworkAssigned: string
  assessmentRemarks: string
  progressStatus: 'notStarted' | 'ongoing' | 'completed'
  teacherReflection: string
  improvementsForNextTime: string
}

const parseCSV = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const learningService = {
  parseCSV,

  async getClassesSubjects() {
    const response = await apiClient.get('/learning/classes-subjects')
    return response.data as { success: boolean; data: LearningClassSubject[] }
  },

  async getChapters(params?: { class_id?: string; subject_id?: string }) {
    const qs = new URLSearchParams()
    if (params?.class_id) qs.append('class_id', params.class_id)
    if (params?.subject_id) qs.append('subject_id', params.subject_id)

    const query = qs.toString()
    const response = await apiClient.get(`/learning/chapters${query ? `?${query}` : ''}`)
    return response.data as { success: boolean; data: LearningChapter[] }
  },

  async createChapter(payload: { class_id: string; subject_id: string; chapterNo: string; title: string; description?: string; pdf_url?: string | null; xlsx_url?: string | null }) {
    const response = await apiClient.post('/learning/chapters', payload)
    return response.data
  },

  async updateChapter(id: string, payload: { chapterNo?: string; title?: string; description?: string; pdf_url?: string | null; xlsx_url?: string | null }) {
    const response = await apiClient.put(`/learning/chapters/${id}`, payload)
    return response.data
  },

  async deleteChapter(id: string) {
    const response = await apiClient.delete(`/learning/chapters/${id}`)
    return response.data
  },

  async getAssignmentOptions() {
    const response = await apiClient.get('/learning/assignment-options')
    return response.data as { success: boolean; data: TeacherAssignmentOptionData }
  },

  async getTeacherAssignments(teacherId?: string) {
    const query = teacherId ? `?teacher_id=${encodeURIComponent(teacherId)}` : ''
    const response = await apiClient.get(`/learning/teacher-assignments${query}`)
    return response.data as { success: boolean; data: TeacherAssignment[] }
  },

  async createTeacherAssignment(payload: {
    teacher_id: string
    class_id: string
    subject_id: string
    section_id?: string | null
    academic_year_id?: string | null
  }) {
    const response = await apiClient.post('/learning/teacher-assignments', payload)
    return response.data
  },

  async deleteTeacherAssignment(id: string) {
    const response = await apiClient.delete(`/learning/teacher-assignments/${id}`)
    return response.data
  },

  async getKeyConcepts(chapterId?: string) {
    const query = chapterId ? `?chapter_id=${encodeURIComponent(chapterId)}` : ''
    const response = await apiClient.get(`/learning/key-concepts${query}`)
    return response.data as { success: boolean; data: LearningKeyConcept[] }
  },

  async createKeyConcept(payload: {
    chapter_id: string
    title: string
    description?: string
    totalSessionsRequired: number
    sessionDurationMinutes?: number | null
    difficultyLevel?: 'easy' | 'medium' | 'hard'
    prerequisites?: string[]
  }) {
    const response = await apiClient.post('/learning/key-concepts', payload)
    return response.data
  },

  async updateKeyConcept(id: string, payload: {
    title?: string
    description?: string
    totalSessionsRequired?: number
    difficultyLevel?: 'easy' | 'medium' | 'hard'
  }) {
    const response = await apiClient.put(`/learning/key-concepts/${id}`, payload)
    return response.data
  },

  async deleteKeyConcept(id: string) {
    const response = await apiClient.delete(`/learning/key-concepts/${id}`)
    return response.data
  },

  async getMyLessonPlans() {
    const response = await apiClient.get('/learning/my-lesson-plans')
    return response.data as { success: boolean; data: MyLessonPlan[] }
  },

  async deleteLessonPlan(id: string) {
    const response = await apiClient.delete(`/learning/lesson-plans/${id}`)
    return response.data
  },

  async getLessonPlan(keyConceptId: string) {
    const response = await apiClient.get(`/learning/key-concepts/${keyConceptId}/lesson-plan`)
    return response.data
  },

  async upsertLessonPlan(keyConceptId: string, payload: LessonPlanPayload) {
    const response = await apiClient.post(`/learning/key-concepts/${keyConceptId}/lesson-plan`, payload)
    return response.data
  },
}

export default learningService
