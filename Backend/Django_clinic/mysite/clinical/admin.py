from django.contrib import admin
from .models import ClinicalSession,ClinicalHistory,HistoryAnswer,AYUSHHistory,MedicalDocument,ClinicalSummary
# Register your models here.

admin.site.register(ClinicalSummary)
admin.site.register(ClinicalHistory)
admin.site.register(ClinicalSession)
admin.site.register(HistoryAnswer)
admin.site.register(MedicalDocument)
admin.site.register(AYUSHHistory)