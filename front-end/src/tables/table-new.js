import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import "./table-new.css";

export default function NewTable() {
    const [tableError, setTableError] = useState(null);
    const [table, setTable] = useState({
        table_name: "",
        capacity: "",
    });

    const ref = useRef();

    useEffect(() => {
        ref.current.focus();
    }, []);

    const history = useHistory();

    const submitHandler = (event) => {
        event.preventDefault();
        createTable(table)
            .then(() => history.push(`/dashboard`))
            .catch(setTableError);
    };

    const changeHandler = ({ target: { name, value } }) => {
        //Set value of capacity to Number only
        if (name === "capacity") {
            value = Number(value);
        }
        setTable((original) => ({
            ...original,
            [name]: value,
        }));
    };

    return (
        <div className="new-table">
            <div className="header">
                <h1>New Table</h1>
            </div>
            <form className="table-form mt-3" onSubmit = {submitHandler}>
                <ErrorAlert error = {tableError} />
                <fieldset>
                    <legend>Table Information</legend>
                    <label className = "table-name">
                        Table Name:
                        <input 
                            name="table_name"
                            type="text"
                            minLength="2"
                            value={table.table_name}
                            ref={ref}
                            required
                            onChange={changeHandler}
                        />
                    </label>
                    <br/>
                    <label>
                        Capacity:
                        <input
                            name="capacity"
                            type="number"
                            min="1"
                            value={table.capacity}
                            required
                            onChange={changeHandler}
                        />
                    </label>
                    <br/>
                    <button className="btn" type="submit">Submit</button>
                    <button className="btn" onClick={history.goBack}>Cancel</button>
                </fieldset>
            </form>
        </div>
    );
};