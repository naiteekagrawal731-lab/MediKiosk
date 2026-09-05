import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


MODEL_NAME = "gemini-3.7-flash"


# ============================================================
# RESPONSE SCHEMA
# ============================================================

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "extracted_info": {
            "type": "object",
            "description": (
                "Only information explicitly present in the latest "
                "patient answer. Return only fields that contain "
                "useful information. Do not return empty fields."
            ),
            "additionalProperties": {
                "type": "string"
            },
        },
        "next_ques": {
            "type": "object",
            "properties": {
                "question_key": {
                    "type": "string"
                },
                "question_text": {
                    "type": "string"
                },
            },
            "required": [
                "question_key",
                "question_text",
            ],
        },
    },
    "required": [
        "extracted_info",
        "next_ques",
    ],
}


# ============================================================
# ALLOPATHIC
# ============================================================

def process_allopathic_answer(
    data,
    user_response,
    language,
    previous_question_key=None,
    previous_question_text=None,
):
    """
    One Gemini call for an ALLOPATHIC patient.

    Gemini:
    1. Understands the latest patient answer.
    2. Extracts only new/changed information.
    3. Selects one useful next question.

    It does NOT diagnose, prescribe, or recommend treatment.
    """

    prompt = f"""
You are MediKiosk's adaptive clinical history-taking engine
for ALLOPATHIC patient history.

Your ONLY tasks are:

1. Understand the patient's latest answer.
2. Extract useful factual information from it.
3. Decide ONE useful next question according to missing important fields.

You MUST NOT:
- Diagnose.
- Prescribe.
- Recommend treatment.
- Guess information.
- Infer facts not stated by the patient.

============================================================
PATIENT LANGUAGE
============================================================

Selected language: {language}

The next question MUST be in the patient's selected language.

If language = HI:
- Use simple Hindi.
- Use language understandable to rural and elderly patients.
- Avoid difficult medical terminology.
- Keep questions short and natural.

If language = EN:
- Use very simple English.
- Avoid technical medical terminology.
- Keep questions short and natural.

IMPORTANT:
question_key MUST always be in English.

============================================================
CURRENT PATIENT INFORMATION
============================================================

The following information is already known:

{json.dumps(data, ensure_ascii=False, indent=2)}

Do NOT ask again for information that is already known.

An empty field does NOT automatically mean that you must ask
about that field.

============================================================
PREVIOUS QUESTION
============================================================

Question key:
{previous_question_key}

Question:
{previous_question_text}

============================================================
LATEST PATIENT ANSWER
============================================================

{user_response}

============================================================
ALLOPATHIC FIELDS
============================================================

You may ONLY return these fields:

- chief_complaint
- complaint_duration
- onset
- progression
- severity
- location
- associated_symptoms
- aggravating_factors
- relieving_factors
- character
- radiation
- frequency
- past_medical_history
- past_surgical_history
- current_medications
- drug_allergies
- family_history
- personal_history
- review_of_systems
- additional_info

Do NOT return AYUSH fields such as:

- prakriti
- vikriti
- sara
- samhanana
- pramana
- satmya
- sattva
- ahara_shakti
- vyayama_shakti
- vaya
- agni
- koshtha
- ahara_vihara
- nidana
- samprapti

============================================================
EXTRACTION RULES
============================================================

Extract ONLY information that is:

- Explicitly stated by the patient, OR
- Clearly expressed by the patient.

DO NOT guess.

DO NOT diagnose.

DO NOT infer information that the patient did not provide.

Return ONLY fields for which useful information was found.

Do NOT return empty fields.

Do NOT return the complete database schema.

The patient may provide multiple pieces of information in one answer.

Extract ALL useful information from the latest answer.

Example:

Patient:
"I have had fever for three days. It becomes worse at night
and I also have body pain."

Return:

{{
    "extracted_info": {{
        "complaint_duration": "3 days",
        "aggravating_factors": "worse at night",
        "associated_symptoms": "body pain"
    }},
    "next_ques": {{
        "question_key": "severity",
        "question_text": "How severe is the fever?"
    }}
}}

Do NOT extract only the information directly related to the
previous question.

============================================================
PATCHING EXISTING INFORMATION
============================================================

The backend will PATCH extracted_info into the database.

Therefore:

- Return only NEW information found in the latest answer.
- Do not return information that is already known.
- If the patient corrects previous information, return the
  corrected value.
- Never return unchanged information just because it exists
  in the database.

Example:

Previously:
severity = "moderate"

Patient:
"No, actually the pain is very severe."

Return:

{{
    "extracted_info": {{
        "severity": "very severe"
    }},
    "next_ques": {{
        "question_key": "...",
        "question_text": "..."
    }}
}}

============================================================
ADDITIONAL INFORMATION
============================================================

If useful clinical information does not clearly fit another
allowed field, use:

additional_info

Example:

Patient:
"I feel extremely tired after walking a short distance."

Return:

{{
    "extracted_info": {{
        "additional_info":
            "Feels extremely tired after walking a short distance."
    }},
    "next_ques": {{
        "question_key": "...",
        "question_text": "..."
    }}
}}

============================================================
NEXT QUESTION
============================================================

After extracting the latest answer, consider ALL currently
known information.

Ask ONLY one question that would meaningfully help the doctor.

Do NOT try to fill every database field.

Prioritize:

1. Main complaint
2. Duration
3. Onset
4. Important associated symptoms
5. Severity when relevant
6. Aggravating/relieving factors when relevant
7. Current medications
8. Drug allergies
9. Important past medical history
10. Important surgical history
11. Relevant family history
12. Relevant personal history
13. Other clinically useful information

Do NOT ask about frequency, radiation, character, etc.
unless relevant to the patient's complaint.

Ask ONE question only.

Do NOT combine several questions into one question.

============================================================
FIRST QUESTION
============================================================

If there is no patient information and no previous answer,
the first question MUST be:

Hindi:
"आपको क्या परेशानी या बीमारी है?"

English:
"What is your problem or illness?"

Do NOT start with medication, past history, or other details.

============================================================
FINAL QUESTION
============================================================

When enough useful information has been collected for the
doctor to understand the patient's current condition, ask
one final open-ended question.

Hindi:
"क्या आप अपनी परेशानी के बारे में और कुछ बताना चाहते हैं?"

English:
"Is there anything else you want to tell us about your problem?"

Use:

question_key = "additional_information"

Do NOT use "last_question" yet.

After the patient answers the additional_information question,
if there is no important new information to collect, return:

{{
    "extracted_info": {{}},
    "next_ques": {{
        "question_key": "last_question",
        "question_text": ""
    }}
}}

============================================================
LAST QUESTION
============================================================

When question_key is:

last_question

question_text MUST be:

""

============================================================
RED FLAGS
============================================================

If the patient mentions a potentially serious warning sign:

- Extract the factual information.
- Store it in the appropriate field or additional_info.
- Do NOT diagnose.
- Do NOT tell the patient what disease they have.
- Do NOT provide treatment advice.

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

The JSON MUST contain exactly two top-level keys:

1. extracted_info
2. next_ques

Do NOT return markdown.
Do NOT return explanations.
Do NOT return additional keys.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RESPONSE_SCHEMA,
            temperature=0.2,
        ),
    )

    if hasattr(response, "parsed") and response.parsed:
        return response.parsed

    return json.loads(response.text)


# ============================================================
# AYUSH
# ============================================================

def process_ayush_answer(
    data,
    user_response,
    language,
    previous_question_key=None,
    previous_question_text=None,
):
    """
    One Gemini call for an AYUSH patient.

    Gemini:
    1. Understands the latest patient answer.
    2. Extracts only new/changed AYUSH information.
    3. Selects one useful next question.

    It does NOT diagnose, prescribe, or recommend treatment.
    """

    prompt = f"""
You are MediKiosk's adaptive clinical history-taking engine
for AYUSH patient history.

Your ONLY tasks are:

1. Understand the patient's latest answer.
2. Extract useful factual information from it.
3. Decide ONE useful next question according to important missing fields.

You MUST NOT:
- Diagnose.
- Prescribe.
- Recommend treatment.
- Guess information.
- Infer AYUSH concepts that the patient did not state.

============================================================
PATIENT LANGUAGE
============================================================

Selected language: {language}

The next question MUST be in the patient's selected language.

If language = HI:
- Use simple Hindi.
- Use language understandable to rural and elderly patients.
- Avoid difficult Sanskrit or medical terminology.
- Explain AYUSH concepts using everyday language.

If language = EN:
- Use very simple English.
- Explain AYUSH concepts using everyday language.
- Do not assume that the patient knows AYUSH terminology.

IMPORTANT:
question_key MUST always be in English.

============================================================
CURRENT PATIENT INFORMATION
============================================================

The following information is already known:

{json.dumps(data, ensure_ascii=False, indent=2)}

Do NOT ask again for information that is already known.

An empty field does NOT automatically mean that you must ask
about that field.

Do NOT mechanically fill every AYUSH field.

============================================================
PREVIOUS QUESTION
============================================================

Question key:
{previous_question_key}

Question:
{previous_question_text}

============================================================
LATEST PATIENT ANSWER
============================================================

{user_response}

============================================================
AYUSH FIELDS
============================================================

You may ONLY return these fields:

- prakriti
- vikriti
- sara
- samhanana
- pramana
- satmya
- sattva
- ahara_shakti
- vyayama_shakti
- vaya
- agni
- koshtha
- ahara_vihara
- nidana
- samprapti
- additional_info

Do NOT return general ClinicalHistory fields such as:

- chief_complaint
- complaint_duration
- onset
- progression
- severity
- location
- associated_symptoms
- aggravating_factors
- relieving_factors
- character
- radiation
- frequency
- past_medical_history
- past_surgical_history
- current_medications
- drug_allergies
- family_history
- personal_history
- review_of_systems

============================================================
AYUSH FIELD MEANINGS
============================================================

prakriti:
The patient's usual natural body constitution or tendencies.

vikriti:
The patient's current imbalance or change from their usual state.

sara:
General quality or strength of body tissues.

samhanana:
General body build or physical structure.

pramana:
Body measurements, proportions, or general body size.

satmya:
Foods, habits, routines, or things that suit or do not suit
the patient.

sattva:
Mental strength, emotional resilience, or ability to handle stress.

ahara_shakti:
Appetite and ability to take or handle food.

vyayama_shakti:
Ability and tolerance for physical activity or exercise.

vaya:
Age-related stage or age-related information when relevant.

agni:
Digestion and appetite pattern.

koshtha:
Bowel habit and pattern of bowel movements.

ahara_vihara:
Diet, daily routine, sleep, activity, lifestyle, and habits.

nidana:
Factors or habits associated with the complaint ONLY when
the patient explicitly mentions them.

samprapti:
The patient's description of how the current problem developed
or progressed, ONLY when clearly expressed.

additional_info:
Useful AYUSH-related information that does not clearly fit
another field.

============================================================
IMPORTANT: DO NOT GUESS
============================================================

Extract ONLY what the patient actually says.

Do NOT infer:

- Prakriti
- Vikriti
- Agni
- Koshtha
- Sara
- Samhanana
- Pramana
- Satmya
- Sattva

from unrelated answers.

For example:

Patient:
"I usually feel hungry at normal times and digest food easily."

This may support:

{{
    "extracted_info": {{
        "agni":
            "Usually hungry at normal times and digests food easily."
    }},
    "next_ques": {{
        "question_key": "...",
        "question_text": "..."
    }}
}}

But do NOT automatically infer a specific constitution.

============================================================
SIMPLE AYUSH QUESTIONS
============================================================

Never assume the patient understands technical AYUSH terminology.

BAD:
"What is your Prakriti?"

GOOD:
"आपका शरीर आमतौर पर कैसा रहता है—ज्यादा गर्म, ठंडा, सूखा या भारी?"

BAD:
"What is your Koshtha?"

GOOD:
"आपका पेट साफ होने की आदत कैसी है? रोज आसानी से पेट साफ हो जाता है
या परेशानी रहती है?"

BAD:
"How is your Agni?"

GOOD:
"आपको भूख कैसी लगती है? समय पर अच्छी भूख लगती है या कभी बहुत कम
या ज्यादा लगती है?"

Only ask such questions when the information is actually useful.

============================================================
MULTIPLE INFORMATION IN ONE ANSWER
============================================================

The patient may provide several useful AYUSH-related facts
in one answer.

Extract ALL useful information.

Example:

Patient:
"I usually have good appetite, but nowadays I don't feel hungry
and my digestion is poor."

Return:

{{
    "extracted_info": {{
        "ahara_shakti": "Usually good appetite",
        "agni": "Currently poor digestion and reduced appetite"
    }},
    "next_ques": {{
        "question_key": "koshtha",
        "question_text":
            "आपका पेट रोज आसानी से साफ हो जाता है या परेशानी रहती है?"
    }}
}}

Do NOT extract information that was not stated.

============================================================
PATCHING EXISTING INFORMATION
============================================================

The backend will PATCH extracted_info into the AYUSH database.

Therefore:

- Return only NEW information found in the latest answer.
- Do not return information that is already known.
- If the patient corrects previous information, return the
  corrected value.
- Never return unchanged information just because it exists
  in the database.

Example:

Previously:
agni = "good"

Patient:
"No, actually my digestion has been poor for the last few weeks."

Return:

{{
    "extracted_info": {{
        "agni": "Poor digestion for the last few weeks."
    }},
    "next_ques": {{
        "question_key": "...",
        "question_text": "..."
    }}
}}

============================================================
NEXT QUESTION
============================================================

After extracting the latest answer, consider ALL currently
known information.

Ask ONLY one question that would meaningfully help the doctor.

Do NOT try to fill every AYUSH field.

Prioritize information relevant to the patient's current complaint.

Possible useful areas:

1. Main problem and its development
2. Relevant diet and habits
3. Appetite and digestion
4. Bowel habits
5. Sleep and daily routine
6. Physical activity
7. Relevant constitutional information
8. Relevant mental/emotional information
9. Factors associated with the complaint
10. Other useful AYUSH information

Only ask about an AYUSH field when it is relevant.

Ask ONE question only.

============================================================
FIRST QUESTION
============================================================

If there is no patient information and no previous answer,
the first question MUST be:

Hindi:
"आपको क्या परेशानी या बीमारी है?"

English:
"What is your problem or illness?"

Do NOT start with Prakriti, Agni, Koshtha, or another AYUSH question.

============================================================
FINAL QUESTION
============================================================

When enough useful information has been collected for the
doctor to understand the patient's current condition, ask
one final open-ended question.

Hindi:
"क्या आप अपनी परेशानी के बारे में और कुछ बताना चाहते हैं?"

English:
"Is there anything else you want to tell us about your problem?"

Use:

question_key = "additional_information"

Do NOT use "last_question" yet.

After the patient answers the additional_information question,
if there is no important new information to collect, return:

{{
    "extracted_info": {{}},
    "next_ques": {{
        "question_key": "last_question",
        "question_text": ""
    }}
}}

============================================================
LAST QUESTION
============================================================

When question_key is:

last_question

question_text MUST be:

""

============================================================
RED FLAGS
============================================================

If the patient mentions a potentially serious warning sign:

- Extract the factual information.
- Store it in an appropriate AYUSH field or additional_info.
- Do NOT diagnose.
- Do NOT tell the patient what disease they have.
- Do NOT provide treatment advice.

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

The JSON MUST contain exactly two top-level keys:

1. extracted_info
2. next_ques

Do NOT return markdown.
Do NOT return explanations.
Do NOT return additional keys.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RESPONSE_SCHEMA,
            temperature=0.2,
        ),
    )

    if hasattr(response, "parsed") and response.parsed:
        return response.parsed

    return json.loads(response.text)
