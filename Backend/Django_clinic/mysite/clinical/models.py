from django.db import models

class ClinicalSession(models.Model):
    STATUS_CHOICES = [
        ("STARTED", "Started"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    ]

    session_id = models.CharField(
        max_length=8,
        primary_key=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="STARTED"
    )
    
    red_flag_detected = models.BooleanField(default=False)

    red_flag_data = models.JSONField(
        default=list,
        blank=True
    )

    started_at = models.DateTimeField(
        auto_now_add=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )
    

    def __str__(self):
        return self.session_id


class HistoryAnswer(models.Model):
    session = models.ForeignKey(
        ClinicalSession,
        on_delete=models.CASCADE,
        related_name="answers"
    )

    question_key = models.CharField(max_length=100)

    question_text = models.TextField()

    answer_text = models.TextField()
    
    INPUT_TYPE_CHOICES = [
        ("VOICE", "Voice"),
        ("TOUCH", "Touch"),
        ("TEXT", "Text"),
    ]

    input_type = models.CharField(
        max_length=10,
        choices=INPUT_TYPE_CHOICES
    )

    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.session} -- {self.question_key}"
    

class ClinicalHistory(models.Model):
    session = models.OneToOneField(
        ClinicalSession,
        on_delete=models.CASCADE,
        related_name="history"
    )

    # Main complaint
    chief_complaint = models.TextField(blank=True)
    complaint_duration = models.CharField(max_length=100, blank=True)

    # History of present illness
    onset = models.TextField(blank=True)
    progression = models.TextField(blank=True)
    severity = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    associated_symptoms = models.TextField(blank=True)
    aggravating_factors = models.TextField(blank=True)
    relieving_factors = models.TextField(blank=True)
    character = models.TextField(blank=True) #chest pain - sharp/burn/etc
    radiation = models.TextField(blank=True) #radiating to left arm
    frequency = models.CharField(max_length=100, blank=True) #some complaints aren't continuous
    

    # Past history
    past_medical_history = models.TextField(blank=True)
    past_surgical_history = models.TextField(blank=True)

    # Medication / allergy
    current_medications = models.TextField(blank=True)
    drug_allergies = models.TextField(blank=True)

    # Family / personal
    family_history = models.TextField(blank=True)
    personal_history = models.TextField(blank=True)

    # Review of systems
    review_of_systems = models.JSONField(
        default=dict,
        blank=True
    )
    
    #additional info
    additional_info = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

class AYUSHHistory(models.Model):
    session = models.OneToOneField(
        ClinicalSession,
        on_delete=models.CASCADE,
        related_name="ayush_history"
    )

    prakriti = models.TextField(blank=True)
    vikriti = models.TextField(blank=True)

    sara = models.TextField(blank=True)
    samhanana = models.TextField(blank=True)
    pramana = models.TextField(blank=True)
    satmya = models.TextField(blank=True)
    sattva = models.TextField(blank=True)

    ahara_shakti = models.TextField(blank=True)
    vyayama_shakti = models.TextField(blank=True)
    vaya = models.TextField(blank=True)

    agni = models.TextField(blank=True)
    koshtha = models.TextField(blank=True)

    ahara_vihara = models.TextField(blank=True)
    nidana = models.TextField(blank=True)
    samprapti = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)


class MedicalDocument(models.Model):

    session = models.ForeignKey(
        ClinicalSession,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    file = models.FileField(
        upload_to="medical_documents/"
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    ocr_text = models.TextField(
        blank=True
    )
    
    OCR_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    ocr_status = models.CharField(
        max_length=20,
        choices=OCR_STATUS_CHOICES,
        default="PENDING"
    )
    
    document_type = models.CharField(
        max_length=50,
        blank=True
    )

    document_date = models.DateField(
        null=True,
        blank=True
    )

    extracted_data = models.JSONField(
        default=dict,
        blank=True
    )
    
    def __str__(self):
        return f"{self.session} - {self.document_date}"
    

class ClinicalSummary(models.Model):
    session = models.OneToOneField(
        ClinicalSession,
        on_delete=models.CASCADE,
        related_name="summary"
    )

    summary_data = models.JSONField(
        default=dict,
        blank=True
    )

    ai_generated = models.BooleanField(
        default=True
    )

    doctor_verified = models.BooleanField(
        default=False
    )
    
    doctor_edited = models.BooleanField(default=False)
    
    verified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Summary - {self.session.session_id}"