from clinical.models import HistoryAnswer,ClinicalSession,ClinicalSummary,MedicalDocument,ClinicalHistory,AYUSHHistory

def get_session_context(session_id):

    session = ClinicalSession.objects.get(
        session_id=session_id
    )

    # answers = HistoryAnswer.objects.filter(
    #     session=session
    # ).order_by("created_at")

    documents = MedicalDocument.objects.filter(
        session=session
    )

    try:
        history = session.history
    except ClinicalHistory.DoesNotExist:
        history = None

    try:
        ayush = session.ayush_history
    except AYUSHHistory.DoesNotExist:
        ayush = None

    return {
        "session": session,
        # "answers": answers,
        "history": history,
        "ayush": ayush,
        "documents": documents,
    }
    
def process_medical_document(document_id):
    pass

def generate_clinical_summary(session_id):
    pass

def detect_red_flags(session_id):
    pass

def get_next_question(history): #later replace with ai
    if not history.get("chief_complaint"):
        return {
            "question_key": "chief_complaint",
            "question": "What is your main health problem?"
        }

    if not history.get("complaint_duration"):
        return {
            "question_key": "complaint_duration",
            "question": "How long have you had this problem?"
        }

    if not history.get("severity"):
        return {
            "question_key": "severity",
            "question": "How severe is the problem?"
        }

    if not history.get("location"):
        return {
            "question_key": "location",
            "question": "Where exactly do you feel the problem?"
        }

    return {
        "question_key": None,
        "question": None,
        "is_complete": True
    }

