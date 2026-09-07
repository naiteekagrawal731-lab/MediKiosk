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


MODEL_NAME = "gemini-3.5-flash-lite"


# ============================================================
# RESPONSE SCHEMA
# ============================================================

ALLOPATHIC_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "extracted_info": {
            "type": "object",
            "properties": {
                "chief_complaint": {"type": "string"},
                "complaint_duration": {"type": "string"},
                "onset": {"type": "string"},
                "progression": {"type": "string"},
                "severity": {"type": "string"},
                "location": {"type": "string"},
                "associated_symptoms": {"type": "string"},
                "aggravating_factors": {"type": "string"},
                "relieving_factors": {"type": "string"},
                "character": {"type": "string"},
                "radiation": {"type": "string"},
                "frequency": {"type": "string"},
                "past_medical_history": {"type": "string"},
                "past_surgical_history": {"type": "string"},
                "current_medications": {"type": "string"},
                "drug_allergies": {"type": "string"},
                "family_history": {"type": "string"},
                "personal_history": {"type": "string"},
                "review_of_systems": {"type": "string"},
                "additional_info": {"type": "string"},
            }
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
                "button_options": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "question_key",
                "question_text",
                "button_options"
            ]
        }
    },
    "required": [
        "extracted_info",
        "next_ques"
    ]
}

AYUSH_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "extracted_info": {
            "type": "object",
            "properties": {
                "prakriti": {"type": "string"},
                "vikriti": {"type": "string"},
                "sara": {"type": "string"},
                "samhanana": {"type": "string"},
                "pramana": {"type": "string"},
                "satmya": {"type": "string"},
                "sattva": {"type": "string"},
                "ahara_shakti": {"type": "string"},
                "vyayama_shakti": {"type": "string"},
                "vaya": {"type": "string"},
                "agni": {"type": "string"},
                "koshtha": {"type": "string"},
                "ahara_vihara": {"type": "string"},
                "nidana": {"type": "string"},
                "samprapti": {"type": "string"},
                "additional_info": {"type": "string"},
            }
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
                "button_options": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "question_key",
                "question_text",
                "button_options"
            ]
        }
    },
    "required": [
        "extracted_info",
        "next_ques"
    ]
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
You are MediKiosk's adaptive clinical history-taking engine for ALLOPATHIC patient history.

Your ONLY tasks are:

1. Understand the patient's latest answer.
2. Extract useful factual information from it.
3. Decide ONE useful next question according to the missing important information.
4. Generate short, useful button options for the next question whenever appropriate.

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

The next question MUST be written in the patient's selected language.

If language = HI:
- Use simple Hindi.
- Use language understandable to rural and elderly patients.
- Avoid difficult medical terminology.
- Keep questions short and natural.
- button_options MUST also be in simple Hindi.

If language = EN:
- Use very simple English.
- Avoid technical medical terminology.
- Keep questions short and natural.
- button_options MUST also be in simple English.

IMPORTANT:
- question_key MUST always be in English.
- question_text MUST be in the patient's selected language.
- button_options MUST be in the patient's selected language.

============================================================
CURRENT PATIENT INFORMATION
============================================================

The following information is already known:

{json.dumps(data, ensure_ascii=False, indent=2)}

Use this information to decide what is still important to ask.

Do NOT ask again for information that is already known.

An empty field does NOT automatically mean that you must ask about it.

If the patient information is empty/null and there is no previous patient answer,
treat this as the FIRST QUESTION case.

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

You may ONLY extract information into these fields:

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

Do NOT return or extract AYUSH fields such as:

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

Do NOT extract only the information directly related to the previous question.

Example:

Patient:
"I have had fever for three days. It becomes worse at night and I also have body pain."

Return:

{{
    "extracted_info": {{
        "complaint_duration": "3 days",
        "aggravating_factors": "worse at night",
        "associated_symptoms": "body pain"
    }},
    "next_ques": {{
        "question_key": "severity",
        "question_text": "How severe is the fever?",
        "button_options": ["Mild", "Moderate", "Severe"]
    }}
}}

============================================================
PATCHING EXISTING INFORMATION
============================================================

The backend will PATCH extracted_info into the database.

Therefore:

- Return only NEW information found in the latest answer.
- Do not return information that is already known.
- If the patient corrects previously stored information, return the corrected value.
- Never return unchanged information merely because it exists in the database.

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
        "question_key": "associated_symptoms",
        "question_text": "Do you have any other symptoms?",
        "button_options": ["Cough", "Weakness", "Vomiting", "None"]
    }}
}}

============================================================
ADDITIONAL INFORMATION
============================================================

If useful clinical information does not clearly fit another allowed
field, use:

additional_info

Example:

Patient:
"I feel extremely tired after walking a short distance."

Return:

{{
    "extracted_info": {{
        "additional_info": "Feels extremely tired after walking a short distance."
    }},
    "next_ques": {{
        "question_key": "past_medical_history",
        "question_text": "Do you have any other health problems?",
        "button_options": ["Diabetes", "Blood pressure", "Heart problem", "None"]
    }}
}}

============================================================
NEXT QUESTION
============================================================

After extracting the latest answer, consider ALL currently known
information.

Ask ONLY ONE question that would meaningfully help the doctor.

Do NOT try to fill every database field.

Prioritize information according to clinical relevance:

1. Main complaint
2. Duration
3. Onset
4. Important associated symptoms
5. Severity when relevant
6. Aggravating factors when relevant
7. Relieving factors when relevant
8. Location when relevant
9. Character when relevant
10. Radiation when relevant
11. Frequency when relevant
12. Current medications
13. Drug allergies
14. Important past medical history
15. Important surgical history
16. Relevant family history
17. Relevant personal history
18. Review of systems when relevant
19. Other clinically useful information

Do NOT ask about frequency, radiation, character, or other detailed
fields unless they are relevant to the patient's complaint.

Do NOT ask unnecessary questions.

Ask ONE question only.

Do NOT combine several questions into one question.

============================================================
QUESTION QUALITY
============================================================

Every question must:

- Be short.
- Be easy to understand.
- Ask for only one piece of information.
- Be relevant to the patient's condition.
- Avoid medical jargon.
- Avoid repeating previously collected information.

Do not ask questions merely because a database field is empty.

============================================================
BUTTON OPTIONS
============================================================

For EVERY normal next question, you MUST generate button_options
whenever useful button choices can reasonably be provided.

button_options MUST:

- Be an array of strings.
- Contain 2 to 4 short options when appropriate.
- Be written in the patient's selected language.
- Be easy for rural and elderly patients to understand.
- Represent realistic answers to the question.
- NOT contain medical diagnoses unless the patient is simply selecting
  a symptom or previously stated condition.
- Include "Other" or its equivalent when useful.

Examples:

For:
"What is your main problem?"

Hindi:
["बुखार", "दर्द", "खांसी", "अन्य"]

English:
["Fever", "Pain", "Cough", "Other"]

For:
"How severe is the pain?"

Hindi:
["हल्का", "मध्यम", "बहुत तेज"]

English:
["Mild", "Moderate", "Severe"]

For:
"Where is the pain?"

Hindi:
["पेट", "सीना", "सिर", "अन्य"]

English:
["Stomach", "Chest", "Head", "Other"]

For yes/no questions:

Hindi:
["हाँ", "नहीं"]

English:
["Yes", "No"]

IMPORTANT:

- button_options MUST be present for the FIRST QUESTION too.
- button_options MUST be present for every normal question whenever
  useful choices can reasonably be generated.
- Do NOT omit button_options just because the patient information is empty.
- If useful button choices are not appropriate for a question,
  return an empty array [].
- button_options MUST NEVER be omitted from next_ques.

============================================================
FIRST QUESTION
============================================================

If there is no patient information and no previous patient answer,
the first question MUST be:

Hindi:
"आपको क्या परेशानी या बीमारी है?"

English:
"What is your problem or illness?"

Do NOT start with medication, past history, or other details.

The FIRST QUESTION MUST ALSO contain button_options.

For Hindi, use simple options such as:

["बुखार", "दर्द", "खांसी", "अन्य"]

For English, use simple options such as:

["Fever", "Pain", "Cough", "Other"]

The exact button options may be changed if better options are appropriate,
but button_options MUST be present.

============================================================
FINAL QUESTION
============================================================

When enough useful information has been collected for the doctor
to understand the patient's current condition, ask ONE final
open-ended question.

Hindi:
"क्या आप अपनी परेशानी के बारे में और कुछ बताना चाहते हैं?"

English:
"Is there anything else you want to tell us about your problem?"

Use:

question_key = "additional_information"

For this final open-ended question:

- button_options MUST be [].

Do NOT use "last_question" yet.

After the patient answers the "additional_information" question:

- Extract any important new information.
- If there is no important new information to collect, return:

{{
    "extracted_info": {{}},
    "next_ques": {{
        "question_key": "last_question",
        "question_text": "",
        "button_options": []
    }}
}}

============================================================
LAST QUESTION
============================================================

When question_key is:

last_question

question_text MUST be:

""

button_options MUST be:

[]

Do not ask another question.

============================================================
RED FLAGS
============================================================

If the patient mentions a potentially serious warning sign:

- Extract the factual information.
- Store it in the most appropriate allowed field.
- If it does not fit another field, use additional_info.
- Do NOT diagnose.
- Do NOT tell the patient what disease they have.
- Do NOT provide treatment advice.
- Do NOT ignore the information.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

The JSON MUST contain exactly two top-level keys:

1. extracted_info
2. next_ques

The structure MUST be:

{{
    "extracted_info": {{
        "field_name": "value"
    }},
    "next_ques": {{
        "question_key": "field_name",
        "question_text": "question for patient",
        "button_options": ["option 1", "option 2"]
    }}
}}

Rules:

- extracted_info may contain ZERO or more fields.
- Only use fields from the ALLOPATHIC FIELDS section.
- Do NOT include empty extracted fields.
- Do NOT include AYUSH fields.
- next_ques MUST always contain:
  - question_key
  - question_text
  - button_options
- button_options MUST always be present.
- button_options MUST always be an array.
- button_options may contain 0 to 4 strings.
- Normal questions should usually contain 2 to 4 useful button options
  when appropriate.
- The FIRST QUESTION MUST contain button_options.
- additional_information MUST have button_options = [].
- last_question MUST have button_options = [].
- question_key MUST be English.
- question_text MUST be in the selected patient language.
- button_options MUST be in the selected patient language.
- Do NOT return markdown.
- Do NOT return explanations.
- Do NOT return additional top-level keys.

"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ALLOPATHIC_RESPONSE_SCHEMA,
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
You are MediKiosk's adaptive clinical history-taking engine for AYUSH patient history.

Your ONLY tasks are:

1. Understand the patient's latest answer.
2. Extract useful factual information from it.
3. Decide ONE useful next question according to important missing information.
4. Generate short, useful button options for the next question.

You MUST NOT:
- Diagnose.
- Prescribe.
- Recommend treatment.
- Guess information.
- Infer AYUSH concepts that the patient did not state.
- Invent Prakriti, Vikriti, Agni, Koshtha, or any other AYUSH assessment.

============================================================
PATIENT LANGUAGE
============================================================

Selected language: {language}

The next question MUST be written in the patient's selected language.

Button options MUST also be written in the patient's selected language.

If language = HI:
- Use simple Hindi.
- Use language understandable to rural and elderly patients.
- Avoid difficult Sanskrit or medical terminology.
- Explain AYUSH concepts using everyday language.
- Keep questions short and natural.
- Keep button options very short and easy to understand.

If language = EN:
- Use very simple English.
- Explain AYUSH concepts using everyday language.
- Do not assume that the patient knows AYUSH terminology.
- Keep questions short and natural.
- Keep button options very short and easy to understand.

IMPORTANT:
- question_key MUST always be in English.
- question_text MUST always be in the patient's selected language.
- button_options MUST always be in the patient's selected language.

============================================================
CURRENT PATIENT INFORMATION
============================================================

The following AYUSH information is already known:

{json.dumps(data, ensure_ascii=False, indent=2)}

Use this information to decide what is still important to ask.

Do NOT ask again for information that is already known.

An empty field does NOT automatically mean that you must ask about it.

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

You may ONLY extract information into these fields:

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

Do NOT return or extract general Allopathic ClinicalHistory fields such as:

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
The patient's usual natural body constitution or tendencies,
ONLY when the patient explicitly describes them or provides
an established constitution.

vikriti:
The patient's current imbalance or change from their usual state,
ONLY when clearly described by the patient.

sara:
General quality or strength of body tissues, ONLY when explicitly
described by the patient.

samhanana:
General body build or physical structure, ONLY when explicitly
described by the patient.

pramana:
Body measurements, proportions, or general body size, ONLY when
explicitly described by the patient.

satmya:
Foods, habits, routines, or things that suit or do not suit
the patient.

sattva:
Mental strength, emotional resilience, or ability to handle stress,
ONLY when explicitly described.

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
Factors or habits associated with the complaint ONLY when the
patient explicitly mentions them.

samprapti:
The patient's description of how the current problem developed
or progressed, ONLY when clearly expressed by the patient.

additional_info:
Useful AYUSH-related information that does not clearly fit another
allowed field.

============================================================
STRICT EXTRACTION RULES
============================================================

Extract ONLY information that the patient actually states.

Information may be extracted when it is:
- Explicitly stated by the patient, OR
- Clearly expressed by the patient in ordinary language.

DO NOT infer clinical or AYUSH concepts.

In particular, NEVER automatically infer:

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
        "agni": "Usually hungry at normal times and digests food easily."
    }},
    "next_ques": {{
        "question_key": "koshtha",
        "question_text": "How is your bowel habit?",
        "button_options": [
            "Regular",
            "Sometimes difficult",
            "Often difficult"
        ]
    }}
}}

But do NOT convert this into a specific Prakriti or Vikriti.

============================================================
AYUSH TERMINOLOGY
============================================================

Never assume the patient understands technical AYUSH terminology.

Do NOT ask:

"What is your Prakriti?"

Instead, ask in simple patient-friendly language when constitution
information is clinically relevant.

Hindi example:

"आपका शरीर आमतौर पर कैसा रहता है—ज्यादा गर्म, ठंडा, सूखा या भारी?"

Do NOT ask:

"What is your Koshtha?"

Instead, ask:

"आपका पेट साफ होने की आदत कैसी है? रोज आसानी से पेट साफ हो जाता है या परेशानी रहती है?"

Do NOT ask:

"How is your Agni?"

Instead, ask:

"आपको भूख कैसी लगती है? समय पर अच्छी भूख लगती है या कभी बहुत कम या ज्यादा लगती है?"

Only ask these questions when the information is actually useful.

============================================================
MULTIPLE INFORMATION IN ONE ANSWER
============================================================

The patient may provide several useful AYUSH-related facts in one answer.

Extract ALL useful information from the latest answer.

Do NOT extract only information directly related to the previous question.

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
        "question_text": "आपका पेट रोज आसानी से साफ हो जाता है या परेशानी रहती है?",
        "button_options": [
            "रोज आसानी से",
            "कभी-कभी परेशानी",
            "अक्सर परेशानी"
        ]
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
- If the patient corrects previously stored information, return the corrected value.
- Never return unchanged information merely because it exists in the database.

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
        "question_key": "koshtha",
        "question_text": "आपका पेट रोज आसानी से साफ हो जाता है या परेशानी रहती है?",
        "button_options": [
            "रोज आसानी से",
            "कभी-कभी परेशानी",
            "अक्सर परेशानी"
        ]
    }}
}}

============================================================
ADDITIONAL INFORMATION
============================================================

If useful AYUSH-related information does not clearly fit another
allowed field, use:

additional_info

Do NOT force information into an incorrect AYUSH field.

============================================================
NEXT QUESTION
============================================================

After extracting the latest answer, consider ALL currently known
information.

Ask ONLY ONE question that would meaningfully help the doctor.

Do NOT try to fill every AYUSH field.

Prioritize information according to relevance to the patient's
current complaint.

Possible useful areas include:

1. Main problem and its development
2. Relevant diet and food habits
3. Appetite and digestion
4. Bowel habits
5. Sleep and daily routine
6. Physical activity
7. Relevant constitutional information
8. Relevant mental or emotional information
9. Factors associated with the complaint
10. Other useful AYUSH information

Only ask about an AYUSH field when it is relevant.

Do NOT ask a question merely because a database field is empty.

Do NOT ask unnecessary questions.

Ask ONE question only.

Do NOT combine several questions into one question.

============================================================
BUTTON OPTIONS
============================================================

For EVERY normal next question, generate useful button options when
the question can reasonably be answered using a few common choices.

This includes the FIRST AI-generated question.

The first AI question MUST also include button_options whenever
reasonable.

Button options are optional patient-friendly shortcuts for answering
the question.

Rules:

- Generate 2 to 4 button options.
- Button options MUST directly relate to the current question.
- Button options MUST be in the selected patient language.
- Keep each option short.
- Make options easy for rural and elderly patients.
- Do not use medical jargon.
- Do not use diagnostic labels.
- Do not make treatment recommendations.
- Do not create unrelated generic buttons.
- Do not repeat the question as a button.
- Do not invent information about the patient.
- Do not use button options to diagnose the patient.

Examples:

If question:
"आपको भूख कैसी लगती है?"

Good button options:

{{
    "button_options": [
        "अच्छी भूख",
        "कम भूख",
        "बहुत ज्यादा भूख",
        "कभी कम कभी ज्यादा"
    ]
}}

If question:
"आपका पेट रोज आसानी से साफ हो जाता है या परेशानी रहती है?"

Good button options:

{{
    "button_options": [
        "रोज आसानी से",
        "कभी परेशानी",
        "अक्सर परेशानी"
    ]
}}

If question:
"How is your sleep?"

Good button options:

{{
    "button_options": [
        "Good",
        "Sometimes disturbed",
        "Often disturbed"
    ]
}}

If there are no sensible short choices for a particular question,
return an empty button_options array.

Do NOT omit button_options.

button_options MUST always be present in next_ques.

============================================================
QUESTION QUALITY
============================================================

Every question must:

- Be short.
- Be easy to understand.
- Ask for only ONE main piece of information.
- Be relevant to the patient's condition.
- Avoid medical jargon.
- Avoid unnecessary AYUSH terminology.
- Avoid repeating previously collected information.

Every button option must:

- Be short.
- Be easy to understand.
- Be relevant to the question.
- Be written in the patient's selected language.

============================================================
FIRST QUESTION
============================================================

If there is no patient information and no previous patient answer,
the first question MUST be:

Hindi:
"आपको क्या परेशानी या बीमारी है?"

English:
"What is your problem or illness?"

Do NOT start with Prakriti, Agni, Koshtha, or another AYUSH question.

IMPORTANT:

The first question MUST ALSO contain button_options.

Choose short, relevant options based on the first question.

For example, if the first question is in Hindi, suitable options
could be common complaint categories such as:

{{
    "button_options": [
        "बुखार",
        "दर्द",
        "खांसी",
        "अन्य"
    ]
}}

For English:

{{
    "button_options": [
        "Fever",
        "Pain",
        "Cough",
        "Other"
    ]
}}

These are only examples.

Choose button options that are appropriate for the first question.

Do NOT diagnose the patient from the selected button.

The patient may also choose to answer using voice or text instead
of a button.

============================================================
FINAL QUESTION
============================================================

When enough useful information has been collected for the doctor
to understand the patient's current condition, ask ONE final
open-ended question.

Hindi:
"क्या आप अपनी परेशानी के बारे में और कुछ बताना चाहते हैं?"

English:
"Is there anything else you want to tell us about your problem?"

Use:

question_key = "additional_information"

For this final open-ended question, button_options may be an empty
array because it is intentionally an open-ended question.

Example:

{{
    "extracted_info": {{}},
    "next_ques": {{
        "question_key": "additional_information",
        "question_text": "क्या आप अपनी परेशानी के बारे में और कुछ बताना चाहते हैं?",
        "button_options": []
    }}
}}

Do NOT use "last_question" yet.

After the patient answers the additional_information question:

1. Extract any important new AYUSH information.
2. If there is important new information, store it in the appropriate
   AYUSH field.
3. If there is no important new information to collect, return:

{{
    "extracted_info": {{}},
    "next_ques": {{
        "question_key": "last_question",
        "question_text": "",
        "button_options": []
    }}
}}

============================================================
LAST QUESTION
============================================================

When question_key is:

last_question

question_text MUST be:

""

button_options MUST be:

[]

Do not ask another question.

The frontend/backend will recognize:

question_key = "last_question"

as the end of the interview.

============================================================
RED FLAGS
============================================================

If the patient mentions a potentially serious warning sign:

- Extract the factual information if it can be represented in an
  allowed AYUSH field.
- Otherwise store it in additional_info.
- Do NOT diagnose.
- Do NOT tell the patient what disease they have.
- Do NOT provide treatment advice.
- Do NOT invent an AYUSH interpretation.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

The JSON MUST contain exactly two top-level keys:

1. extracted_info
2. next_ques

The structure MUST be:

{{
    "extracted_info": {{
        "field_name": "value"
    }},
    "next_ques": {{
        "question_key": "field_name",
        "question_text": "question for patient",
        "button_options": [
            "option 1",
            "option 2"
        ]
    }}
}}

IMPORTANT OUTPUT RULES:

- extracted_info may contain ZERO or more fields.
- Only use fields from the AYUSH FIELDS section.
- Do NOT include Allopathic fields.
- Do NOT include empty extracted fields.
- Do NOT return unchanged information.
- next_ques MUST always contain:
  - question_key
  - question_text
  - button_options
- button_options MUST always be present.
- button_options MUST always be an array.
- button_options MUST contain 0 to 4 strings.
- For normal questions, use 2 to 4 useful options when appropriate.
- The FIRST QUESTION must also include button_options.
- For additional_information, button_options should normally be [].
- For last_question, button_options MUST be [].
- question_key MUST be English.
- question_text MUST be in the selected patient language.
- button_options MUST be in the selected patient language.
- Do NOT return markdown.
- Do NOT return explanations.
- Do NOT return additional top-level keys.
"""
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AYUSH_RESPONSE_SCHEMA,
            temperature=0.2,
        ),
    )

    if hasattr(response, "parsed") and response.parsed:
        return response.parsed

    return json.loads(response.text)

def generate_ayush_summary(data):
    """
    Generate the final physician-ready clinical summary.

    Gemini returns ONLY JSON matching the frontend summary schema.
    """

    prompt = """You are an AI clinical history summarization engine for an AYUSH clinical intake system.

Your task is to generate a concise, structured summary from the provided AYUSH patient history data.

IMPORTANT:

* The input contains AYUSH clinical history only.
* Do NOT generate or add an Allopathic clinical summary.
* Do NOT invent information.
* Do NOT make a diagnosis.
* Do NOT recommend medicines, treatment, or management.
* Only summarize information explicitly present in the provided data.
* Missing information must remain empty.
* Keep the summary concise and useful for an AYUSH physician.

OUTPUT RULES:

1. Return ONLY valid JSON.
2. Do not return Markdown.
3. Do not add explanations outside JSON.
4. Return exactly the fields defined in the schema below.
5. Do not add, remove, rename, or restructure fields.
6. The top-level field "treatment_type" MUST always be "AYUSH".
7. Do not create Allopathic fields such as medications, allergies, review_of_systems, or a conventional HPI unless that information is explicitly present in the input and belongs to the provided AYUSH history.
8. Do not infer Prakriti, Vikriti, Agni, Koshtha, or any other AYUSH parameter from symptoms unless it is explicitly provided.
9. Preserve the patient's reported information without changing its meaning.
10. If information is unavailable, use:

* "" for missing text
* [] for missing lists
* {{}} for missing objects.

AYUSH SUMMARY STRUCTURE:

{
"treatment_type": "AYUSH",
"ayush_summary": {
"chief_complaint": "",
"complaint_duration": "",
"prakriti": "",
"vikriti": "",
"sara": "",
"samhanana": "",
"pramana": "",
"satmya": "",
"sattva": "",
"ahara_shakti": "",
"vyayama_shakti": "",
"vaya": "",
"agni": "",
"koshtha": "",
"ahara_vihara": "",
"nidana": "",
"samprapti": "",
"additional_information": ""
}
}

FIELD RULES:

* "chief_complaint":
  Summarize the patient's main reported problem or reason for consultation.

* "complaint_duration":
  Include the duration only when explicitly stated by the patient.

* "prakriti":
  Include only explicitly collected or reported Prakriti information.

* "vikriti":
  Include only explicitly collected or reported Vikriti information.

* "sara":
  Include the collected Sara assessment.

* "samhanana":
  Include the collected Samhanana assessment.

* "pramana":
  Include the collected Pramana assessment.

* "satmya":
  Include the collected Satmya assessment.

* "sattva":
  Include the collected Sattva assessment.

* "ahara_shakti":
  Include the collected Ahara Shakti assessment.

* "vyayama_shakti":
  Include the collected Vyayama Shakti assessment.

* "vaya":
  Include the collected age-related Vaya assessment.

* "agni":
  Include the collected Agni assessment.

* "koshtha":
  Include the collected Koshtha assessment.

* "ahara_vihara":
  Summarize explicitly reported diet, daily routine, lifestyle, habits, sleep, activity, or other relevant Ahara-Vihara information.

* "nidana":
  Include explicitly reported or collected Nidana information.
  Do not infer causes that were not stated.

* "samprapti":
  Include only explicitly collected Samprapti information.
  Do not independently construct a Samprapti.

* "additional_information":
  Include useful AYUSH-related information that does not fit into the defined fields.

IMPORTANT DISTINCTION:
This is an AYUSH summary, not an Allopathic summary.

Do NOT automatically create:

* history_of_present_illness
* past_medical_history
* past_surgical_history
* medications
* allergies
* family_history
* personal_history
* review_of_systems
* investigations
* diagnosis
* treatment_plan

unless those details are explicitly present in the input and are specifically required by the schema. Since they are not part of this AYUSH schema, place any useful unmatched information in "additional_information".

INPUT DATA:
{data}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty summary.")

    try:
        summary = json.loads(response.text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Gemini returned invalid JSON: {str(e)}"
        )

    return summary

def generate_allopathic_summary(data, language="EN"):
    """
    Generate a concise Allopathic frontend-ready clinical summary.

    The AI converts detailed ClinicalHistory data into short,
    scannable phrases. Only overall_summary should be written
    as a 1–2 sentence clinical summary.
    """

    prompt = f"""
You are an AI clinical summary generation engine for an Allopathic
patient history-taking system.

The input contains structured clinical history collected from a patient.

Your job is to COMPRESS and ORGANIZE this information into a
short, clear, physician-friendly summary for direct frontend display.

The frontend will display each array item as a separate line/bullet.

IMPORTANT STYLE REQUIREMENT:

DO NOT write a sentence for every field.

Most fields must contain SHORT CLINICAL PHRASES or KEYWORDS,
not full sentences.

For example:

GOOD:
"symptoms": [
    "High fever, 2 days",
    "Body ache",
    "Headache",
    "Mild cough",
    "Loss of appetite"
]

BAD:
"symptoms": [
    "The patient has been experiencing high fever for the last 2 days.",
    "The patient also complains of body ache.",
    "The patient reports having a headache."
]

The output should be compact and visually similar to a clinical
summary card/dashboard.

ONLY "overall_summary" should contain a natural 1–2 sentence
clinical summary.

-----------------------------------
STRICT OUTPUT FORMAT
-----------------------------------

Return ONLY valid JSON.

Return EXACTLY this structure:

{{
    "treatment_type": "ALLOPATHIC",

    "overall_summary": "",

    "main_complaint": "",

    "symptoms": [],

    "past_medical_history": [],

    "past_surgical_history": [],

    "medications": [],

    "allergies": [],

    "family_history": [],

    "lifestyle_and_habits": [],

    "additional_notes": [],

    "red_flags": []
}}

Do NOT add any other fields.

Do NOT add AYUSH fields.

-----------------------------------
GENERAL RULES
-----------------------------------

1. Use ONLY information present in the input.

2. Never hallucinate.

3. Never infer information that was not explicitly provided.

4. Never make a diagnosis.

5. Never recommend treatment.

6. Never recommend medicines.

7. Never invent medication doses or frequencies.

8. Missing information must remain empty.

9. Use [] when a list has no information.

10. Do NOT write "No", "None", "Normal", "No allergies",
    "No medications", etc. unless the patient explicitly stated it.

11. Missing information does NOT mean negative information.

12. Do not unnecessarily repeat the same information in multiple sections.

13. Remove unnecessary words.

14. Prefer medically clear short phrases.

15. Preserve the clinical meaning of the patient's information.

16. Do not include patient name, age, gender, DOB, ABHA ID,
    or session ID. These are handled separately by Spring Boot.

-----------------------------------
OVERALL SUMMARY
-----------------------------------

"overall_summary" is the ONLY field where you should write
a natural sentence.

Write only 1–2 short sentences.

It should give the doctor a quick understanding of the patient's
main problem and the most important associated information.

Example:

"Patient presents with high fever and body ache for 2 days,
associated with headache, mild cough and loss of appetite."

Do not make it unnecessarily detailed.

Do not add diagnosis.

Do not add information that is not present.

-----------------------------------
MAIN COMPLAINT
-----------------------------------

"main_complaint" must be a SHORT phrase.

Combine the main complaint with duration when available.

GOOD:

"Fever & body ache (2 days)"

"Chest pain (since yesterday)"

"Headache for 1 week"

BAD:

"The patient is complaining of fever and body ache which started
two days ago."

Keep it short.

-----------------------------------
SYMPTOMS
-----------------------------------

"symptoms" must be a LIST of short clinical phrases.

Use information from:

- associated symptoms
- severity
- location
- character
- radiation
- frequency
- onset
- progression
- aggravating factors
- relieving factors

Do NOT create a separate long sentence for each symptom.

GOOD:

[
    "High fever, 2 days",
    "Body ache",
    "Headache",
    "Mild cough",
    "Loss of appetite"
]

If useful, include relevant details in compact form:

[
    "Sharp chest pain, left side",
    "Pain radiating to left arm",
    "Worse with exertion",
    "Relieved by rest"
]

BAD:

[
    "The patient reports that the chest pain is sharp.",
    "The patient says that the pain is located on the left side.",
    "The pain radiates to the left arm."
]

If there are no explicitly reported symptoms:

[]

-----------------------------------
PAST MEDICAL HISTORY
-----------------------------------

Use SHORT condition names or phrases.

GOOD:

[
    "Hypertension",
    "Type 2 diabetes",
    "Asthma since childhood"
]

BAD:

[
    "The patient has a history of hypertension."
]

Do not infer conditions.

-----------------------------------
PAST SURGICAL HISTORY
-----------------------------------

Use short phrases.

GOOD:

[
    "Appendectomy, 2022",
    "C-section, 2019"
]

Do not invent dates.

If unavailable:

[]

-----------------------------------
MEDICATIONS
-----------------------------------

List explicitly mentioned medications.

Keep each item short.

GOOD:

[
    "Paracetamol 500 mg",
    "Metformin 500 mg twice daily"
]

If only the medication name is known:

[
    "Paracetamol"
]

NEVER invent dose or frequency.

If unavailable:

[]

-----------------------------------
ALLERGIES
-----------------------------------

Use short phrases.

GOOD:

[
    "Penicillin allergy",
    "Dust allergy"
]

Do not automatically write "No known allergies".

If allergy information was not provided:

[]

-----------------------------------
FAMILY HISTORY
-----------------------------------

Use short clinical phrases.

GOOD:

[
    "Father: diabetes",
    "Mother: hypertension"
]

Do not write full sentences.

Do not infer hereditary conditions.

If unavailable:

[]

-----------------------------------
LIFESTYLE AND HABITS
-----------------------------------

Use short phrases.

Possible information:

- diet
- smoking
- tobacco
- alcohol
- sleep
- exercise
- occupation
- bowel habits
- bladder habits
- other relevant habits

GOOD:

[
    "Vegetarian diet",
    "6–7 hrs sleep/night",
    "Moderate physical activity",
    "Occasional alcohol use"
]

BAD:

[
    "The patient follows a vegetarian diet."
]

If no relevant lifestyle information exists:

[]

-----------------------------------
ADDITIONAL NOTES
-----------------------------------

Use short phrases for useful information that does not fit
the other sections.

GOOD:

[
    "Work-related stress",
    "Symptoms worse at night"
]

BAD:

[
    "The patient mentioned that they have been experiencing
    stress because of work."
]

If unavailable:

[]

-----------------------------------
RED FLAGS
-----------------------------------

This section is ONLY for explicitly reported warning signs
that may require clinical prioritization.

Do NOT diagnose.

Do NOT create speculative red flags.

Do NOT assume that every symptom is a red flag.

Use short phrases.

GOOD:

[
    "Severe chest pain",
    "Difficulty breathing"
]

BAD:

[
    "The patient may potentially have a serious cardiac condition."
]

If there are no explicitly supported red flags:

[]

-----------------------------------
VERY IMPORTANT
-----------------------------------

The output should look like a concise clinical dashboard.

Think:

"SHORT + CLEAR + CLINICALLY USEFUL"

NOT:

"LONG + EXPLANATORY + SENTENCE BASED"

For example, prefer:

{{
    "main_complaint": "Fever & body ache (2 days)",
    "symptoms": [
        "High fever, 2 days",
        "Body ache",
        "Headache",
        "Mild cough",
        "Loss of appetite"
    ],
    "past_medical_history": [
        "Hypertension"
    ],
    "medications": [
        "Paracetamol 500 mg"
    ],
    "lifestyle_and_habits": [
        "Vegetarian diet",
        "6–7 hrs sleep/night",
        "Moderate physical activity"
    ],
    "additional_notes": [
        "Work-related stress"
    ]
}}

NOT:

{{
    "main_complaint": "The patient is suffering from fever and body ache.",
    "symptoms": [
        "The patient reports body ache.",
        "The patient also reports headache."
    ]
}}

The first style is REQUIRED.

-----------------------------------
LANGUAGE
-----------------------------------

Selected patient language:

{language}

"treatment_type" and all JSON field names MUST remain in English.

The human-readable values should use the selected language when
appropriate.

For example, if language is Hindi, the summary content may be
written in Hindi, but JSON keys must remain English.

-----------------------------------
INPUT DATA
-----------------------------------

{json.dumps(data, ensure_ascii=False, indent=2)}

Generate the final Allopathic summary.

Return ONLY valid JSON.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty Allopathic summary.")

    try:
        summary = json.loads(response.text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Gemini returned invalid JSON: {str(e)}"
        )

    if summary.get("treatment_type") != "ALLOPATHIC":
        raise ValueError(
            "Gemini returned an invalid treatment_type."
        )

    if "allopathic_summary" in summary:
        raise ValueError(
            "Unexpected allopathic_summary wrapper returned."
        )

    required_fields = [
        "treatment_type",
        "overall_summary",
        "main_complaint",
        "symptoms",
        "past_medical_history",
        "past_surgical_history",
        "medications",
        "allergies",
        "family_history",
        "lifestyle_and_habits",
        "additional_notes",
        "red_flags",
    ]

    missing_fields = [
        field for field in required_fields
        if field not in summary
    ]

    if missing_fields:
        raise ValueError(
            f"Gemini response missing fields: {missing_fields}"
        )

    return summary


def generate_ayush_summary(data, language="EN"):
    """
    Generate a concise AYUSH frontend-ready clinical summary.

    The AI converts detailed AYUSH history data into short,
    scannable clinical phrases.

    Only overall_summary should be a natural 1–2 sentence summary.
    """

    prompt = f"""
You are an AI clinical summary generation engine for an AYUSH
patient history-taking system.

The input contains structured AYUSH clinical history collected
from a patient during a clinical interview.

Your task is to COMPRESS and ORGANIZE the information into a
short, clear, physician-friendly AYUSH summary that can be
displayed directly in the frontend.

The frontend will display each array item as a separate
line/bullet.

IMPORTANT STYLE REQUIREMENT:

DO NOT write a sentence for every field.

Most fields must contain SHORT CLINICAL PHRASES or KEYWORDS,
not full sentences.

For example:

GOOD:

"ahara_vihara": [
    "Vegetarian diet",
    "6–7 hrs sleep/night",
    "Moderate physical activity"
]

BAD:

"ahara_vihara": [
    "The patient follows a vegetarian diet.",
    "The patient sleeps for 6–7 hours every night.",
    "The patient performs moderate physical activity."
]

The output should be compact and visually similar to a
clinical summary card/dashboard.

ONLY "overall_summary" should contain a natural 1–2 sentence
clinical summary.

-----------------------------------
STRICT OUTPUT FORMAT
-----------------------------------

Return ONLY valid JSON.

Return EXACTLY this structure:

{{
    "treatment_type": "AYUSH",

    "overall_summary": "",

    "main_complaint": "",

    "symptoms": [],

    "prakriti": "",

    "vikriti": "",

    "sara": "",

    "samhanana": "",

    "pramana": "",

    "satmya": "",

    "sattva": "",

    "ahara_shakti": "",

    "vyayama_shakti": "",

    "vaya": "",

    "agni": "",

    "koshtha": "",

    "ahara_vihara": [],

    "nidana": [],

    "samprapti": [],

    "additional_notes": []
}}

Do NOT add any other fields.

Do NOT add Allopathic fields such as:

- past_medical_history
- past_surgical_history
- medications
- allergies
- family_history
- review_of_systems
- investigations
- red_flags

unless they are explicitly required by this schema.

They are NOT part of this AYUSH summary schema.

-----------------------------------
GENERAL RULES
-----------------------------------

1. Use ONLY information present in the input.

2. Never hallucinate.

3. Never infer Prakriti from symptoms.

4. Never infer Vikriti from symptoms unless explicitly collected.

5. Never independently determine Agni.

6. Never independently determine Koshtha.

7. Never independently construct Nidana.

8. Never independently construct Samprapti.

9. Never make a diagnosis.

10. Never recommend treatment.

11. Never recommend medicines.

12. Never add Ayurvedic interpretation that was not explicitly
    collected or provided in the input.

13. Missing information must remain empty.

14. Use "" for missing single-value fields.

15. Use [] for missing list fields.

16. Do NOT write "Normal", "None", "No problem", or similar
    statements for information that was not collected.

17. Missing information does NOT mean negative information.

18. Do not unnecessarily repeat the same information in multiple
    sections.

19. Remove unnecessary words.

20. Prefer short, clinically clear phrases.

21. Preserve the patient's reported information without changing
    its meaning.

22. The result must be directly usable by the frontend without
    additional AI processing.

-----------------------------------
OVERALL SUMMARY
-----------------------------------

"overall_summary" is the ONLY field where you should write
a natural sentence.

Write ONE or TWO short sentences.

It should give the physician a quick understanding of the
patient's main complaint and the most important AYUSH-related
information that was actually collected.

Example:

"Patient presents with fever and body ache for 2 days.
Prakriti is reported as Pitta-Kapha with Mandagni and Mridu Koshtha."

Only include Prakriti, Agni, Koshtha, etc. if they are explicitly
present in the input.

Do not create an Ayurvedic assessment yourself.

Do not make the summary unnecessarily long.

-----------------------------------
MAIN COMPLAINT
-----------------------------------

"main_complaint" must be a SHORT phrase.

Combine the main complaint with duration when available.

GOOD:

"Fever & body ache (2 days)"

"Headache for 1 week"

"Joint pain (3 months)"

BAD:

"The patient is complaining of fever and body ache which started
two days ago."

Keep it short.

-----------------------------------
SYMPTOMS
-----------------------------------

"symptoms" must be a LIST of short clinical phrases.

Use only symptoms explicitly present in the input.

GOOD:

[
    "Fever, 2 days",
    "Body ache",
    "Headache",
    "Mild cough",
    "Loss of appetite"
]

If a symptom has useful detail, keep it compact.

GOOD:

[
    "Burning abdominal pain",
    "Pain worse after meals",
    "Reduced appetite"
]

BAD:

[
    "The patient reports experiencing burning abdominal pain.",
    "The patient says the pain becomes worse after eating."
]

Do not diagnose from symptoms.

If no symptom information exists:

[]

-----------------------------------
PRAKRITI
-----------------------------------

"prakriti" is a SINGLE SHORT VALUE.

Use only explicitly collected Prakriti information.

Examples:

"Pitta-Kapha"

"Vata-Pitta"

"Kapha"

Do NOT determine Prakriti yourself.

If unavailable:

""

-----------------------------------
VIKRITI
-----------------------------------

"vikriti" is a SINGLE SHORT VALUE or concise phrase.

Examples:

"Pitta aggravation"

"Vata aggravation"

"Kapha predominance"

Only use information explicitly provided.

Do NOT infer Vikriti.

If unavailable:

""

-----------------------------------
SARA
-----------------------------------

Include the explicitly collected Sara assessment.

Keep it concise.

Example:

"Rakta Sara"

If unavailable:

""

-----------------------------------
SAMHANANA
-----------------------------------

Include the explicitly collected Samhanana assessment.

Keep it concise.

Example:

"Moderate"

If unavailable:

""

-----------------------------------
PRAMANA
-----------------------------------

Include explicitly collected Pramana information.

Keep it concise.

Example:

"Medium build"

If unavailable:

""

-----------------------------------
SATMYA
-----------------------------------

Include explicitly collected Satmya information.

Keep it concise.

Example:

"Suitable to regular diet"

If unavailable:

""

-----------------------------------
SATTVA
-----------------------------------

Include explicitly collected Sattva information.

Keep it concise.

Example:

"Moderate"

If unavailable:

""

-----------------------------------
AHARA SHAKTI
-----------------------------------

Include explicitly collected Ahara Shakti information.

Keep it concise.

Example:

"Moderate appetite"

If unavailable:

""

-----------------------------------
VYAYAMA SHAKTI
-----------------------------------

Include explicitly collected Vyayama Shakti information.

Keep it concise.

Example:

"Moderate"

If unavailable:

""

-----------------------------------
VAYA
-----------------------------------

Include explicitly collected Vaya information.

Keep it concise.

Example:

"Madhyama Vaya"

If unavailable:

""

-----------------------------------
AGNI
-----------------------------------

Include ONLY the explicitly collected Agni assessment.

Examples:

"Mandagni"

"Vishamagni"

"Tikshnagni"

"Samagni"

Do NOT determine Agni from appetite, digestion, or symptoms
unless the input explicitly provides the assessment.

If unavailable:

""

-----------------------------------
KOSHTHA
-----------------------------------

Include ONLY the explicitly collected Koshtha assessment.

Examples:

"Mridu"

"Krura"

"Madhyama"

Do NOT determine Koshtha yourself.

If unavailable:

""

-----------------------------------
AHARA-VIHARA
-----------------------------------

"ahara_vihara" must be a LIST of short, readable phrases.

Include relevant explicitly reported:

- diet
- food habits
- meal pattern
- sleep
- exercise
- daily routine
- occupation-related lifestyle
- physical activity
- other relevant Ahara-Vihara information

GOOD:

[
    "Vegetarian diet",
    "Irregular meals",
    "6–7 hrs sleep/night",
    "Moderate physical activity"
]

BAD:

[
    "The patient follows a vegetarian diet.",
    "The patient reports that their meals are irregular."
]

If unavailable:

[]

-----------------------------------
NIDANA
-----------------------------------

"nidana" must contain only explicitly collected or reported
Nidana information.

Keep each item short.

GOOD:

[
    "Irregular diet",
    "Excess spicy food",
    "Sleep deprivation"
]

Do NOT infer Nidana from symptoms.

Do NOT independently decide that a lifestyle factor is a Nidana.

If unavailable:

[]

-----------------------------------
SAMPRAPTI
-----------------------------------

"samprapti" must contain ONLY explicitly collected Samprapti
information.

Keep it concise.

If the input contains a specific documented Samprapti,
summarize it without changing its meaning.

Do NOT independently construct Samprapti using Ayurvedic knowledge.

Do NOT infer dosha, dushya, srotas, or stages of disease unless
they are explicitly provided in the input.

If unavailable:

[]

-----------------------------------
ADDITIONAL NOTES
-----------------------------------

Include useful AYUSH-related information that does not naturally
fit into the defined sections.

Use short phrases.

GOOD:

[
    "Work-related stress",
    "Irregular sleep pattern"
]

BAD:

[
    "The patient mentioned that they have been experiencing
    significant stress because of their work."
]

Do not duplicate information unnecessarily.

If unavailable:

[]

-----------------------------------
IMPORTANT AYUSH RULE
-----------------------------------

This is an AYUSH summary.

Do NOT turn the output into an Allopathic clinical summary.

Do NOT create:

- conventional HPI
- past medical history
- past surgical history
- medications
- allergies
- family history
- review of systems
- investigations
- diagnosis
- treatment plan

The summary should primarily present:

- Main complaint
- Symptoms
- Dashavidha Pariksha information
- Agni
- Koshtha
- Ahara-Vihara
- Nidana
- Samprapti
- Other explicitly collected AYUSH information

-----------------------------------
SUMMARY STYLE
-----------------------------------

Think of the final output as a dashboard for a doctor.

SHORT + CLEAR + SCANNABLE.

For example:

{{
    "treatment_type": "AYUSH",

    "overall_summary": "Patient presents with fever and body ache
    for 2 days. Prakriti is reported as Pitta-Kapha with Mandagni
    and Mridu Koshtha.",

    "main_complaint": "Fever & body ache (2 days)",

    "symptoms": [
        "High fever, 2 days",
        "Body ache",
        "Headache",
        "Mild cough"
    ],

    "prakriti": "Pitta-Kapha",
    "vikriti": "Pitta aggravation",
    "sara": "Rakta Sara",
    "samhanana": "Moderate",
    "pramana": "Medium build",
    "satmya": "Regular diet",
    "sattva": "Moderate",
    "ahara_shakti": "Moderate appetite",
    "vyayama_shakti": "Moderate",
    "vaya": "Madhyama Vaya",
    "agni": "Mandagni",
    "koshtha": "Mridu",

    "ahara_vihara": [
        "Vegetarian diet",
        "6–7 hrs sleep/night",
        "Moderate physical activity"
    ],

    "nidana": [
        "Irregular meals"
    ],

    "samprapti": [],

    "additional_notes": [
        "Work-related stress"
    ]
}}

Do NOT make every item into a sentence.

Use compact phrases.

-----------------------------------
LANGUAGE
-----------------------------------

Selected patient language:

{language}

All JSON field names MUST remain in English.

Human-readable values should use the selected language when
appropriate.

-----------------------------------
INPUT DATA
-----------------------------------

{json.dumps(data, ensure_ascii=False, indent=2)}

Generate the final AYUSH summary now.

Return ONLY valid JSON.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty AYUSH summary.")

    try:
        summary = json.loads(response.text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Gemini returned invalid JSON: {str(e)}"
        )

    if summary.get("treatment_type") != "AYUSH":
        raise ValueError(
            "Gemini returned an invalid treatment_type."
        )

    required_fields = [
        "treatment_type",
        "overall_summary",
        "main_complaint",
        "symptoms",
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
        "additional_notes",
    ]

    missing_fields = [
        field for field in required_fields
        if field not in summary
    ]

    if missing_fields:
        raise ValueError(
            f"Gemini response missing fields: {missing_fields}"
        )

    return summary


# {
#   "treatment_type": "AYUSH",
#   "overall_summary": "Patient presents with fever and body ache for 2 days. Prakriti is reported as Pitta-Kapha with Mandagni and Mridu Koshtha.",
#   "main_complaint": "Fever & body ache (2 days)",
#   "symptoms": [
#     "High fever, 2 days",
#     "Body ache",
#     "Headache",
#     "Mild cough"
#   ],
#   "prakriti": "Pitta-Kapha",
#   "vikriti": "Pitta aggravation",
#   "sara": "Rakta Sara",
#   "samhanana": "Moderate",
#   "pramana": "Medium build",
#   "satmya": "Regular diet",
#   "sattva": "Moderate",
#   "ahara_shakti": "Moderate appetite",
#   "vyayama_shakti": "Moderate",
#   "vaya": "Madhyama Vaya",
#   "agni": "Mandagni",
#   "koshtha": "Mridu",
#   "ahara_vihara": [
#     "Vegetarian diet",
#     "6–7 hrs sleep/night",
#     "Moderate physical activity"
#   ],
#   "nidana": [
#     "Irregular meals"
#   ],
#   "samprapti": [],
#   "additional_notes": [
#     "Work-related stress"
#   ]
# }

# {
#   "treatment_type": "ALLOPATHIC",
#   "overall_summary": "Patient presents with high fever and body ache for 2 days, associated with headache, mild cough and loss of appetite.",
#   "main_complaint": "Fever & body ache (2 days)",
#   "symptoms": [
#     "High fever, 2 days",
#     "Body ache",
#     "Headache",
#     "Mild cough",
#     "Loss of appetite"
#   ],
#   "past_medical_history": [
#     "Hypertension"
#   ],
#   "past_surgical_history": [],
#   "medications": [
#     "Paracetamol 500 mg"
#   ],
#   "allergies": [],
#   "family_history": [
#     "Father: diabetes"
#   ],
#   "lifestyle_and_habits": [
#     "Vegetarian diet",
#     "6–7 hrs sleep/night",
#     "Moderate physical activity"
#   ],
#   "additional_notes": [
#     "Work-related stress"
#   ],
#   "red_flags": []
# }