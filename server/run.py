#!flask/bin/python

from app import app
from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

env_is = 'dev'


def setup_redis():
    import json
    import redis
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    if not r.exists("samples"):
        r.set("samples", json.dumps([]))
    if not r.exists("current_id"):
        r.set("current_id", 0)


setup_redis()

if env_is == 'dev':
    app.run(debug=True)

else:
    http_server = HTTPServer(WSGIContainer(app))
    http_server.listen(5000)
    IOLoop.instance().start()


#from flask import url_for
#url_for('static', filename='frontend.html')
