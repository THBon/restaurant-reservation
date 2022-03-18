import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { clearTable } from "../utils/api";

export default function TablesView({ tables, loadDashboard }) {
    const [finishError, setFinishError] = useState(null);

    //Finish handler
    async function finishHandler(tableId) {
        if (
            window.confirm(
                "Is this table ready for new guest ?"
                )
            ) {
            const abortController = new AbortController();
            setFinishError(null);
            try {
                await clearTable(tableId);
                loadDashboard();
            } catch (err) {
                setFinishError(err) 
            }
            return () => abortController.abort();
        }
    }

    const content = tables.map((table, i) => (
        <div className="table" key={table.table_id}>
            <div className="card-header">{table.table_name}</div>
            <ul className="list-group">
                <li className="list-group-item">Capacity: {table.capacity}</li>
                <li
                    className="list-group-item"
                    data-table-id-status={`${table.table_id}`}
                >
                    Status: {table.reservation_id ? "Occupied" : "Free"}
                </li>
                <div className="card-footer">
                    {(table.reservation_id && (
                        <button
                            type="button"
                            className="btn"
                            data-table-id-finish={`${table.table_id}`}
                            onClick={() => finishHandler(table.table_id, table.reservation_id)}
                        >Finish</button>
                    )) || <p className="no-buttons"></p>}
                </div>
            </ul>
        </div>
    ));

    return(
        <>
            {finishError && (
                <div>
                    <ErrorAlert error={finishError} />
                </div>
            )}
            {tables.length !== 0 && (
                <>
                    <div className="tables-header">
                        <h3>Tables</h3>
                    </div>
                    <div className="tables-list">{content}</div>
                </>
            )}
        </>
    );
}