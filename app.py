import json
import random
import time
from datetime import datetime
from random import choice
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask import Flask, Response, render_template, jsonify, request
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.sql import alias
from sqlalchemy import create_engine
# Initializing the app
app = Flask(__name__)
random.seed()  # Initialize the random number generator

# Setup DB marshmallow vars
# db = dbmodule.setup(app)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:password@localhost/postgres"
#app.config['SQLALCHEMY_DATABASE_URI'] = 'syncaed://postgres:password@localhost/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)
print(db)

Base = automap_base()
Base.prepare(db.engine, reflect=True)

# SyncAED tables
syncAED_bus_data = Base.classes.syncAED_bus_data
syncAED_factor_data = Base.classes.syncAED_factor_data
syncAED_bus_edges = Base.classes.syncAED_bus_edges
#syncAED_pmu_localization = Base.classes.syncAED_pmu_localization

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

class SyncAEDBusEdges(ma.Schema):
    class Meta:
        fields = ('id', 'from_bus', 'to_bus', 'from_latitude','from_longitude', 'to_latitude','to_longitude')

SyncAEDBusEdges_schema = SyncAEDBusEdges()
SyncAEDBusEdges_schemas = SyncAEDBusEdges(many=True)

class SyncAEDFactorWithLocationData(ma.Schema):
    class Meta:
        fields = ('id', 'bus_id', 'pmu_id', 'event_date', 'event_time', 'vol_mag', 'vol_angle', 'current_mag', 'current_angle', 'frequency', 'rocof', 'latitude', 'longitude')

SyncAEDFactorWithLocationData_schema = SyncAEDFactorWithLocationData()
SyncAEDFactorWithLocationData_schemas = SyncAEDFactorWithLocationData(many=True)

class SyncAEDBusEdgesWithLocationData(ma.Schema):
    class Meta:
        fields = ('id', 'from_bus', 'to_bus','bus_id', 'bus_name', 'base_kv', 'latitude', 'longitude', 'bus_status', 'v_min', 'v_max')

SyncAEDBusEdgesWithLocationData_schema = SyncAEDBusEdgesWithLocationData()
SyncAEDBusEdgesWithLocationData_schemas = SyncAEDBusEdgesWithLocationData(many=True)

class SyncAEDPmuLocalization(ma.Schema):
    class Meta:
        fields = ('id', 'detected_location', 'pmu1_id','pmu1_bus_id', 'pmu1_norm_score', 'pmu2_id', 'pmu2_bus_id', 'pmu2_norm_score', 'event_date', 'event_time', 'event_type')

SyncAEDPmuLocalization_schema = SyncAEDPmuLocalization()
SyncAEDPmuLocalization_schemas = SyncAEDPmuLocalization(many=True)

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
    result = SyncAEDFactor_schemas.dump(query_results[id*6:id*6+6])
    print(result)
    return jsonify(result)

#@app.route('/pmu_localization/<int:id>/')
#def result_pmu_localization_page(id):
    query_results = db.session.query(syncAED_pmu_localization).all()
    result = SyncAEDPmuLocalization_schemas.dump(query_results[id*9:id*9+9])
    print(result)
    return jsonify(result)

@app.route('/result_events_localization/<int:id>/')
def result_chart_data_page_localization(id):
    query_results = db.session.query(syncAED_factor_data).all()
    result = SyncAEDFactor_schemas.dump(query_results[id*9:id*9+9])
    print(result)
    return jsonify(result)

#@app.route('/result_pmu_localization/<int:id>/')
#def result_pmu_localization(id):
    query_results = db.session.query(syncAED_pmu_localization).all()
    result = SyncAEDPmuLocalization_schemas.dump(query_results[id*9:id*9+9])
    print(result)
    return jsonify(result)
	
@app.route('/main_result_events/<int:id>/')
def main_page(id):
    query_results = db.session.query(syncAED_factor_data).all()
    result = SyncAEDFactor_schemas.dump(query_results[id*5:id*5+5])
    return jsonify(result)
	
@app.route('/result_events/chart_data/<int:id>/')
def result_chart_data_results(id):
    query_results = db.session.query(syncAED_factor_data.id, syncAED_factor_data.vol_mag, syncAED_factor_data.vol_angle, syncAED_factor_data.current_mag, syncAED_factor_data.current_angle, syncAED_factor_data.frequency, syncAED_factor_data.rocof)
    start = 0
    if(id-30>0):
        start = id-30
    result = SyncAEDFactor_schemas.dump(query_results[start:(start+30)])
    print(result)
    return jsonify(result)

@app.route('/main_mapdata')
def main_map_data():
    query_results = db.session.query(syncAED_bus_data.bus_id,syncAED_bus_data.bus_name,syncAED_bus_data.bus_status,syncAED_bus_data.latitude,syncAED_bus_data.longitude)
    result = SyncBusData_schemas.dump(query_results)
    return jsonify(result)

# @app.route('/map_node_locations')
# def nodeLoc_data():
    # query_results = db.session.query(syncAED_bus_data.bus_id,syncAED_factor_data).filter(syncAED_bus_data.bus_id == syncAED_factor_data.bus_id).filter(syncAED_factor_data.vol_mag == "8.001").all()
    # result = SyncAEDFactorWithLocationData_schemas.dump(query_results)
    # print(result)
    # return jsonify({'results' : result})
	
@app.route('/map_edges')
def map_edges():
    query_results = db.session.query(syncAED_bus_edges).all()
    result = SyncAEDBusEdges_schemas.dump(query_results)
    print(result)
    return jsonify(result)

#@app.route('/pmu_localization')
#def pmu_localization():
    query_results = db.session.query(syncAED_pmu_localization).all()
    result = SyncAEDPmuLocalization_schemas.dump(query_results)
    print(result)
    return jsonify(result)
    
# @app.route('/map_node_locations')
# def nodeLoc_data():
    # query_results = db.session.query(syncAED_bus_data.latitude,syncAED_bus_data.longitude,syncAED_bus_edges.from_bus,syncAED_bus_edges.to_bus).filter(syncAED_bus_edges.from_bus == syncAED_bus_data.bus_id ).all()
    # query_results2 = db.session.query(syncAED_bus_data.latitude,syncAED_bus_data.longitude,syncAED_bus_edges.from_bus,syncAED_bus_edges.to_bus).filter(syncAED_bus_edges.to_bus == syncAED_bus_data.bus_id ).all()
    # print(query_results[0].from_bus)
    # arr = [0 for i in range(len(query_results))]
    # for i in range(len(query_results)):
        # arr[i] = 'x : '+query_results[i].latitude
    # print(jsonify(arr))
    # new_list = query_results[1:3]+query_results2[1:3]	
    # result = SyncAEDBusEdgesWithLocationData_schemas.dump(new_list)
    # print(result)
    # return jsonify(arr)
	
if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=9002)
