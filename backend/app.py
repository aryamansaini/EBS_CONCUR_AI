from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import oracledb
import pandas as pd
import os
from typing import Optional
import json
from queries import (
   SQL_SUMMARY,
   SQL_TS,
   SQL_LONG_RUNNING,
   SQL_TERMINATED_ROWS,
   SQL_EVENT_BUBBLES
)

# from backend.queries import (
#     SQL_SUMMARY,
#     SQL_TS,
#     SQL_LONG_RUNNING,
#     SQL_TERMINATED_ROWS,
#     SQL_EVENT_BUBBLES
# )


# ---------------- DB Setup ---------------- #
DB_USER = os.getenv("ORACLE_USER", "apps")
DB_PASS = os.getenv("ORACLE_PASS", "apps")
DB_DSN = os.getenv("ORACLE_DSN", "hostname:1521/servicename")

def run_query(sql: str, binds: Optional[dict] = None):
    with oracledb.connect(user=DB_USER, password=DB_PASS, dsn=DB_DSN) as conn:
        cur = conn.cursor()
        cur.execute(sql, binds or {})
        columns = [col[0].lower() for col in cur.description]
        rows = cur.fetchall()
        return pd.DataFrame(rows, columns=columns)

# ---------- Import SQL Queries from your code ----------
from queries import (
    SQL_SUMMARY,
    SQL_TS,
    SQL_LONG_RUNNING,
    SQL_TERMINATED_ROWS
)

app = FastAPI(title="EBS Dashboard API")

# Allow JET frontend to call FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict in prod
    allow_methods=["*"],
    allow_headers=["*"],
)


def df_to_json(df):
    return json.loads(df.to_json(orient="records"))


@app.get("/api/summary")
def get_summary(hours: int = Query(8, ge=1, le=48)):
    df = run_query(SQL_SUMMARY, {"hours": hours})
    return df_to_json(df)


@app.get("/api/trend")
def get_trend(hours: int = Query(8, ge=1, le=48)):
    df = run_query(SQL_TS, {"hours": hours})
    return df_to_json(df)


@app.get("/api/long-running")
def get_long_running():
    df = run_query(SQL_LONG_RUNNING)
    return df_to_json(df)


@app.get("/api/terminated")
def get_terminated(hours: int = Query(8, ge=1, le=48)):
    df = run_query(SQL_TERMINATED_ROWS, {"hours": hours})
    return df_to_json(df)
