import { React, useState, useEffect, useRef } from "react";
import { listReservations } from "../utils/api";
import ReservationsList from "../reservation/reservation-list";
import ErrorAlert from "../layout/ErrorAlert";
import "./search.css";

export default function Search() {
    const [reservations, setReservations] = useState([]);
    const [reservationsError, setReservationsError] = useState(null);
    const [searched, setSearched] = useState(false);

    const [number, setNumber] = useState({
        mobile_number: "",
    });

    const ref = useRef();

    useEffect(() => {
        ref.current.focus();
    }, []);

    async function submitHandler(event) {
        event.preventDefault();
        const abortController = new AbortController();
        setReservationsError(null);
        setSearched(false);
        try {
            const data = await listReservations(number, abortController.signal);
            setReservations(data);
            setSearched(true); 
        } catch (error) {
            setReservationsError(error);
        }
        return () => abortController.abort();
    }

    function changeHandler({ target: { name, value }}) {
        setNumber((original) => ({
            ...original,
            [name]: value,
        }));
    }

    return (
        <div className="search-reservations">
            <div className="header">
                <h1>Search For A Reservations</h1>
            </div>
            {reservationsError && (
                <div className="reservations-error">
                    <ErrorAlert error={reservationsError} />
                </div>
            )}
            <form className="search-form" onSubmit={submitHandler}>
                <label>
                    Phone number:
                    <input
                        name="mobile_number"
                        type="text"
                        value={number.mobile_number}
                        placeholder="123-456-7890"
                        required
                        ref={ref}
                        onChange={changeHandler}
                    />
                </label>
                <button className="btn" type="submit">
                    Find
                </button>
            </form>

            {reservations.length !== 0 && (
                <div class="search-results">
                    <h5 className="match-header">{reservations.length} that matches:</h5>
                    <ReservationsList reservations={reservations} />
                </div>
            )}

            {searched && reservations.length === 0 ? (
                <h3>No reservations found</h3>
            ) : (
                ''
            )}
        </div>
    );
}