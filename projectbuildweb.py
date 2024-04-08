from dataclasses import dataclass
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.responses import FileResponse
from sklearn.cluster import KMeans
import sqlalchemy
from sqlalchemy import create_engine
import plotly.graph_objects as go
import mysql.connector
import numpy as np
import os
import pandas as pd
import plotly.express as px
import petl as etl
from petl import cutout, look,fromdb, head, appenddb,rename,duplicates
import geopy.distance 
import random
import uvicorn
from fastapi.responses import RedirectResponse
from typing import List
import shutil
import pymysql.cursors
import pymysql
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
import secrets
from passlib.context import CryptContext
from passlib.hash import bcrypt
import bcrypt
import plotly.express as px

custom_color_scale = [
    (0, 'blue'),    # Start color
    (0.5, 'green'),   # Middle color
    (1, 'red')    # End color
]

if not os.path.exists("./src/assets"):
    os.mkdir("./src/assets")



## DATABASE CREDENTIALS ##
db_user = 'root'
db_password = 'hSx13Qsyr2cG'

app = FastAPI()

db_host = 'localhost'
db_user = 'root'
db_password = 'hSx13Qsyr2cG'
db_name = 'build'

SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def authenticate_user(buser_email: str, buser_password: str):
    # Authenticate the user against your database
    connection = mysql.connector.connect(user='root', password='hSx13Qsyr2cG', host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = connection.cursor()
    cursor.execute("SELECT buser_password FROM build_user WHERE buser_email = %s", (buser_email,))
    user = cursor.fetchone()

    if user:
        return user[0]


# Login endpoint
@app.post("/login/{buser_email} {buser_password}")
async def login(buser_email: str, buser_password: str):
    # Authenticate user
    hashed_password = authenticate_user(buser_email, buser_password)
    

    if not hashed_password:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    print(hashed_password)
    
    print(bcrypt.checkpw(buser_password.encode('utf-8'), hashed_password.encode('utf-8')))
    # Compare hashed password with the provided password
    if bcrypt.checkpw(buser_password.encode('utf-8'), hashed_password.encode('utf-8')):
        # Create access token or session token here
        # (Add your token creation logic here)
        return {"message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Incorrect email or password")


#PROCTECTIONS TOKEN HASNT BEEN ADDED THIS IS JUST AN EXAMPLE
# Protected endpoint
@app.get("/protected")
async def protected_data(token: str = Depends(oauth2_scheme)):
    try:
        # Verify the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # If token is valid, return protected data
        return {"message": "This is protected data"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")



def rename_column(table, old_column_name, new_column_name):
    if old_column_name in table.columns:
        table.rename(columns={old_column_name: new_column_name}, inplace=True)
    return table

def remove_column(table, column_name):
    if column_name in table.columns:
        table.drop(columns=[column_name], inplace=True)
    return table

def merge_tables(table1_name, table2_name, key, db_host, db_user, db_password, db_name):
    # Connect to the database
    connection = pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        db=db_name,
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            # Construct the SQL query to merge the tables
            merge_query = f"""
                SELECT * 
                FROM {table1_name} t1
                JOIN {table2_name} t2 ON t1.{key} = t2.{key}
            """
            # Execute the SQL query
            cursor.execute(merge_query)
            # Fetch the results into a dictionary
            merged_data = cursor.fetchall()

    finally:
        # Close the database connection
        connection.close()

    return merged_data

def remove_duplicates(table, key):
    table.drop_duplicates(subset=key, inplace=True)
    return table


from sqlalchemy import create_engine

def upload_merged_table_to_database(df, db_host, db_user, db_password, db_name):
    try:
        # Create a SQLAlchemy engine
        engine = create_engine(f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}")

        # Upload the DataFrame to the database
        df.to_sql(name='merged_tables', con=engine, if_exists='replace', index=False)

        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}



def upload_to_databasey(df, db_hostf, db_userf, db_passwordf, db_namef, table_name):
    # Connect to the database
    connection = pymysql.connect(
        host=db_hostf,
        user=db_userf,
        password=db_passwordf,
        db=db_namef,
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            # Check if the table already exists
            table_exists = cursor.execute("SHOW TABLES LIKE %s", (table_name,))
            if table_exists:
                new_table_name = input("The table already exists. Please enter another name: ")
                return upload_to_databasey(df, db_host, db_user, db_password, db_name, table_name=new_table_name)

            # Create a table with the same columns as the DataFrame
            create_table_query = """ 
            CREATE TABLE IF NOT EXISTS `{}` (
                {}
            )
            """.format(table_name, ', '.join([f'`{column}` VARCHAR(255)' for column in df.columns]))
            cursor.execute(create_table_query)

            # Insert data into the table
            for _, row in df.iterrows():
                insert_query = """
                INSERT INTO {} ({})
                VALUES ({})
                """.format(table_name, ', '.join(df.columns), ', '.join(['%s' for _ in df.columns]))
                cursor.execute(insert_query, tuple(row))

        # Commit changes to the database
        connection.commit()

    finally:
        # Close the database connection
        connection.close()



def table_exists(cursor, table_name):
    # Check if the table already exists
    cursor.execute("SHOW TABLES LIKE %s", (f"{table_name}",))
    return cursor.fetchone() is not None

def get_table_data(table_name, db_host, db_user, db_password, db_name):
    # Connect to the database
    connection = pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        db=db_name,
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        # Execute a SELECT query to fetch data from the specified table
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name}")
            result = cursor.fetchall()

            # Convert the fetched data into a DataFrame
            df = pd.DataFrame(result)
            
    finally:
        # Close the database connection
        connection.close()

    return df


origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

## DATA
dataMun: any
dataCrimeBars: any
datCrimeMap: any
dataTransport: any

class LocationPredictionRequest(BaseModel):
    features: List[float]


class Credentials(BaseModel):
    username: str
    password: str

@app.post('/cleanData')
async def cleanData(
    file: UploadFile = File(...),
    rename_column_old: str = Form(None),
    rename_column_new: str = Form(None),
    remove_column_name: str = Form(None),
    merge_key: str = Form(None),
    remove_duplicates_key: str = Form(None),
    table_name: str = Form(None),  # Default table name if not provided
    db_host: str = Form('localhost'),
    db_user: str = Form('root'),
    db_password: str = Form('hSx13Qsyr2cG'),
    db_name: str = Form('build'),
    table1_name: str = Form(None),  # Name of the first table to merge
    table2_name: str = Form(None), 
):
    # Temporary file to save the uploaded file


    if table1_name and table2_name and merge_key:
        # Merge the tables from the database
        merged_data = merge_tables(table1_name, table2_name, merge_key, db_host, db_user, db_password, db_name)
        # Convert merged data to DataFrame
        df = pd.DataFrame(merged_data)
        print("in the merge", df)
        upload_merged_table_to_database(df, db_host, db_user, db_password, db_name)
    
    
        with open('uploaded_file.csv', 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Try reading the CSV file with different encodings
        encodings = ['utf-8', 'latin1', 'ISO-8859-1']
        for encoding in encodings:
            try:
                # Read the CSV file into a DataFrame
                df = pd.read_csv('uploaded_file.csv', encoding=encoding)
                break  # Break the loop if reading succeeds
            except UnicodeDecodeError:
                continue  # Try the next encoding if reading fails

        if rename_column_old and rename_column_new:
            df = rename_column(df, rename_column_old, rename_column_new)
        if remove_column_name:
            df = remove_column(df, remove_column_name)

        print(df)

        # Save the cleaned DataFrame to a new CSV file
        df.to_csv('cleaned_file.csv', index=False)

        # Determine the table name
        if table_name is None:
            table_name = 'clean_data'  # Default table name if not provided

        # Upload the cleaned data to the database
        upload_to_databasey(df, db_host, db_user, db_password, db_name, table_name)

    return {'success': True}






@app.get('/fetchNearbyHotels/{lng}/{lat}')
async def get_nearby_hotels(lng: float, lat: float):
    
        # Connect to MySQL database
        connection = mysql.connector.connect(
            user=db_user, password=db_password, host='localhost', database='build', auth_plugin='mysql_native_password'
        )

        # Execute SQL query to fetch nearby hotels based on coordinates
        cursor = connection.cursor()
        cursor.execute(f"SELECT `Nombre de la Unidad Económica` FROM build.hoteles WHERE ABS(Latitud - {lat}) <= 0.05 AND ABS(Longitud - {lng}) <= 0.05  LIMIT 10")
        hotels_data = cursor.fetchall()
        
        if not hotels_data:
            raise HTTPException(status_code=404, detail="No nearby hotels found")
        

        return hotels_data

@app.get('/predictZone/{longitud}/{latitud}')
async def predictZone(longitud: float = -103.36882906094334 , latitud: float=20.672960406343122):
    #longitud = float(longitud)
    #latitud = float(latitud)
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                            host='localhost', database='build', auth_plugin='mysql_native_password')

    #Clusterizacion de crimenes
    cursor = conexion.cursor()
    cursor.execute(f"SELECT CrimeLongitudID, Latitud FROM build.delito_por_zona")

    crime_data = cursor.fetchall()
    crime_data = list(zip(*crime_data))

    conexion.commit()

    crime_df = pd.DataFrame({'Latitud':crime_data[1], 'Longitud':crime_data[0]})
    crime_df["Latitud"] = pd.to_numeric(crime_df["Latitud"])
    crime_df["Longitud"] = pd.to_numeric(crime_df["Longitud"])

    kmeans = KMeans(n_clusters = 100, init ='k-means++', tol=0)
    crime_df = crime_df.dropna()
    kmeans.fit(crime_df[crime_df.columns[0:2]]) # Compute k-means clustering.
    crime_centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, crime_counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)

    crime_result = pd.DataFrame({'Latitud':crime_centers[:,0], 'Longitud':crime_centers[:,1], 'Incidencias':crime_counts})



     #Clusterizacion de farmacias
    cursor = conexion.cursor()
    cursor.execute(f"SELECT Longitud, Latitud FROM build.farmacias;")

    farm_data = cursor.fetchall()
    farm_data = list(zip(*farm_data))

    conexion.commit()

    farm_df = pd.DataFrame({'Latitud':farm_data[1], 'Longitud':farm_data[0]})
    farm_df["Latitud"] = pd.to_numeric(farm_df["Latitud"])
    farm_df["Longitud"] = pd.to_numeric(farm_df["Longitud"])
    farm_df = farm_df.dropna()

    kmeans = KMeans(n_clusters = 100, init ='k-means++', tol=0)
    kmeans.fit(farm_df[farm_df.columns[0:2]]) # Compute k-means clustering.

    farm_centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, farm_counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)

    farm_result = pd.DataFrame({'Latitud':farm_centers[:,0], 'Longitud':farm_centers[:,1], 'Farmacias':farm_counts}) 
    


     #Clusterizacion de hospitales
    cursor = conexion.cursor()
    cursor.execute(f"SELECT Longitud, Latitud FROM build.hospitales;")

    hosp_data = cursor.fetchall()
    hosp_data = list(zip(*hosp_data))

    conexion.commit()

    hosp_df = pd.DataFrame({'Latitud':hosp_data[1], 'Longitud':hosp_data[0]})
    hosp_df["Latitud"] = pd.to_numeric(hosp_df["Latitud"])
    hosp_df["Longitud"] = pd.to_numeric(hosp_df["Longitud"])
    hosp_df = hosp_df.dropna()

    kmeans = KMeans(n_clusters = 100, init ='k-means++', tol=0)
    kmeans.fit(hosp_df[hosp_df.columns[0:2]]) # Compute k-means clustering.

    hosp_centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, hosp_counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)

    hosp_result = pd.DataFrame({'Latitud':hosp_centers[:,0], 'Longitud':hosp_centers[:,1], 'Hospitales':hosp_counts}) 


   

    #Clusterizacion de police stations
    cursor = conexion.cursor()
    cursor.execute(f"SELECT Longitud, Latitud FROM build.estaciones_de_policia;")

    poli_data = cursor.fetchall()
    poli_data = list(zip(*poli_data))

    conexion.commit()

    poli_df = pd.DataFrame({'Latitud':poli_data[1], 'Longitud':poli_data[0]})
    poli_df["Latitud"] = pd.to_numeric(poli_df["Latitud"])
    poli_df["Longitud"] = pd.to_numeric(poli_df["Longitud"])
    poli_df = poli_df.dropna()

    kmeans = KMeans(n_clusters = 30, init ='k-means++', tol=0)
    kmeans.fit(poli_df[poli_df.columns[0:2]]) # Compute k-means clustering.

    poli_centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, poli_counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)

    poli_result = pd.DataFrame({'Latitud':poli_centers[:,0], 'Longitud':poli_centers[:,1], 'Policia':poli_counts}) 


    #Clusterizacion de hoteles
    cursor = conexion.cursor()
    cursor.execute(f"SELECT Longitud, Latitud FROM build.hoteles;")

    hot_data = cursor.fetchall()
    hot_data = list(zip(*hot_data))

    conexion.commit()

    hot_df = pd.DataFrame({'Latitud':hot_data[1], 'Longitud':hot_data[0]})
    hot_df["Latitud"] = pd.to_numeric(hot_df["Latitud"])
    hot_df["Longitud"] = pd.to_numeric(hot_df["Longitud"])
    hot_df = hot_df.dropna()

    kmeans = KMeans(n_clusters = 100, init ='k-means++', tol=0)
    kmeans.fit(hot_df[hot_df.columns[0:2]]) # Compute k-means clustering.

    hot_centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, hot_counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)

    hot_result = pd.DataFrame({'Latitud':hot_centers[:,0], 'Longitud':hot_centers[:,1], 'Hoteles':hot_counts})                                           
       
    is_running = True
    while is_running:
        coords_original = (latitud, longitud)
        
        #Obtener indice de crimenes
        max_crimes = crime_result["Incidencias"].max()
        crime_index = 0
        for index, row in crime_result.iterrows():
            coords_temp = (row['Latitud'], row['Longitud'])
            if geopy.distance.geodesic(coords_original, coords_temp).km < 3:
                crime_index += row['Incidencias']
        
        crime_index /= max_crimes

        #Obtener indice de Farmacias
        max_farm = farm_result["Farmacias"].max()
        farm_index = 0
        for index, row in farm_result.iterrows():
            coords_temp = (row['Latitud'], row['Longitud'])
            if geopy.distance.geodesic(coords_original, coords_temp).km < 3:
                farm_index += row['Farmacias']
        
        farm_index /= max_farm

        #Obtener indice de hospitales
        max_hosp = hosp_result["Hospitales"].max()
        hosp_index = 0
        for index, row in hosp_result.iterrows():
            coords_temp = (row['Latitud'], row['Longitud'])
            if geopy.distance.geodesic(coords_original, coords_temp).km < 3:
                hosp_index += row['Hospitales']
        
        hosp_index /= max_hosp

        #Obtener indice de poli
        max_poli = poli_result["Policia"].max()
        poli_index = 0
        for index, row in poli_result.iterrows():
            coords_temp = (row['Latitud'], row['Longitud'])
            if geopy.distance.geodesic(coords_original, coords_temp).km < 3:
                poli_index += row['Policia']
        
        poli_index /= max_poli

        #Obtener indice de hoteles
        max_hot = hot_result["Hoteles"].max()
        hot_index = 0
        for index, row in hot_result.iterrows():
            coords_temp = (row['Latitud'], row['Longitud'])
            if geopy.distance.geodesic(coords_original, coords_temp).km < 3:
                hot_index += row['Hoteles']
        
        hot_index /= max_hot

        
        #total_index = 1 + hosp_index - (crime_index * 2) - (farm_index * 0.5) - (police_index * 0.5) - (hotel_index * 0.9)
        total_index = 1 + (hosp_index) - (crime_index * 5) + (farm_index) + (poli_index)


        if total_index < 0:
            print(total_index)
            movement = random.randint(1, 9)
            if (movement % 2) == 0:
                latitud -= movement/1000
                longitud -= movement/1000
            else:
                latitud += movement/1000
                longitud += movement/1000
        else:
            total_rsult = {
                "latitud":latitud,
                "longitud":longitud,
                "crimeIndex":crime_index,
                "farmaciasIndex":farm_index,
                "hospitalesIndex":hosp_index,
                "policiaIndex":poli_index,
                "hotelesIndex":hot_index,
                "totalIndex":total_index
            }
        
            return total_rsult


@app.get('/crimeBars/{municipio}')
async def getCrimeBars(municipio: str):

    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                       host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT colonia, COUNT(*) as crimenes FROM build.delito_por_zona  WHERE NombreDeMunicipio = '{municipio}' group by colonia order by crimenes limit 40;")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    fig = px.bar({"Colonia": data[0], "Crimenes": data[1]}, x="Colonia",
                 y="Crimenes", title=f"Colonias más seguras de {municipio}")
    fig.update_layout(
        font=dict(
            size=14
        )
    )

    fig.write_image("./src/assets/crimebarsMun.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/crimebarsMun.png")



@app.get('/crimeMap')
async def getCrimeBars():
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT CrimeLongitudID, Latitud FROM build.delito_por_zona")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[1], 'Longitud':data[0]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 100, init ='k-means++')
    print("AQUIiiiIIIIIIIIIIIIIs")
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Incidetes':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Incidetes", size="Incidetes", color_continuous_scale=px.colors.diverging.Spectral, zoom=7, title="Cantidad de crímenes por zona")
    fig.write_image("./src/assets/allcrimemap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/allcrimemap.png")


    
@app.get('/publicTransportZMG')
async def getCimeBars():
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT * FROM build.paradasdecamion;")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'ID':data[0], 'Latitud':data[1], 'Longitud':data[2]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 15, init ='k-means++')
    kmeans.fit(df[df.columns[1:3]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)

    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Puntos de acceso':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Puntos de acceso", size="Puntos de acceso", color_continuous_scale=px.colors.diverging.Spectral, zoom=9.5, title="Zonas con mayor acceso a transporte público")
    fig.write_image("./src/assets/ptmap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/ptmap.png")

@app.get('/businessMap')
async def getBusinessMap():
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT latitud, longitud FROM build.businesses")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[0], 'Longitud':data[1]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 100, init ='k-means++')
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Incidetes':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Incidetes", size="Incidetes", color_continuous_scale=px.colors.diverging.Picnic, zoom=7, title="Cantidad negocios por zona")
    fig.write_image("./src/assets/allbussinesmap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/allbussinesmap.png")

@app.get('/hospitalMap')
async def getBusinessMap():
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT Latitud, Longitud FROM build.hospitales")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[0], 'Longitud':data[1]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 15, init ='k-means++')
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Cantidad':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Cantidad", size="Cantidad", color_continuous_scale=px.colors.diverging.Picnic, zoom=7, title="Cantidad de hospitales por zona")
    fig.write_image("./src/assets/allhospitalsmap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/allhospitalsmap.png")

@app.get('/pharmacyMap')
async def getPharmacyMap():
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT Latitud, Longitud FROM build.farmacias")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[0], 'Longitud':data[1]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 100, init ='k-means++')
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Incidetes':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Incidetes", size="Incidetes", color_continuous_scale=px.colors.diverging.Picnic, zoom=7, title="Cantidad de farmacias por zona")
    fig.write_image("./src/assets/allpharmacymap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/allpharmacymap.png")


@app.get('/hotelMap')
async def getHotelMap():
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT Latitud, Longitud FROM build.hoteles")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[0], 'Longitud':data[1]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 100, init ='k-means++')
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Incidetes':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Incidetes", size="Incidetes", color_continuous_scale=px.colors.diverging.Picnic, zoom=7, title="Cantidad de hoteles por zona")
    fig.write_image("./src/assets/allhotelmap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/allhotelmap.png")

@app.get('/policeMap')
async def getPoliceMap():
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT Latitud, Longitud FROM build.estaciones_de_policia")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[0], 'Longitud':data[1]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 15, init ='k-means++')
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Cantidad':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Cantidad", size="Cantidad", color_continuous_scale=px.colors.diverging.Picnic, zoom=7, title="Cantidad de estaciones de polica por zona")
    fig.write_image("./src/assets/allpolicemap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/allpolicemap.png")

@app.get('/businessMap/{municipio}')
async def getBusinessMap(municipio: str):
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT latitud, longitud FROM build.businesses WHERE municipio ='{municipio}'")

    data = cursor.fetchall()
    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[0], 'Longitud':data[1]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 30, init ='k-means++')
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Incidetes':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Incidetes", size="Incidetes", color_continuous_scale=px.colors.diverging.Picnic, zoom=9.5, title=f"Cantidad de negocios en {municipio}")
    fig.write_image("./src/assets/bussinesmap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/bussinesmap.png")

@app.get('/crimeMap/{municipio}')
async def getCimeBars(municipio: str):
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT CrimeLongitudID, Latitud FROM build.delito_por_zona WHERE NombreDeMunicipio='{municipio}'")

    data = cursor.fetchall()

    if not data:
        # Handle case where no data is returned
        return "No crime data found for this municipality"

    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[1], 'Longitud':data[0]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 30, init ='k-means++')
    print("AQUIiiiIIIIIIIIIIIIIs")
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Incidetes':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Incidetes", size="Incidetes", color_continuous_scale=px.colors.diverging.Spectral, zoom=9.5, title=f"Cantidad de crímenes en {municipio}")
    fig.write_image("./src/assets/crimemap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/crimemap.png")




@app.get('/hotelMapByZone/{municipio}')
async def hotelMap(municipio: str):
    conexion = mysql.connector.connect(user=db_user, password=db_password,
                                        host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute(
        f"SELECT  Longitud, Latitud FROM build.hoteles WHERE Municipio='{municipio}'")

    data = cursor.fetchall()

    if not data:
        # Handle case where no data is returned
        return "No crime data found for this municipality"

    data = list(zip(*data))

    conexion.commit()

    df = pd.DataFrame({'Latitud':data[1], 'Longitud':data[0]})

    df["Latitud"] = pd.to_numeric(df["Latitud"])
    df["Longitud"] = pd.to_numeric(df["Longitud"])

    kmeans = KMeans(n_clusters = 4, init ='k-means++')
    print("AQUIiiiIIIIIIIIIIIIIs")
    df = df.dropna()
    print(df[df.columns[0:2]])
    kmeans.fit(df[df.columns[0:2]]) # Compute k-means clustering.

    centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
    db1_labels = kmeans.labels_
    labels, counts = np.unique(db1_labels[db1_labels>=0], return_counts=True)


    result = pd.DataFrame({'Latitud':centers[:,0], 'Longitud':centers[:,1], 'Hotels':counts, 'Label':list(range(1, len(counts)+1))})

    px.set_mapbox_access_token("pk.eyJ1IjoiYW5kLW1vbCIsImEiOiJjbGI3MTJqcmwwNmYzM3VwOTd5NWtxeTZlIn0.l4q0owDO-L1SRTUN7z16VQ")

    fig = px.scatter_mapbox(result, lat="Latitud", lon="Longitud", color="Hotels", size="Hotels", color_continuous_scale=px.colors.diverging.Spectral, zoom=9.5, title=f"Cantidad de hoteles en {municipio}")
    fig.write_image("./src/assets/hotelmap.png", width=1200, height=800, scale=1)
    return FileResponse("./src/assets/hotelmap.png")


#ADDED CODE FROM ME, REGISTERING USer
@app.put('/addBuildUser/{first_name}/{buser_email}/{buser_password}')
def addActor(first_name:str, buser_email:str, buser_password:str):
    # Hash the password
    hashed_password = bcrypt.hashpw(buser_password.encode('utf-8'), bcrypt.gensalt())

    # Insert the hashed password into the database
    conexion = mysql.connector.connect(user='root', password='hSx13Qsyr2cG', host='localhost', database='build', auth_plugin='mysql_native_password')
    cursor = conexion.cursor()
    cursor.execute("INSERT INTO build_user(first_name, buser_email, buser_password, last_update) VALUES (%s, %s, %s, now())", (first_name, buser_email, hashed_password))
    conexion.commit()
    return {'message': 'Registro agregado'}

#LOGIN REGULAR USER


#ADMIN DELETE DB TABLES
@app.get('/builddb')
async def viewTables():
    try:
        connection = mysql.connector.connect(user='root', password='hSx13Qsyr2cG', host='localhost', database='build', auth_plugin='mysql_native_password')
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]

        return {'tables': tables}

    except Exception as e:
        return {"error": str(e)}

    finally:
        # Close the cursor and connection
        cursor.close()
        connection.close()

@app.post('/builddb/delete/{table_name}')
async def deleteTable(table_name:str):
    try:
        connection = mysql.connector.connect(user='root', password='hSx13Qsyr2cG', host='localhost', database='build', auth_plugin='mysql_native_password')
        cursor = connection.cursor()
        
        if table_name:
            cursor.execute(f"DROP TABLE {table_name}")
            connection.commit()
            return {"success": True}
        else:
            return {"success": False, "error": "Table does not exist"}

    except Exception as e:
        return {"error": str(e)}

    finally:
        # Close the cursor and connection
        cursor.close()
        connection.close()


@app.post("/upload_to_database")
async def upload_to_database(file: UploadFile = File(...)):
    try:
        # Temporary file to save the uploaded file
        with open('uploaded_file.csv', 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Try reading the CSV file into a DataFrame
        df = pd.read_csv('uploaded_file.csv')

        # Connect to the database
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='hSx13Qsyr2cG',
            db='build',
            cursorclass=pymysql.cursors.DictCursor
        )

        # Check if the table exists, if not create it
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES LIKE 'my_data_table'")
            if cursor.fetchone() is None:
                # Table does not exist, create it
                columns = ', '.join([f"{column} VARCHAR(255)" for column in df.columns])
                create_table_query = f"CREATE TABLE my_data_table ({columns})"
                cursor.execute(create_table_query)
                connection.commit()

        # Upload the DataFrame to the database
        df.to_sql(name='my_data_table', con=connection, if_exists='append', index=False)

        # Close the database connection
        connection.close()

        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}