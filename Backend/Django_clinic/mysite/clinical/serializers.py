from rest_framework import serializers

from .models import (
    ClinicalSession,
    HistoryAnswer,
    ClinicalHistory,
    AYUSHHistory,
    MedicalDocument,
    ClinicalSummary,
)


class ClinicalSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalSession
        fields = [
            "session_id",
            "status",
            "red_flag_detected",
            "red_flag_data",
            "started_at",
            "completed_at",
        ]

        read_only_fields = [
            "status",
            "red_flag_detected",
            "red_flag_data",
            "started_at",
            "completed_at",
        ]
        
class ClinicalSessionSerializerAI(serializers.ModelSerializer):
    class Meta:
        model = ClinicalSession
        fields = [
            "status",
            "red_flag_detected",
            "red_flag_data",
        ]
        
class HistoryAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryAnswer

        fields = [
            "id",
            "session",
            "question_key",
            "question_text",
            "answer_text",
            "input_type",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "session", #we will read from url
        ]
        
class ClinicalHistorySerializerAI(serializers.ModelSerializer):
    class Meta:
        model = ClinicalHistory

        fields = [
            "session",
            "chief_complaint",
            "complaint_duration",
            "onset",
            "progression",
            "severity",
            "location",
            "associated_symptoms",
            "aggravating_factors",
            "relieving_factors",
            "character",
            "radiation",
            "frequency",
            "past_medical_history",
            "past_surgical_history",
            "current_medications",
            "drug_allergies",
            "family_history",
            "personal_history",
            "review_of_systems",
            "additional_info",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "session",
            "created_at",
            "updated_at",
        ]

class AYUSHHistorySerializerAI(serializers.ModelSerializer):
    class Meta:
        model = AYUSHHistory

        fields = [
            "session",
            "prakriti",
            "vikriti",
            "sara",
            "samhanana",
            "pramana",
            "satmya",
            "sattva",
            "ahara_shakti",
            "vyayama_shakti",
            "vaya",
            "agni",
            "koshtha",
            "ahara_vihara",
            "nidana",
            "samprapti",
            "created_at",
        ]

        read_only_fields = [
            "session",
            "created_at",
        ]
        
class MedicalDocumentUploadSerializer(serializers.ModelSerializer):
    """
    Used when patient/frontend uploads a medical document.

    Frontend should only send:
        file
    """

    class Meta:
        model = MedicalDocument
        fields = [
            "file",
        ]

class MedicalDocumentSerializer(serializers.ModelSerializer):
    """
    Returned after successful upload.

    Only returns information useful to frontend.
    AI/OCR fields are not exposed here.
    """

    class Meta:
        model = MedicalDocument
        fields = [
            "id",
            "file",
            "uploaded_at",
            "ocr_status",
        ]

        read_only_fields = [
            "id",
            "file",
            "uploaded_at",
            "ocr_status",
        ]
        
        
class MedicalDocumentSerializerDoctor(serializers.ModelSerializer): #send to springboot
    class Meta:
        model = MedicalDocument

        fields = [
            "id",
            "session",
            "file",
            "uploaded_at",
            "ocr_text",
            "ocr_status",
            "document_type",
            "document_date",
            "extracted_data",
        ]

        read_only_fields = [
            "id",
            "session",
            "uploaded_at",
            "ocr_text",
            "ocr_status",
            "document_type",
            "document_date",
            "extracted_data",
        ]

class MedicalDocumentSerializerAI(serializers.ModelSerializer): #used by ai
    class Meta:
        model = MedicalDocument
        fields=[
            "id",
            "uploaded_at",
            "ocr_text",
            "ocr_status",
            "document_type",
            "document_date",
            "extracted_data", #Your document-processing pipeline is supposed to extract more than OCR text. The SIH problem specifically requires extracting things such as diagnoses, medications/doses, investigations, procedures/surgeries, abnormal values, etc.
        ]
        read_only_fields = [
            "id",
            "uploaded_at",
        ]
        
        
class ClinicalSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalSummary

        fields = [
            "session",
            "summary_data",
            "ai_generated",
            "doctor_verified",
            "doctor_edited",
            "verified_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "session",
            "ai_generated",
            "verified_at", #should be read only handle this in future
            "created_at",
            "updated_at",
        ]
        
class ClinicalSummarySerializerAI(serializers.ModelSerializer): #used by ai 
    class Meta:
        model = ClinicalSummary
        fields = [
            "session",
            "summary_data",
            "ai_generated",
        ]

        read_only_fields = [
            "session",
        ]