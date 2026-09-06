from clinical.models import (
    HistoryAnswer,
    ClinicalSession,
    ClinicalSummary,
    MedicalDocument,
    ClinicalHistory,
    AYUSHHistory,
)

from .gemini import process_allopathic_answer,process_ayush_answer

from .sarvam import (
    speech_to_text,
    text_to_speech,
)

def get_session_or_404(session_id):
    """
    Get a ClinicalSession using the session ID generated
    by the Spring Boot backend.
    """
    try:
        return ClinicalSession.objects.get(session_id=session_id)
    except ClinicalSession.DoesNotExist:
        return None

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
        extracted_info + next_ques + button_options
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

    if session.treatment_type == "ALLOPATHIC":

        result = process_allopathic_answer(
            data=data,
            user_response=answer_text,
            language=session.language,
            previous_question_key=question_key,
            previous_question_text=question_text,
        )

    elif session.treatment_type == "AYUSH":

        result = process_ayush_answer(
            data=data,
            user_response=answer_text,
            language=session.language,
            previous_question_key=question_key,
            previous_question_text=question_text,
        )

    else:

        raise ValueError(
            f"Invalid treatment type: {session.treatment_type}"
        )

    # ========================================================
    # 4. EXTRACT INFORMATION
    # ========================================================

    extracted_info = result.get(
        "extracted_info",
        {}
    )

    if not isinstance(extracted_info, dict):
        extracted_info = {}

    # ========================================================
    # 5. PATCH THE CORRECT HISTORY
    # ========================================================

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

    # Don't create an empty answer record for the initial
    # question request.

    if answer_text:

        save_history_answer(
            session=session,
            question_key=question_key,
            question_text=question_text,
            answer_text=answer_text,
            input_type=input_type,
        )

    # ========================================================
    # 7. GET NEXT QUESTION FROM GEMINI
    # ========================================================

    next_ques = result.get(
        "next_ques",
        {}
    )

    if not isinstance(next_ques, dict):
        next_ques = {}

    next_question_key = next_ques.get(
        "question_key",
        ""
    )

    next_question_text = next_ques.get(
        "question_text",
        ""
    )

    # ========================================================
    # 8. GET BUTTON OPTIONS
    # ========================================================

    button_options = next_ques.get(
        "button_options",
        []
    )

    # Safety check
    if not isinstance(button_options, list):
        button_options = []

    # Maximum 4 buttons
    button_options = button_options[:4]

    # Remove empty options
    button_options = [
        str(option).strip()
        for option in button_options
        if option and str(option).strip()
    ]

    # ========================================================
    # 9. CHECK IF INTERVIEW IS FINISHED
    # ========================================================

    if next_question_key == "last_question":

        session.status = "COMPLETED"
        session.save(update_fields=["status"])

        return {
            "question_key": "last_question",
            "question_text": "",
            "question_audio": None,
            "button_options": [],
            "is_final": True,
        }

    # ========================================================
    # 10. TEXT → SPEECH
    # ========================================================

    question_audio = None

    if next_question_text:

        try:

            tts_response = text_to_speech(
                next_question_text,
                session.language,
            )

            if isinstance(tts_response, dict):

                question_audio = tts_response.get(
                    "audio_base64"
                )

        except Exception as e:

            print(
                "TTS error:",
                e,
            )

    # ========================================================
    # 11. RETURN TO VIEW
    # ========================================================

    return {
        "question_key": next_question_key,
        "question_text": next_question_text,
        "question_audio": question_audio,
        "button_options": button_options,
        "is_final": False,
    }