from django.conf import settings
from sarvamai import SarvamAI


client = SarvamAI(
    api_subscription_key=settings.SARVAM_API_KEY
)


SARVAM_LANGUAGE_CODES = {
    "EN": "en-IN",
    "HI": "hi-IN",
}


def get_language_code(language):
    """
    Convert our application language code to Sarvam language code.

    EN -> en-IN
    HI -> hi-IN
    """

    language = language.upper()

    if language not in SARVAM_LANGUAGE_CODES:
        raise ValueError(f"Unsupported language: {language}")

    return SARVAM_LANGUAGE_CODES[language]


# ==================================================
# SPEECH TO TEXT
# ==================================================

def speech_to_text(audio_file, language="EN"):
    """
    Convert patient speech to text.

    language:
        EN -> English
        HI -> Hindi
    """

    language_code = get_language_code(language)

    response = client.speech_to_text.transcribe(
        file=audio_file,
        model="saaras:v4",
        language_code=language_code,
        mode="transcribe",
    )

    return {
        "text": response.transcript,
        "language": response.language_code,
    }


# ==================================================
# TEXT TO SPEECH
# ==================================================
import base64

def text_to_speech(text, language="EN"):
    language_code = get_language_code(language)

    response = client.text_to_speech.convert(
        text=text,
        model="bulbul:v3",
        language_code=language_code,
        speaker="shubh",
        pace=1.0,
        speech_sample_rate=24000,
    )

    # Sarvam returns audio in response.audios
    if not response.audios:
        raise ValueError("Sarvam TTS returned no audio")

    audio_base64 = response.audios[0]

    return {
        "audio_base64": audio_base64,
        "content_type": "audio/wav",
    }
    
    #If your installed Sarvam SDK returns the audio as raw bytes rather than a base64 string, use:
    # audio_base64 = base64.b64encode(response.audios[0]).decode("utf-8")


# # ==================================================
# # HINDI -> ENGLISH
# # ==================================================

# def hindi_to_english(text):
#     response = client.text.translate(
#         input=text,
#         source_language_code="hi-IN",
#         target_language_code="en-IN",
#         model="sarvam-translate:v1",
#     )

#     return response.translated_text


# # ==================================================
# # ENGLISH -> HINDI
# # ==================================================

# def english_to_hindi(text):
#     response = client.text.translate(
#         input=text,
#         source_language_code="en-IN",
#         target_language_code="hi-IN",
#         model="sarvam-translate:v1",
#     )

#     return response.translated_text