# pyrefly: ignore [missing-import]
from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
# from .authentication import AIServiceAuthentication
from ai.services import get_next_question,complete_questions
from .models import (
    ClinicalSession,
    HistoryAnswer,
    ClinicalHistory,
    AYUSHHistory,
    MedicalDocument,
    ClinicalSummary,
)

from .serializers import (
    ClinicalSessionSerializer,
    ClinicalSessionSerializerAI,
    HistoryAnswerSerializer,
    ClinicalHistorySerializerAI,
    AYUSHHistorySerializerAI,
    MedicalDocumentSerializerAI,
    MedicalDocumentSerializer,
    MedicalDocumentSerializerDoctor,
    MedicalDocumentUploadSerializer,
    ClinicalSummarySerializer,
    ClinicalSummarySerializerAI,
)

# ============================================================
# Helper
# ============================================================

def get_session_or_404(session_id):
    """
    Get a ClinicalSession using the session ID generated
    by the Spring Boot backend.
    """
    try:
        return ClinicalSession.objects.get(session_id=session_id)
    except ClinicalSession.DoesNotExist:
        return None

class StartSession(APIView):

    def post(self, request, session_id):

        # 1. Find session
        session = get_session_or_404(session_id)
        
        if not session:
            return Response(
                {"error": "Clinical session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Get onboarding data from React
        language = request.data.get("language")
        consent_given = request.data.get("consent_given")
        treatment_type = request.data.get("treatment_type")

        # 3. Validate language
        if not language:
            return Response(
                {"error": "Please select a language."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Validate consent
        if consent_given is not True:
            return Response(
                {"error": "Consent is required to continue."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Validate treatment type
        if not treatment_type:
            return Response(
                {"error": "Please select the treatment type."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 6. Validate allowed values
        valid_languages = ["EN", "HI"] # "BN", "TA", "TE"
        valid_treatment_types = ["AYUSH", "ALLOPATHIC"]

        if language not in valid_languages:
            return Response(
                {"error": "Invalid language selected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if treatment_type not in valid_treatment_types:
            return Response(
                {"error": "Invalid treatment type selected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 7. Save onboarding information
        session.language = language
        session.consent_given = consent_given
        session.treatment_type = treatment_type
        session.status = "IN_PROGRESS"

        session.save(
            update_fields=[
                "language",
                "consent_given",
                "treatment_type",
                "status"
            ]
        )

        # 8. Return success
        return Response(
            {
                "message": "Clinical interview started successfully.",
                "session_id": session.session_id,
                "language": session.language,
                "treatment_type": session.treatment_type,
                "status": session.status
            },
            status=status.HTTP_200_OK
        )
            
# ============================================================
# SESSION
# ============================================================

class ClinicalSessionCreateView(APIView):
    """
    POST /api/clinical/session/

    Spring Boot generates the 8-character session ID.
    React sends that ID to Django.

    Example request:
    {
        "session_id": "A7K92PQL"
    }
    """

    def post(self, request):

        session_id = request.data.get("session_id")

        if not session_id:
            return Response(
                {"error": "session_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate session ID length
        if len(session_id) != 8:
            return Response(
                {"error": "session_id must be exactly 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Optional: normalize
        # session_id = session_id.upper()

        # Django does NOT generate the ID.
        # It only checks whether Spring's ID already exists.
        if ClinicalSession.objects.filter(session_id=session_id).exists():
            return Response(
                {"error": "Clinical session already exists."},
                status=status.HTTP_409_CONFLICT
            )

        session = ClinicalSession.objects.create(
            session_id=session_id,
            status="STARTED"
        )

        serializer = ClinicalSessionSerializer(session)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class ClinicalSessionDetailView(APIView):
    """
    GET /api/clinical/session/<session_id>/
    """
    def get(self, request, session_id):

        session = get_session_or_404(session_id)

        if not session:
            return Response(
                {"error": "Clinical session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ClinicalSessionSerializer(session)

        return Response(serializer.data)
    
class QuestionAnswerView(APIView):

    def post(self, request, session_id):

        session = get_session_or_404(session_id)

        input_type = request.data.get("input_type", "TEXT")
        question_key = request.data.get("question_key")
        question_text = request.data.get("question_text")

        if input_type == "VOICE":

            user_response = request.FILES.get("audio")

            if not user_response:
                return Response(
                    {"error": "Audio file is required for voice input."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        else:

            user_response = request.data.get(
                "user_response",
                ""
            )

        result = get_next_question(
            session_id,
            user_response,
            question_key,
            question_text,
            input_type,
        )

        return Response(result)

class QuestionsComplete(APIView):
    """
    POST /api/clinical/session/<session_id>/questions-done/
    """

    def post(self, request, session_id):

        try:
            result = complete_questions(session_id)

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {
                    "error": "Failed to complete clinical history",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ============================================================
# ANSWERS
# ============================================================

# class HistoryAnswerCreateView(APIView):
#     """
#     POST /api/clinical/session/<session_id>/answer/

#     React sends:

#     {
#         "question_key": "chief_complaint",
#         "question_text": "What is your main problem?",
#         "answer_text": "I have chest pain",
#         "input_type": "VOICE"
#     }

#     Session ID comes from URL.
#     """

#     def post(self, request, session_id):

#         session = get_session_or_404(session_id)

#         if not session:
#             return Response(
#                 {"error": "Clinical session not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         serializer = HistoryAnswerSerializer(
#             data=request.data
#         )

#         if serializer.is_valid():

#             answer = serializer.save(session=session)

#             # Move session forward
#             if session.status == "STARTED":
#                 session.status = "IN_PROGRESS"
#                 session.save(update_fields=["status"])

#             return Response(
#                 HistoryAnswerSerializer(answer).data,
#                 status=status.HTTP_201_CREATED
#             )

#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST
#         )


class HistoryAnswerListView(APIView):
    """
    GET /api/clinical/session/<session_id>/answers/
    """

    def get(self, request, session_id):

        session = get_session_or_404(session_id)

        if not session:
            return Response(
                {"error": "Clinical session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        answers = HistoryAnswer.objects.filter(
            session=session
        ).order_by("created_at")

        serializer = HistoryAnswerSerializer(
            answers,
            many=True
        )

        return Response(serializer.data)


# ============================================================
# CLINICAL HISTORY
# ============================================================

# class ClinicalHistoryView(APIView):
#     """
#     GET  /api/clinical/session/<session_id>/history/
#     POST /api/clinical/session/<session_id>/history/

#     This stores the structured general clinical history.
#     """
    
#     authentication_classes = [AIServiceAuthentication]

#     def get(self, request, session_id):

#         session = get_session_or_404(session_id)

#         if not session:
#             return Response(
#                 {"error": "Clinical session not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         try:
#             history = session.history
#         except ClinicalHistory.DoesNotExist:
#             return Response(
#                 {"message": "Clinical history not created yet."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         serializer = ClinicalHistorySerializerAI(history)

#         return Response(serializer.data)

#     def post(self, request, session_id):

#         session = get_session_or_404(session_id)

#         if not session:
#             return Response(
#                 {"error": "Clinical session not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         try:
#             history = session.history

#             serializer = ClinicalHistorySerializerAI(
#                 history,
#                 data=request.data,
#                 partial=True
#             )

#         except ClinicalHistory.DoesNotExist:

#             serializer = ClinicalHistorySerializerAI(
#                 data=request.data
#             )

#         if serializer.is_valid():

#             history = serializer.save(session=session)

#             return Response(
#                 ClinicalHistorySerializerAI(history).data,
#                 status=status.HTTP_200_OK
#             )

#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST
#         )


# ============================================================
# AYUSH HISTORY
# ============================================================

# class AYUSHHistoryView(APIView):
#     """
#     GET  /api/clinical/session/<session_id>/ayush/
#     POST /api/clinical/session/<session_id>/ayush/
#     """
    
#     authentication_classes = [AIServiceAuthentication]

#     def get(self, request, session_id):

#         session = get_session_or_404(session_id)

#         if not session:
#             return Response(
#                 {"error": "Clinical session not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         try:
#             ayush_history = session.ayush_history
#         except AYUSHHistory.DoesNotExist:
#             return Response(
#                 {"message": "AYUSH history not created yet."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         serializer = AYUSHHistorySerializerAI(ayush_history)

#         return Response(serializer.data)

#     def post(self, request, session_id):

#         session = get_session_or_404(session_id)

#         if not session:
#             return Response(
#                 {"error": "Clinical session not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         try:
#             ayush_history = session.ayush_history

#             serializer = AYUSHHistorySerializerAI(
#                 ayush_history,
#                 data=request.data,
#                 partial=True
#             )

#         except AYUSHHistory.DoesNotExist:

#             serializer = AYUSHHistorySerializerAI(
#                 data=request.data
#             )

#         if serializer.is_valid():

#             ayush_history = serializer.save(session=session)

#             return Response(
#                 AYUSHHistorySerializerAI(ayush_history).data,
#                 status=status.HTTP_200_OK
#             )

#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST
#         )


# ============================================================
# MEDICAL DOCUMENT UPLOAD
# ============================================================

class MedicalDocumentUploadView(APIView):
    """
    POST /api/clinical/session/<session_id>/document/

    React uploads a medical document.

    multipart/form-data:
        file = document/image
    """

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    def post(self, request, session_id):

        session = get_session_or_404(session_id)

        if not session:
            return Response(
                {"error": "Clinical session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MedicalDocumentUploadSerializer(
            data=request.data
        )

        if serializer.is_valid():

            document = serializer.save(
                session=session
                # ocr_status="PENDING"
            )

            return Response(
                MedicalDocumentSerializer(document).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# AI DOCUMENT UPDATE
# ============================================================

# class MedicalDocumentAIUpdateView(APIView):
#     """
#     POST /api/clinical/session/<session_id>/document/<int:document_id>/ai/

#     AI/OCR service sends extracted information.

#     Example:
#     {
#         "ocr_text": "...",
#         "ocr_status": "COMPLETED",
#         "document_type": "Prescription",
#         "document_date": "2026-09-01",
#         "extracted_data": {}
#     }
#     """
    
#     authentication_classes = [AIServiceAuthentication]

#     def post(self, request, session_id, document_id):

#         session = get_session_or_404(session_id)

#         if not session:
#             return Response(
#                 {"error": "Clinical session not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         try:
#             document = MedicalDocument.objects.get(
#                 id=document_id,
#                 session=session
#             )
#         except MedicalDocument.DoesNotExist:
#             return Response(
#                 {"error": "Medical document not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         serializer = MedicalDocumentSerializerAI(
#             document,
#             data=request.data,
#             partial=True
#         )

#         if serializer.is_valid():

#             document = serializer.save()

#             return Response(
#                 MedicalDocumentSerializerAI(document).data,
#                 status=status.HTTP_200_OK
#             )

#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST
#         )


# ============================================================
# MEDICAL DOCUMENT LIST
# ============================================================

class MedicalDocumentListView(APIView):
    """
    GET /api/clinical/session/<session_id>/documents/

    Used by patient/frontend to view uploaded documents.
    """

    def get(self, request, session_id):

        session = get_session_or_404(session_id)

        if not session:
            return Response(
                {"error": "Clinical session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        documents = MedicalDocument.objects.filter(
            session=session
        ).order_by("-uploaded_at")

        serializer = MedicalDocumentSerializer(
            documents,
            many=True
        )

        return Response(serializer.data)
    
# # ============================================================
# # MEDICAL DOCUMENT LIST For AI
# # ============================================================

# class MedicalDocumentListViewAI(APIView):
#     """
#     GET /api/clinical/session/<session_id>/documents/

#     Used by patient/frontend to view uploaded documents.
#     """

#     def get(self, request, session_id):

#         session = get_session_or_404(session_id)

#         if not session:
#             return Response(
#                 {"error": "Clinical session not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         documents = MedicalDocument.objects.filter(
#             session=session
#         ).order_by("-uploaded_at")

#         serializer = MedicalDocumentSerializerAI(
#             documents,
#             many=True
#         )

#         return Response(serializer.data)
    
# ============================================================
# MEDICAL DOCUMENT LIST View FOR SPRINGBOOT
# ============================================================

class MedicalDocumentListViewSpring(APIView):
    """
    GET /api/clinical/session/<session_id>/documents/

    Used by springboot to get medical info. 
    """
    #use api key for secure spring ka hi connection (check then send)
    
    def get(self, request, session_id):

        session = get_session_or_404(session_id)

        if not session:
            return Response(
                {"error": "Clinical session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        documents = MedicalDocument.objects.filter(
            session=session
        ).order_by("-uploaded_at")

        serializer = MedicalDocumentSerializerDoctor(
            documents,
            many=True
        )

        return Response(serializer.data)


# ============================================================
# AI SUMMARY UPDATE
# ============================================================

# class ClinicalSummaryAIUpdateView(APIView):
#     """
#     POST /api/clinical/session/<session_id>/summary/ai/

#     AI sends the final structured summary.

#     Example:
#     {
#         "summary_data": {
#             ...
#         },
#         "ai_generated": true
#     }
#     """
    
#     authentication_classes = [AIServiceAuthentication]

#     def post(self, request, session_id):

#         session = get_session_or_404(session_id)

#         if not session:
#             return Response(
#                 {"error": "Clinical session not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         serializer = ClinicalSummarySerializerAI(
#             data=request.data
#         )

#         if serializer.is_valid():

#             summary, created = ClinicalSummary.objects.update_or_create(
#                 session=session,
#                 defaults={
#                     "summary_data": serializer.validated_data.get(
#                         "summary_data",
#                         {}
#                     ),
#                     "ai_generated": serializer.validated_data.get(
#                         "ai_generated",
#                         True
#                     ),
#                 }
#             )

#             return Response(
#                 ClinicalSummarySerializer(summary).data,
#                 status=status.HTTP_200_OK
#             )

#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST
#         )


# ============================================================
# SUMMARY
# ============================================================

class ClinicalSummaryView(APIView):
    """
    GET /api/clinical/session/<session_id>/summary/

    springboot retrieves the final summary.
    """

    def get(self, request, session_id):

        session = get_session_or_404(session_id)

        if not session:
            return Response(
                {"error": "Clinical session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            summary = session.summary
        except ClinicalSummary.DoesNotExist:
            return Response(
                {"message": "Clinical summary not generated yet."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ClinicalSummarySerializer(summary)

        return Response(serializer.data)


# ============================================================
# COMPLETE SESSION
# ============================================================

class ClinicalSessionCompleteView(APIView):
    """
    POST /api/clinical/session/<session_id>/complete/

    Marks the clinical session as completed.

    AI should normally generate/store the summary before
    this endpoint is called.
    """

    def post(self, request, session_id):

        session = get_session_or_404(session_id)

        if not session:
            return Response(
                {"error": "Clinical session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if session.status == "COMPLETED":
            return Response(
                {
                    "message": "Session is already completed.",
                    "session_id": session.session_id
                },
                status=status.HTTP_200_OK
            )
        

        session.status = "COMPLETED"
        session.completed_at = timezone.now()

        session.save(
            update_fields=[
                "status",
                "completed_at"
            ]
        )

        return Response(
            {
                "session_id": session.session_id,
                "status": session.status,
                "completed_at": session.completed_at
            },
            status=status.HTTP_200_OK
        )