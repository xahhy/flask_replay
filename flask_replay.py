import configparser
import logging
import os
from logging.handlers import TimedRotatingFileHandler

import sys
import json
from pathlib import Path
from flask import Flask, request, make_response
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy,declarative_base
import pymysql
import urllib3
from flask_cors import CORS

cur_path = Path(__file__).parent

try:
    cf = configparser.ConfigParser()
    cf.read(cur_path/'flask_replay.conf')
    REMOTE_PORT = cf.get('remote', 'port')
    MYSQL_URI = cf.get('mysql', 'uri')
except Exception as e:
    logging.exception(e)
    sys.exit(-1)

pymysql.install_as_MySQLdb()
app = Flask(__name__)
CORS(app)
SQLALCHEMY_TRACK_MODIFICATIONS = True
app.config['SQLALCHEMY_DATABASE_URI'] = MYSQL_URI
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:123@1.8.90.63:3306/tsrtmp?charset=utf8'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
http = urllib3.PoolManager()

class Session:
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

class Channel(db.Model, Session):
    """
    Channel information from epg server
    """
    id = db.Column(db.Integer, primary_key=True)
    channel_id = db.Column(db.String(45), unique=True, nullable=False)
    channel_name = db.Column(db.String(200), unique=True, nullable=False)
    rtmp_url = db.Column(db.String(45))
    active = db.Column(db.Integer, default=0)
    start = db.Column(db.Integer)
    PID = db.Column(db.Integer)
    PGID = db.Column(db.Integer)
    client_ip = db.Column(db.String(100))
    sort = db.Column(db.Integer, default=0)

    def __init__(self, id, name):
        self.channel_id = id
        self.channel_name = name



class Program(db.Model, Session):
    """
    Program information from epg server
    """
    id = db.Column(db.Integer, primary_key=True)
    channel_id = db.Column(db.String(45), db.ForeignKey('channel.channel_id'),nullable=False)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    url = db.Column(db.String(200))
    title = db.Column(db.String(200))
    finished = db.Column(db.Integer)
    event_id = db.Column(db.Integer)

    def __init__(self, channel):
        self.channel = channel

# ----------------------------------------------------------------
OPERATE_SUCCESSED = 'Operate successed'
INVALID_REQUEST = 'Invalid Request'

def insert_channel(id, name, url, ip):
    ret = INVALID_REQUEST
    try:
        assert id != None
        assert name != None
        channel = Channel(id, name)
        channel.rtmp_url = url
        channel.client_ip = ip
        channel.active = 1
        channel.save()
        ret = OPERATE_SUCCESSED
    except Exception as e:
        logging.exception(e)
    print('Insert Channel', id, ret)
    return ret


def delete_channel(id):
    ret = INVALID_REQUEST
    try:
        assert id != None
        channel = Channel.query.filter_by(channel_id=id).first()
        if channel is not None:
            channel.delete()
            ret = OPERATE_SUCCESSED
    except Exception as e:
        logging.exception(e)
    print('Delete Channel', id, ret)
    return ret


def edit_channel(id, name, url, ip):
    ret = INVALID_REQUEST
    try:
        assert id != None
        assert name != None
        channel = Channel.query.filter_by(channel_id=id).first()
        if channel is not None:
            channel.channel_name = name
            channel.rtmp_url = url
            channel.client_ip = ip
            channel.update()
            ret = OPERATE_SUCCESSED
    except Exception as e:
        logging.exception(e)
    print('Edit Channel', id, ret)
    return ret

def add_channel(id, name, url, ip):
    ret = INVALID_REQUEST
    try:
        assert id != None
        assert name != None
        channel = Channel.query.filter_by(channel_id=id).first()
        if channel is not None:
            channel.channel_name = name
            channel.rtmp_url = url
            channel.client_ip = ip
            channel.active = 1
            channel.update()
            ret = OPERATE_SUCCESSED
    except Exception as e:
        logging.exception(e)
    print('Add Channel', id, ret)
    return ret


def str_to_ip(ip):
    if ':' in ip:
        host, port = ip.split(':')
        return host
    else:
        return ip


def set_remote_channel(channel_id, ip, op):
    ret = INVALID_REQUEST
    host = str_to_ip(ip)
    m_op = 'stop' if op == '1' else 'start'
    try:
        r = http.request(
            'GET',
            f'http://{host}:{REMOTE_PORT}/replay-client/am',
            fields={
                'op': m_op,
                'c': channel_id
            }
        )
        ret = OPERATE_SUCCESSED
    except Exception as e:
        logging.exception(e)
    print(f'Remote Channel {m_op}', ret)
    return ret


def select_channel_info():
    try:
        channels_active = Channel.query.filter_by(active=1).all()
        channels_inactive = Channel.query.filter_by(active=0).all()
        active_list = []
        inactive_list = []
        for channel in channels_active:
            active_list.append({
                'channel_id': channel.channel_id,
                'channel_name': channel.channel_name,
                'rtmp_url': channel.rtmp_url,
                'client_ip': channel.client_ip,
                'st': channel.start,
                'sort': channel.sort
            })
        if len(active_list) != 0: active_list.sort(key=lambda x:x['sort'])
        for channel in channels_inactive:
            inactive_list.append({
                'channel_id': channel.channel_id,
                'channel_name': channel.channel_name
            })

        channels_dict = {
            'category': active_list,
            'sel': inactive_list
        }
        return json.dumps(channels_dict)
    except Exception as e:
        logging.exception(e)
    return INVALID_REQUEST


def set_sort_rule(sort_rule):
    ret = INVALID_REQUEST
    try:
        sort_list = json.loads(sort_rule)
        for channel in sort_list:
            channel_record = Channel.query.filter_by(channel_id=channel['channel_id']).first()
            channel_record.sort = int(channel['id'])
            channel_record.update()
        ret = OPERATE_SUCCESSED
    except Exception as e:
        logging.exception(e)
    return ret



@app.route('/am')
def admin():
    op = request.args.get('op')
    name = request.args.get('name')
    url = request.args.get('url')
    ip = request.args.get('ip')
    s = request.args.get('s')
    id = request.args.get('id')
    ret = INVALID_REQUEST
    sort_rule = request.args.get('sort_rule')
    if sort_rule is not None:
        ret = set_sort_rule(sort_rule)
        return make_response(ret)
    if op is None:
        return make_response('Not a admin operation!', 500)

    if op == 'category':
        print('try to get channel info')
        ret = select_channel_info()

    elif op == 'insert':
        print('try to insert channel:', id, name, url, ip)
        ret = insert_channel(id, name, url, ip)
    elif op == 'delete':
        print('try to delete channel:', id)
        ret = delete_channel(id)
    elif op == 'edit':
        print('try to edit channel:', id, name, url, ip)
        ret = edit_channel(id, name, url, ip)
    elif op == 'add':
        print('try to add channel:', id, name, url, ip)
        ret = add_channel(id, name, url, ip)
    elif op == 'status':
        print('try to start(0)/stop(1) remote recording program')
        ret = set_remote_channel(id, ip, op)
    return make_response(ret)


if __name__ == '__main__':
    # log_file_name = 'flask_replay.log'
    # log_file_handler = TimedRotatingFileHandler(filename=log_file_name, when="D", interval=7, backupCount=3)
    # logging.basicConfig(
    #     level=logging.DEBUG,
    #     format='%(asctime)s %(filename)s [line:%(lineno)d] %(levelname)s %(message)s',
    #     handlers=[log_file_handler]
    # )
    app.run(debug=True)
    # c = Channel.query.filter_by(channel_id='CCTV1').first()
    # print(c.channel_id)
