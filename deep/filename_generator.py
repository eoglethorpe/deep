import time


def generate_filename(export_type):
    return '{} DEEP {}'.format(
        time.strftime("%d%m%Y"),
        export_type
    )
