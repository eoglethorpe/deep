from users.models import *
# from leads.models import *
# from entries.models import *
# from report.models import *

import json


class Activity:
    def __init__(self, action):
        self.data = {
            'target': None, 'action': action, 'remarks': None
        }

    def set_target(self, type, id=None, name=None, url=None, remarks=None):
        self.data['target'] = {
            'type': type, 'id': id, 'name': name, 'url': url
        }
        return self

    def set_remarks(self, remarks):
        self.data['remarks'] = remarks
        return self

    def log_for(self, user, group=None, event=None):
        activity_log = ActivityLog(user=user, activity=json.dumps(self.data))
        activity_log.group = group
        activity_log.event = event
        activity_log.save()


class CreationActivity(Activity):
    def __init__(self):
        super().__init__('create')


class EditionActivity(Activity):
    def __init__(self):
        super().__init__('edit')


class DeletionActivity(Activity):
    def __init__(self):
        super().__init__('delete')


class AdditionActivity(Activity):
    def __init__(self):
        super().__init__('remove')


class RemovalActivity(Activity):
    def __init__(self):
        super().__init__('remove')
