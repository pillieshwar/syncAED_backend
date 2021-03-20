import json
import random
import time
from datetime import datetime
from random import choice
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask import Flask, Response, render_template, jsonify, request
from sqlalchemy.ext.automap import automap_base

# Initializing the app
app = Flask(__name__)
random.seed()  # Initialize the random number generator

# Setup DB marshmallow vars
# db = dbmodule.setup(app)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost/syncaeddb'
SQLALCHEMY_TRACK_MODIFICATIONS = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

Base = automap_base()
Base.prepare(db.engine, reflect=True)

# SyncAED tables
syncAED_bus_data = Base.classes.syncAED_bus_data
syncAED_factor_data = Base.classes.syncAED_factor_data

#Schemas
class SyncAEDFactor(ma.Schema):
    class Meta:
        fields = ('id', 'bus_id', 'pmu_id', 'event_date', 'event_time', 'vol_mag', 'vol_angle', 'current_mag', 'current_angle', 'frequency', 'rocof')

SyncAEDFactor_schema = SyncAEDFactor()
SyncAEDFactor_schemas = SyncAEDFactor(many=True)

class SyncBusData(ma.Schema):
    class Meta:
        fields = ('bus_id', 'bus_name', 'base_kv', 'latitude', 'longitude', 'bus_status', 'v_min', 'v_max')

SyncBusData_schema = SyncBusData()
SyncBusData_schemas = SyncBusData(many=True)

class SyncAEDFactorWithLocationData(ma.Schema):
    class Meta:
        fields = ('id', 'bus_id', 'pmu_id', 'event_date', 'event_time', 'vol_mag', 'vol_angle', 'current_mag', 'current_angle', 'frequency', 'rocof', 'latitude', 'longitude')

SyncAEDFactorWithLocationData_schema = SyncAEDFactorWithLocationData()
SyncAEDFactorWithLocationData_schemas = SyncAEDFactorWithLocationData(many=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/mapdata')
def map_data():
    query_results = db.session.query(syncAED_bus_data).all()
    result = SyncBusData_schemas.dump(query_results)
    return jsonify({'results' : result})


@app.route('/eventslocations')
def eventLoc_data():
    query_results = db.session.query(syncAED_factor_data).join(syncAED_bus_data).filter(syncAED_factor_data.bus_id == syncAED_bus_data.bus_id).all()
    result = SyncAEDFactorWithLocationData_schemas.dump(query_results)
    print(result)
    return jsonify({'results' : result})


@app.route('/events')
def chart_data():
    query_results = db.session.query(syncAED_factor_data).all()
    result = SyncAEDFactor_schemas.dump(query_results)
    map_results = db.session.query(syncAED_bus_data).all()
    map_result = SyncBusData_schemas.dump(map_results)
    print(result)
    return jsonify({'results' : result, 'map_results' : map_result})
	
@app.route('/result_events')
def result_chart_data():
    query_results = db.session.query(syncAED_factor_data).all()
    result = SyncAEDFactor_schemas.dump(query_results)
    print(result)
    return jsonify(result)

@app.route('/result_events/<int:id>/')
def result_chart_data_page(id):
    query_results = db.session.query(syncAED_factor_data).all()
    result = SyncAEDFactor_schemas.dump(query_results[id*10:id*10+10])
    print(result)
    return jsonify(result)
	


if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=9002)
