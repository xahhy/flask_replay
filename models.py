from flask_replay import db


class Channel(db.Model):
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
