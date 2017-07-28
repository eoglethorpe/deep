import time


def generate_filename(export_type):
    return '{} DEEP {}'.format(
        time.strftime("%Y%m%d"),
        export_type
    )
