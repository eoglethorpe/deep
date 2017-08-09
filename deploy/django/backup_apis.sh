if [ ! -f /tmp/backup_apis_pid ]; then
    touch  /tmp/backup_apis_pid
fi
if ! kill -0 $(cat /tmp/backup_apis_pid) > /dev/null 2>&1; then
    . /home/code/env_var.sh
    source /home/code/venv/bin/activate
    /home/code/deep/manage.py backup_apis &
    echo $! > /tmp/backup_apis_pid
    echo 'Started backup_apis PID: '$!
else
    echo 'Already Started backup_apis PID: '$(cat /tmp/backup_apis_pid)
fi
