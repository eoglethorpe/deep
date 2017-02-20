from users.hid import HidConfig


def hid_config(request):
    return { 'hid_config': HidConfig() }
