import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { updateTable, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

export default function SeatTable() {
    const [tables, setTables] = useState([]);
    const [tableError, setTableError] = useState(null);
    const [selectValue, setSelectValue] = useState('');

    useEffect(loadTables, []);

    function loadTables() {
        const abortController = new AbortController();
        setTableError(null);
        listTables(abortController.signal)
            .then(setTables)
            .catch(setTableError)
        return () => abortController.abort();
    }

    const history = useHistory();
    const params = useParams();

    const resId = Number(params.reservationId);

    const submitHandler = (event) => {
        event.preventDefault();
        updateTable(resId, Number(selectValue.table_id))
            .then(() => history.push('/dashboard'))
            .catch(setTableError);
    };

    function changeHandler({ target: {name, value } }) {
        setSelectValue((previousValue) => ({
            ...previousValue,
            [name]: value,
        }));
    }

    const options = tables.map((table, id) => (
        <option value={table.table_id} key={id}>
            {`${table.table_name} - ${table.capacity}`}
        </option>
    ));

    return(
        <div>
            <div className="header">
                <h1>Seat Reservation</h1>
            </div>
            <ErrorAlert error={tableError}/>
            <div>
                <form onSubmit={submitHandler}>
                    <fieldset>
                        <legend>Select a table to seat this reservation</legend>
                        <label>
                            Table Name - Table Capacity
                            <select name="table_id" required onChange={changeHandler}>
                                <option value=""></option>
                                {options}
                            </select>
                        </label>
                        <br/>
                        <button type="submit" className="btn">Submit</button>
                        <button type="button" className="btn" onClick={history.goBack}>Cancel</button>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}