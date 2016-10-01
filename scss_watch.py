 #!/usr/bin/env python3

import os

cmd = 'sass --watch '

for file in os.listdir("scss"):
    if not file.startswith("_") and file.endswith(".scss"):
        cmd += 'scss/'+file+':static/css/'+file[:-4]+'css '

os.system(cmd)
