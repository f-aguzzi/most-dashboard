import streamlit as st
import folium
from streamlit_folium import st_folium
import pandas as pd
import requests

st.title("MOST Dashboard")

API_URL="http://fastapi-most:8000"

if 'distance' not in st.session_state:
    st.session_state['distance'] = 150
if 'seats' not in st.session_state:
    st.session_state['seats'] = 30

# Add flight routes
def make_routes(routes):
    m = folium.Map(location=[50, 18], zoom_start=4)

    # Collect all route coordinates
    all_routes = []
    for index, row in routes.iterrows():
        route = [[row['Dep_apt_lat'], row['Dep_apt_lon']],
                [row['Arr_apt_lat'], row['Arr_apt_lon']]]
        all_routes.append(route)

    # Add all routes as a single multi-line
    folium.PolyLine(
        locations=all_routes,
        color='blue',
        weight=2,
        opacity=0.8
    ).add_to(m)
    return m

# Columns
col1, col2 = st.columns([0.2,0.8])

with col1:
    distance = st.slider("Autonomia", min_value=0, max_value=500, value=150, step=1)
    seats = st.slider("Passeggeri", min_value=1, max_value = 100, value=30, step=1)
    if st.button("Cerca"):
        st.session_state["distance"] = distance
        st.session_state["seats"] = seats

        data = requests.get(f"{API_URL}/routes_by?distance={st.session_state['distance']}&seats={st.session_state['seats']}").json()
        st.session_state["routes"] = pd.DataFrame(data)

        st.session_state["m"] = make_routes(st.session_state["routes"])

with col2:
    # Display in Streamlit
    if "m" in st.session_state:
        st_folium(st.session_state["m"], width=700, height=500)
