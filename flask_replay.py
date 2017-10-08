from flask import Flask, request, make_response
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy,declarative_base
import pymysql


pymysql.install_as_MySQLdb()
app = Flask(__name__)
SQLALCHEMY_TRACK_MODIFICATIONS = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:1234@localhost:3306/flask?charset=utf8'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:123@1.8.90.63:3306/tsrtmp?charset=utf8'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Channel(db.Model):
    """
    Channel information from epg server
    """
    id = db.Column(db.Integer, primary_key=True)
    channel_id = db.Column(db.String(200), unique=True, nullable=False)
    channel_name = db.Column(db.String(200), unique=True, nullable=False)
    rtmp_url = db.Column(db.String(200))
    active = db.Column(db.Integer)
    start = db.Column(db.Integer)
    PID = db.Column(db.Integer)
    PGID = db.Column(db.Integer)
    client_ip = db.Column(db.String(50))
    sort = db.Column(db.Integer)

    def __init__(self, id, name):
        self.channel_id = id
        self.channel_name = name

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

class Program(db.Model):
    """
    Program information from epg server
    """
    id = db.Column(db.Integer, primary_key=True)
    channel = db.Column(db.String(200), db.ForeignKey('channel.channel_id'),nullable=False)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    url = db.Column(db.String(200))
    title = db.Column(db.String(200))
    finished = db.Column(db.Integer)
    event_id = db.Column(db.Integer)

    def __init__(self, channel):
        self.channel = channel

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

# ----------------------------------------------------------------
OPERATE_SUCCESSED = 'Operate successed'
INVALID_REQUEST = 'Invalid Request'

def add_channel(id, name, url, ip):
    assert id != None
    assert name != None
    assert url != None
    assert ip != None
    try:
        channel = Channel(id, name)
        channel.rtmp_url = url
        channel.client_ip = ip
        channel.save()
        ret = OPERATE_SUCCESSED
    except:
        ret = INVALID_REQUEST
    print(ret)
    return ret

@app.route('/am')
def admin():
    op = request.args.get('op')
    name = request.args.get('name')
    url = request.args.get('url')
    ip = request.args.get('ip')
    s = request.args.get('s')
    id = request.args.get('id')

    if op is None:
        return make_response('Not a admin operation!', 500)

    if op == 'add':
        print('try to add channel:', id, name, url, ip)
        add_channel(id, name, url, ip)
    return make_response('Success')


if __name__ == '__main__':
    app.run(debug=True)
    # c = Channel.query.filter_by(channel_id='CCTV1').first()
    # print(c.channel_id)
