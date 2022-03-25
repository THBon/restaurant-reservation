import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import { previous, next } from "../utils/date-time";
import ReservationsList from "../reservation/reservation-list";
import TablesList from "../tables/tables-list";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  const history = useHistory();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    setTablesError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  //Change date buttons

  const previousDateHandler = () => {
    history.push(`dashboard?date=${previous(date)}`);
  };

  const nextDateHandler = () => {
    history.push(`dashboard?date=${next(date)}`);
  };

  const todayHandler = () => {
    history.push('/');
  };

  return (
    <main className="main">
      <div className="dashboard-header">
        <h1><strong>Restaurant</strong> Dashboard</h1>
        <h3>Reservations for date: {date}</h3>
        <div className="dashboard-buttons">
          <button className="btn mr-2" onClick={() => previousDateHandler(date)}>Previous</button>
          <button className="btn mr-2" onClick={() => todayHandler()}>Today</button>  
          <button className="btn mr-2" onClick={() => nextDateHandler(date)}>Next</button>
        </div>  
      </div>
      <ErrorAlert error={reservationsError} text={"Reservations"} />
      <ReservationsList reservations={reservations} />
      <ErrorAlert error={tablesError} text={"Tables"} />
      <TablesList tables={tables} date={date} loadDashboard={loadDashboard} />
    </main>
  );
}

export default Dashboard;
