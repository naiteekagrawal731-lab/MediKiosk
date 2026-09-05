# # clinical/authentication.py
# from django.conf import settings
# from rest_framework.authentication import BaseAuthentication
# from rest_framework.exceptions import AuthenticationFailed
# import secrets


# class AIServiceAuthentication(BaseAuthentication):

#     def authenticate(self, request):

#         api_key = request.headers.get("X-AI-API-Key")

#         if not api_key:
#             raise AuthenticationFailed("AI API key required.")

#         if not secrets.compare_digest(
#             api_key,
#             settings.AI_SERVICE_API_KEY
#         ):
#             raise AuthenticationFailed("Invalid AI API key.")

#         return (None, None)