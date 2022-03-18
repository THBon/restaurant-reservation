const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const validProperties = ["table_name", "capacity"];

//Validation section

function hasValidProperties(req, res, next) {
    const { data = {} } = req.body;
    validProperties.forEach((property) => {
        if (!data[property]) {
            next({
                status: 400,
                message: `'${property}' is required`
            });
        }
    });
    next();
}

function hasTableName(req, res, next) {
    const { table_name } = req.body.data;
    if (!table_name || table_name === '' || table_name.length < 2) {
        next({
            status: 400,
            message: `The table name must be at least 2 characters.`,
        });
    }
    next();
}

function hasCapacity(req, res, next) {
    const { capacity } = req.body.data;
    if (!capacity || typeof capacity !== 'number' || capacity < 1) {
        next({
            status: 400,
            message: `The table capacity must be at least 1.`,
        });
    }
    next();
}

function hasData(req, res, next) {
    const data = req.body.data;
    if (data) {
        next();
    } else {
        next({
            status: 400,
            message: `Missing data.`,
        });
    }
}

async function resExists(req, res, next) {
    const { reservation_id } = req.body.data;
    if(!reservation_id) {
        next({
            status: 400,
            message: `Reservation Id is required`,
        });
    }
    const reservation = await reservationService.read(reservation_id);
    if (reservation) {
        res.locals.res = reservation;
        next();
    } else {
        next({
            status: 404,
            message: `Reservation id ${reservation_id} not found.`
        });
    }
}

async function tableExists(req, res, next) {
    const table_id = Number(req.params.table_id);
    const table = await service.readTable(table_id);
    if (table) {
        res.locals.table = table;
        next();
    } else {
        next({
            status: 404,
            message: `Table id ${table_id} not found.`,
        });
    }
}

function emptyTable(req, res, next) {
    const occupied = res.locals.table.reservation_id;
    if (occupied) {
        next({
            status: 400,
            message: `Table ${res.locals.table.table_id} is currently occupied.`,
        });
    }
    next();
}

function validateSeated(req, res, next) {
    const { status } = res.locals.res;
    if (status === 'seated') {
        next({
            status: 400,
            message: `This reservation is already seated`,
        });
    }
    next();
}

async function getPeople(req, res, next) {
    const people = res.locals.res.people;
    if(people) {
        res.locals.partySize = people;
        next();
    } else {
        next({
            status: 400,
            message: `There are no people`,
        });
    }
}

function validateTableSeating(req, res, next) {
    const partySize = res.locals.partySize;
    const capacity = res.locals.table.capacity;
    if (partySize > capacity) {
        next({
            status: 400,
            message: `This table is too small for the current party size.`,
        });
    }
    next();
}

async function validateOccupation(req, res, next) {
    const table_id = Number(req.params.table_id);
    const table = await service.readTable(table_id);

    if (table.reservation_id) {
        res.locals.table = table;
        next();
    } else {
        next({
            status: 400,
            message: `Table is not occupied.`
        });
    }
}

//Functions

async function list(req, res, next) {
    res.json({ data: await service.list() });
}

async function create(req, res, next) {
    const newTable = await service.create(req.body.data);
    res.status(201).json({ data: newTable });
}

async function updateTable(req, res, next) {
    const { reservation_id } = req.body.data;
    const table_id = req.body.data.table_id || Number(req.params.table_id);
    res.json({ data: await service.update(reservation_id, table_id)});
}

async function destroy(req, res) {
    const table_id = req.params.table_id;
    const reservation_id = res.locals.table.reservation_id;
    await service.clearTable(table_id, reservation_id);
    res.status(200).json({});
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [
        asyncErrorBoundary(hasValidProperties),
        asyncErrorBoundary(hasTableName),
        asyncErrorBoundary(hasCapacity),
        asyncErrorBoundary(create),
    ],
    update: [
        asyncErrorBoundary(hasData),
        asyncErrorBoundary(resExists),
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(emptyTable),
        asyncErrorBoundary(validateSeated),
        asyncErrorBoundary(getPeople),
        asyncErrorBoundary(validateTableSeating),
        asyncErrorBoundary(updateTable),
    ],
    delete: [
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(validateOccupation),
        asyncErrorBoundary(destroy),
    ]
};