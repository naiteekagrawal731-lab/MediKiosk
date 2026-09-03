from django.urls import path

from .views import (
    ClinicalSessionCreateView,
    ClinicalSessionDetailView,

    HistoryAnswerCreateView,
    HistoryAnswerListView,

    ClinicalHistoryView,
    AYUSHHistoryView,

    MedicalDocumentUploadView,
    MedicalDocumentAIUpdateView,
    MedicalDocumentListView,
    MedicalDocumentListViewDoctor,

    ClinicalSummaryAIUpdateView,
    ClinicalSummaryView,

    ClinicalSessionCompleteView,
)


urlpatterns = [

    # ========================================================
    # SESSION
    # ========================================================

    path(
        "session/",
        ClinicalSessionCreateView.as_view(),
        name="clinical-session-create",
    ),

    path(
        "session/<str:session_id>/",
        ClinicalSessionDetailView.as_view(),
        name="clinical-session-detail",
    ),


    # ========================================================
    # HISTORY ANSWERS
    # ========================================================

    path(
        "session/<str:session_id>/answer/",
        HistoryAnswerCreateView.as_view(),
        name="history-answer-create",
    ),

    path(
        "session/<str:session_id>/answers/",
        HistoryAnswerListView.as_view(),
        name="history-answer-list",
    ),


    # ========================================================
    # CLINICAL HISTORY
    # ========================================================

    path(
        "session/<str:session_id>/history/ai",
        ClinicalHistoryView.as_view(),
        name="clinical-history",
    ),


    # ========================================================
    # AYUSH HISTORY
    # ========================================================

    path(
        "session/<str:session_id>/ayush/ai",
        AYUSHHistoryView.as_view(),
        name="ayush-history",
    ),


    # ========================================================
    # MEDICAL DOCUMENTS
    # ========================================================

    # Patient/frontend uploads document
    path(
        "session/<str:session_id>/document/",
        MedicalDocumentUploadView.as_view(),
        name="medical-document-upload",
    ),

    # AI/OCR updates extracted information
    path(
        "session/<str:session_id>/document/<int:document_id>/ai/",
        MedicalDocumentAIUpdateView.as_view(),
        name="medical-document-ai-update",
    ),

    # patient/ai views/get documents
    path(
        "session/<str:session_id>/documents/",
        MedicalDocumentListView.as_view(),
        name="medical-document-list",
    ),
    
    # Doctor views documents
    path(
        "session/<str:session_id>/documents/doctor",
        MedicalDocumentListViewDoctor.as_view(),
        name="medical-document-list-doctor",
    ),

    # ========================================================
    # SUMMARY
    # ========================================================

    # AI creates/updates summary
    path(
        "session/<str:session_id>/summary/ai/",
        ClinicalSummaryAIUpdateView.as_view(),
        name="clinical-summary-ai-update",
    ),

    # Doctor/frontend gets summary
    path(
        "session/<str:session_id>/summary/",
        ClinicalSummaryView.as_view(),
        name="clinical-summary",
    ),


    # ========================================================
    # COMPLETE SESSION
    # ========================================================

    path(
        "session/<str:session_id>/complete/",
        ClinicalSessionCompleteView.as_view(),
        name="clinical-session-complete",
    ),
]