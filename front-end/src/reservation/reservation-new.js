import React, { useState, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { createReservation, readReservation, updateReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";


//Creating a new reservation
export default function NewReservation() {
    let [reservationError, setReservationError] = useState(null)
    let [reservation, setReservation] = useState({
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
        status: "Booked",
    });

    const history = useHistory();
    const params = useParams();
    const reservationId = params.reservationId;
    const date = new Date();
    const ref = useRef();

    //Format time WIP
    const mainTime = Math.floor(date.getTimezoneOffset());


    useEffect(() => {
        ref.current.focus();
        async function loadReservation() {
            const abortController = new AbortController();
            setReservationError(null);
            try {
                if(reservationId) {
                    const originalReservation = await readReservation(
                        reservationId,
                        abortController.signal
                    );
                    setReservation(originalReservation);
                }
            } catch (error) {
                setReservationError(error);
            }
            return () => abortController.abort();
        }
        loadReservation();
    }, [reservationId]);

    //Handle changes in form
    function changeHandler({ target: {name, value } }) {
        if (name === 'people') {
            value = Number(value);
        }
        setReservation((original) => ({
            ...original,
            [name]: value,
        }));
    }

    //When cancel button is pressed 
    function cancelHandler(event) {
        event.preventDefault();
        history.goBack();
    }

    //When submit button is pressed
    async function submitHandler(event) {
        event.preventDefault();
        try {
            if(reservationId) {
              await updateReservation(reservation, mainTime);
              history.push(`/dashboard?date=${reservation.reservation_date}`);
            } else {
                await createReservation(reservation, mainTime);
                history.push(`/dashboard?date=${reservation.reservation_date}`);
            }
        } catch (error) {
            setReservationError(error);
        }
    }
    //Left off here, resume here with defining API
    return (
        <div>
            <div className="header">
                <h1>New Reservation</h1>
            </div>
            <form onSubmit={submitHandler}>
                <ErrorAlert error={reservationError} />
                <fieldset>
                    <legend>Customer Information:</legend>
                    <label>
                        First Name:
                        <input
                            name="first_name"
                            type="text"
                            required
                            value={reservation.first_name}
                            ref={ref}
                            onChange={changeHandler}
                        />
                    </label>
                    <label>
                        Last Name:
                        <input 
                            name="last_name"
                            type="text"
                            required
                            value={reservation.last_name}
                            onChange={changeHandler}
                        />
                    </label>
                    <br/>
                    <label>
                        Mobile Number:
                        <input 
                            name="mobile_number"
                            type="tel"
                            placeholder="123-456-7890"
                            required
                            value={reservation.mobile_number}
                            onChange={changeHandler}
                        />
                    </label>
                </fieldset>
                <br/>
                <fieldset>
                    <legend>Reservation</legend>
                    <label>
                        Reservation Date:
                        <input
                            name="reservation_date"
                            type="date"
                            required
                            value={reservation.reservation_date}
                            onChange={changeHandler}
                        />
                    </label>
                    <label>
                        Reservation Time
                        <input 
                            name="reservation_time"
                            type="time"
                            required
                            value={reservation.reservation_time}
                            onChange={changeHandler}
                        />
                    </label>
                    <br/>
                    <label>
                        Party size:
                        <input 
                            name="people"
                            type="number"
                            min="1"
                            required
                            value={reservation.people}
                            onChange={changeHandler}
                        />
                    </label>
                </fieldset>
                <br/>
                <div className="buttons">
                    <button className="btn" onClick={(event) => cancelHandler(event)}>Cancel</button>
                    <button type="submit" className="btn">Submit</button>
                </div>
            </form>
        </div>
    )
}