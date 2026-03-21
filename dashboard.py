import streamlit as st
import requests
import time
import pandas as pd
from datetime import datetime
import os

st.set_page_config(
    page_title="AquaSmart AI - Control Center",
    page_icon="🛡️",
    layout="wide"
)

st.markdown("""
    <style>
    .main { background-color: #0d1117; }
    .stMetric { 
        background-color: #161b22; 
        border-radius: 15px; 
        padding: 20px; 
        border: 1px solid #30363d;
    }
    div[data-testid="stMetricValue"] { color: #58a6ff; font-family: 'Courier New', monospace; font-weight: bold; }
    h3 { color: #f0f6fc; border-bottom: 2px solid #238636; padding-bottom: 5px; }
    </style>
    """, unsafe_allow_html=True)

header_col1, header_col2 = st.columns([1, 4])
with header_col1:
    if os.path.exists('logo.png'):
        st.image('logo.png', width=130)
with header_col2:
    st.title("🛡️ AquaSmart AI: Mission Control Center")
    st.markdown(f"**System Status:** `Operational` | **Last Sync:** `{datetime.now().strftime('%H:%M:%S')}`")

st.write("---")

FIREBASE_URL = "https://aquasmart-system-default-rtdb.firebaseio.com"
PONDS = ["pond_1", "pond_2", "pond_3"]

placeholder = st.empty()

while True:
    with placeholder.container():
        pond_cols = st.columns(3)
        
        for idx, pond_id in enumerate(PONDS):
            with pond_cols[idx]:
                try:
                
                    resp = requests.get(f"{FIREBASE_URL}/ponds/{pond_id}.json", timeout=5).json()
                    
                    if resp:
                        current = resp.get('current', {})
                        ai_res = resp.get('ai_result', {}).get('current', {})
                        history = resp.get('history', {}).get('readings', {})
                        
                        status = ai_res.get('Status', 'Unknown')
                        header_symbol = "🟢" if "Safe" in status else "🔴" if "Danger" in status else "⚠️"
                        st.subheader(f"{header_symbol} {pond_id.replace('_', ' ').title()}")

                        t_val = current.get('Temperature', 0)
                        t_status = "LOW" if t_val < 25 else "HIGH" if t_val > 30 else "SAFE"
                        
                        ph_val = current.get('PH', 0)
                        ph_status = "ACIDIC" if ph_val < 6.5 else "ALKALINE" if ph_val > 8.5 else "SAFE"
                        
                        nh3_val = current.get('Ammonia', 0)
                        nh3_status = "CRITICAL" if nh3_val > 0.8 else "HIGH" if nh3_val > 0.5 else "SAFE"
                        
                        do_val = current.get('DO', 0)
                        do_status = "LOW" if do_val < 4.2 else "SAFE"

                        m_c1, m_c2 = st.columns(2)
                        m_c1.metric("Temperature", f"{t_val}°C", delta=t_status, delta_color="inverse" if t_status != "SAFE" else "normal")
                        m_c2.metric("pH Balance", f"{ph_val}", delta=ph_status, delta_color="inverse" if ph_status != "SAFE" else "normal")
                        
                        m_c3, m_c4 = st.columns(2)
                        m_c3.metric("Ammonia (NH3)", f"{nh3_val} mg/L", delta=nh3_status, delta_color="inverse" if nh3_val > 0.5 else "normal")
                        m_c4.metric("Oxygen (DO)", f"{do_val} mg/L", delta=do_status, delta_color="inverse" if do_status == "LOW" else "normal")

                        if history:
                            df = pd.DataFrame.from_dict(history, orient='index')
                            df['time'] = pd.to_datetime(df['time'])
                            df = df.sort_values('time').tail(50)
                            
                            df = df.rename(columns={'T': 'Temp', 'pH': 'pH', 'NH3': 'NH3', 'DO': 'DO'})
                            st.line_chart(df.set_index('time')[['Temp', 'pH', 'NH3', 'DO']], height=230)

                            with st.expander("📋 Data Logs & CSV Export"):
                                export_df = df[['time', 'Temp', 'pH', 'NH3', 'DO']].copy()
                                export_df = export_df.sort_values('time', ascending=False)
                                st.dataframe(export_df, width='stretch', hide_index=True)
                                
                                csv_data = export_df.to_csv(index=False).encode('utf-8')
                                st.download_button(
                                    label=f"📥 Export {pond_id} CSV",
                                    data=csv_data,
                                    file_name=f"AquaSmart_{pond_id}.csv",
                                    key=f"btn_{pond_id}_{time.time()}", 
                                    mime="text/csv",
                                )

                        st.info(f"🤖 AI: {ai_res.get('Reason', 'Normal Conditions')}")
                        st.markdown("---")
                    else:
                        st.warning(f"Waiting for {pond_id} data...")

                except Exception as e:
                    st.info(f"🔄 Syncing {pond_id} data stream...")
        
        time.sleep(3)