import { React, useState } from "react";
import { updateStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import "./reservation-list.css";
export default function ListReservations({ reservations }) {
    const [cancelError, setCancelError] = useState(null);

    //Cancel a specific reservation in the list
    async function cancelHandler(reservationId) {
        if (window.confirm("Cancel this reservation?")) {
            const abortController = new AbortController();
            setCancelError(null);
            
            try {
                await updateStatus(reservationId);
                window.location.reload();
            } catch (error) {
                setCancelError(error);
            }
            return () => abortController.abort();
        }
    }

    const reservationList = reservations.map((reservation, index) => (
        <div className="reservation" key={reservation.reservation_id}>
            <div className="card-header">
                {reservation.first_name} {reservation.last_name}
            </div>
            <ul className="list-group">
                <li className="list-group-item">
                    Reservation Date: {reservation.reservation_date}
                </li>
                <li className="list-group-item">
                    Reservation Time: {reservation.reservation_time}    
                </li>
                <li className="list-group-item">
                    Phone Number: {reservation.mobile_number}
                </li>
                <li className="list-group-item">
                    People: {reservation.people}    
                </li>
                <li className="list-group-item" data-reservation-id-status={reservation.reservation_id}>
                    Status: {reservation.status}{' '}
                </li>
                <div className="list-group-item card-footer">
                {(reservation.status === "booked" && (
                    <>
                        <a href={`/reservations/${reservation.reservation_id}/seat`}>
                            <button type="button" className="btn">
                                Seat    
                            </button>    
                        </a>
                        <a href={`/reservations/${reservation.reservation_id}/edit`}>
                            <button type="button" className="btn">
                                Edit    
                            </button>    
                        </a>
                        <button
                            data-reservation-id-cancel={reservation.reservation_id}
                            type="button"
                            className="btn"
                            onClick={() => cancelHandler(reservation.reservation_id)}
                        >Cancel</button>
                    </>
                )) || <p className="no-buttons"></p>}
                </div>
            </ul>
        </div>
    ));

    return (
        <>
            {cancelError && (
                <div>
                    <ErrorAlert error={cancelError} />
                </div>
            )}
            <div className="reservation-list">{reservationList}</div>
        </>
    );
};