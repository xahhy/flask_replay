# Flask Replay Service
# Deployment
Use Flask+Gunicorn+Nginx

1. Flask:
```python
# flask_replay.py
from werkzeug.contrib.fixers import ProxyFix
...

app.wsgi_app = ProxyFix(app.wsgi_app)
...
```

2. Gunicorn:
run command `gunicorn -c gun.conf flask_replay:app` or `gunicorn -c gun_conf.py flask_replay:app`

```python
# gun.conf
#监听本机的5000端口
bind='127.0.0.1:5000'
#开启4个进程
workers=4
backlog=2048
#工作模式为gevent
worker_class="gevent"
debug=False
proc_name='gunicorn.pid'
#记录PID
pidfile='flask.pid'
loglevel='debug'
```
or
# gun_conf.py
import gevent.monkey
import multiprocessing

gevent.monkey.patch_all()

# 监听本机的5000端口
bind = '0.0.0.0:5000'

preload_app = True

# 开启进程
# workers=4
workers = multiprocessing.cpu_count() * 2 + 1

# 每个进程的开启线程
threads = multiprocessing.cpu_count() * 2

backlog = 2048

# 工作模式为gevent
worker_class = "gevent"

# debug=True

# 如果不使用supervisord之类的进程管理工具可以是进程成为守护进程，否则会出问题
daemon = True

# 进程名称
proc_name = 'gunicorn.pid'

# 进程pid记录文件
pidfile = 'app_pid.log'

loglevel = 'debug'
logfile = 'debug.log'
accesslog = 'access.log'
access_log_format = '%(h)s %(t)s %(U)s %(q)s'
errorlog = 'error.log'

```
3. Nginx
create a Nginx configure file for flask:
`vim /etc/nginx/conf.d/flask.conf`
```
# /etc/nginx/conf.d/flask.conf
server{
    listen 8888;
    server_name localhost;
    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_pass http://127.0.0.1:5000;
    }
}

```
