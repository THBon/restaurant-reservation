const knex = require("../db/connection");

function create(reservation) {
    return knex('reservations')
        .insert(reservation)
        .returning('*')
        .then((createdRecord) => createdRecord[0]);
}

function read(reservation_Id) {
    return knex('reservations')
        .select('*')
        .where({ reservation_id: reservation_Id })
        .first();
}

function update(updatedReservation) {
    return knex('reservations')
        .select('*')
        .where({ reservation_id: updatedReservation.reservation_id })
        .update(updatedReservation, '*')
        .then((updatedReservation) => updatedReservation[0]);
}

function listByDate(date) {
    return knex('reservations')
        .select('*')
        .where({ reservation_date: date })
        .whereNot({ status: 'finished' })
        .whereNot({ status: 'cancelled' })
        .orderBy('reservation_time');
}

function list() {
    return knex('reservations').select('*').orderBy('reservation_date');
}

function updateStatus(reservation_Id, status) {
    return knex('reservations')
        .where({ reservation_id: reservation_Id })
        .update({ status: status })
        .then(() => read(reservation_Id));
}

function search(mobile_number) {
    return knex('reservations')
        .whereRaw(
            "translate(mobile_number, '() -', '') like ?",
            `%${mobile_number.replace(/\D/g, '')}%`
        )
        .orderBy('reservation_date');
}

module.exports = {
    create,
    read,
    update,
    listByDate,
    list,
    updateStatus,
    search,
};