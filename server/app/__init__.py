#!flask/bin/python


from flask import Flask, jsonify, abort, make_response, request, redirect, url_for, render_template
from flask.ext.httpauth import HTTPBasicAuth
import json
import redis
import time

app = Flask(__name__)

""" All the interactions with redis are coded here.
    We serialize and deserialize the samples against
    the samples key in redis.
    There is also a key to keep the next id available.
"""


def get_samples():
    return json.loads(app.redis.get("samples"))


def get_id():
    return app.redis.incr("last_id")


def save(samples):
    app.redis.set("samples", json.dumps(samples))


def load_config(key):
    data = open("app/config.json", "r").read()
    _ = json.loads(data.rstrip())
    return _[key]


app.redis = redis.StrictRedis(host='localhost', port=6379, db=0)
app.get_samples = get_samples
app.get_id = get_id
app.save = save
app.credentials = load_config('credentials')


"""
samples = [
    {
        'id': 1,
        'name': u'dummy',
        'steps': {}
    },
]
"""

auth = HTTPBasicAuth()


@auth.get_password
def get_password(username):
    #from flask import logging
    #logging.getLogger().addHandler(logging.StreamHandler())
    if username in app.credentials:
        return app.credentials[username]
    return None


@auth.error_handler
def unauthorized():
    return make_response(jsonify({'error': 'Unauthorized access'}), 401)


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


@app.route('/sapi/api/v1.0/samples', methods=['GET'])
@auth.login_required
def get_samples():
    return jsonify({'samples': app.get_samples()})


@app.route('/sapi/api/v1.0/samples/<int:sample_id>', methods=['GET'])
def get_sample(sample_id):
    sample = filter(lambda s: s['id'] == sample_id, app.get_samples())
    if len(sample) == 0:
        abort(404)
    return jsonify({'sample': sample[0]})


@app.route('/sapi/api/v1.0/samples', methods=['POST'])
def create_sample():
    if not request.json or not 'name' in request.json:
        abort(400)
    sample = {
        'id': app.get_id(),
        'name': request.json['name'],
        'steps': {},
    }
    samples = app.get_samples()
    samples.append(sample)
    app.save(samples)
    return jsonify({'sample': sample}), 201


@app.route('/sapi/api/v1.0/samples/<int:sample_id>', methods=['PUT'])
def update_sample(sample_id):
    samples = app.get_samples()
    sample = filter(lambda s: s['id'] == sample_id, samples)
    if len(sample) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if 'name' in request.json and type(request.json['name']) != unicode:
        abort(400)
    if 'step' in request.json and type(request.json['step']) is not unicode:
        abort(400)
    sample[0]['name'] = request.json.get('name', sample[0]['name'])
    _step = request.json.get('step')
    sample[0]['steps'][_step] = time.time()
    app.save(samples)

    return jsonify({'sample': sample[0]})


@app.route('/sapi/api/v1.0/samples/<int:sample_id>', methods=['DELETE'])
def delete_sample(sample_id):
    samples = app.get_samples()
    sample = filter(lambda s: s['id'] == sample_id, samples)
    if len(sample) == 0:
        abort(404)
    samples.remove(sample[0])
    app.save(samples)
    return jsonify({'result': True})


@app.route('/')
@app.route('/index.html')
def index():
    user = {'name': None, 'pwd': None}
    for u, p in app.credentials.items():
        user['name'] = u
        user['pwd'] = p
        break
    return render_template("index.html", title='Sapi Frontend',
                           user=user)
