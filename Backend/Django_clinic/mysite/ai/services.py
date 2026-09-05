from clinical.models import (
    HistoryAnswer,
    ClinicalSession,
    ClinicalSummary,
    MedicalDocument,
    ClinicalHistory,
    AYUSHHistory,
)

from gemini import process_patient_answer

from sarvam import (
    speech_to_text,
    text_to_speech,
)

from clinical.views import get_session_or_404

from clinical.serializers import (
    ClinicalHistorySerializerAI,
    AYUSHHistorySerializerAI,
)


# ============================================================
# CURRENT PATIENT DATA
# ============================================================

def current_patient_data(session_id):
    """
    Return only the history relevant to the treatment type.

    ALLOPATHIC:
        {
            session_id,
            language,
            treatment_type,
            clinical_history: {...}
        }

    AYUSH:
        {
            session_id,
            language,
            treatment_type,
            ayush_history: {...}
        }
    """

    session = get_session_or_404(session_id)

    data = {
        "session_id": session.session_id,
        "language": session.language,
        "treatment_type": session.treatment_type,
    }

    # --------------------------------------------------------
    # ALLOPATHIC
    # --------------------------------------------------------

    if session.treatment_type == "ALLOPATHIC":

        history, _ = ClinicalHistory.objects.get_or_create(
            session=session
        )

        data["clinical_history"] = ClinicalHistorySerializerAI(
            history
        ).data

    # --------------------------------------------------------
    # AYUSH
    # --------------------------------------------------------

    elif session.treatment_type == "AYUSH":

        history, _ = AYUSHHistory.objects.get_or_create(
            session=session
        )

        data["ayush_history"] = AYUSHHistorySerializerAI(
            history
        ).data

    return data


# ============================================================
# PATCH CLINICAL HISTORY
# ============================================================

def patch_clinical_history(session, extracted_info):
    """
    Patch only the fields returned by Gemini into
    ClinicalHistory.

    Example:

        {
            "chief_complaint": "fever",
            "complaint_duration": "since last night"
        }
    """

    if not extracted_info:
        return

    history, _ = ClinicalHistory.objects.get_or_create(
        session=session
    )

    serializer = ClinicalHistorySerializerAI(
        instance=history,
        data=extracted_info,
        partial=True,
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return serializer.data


# ============================================================
# PATCH AYUSH HISTORY
# ============================================================

def patch_ayush_history(session, extracted_info):
    """
    Patch only the fields returned by Gemini into
    AYUSHHistory.

    Example:

        {
            "prakriti": "...",
            "agni": "...",
            "ahara_vihara": "..."
        }

    There is NO "ayush_history" wrapper.
    """

    if not extracted_info:
        return

    history, _ = AYUSHHistory.objects.get_or_create(
        session=session
    )

    serializer = AYUSHHistorySerializerAI(
        instance=history,
        data=extracted_info,
        partial=True,
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return serializer.data


# ============================================================
# SAVE HISTORY ANSWER
# ============================================================

def save_history_answer(
    session,
    question_key,
    question_text,
    answer_text,
    input_type,
):
    """
    Store the actual question/answer given during the interview.

    NOTE:
    Your current HistoryAnswer model does not contain
    extracted_data, so we don't save it here.
    """

    if not question_key:
        return

    return HistoryAnswer.objects.create(
        session=session,
        question_key=question_key,
        question_text=question_text or "",
        answer_text=answer_text,
        input_type=input_type,
    )


# ============================================================
# PROCESS MEDICAL DOCUMENT
# ============================================================

def process_medical_document(document_id):
    pass


# ============================================================
# GENERATE CLINICAL SUMMARY
# ============================================================

def generate_clinical_summary(session_id):
    pass


# ============================================================
# DETECT RED FLAGS
# ============================================================

def detect_red_flags(session_id):
    pass


# ============================================================
# GET NEXT QUESTION
# ============================================================

def get_next_question(
    session_id,
    user_response,
    question_key=None,
    question_text=None,
    input_type="TEXT",
):
    """
    Process one patient answer.

    Flow:

        React
          ↓
        Django
          ↓
        STT (only if voice)
          ↓
        Gemini
          ↓
        extracted_info + next_ques
          ↓
        PATCH correct history table
          ↓
        Save question/answer
          ↓
        TTS next question
          ↓
        React
    """

    session = get_session_or_404(session_id)

    # ========================================================
    # 1. CONVERT VOICE TO TEXT
    # ========================================================

    if input_type == "VOICE":

        text_response = speech_to_text(
            user_response,
            session.language,
        )

        if isinstance(text_response, dict):
            answer_text = text_response.get(
                "text",
                ""
            )
        else:
            answer_text = getattr(
                text_response,
                "transcript",
                str(text_response),
            )

    else:

        answer_text = str(user_response).strip()

    # ========================================================
    # 2. GET CURRENT PATIENT INFORMATION
    # ========================================================

    data = current_patient_data(session_id)

    # ========================================================
    # 3. SEND EVERYTHING TO GEMINI
    # ========================================================
    #
    # Gemini receives:
    #
    # - current database information
    # - previous question
    # - latest patient answer
    # - language
    # - treatment type
    #
    # Gemini returns:
    #
    # {
    #     "extracted_info": {
    #         "chief_complaint": "fever",
    #         "complaint_duration": "since last night"
    #     },
    #
    #     "next_ques": {
    #         "question_key": "severity",
    #         "question_text": "How severe is your fever?"
    #     }
    # }
    #

    result = process_patient_answer(
        data=data,
        user_response=answer_text,
        language=session.language,
        treatment_type=session.treatment_type,
        previous_question_key=question_key,
        previous_question_text=question_text,
    )

    # ========================================================
    # 4. EXTRACT INFORMATION
    # ========================================================

    extracted_info = result.get(
        "extracted_info",
        {}
    )

    # Safety check
    if not isinstance(extracted_info, dict):
        extracted_info = {}

    # ========================================================
    # 5. PATCH THE CORRECT HISTORY
    # ========================================================
    #
    # IMPORTANT:
    #
    # ALLOPATHIC:
    # extracted_info directly contains ClinicalHistory fields.
    #
    # AYUSH:
    # extracted_info directly contains AYUSHHistory fields.
    #
    # There is NO:
    #
    # extracted_info["ayush_history"]
    #
    # or
    #
    # extracted_info["clinical_history"]
    #

    if session.treatment_type == "ALLOPATHIC":

        patch_clinical_history(
            session,
            extracted_info,
        )

    elif session.treatment_type == "AYUSH":

        patch_ayush_history(
            session,
            extracted_info,
        )

    # ========================================================
    # 6. SAVE PATIENT'S ACTUAL ANSWER
    # ========================================================

    save_history_answer(
        session=session,
        question_key=question_key,
        question_text=question_text,
        answer_text=answer_text,
        input_type=input_type,
    )

    # ========================================================
    # 7. GET NEXT QUESTION
    # ========================================================

    next_ques = result.get(
        "next_ques",
        {}
    )

    next_question_key = next_ques.get(
        "question_key",
        ""
    )

    next_question_text = next_ques.get(
        "question_text",
        ""
    )

    # ========================================================
    # 8. CHECK IF INTERVIEW IS FINISHED
    # ========================================================

    if next_question_key == "last_question":

        return {
            "question_key": "last_question",
            "question_text": "",
            "question_audio": None,
            "is_final": True,
            "extracted_info": extracted_info,
        }

    # ========================================================
    # 9. TEXT → SPEECH
    # ========================================================

    question_audio = None

    if next_question_text:

        try:

            question_audio = text_to_speech(
                next_question_text,
                session.language,
            )

        except Exception as e:

            print(
                "TTS error:",
                e,
            )

    # ========================================================
    # 10. RETURN TO VIEW
    # ========================================================

    return {
        "question_key": next_question_key,
        "question_text": next_question_text,
        "question_audio": question_audio,
        "is_final": False,
        "extracted_info": extracted_info,
    }