from django.http import JsonResponse
import json


class JsonError(JsonResponse):
    def __init__(self, message, status=500):
        super().__init__({
            'status': False, 'message': message
        }, status=status)


class JsonMethodNotAllowed(JsonResponse):
    def __init__(self, request):
        super().__init__({
            'detail': request.method+' Method Not Allowed'
            }, status=405)


class JsonResult(JsonResponse):
    def __init__(self, data, status=200):
        super().__init__({
            'status': True, 'data': data
        }, status=status)


def get_json_request(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except:
        return None


# Standard responses
INVALID_JSON_REQUEST = JsonError("Not a valid json data")
