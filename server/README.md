### Intro

Here you have the restful service that keeps track of sample progress.  We have
the restful service and a frontend.

We use python, flask, tornado and redis for the backend.

### Setup

Use [virtualenv](http://www.virtualenv.org/en/latest/) to create a python
env:

```$ virtualenv flask```

Install the necessary packages:

```sh
$ flask/bin/pip install flask
$ flask/bin/pip install tornado
$ flask/bin/pip install redis
$ flask/bin/pip install flask-httpauth
$ flask/bin/pip install requests
```

Install redis:

Use your package manager of choice for that or compile from sources.

### Testing it out

Start the http server and redis:

```
$ redis-server &> logs.redis.txt &
$ git clone path_to_split_mapping_repo
$ cd split_mapping/rest
$ ./run.py &> logs.rest.txt &
```

First you should change ```app/config.json``` and setup whatever login/pwd you
prefer for the service.

Use then ```signal.py``` to create some samples and introduce stage
changes:

```
$ export PATH=PATH_TO_SPLIT_MAPPING:$PATH
$ url=http://localhost:5000/sapi/api/v1.0/samples
$ signal.py list $url
{
    "samples": []
}

$ /Users/drio/dev/py.analysis/pipelines/split_mapping/signal.py $url 18277 init
<Response [201]>
$ /Users/drio/dev/py.analysis/pipelines/split_mapping/signal.py $url foo init
<Response [201]>

$ signal.py list $url
{
    "samples": [
        {
            "id": 2,
            "name": "18277",
            "steps": {
                "init": 1386864048.57309
            }
        },
        {
            "id": 3,
            "name": "foo",
            "steps": {
                "init": 1386864053.307082
            }
        }
    ]
}

```

As you add and modify samples, check the backend to see it gets updated. Point your browser to
your backend, in this case [http://localhost:5000/frontend.html](http://localhost:5000/static/frontend.html).


