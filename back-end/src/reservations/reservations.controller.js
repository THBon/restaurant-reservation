const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */

const validProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
];

//Validation check
function hasData(req, res, next) {
  const data = req.body.data;
  if (data) {
    next();
  } else {
    next({
      status: 400,
      message: `Request is missing data`,
    });
  }
}

function hasValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalid = Object.keys(data).filter(
    (field) => !validProperties.includes(field)
  );

  if(invalid.length) {
    return next({
      status: 400,
      message: `One of the field is invalid: ${invalid.join(", ")}`,
    });
  }
  next();
}

function hasFirstName(req, res, next) {
  const index = validProperties.indexOf("first_name");
  const { first_name } = req.body.data;
  if (first_name === '') {
    next({
      status: 400,
      message: `${validProperties[index]} cannot be empty`
    });
  }
  if (typeof first_name !== 'string') {
    next({
      status: 400,
      message: `${validProperties[index]} must contain valid characters`
    });
  }
  next();
}

function hasLastName(req, res, next) {
  const index = validProperties.indexOf("last_name");
  const { last_name } = req.body.data;
  if (last_name === '') {
    next({
      status: 400,
      message: `${validProperties[index]} cannot be empty`
    });
  }
  if (typeof last_name !== 'string') {
    next({
      status: 400,
      message: `${validProperties[index]} must contain valid characters`
    });
  }
  next();
}

function hasMobileNumber(req, res, next) {
  const index = validProperties.indexOf("mobile_number");
  const { mobile_number } = req.body.data;

  if (!mobile_number || mobile_number === '') {
    next({
      status: 400,
      message: `${validProperties[index]} cannot be empty.`
    });
  }
  const splitNumber = mobile_number.split('-'); //Remove all the -
  const numberOnly = splitNumber.join('') //Join back the numbers
  if (isNaN(Number(numberOnly))) {
    next({
      status: 400,
      message: `Please enter valid digits (0-9) in the format 123-456-7890`,
    });
  }
  next();
}

//Date check
//Check if the reservation date is valid

function hasValidDate(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const { mainTime } = req.body.date;

  const today = new Date();
  const submitDate = new Date(reservation_date + " " + reservation_time)
  const time = today.getTime();
  const submitTime = submitDate.getTime();

  const localSubmit = new Date(submitTime);
  const currentTime = new Date(time - mainTime * 60 * 1000);
  const returnDate = currentTime.toString().slice(0, 15);
  const formattedCurrentTime = currentTime.toString().slice(15, 21);
  const invalidDate = 2;
  const dayInFormat = localSubmit.getDay();

  const dateFormat = /\d\d\d\d-\d\d-\d\d/;
  if (!reservation_date) {
    next({
      status: 400,
      message: `Please select a reservation date.`,
    });
  }
  if (!reservation_date.match(dateFormat)) {
    return next({
      status: 400,
      message: `The reservation date must be valid 'YYYY-MM-DD'`,
    });
  }
  if(localSubmit < currentTime) {
    next({
      status: 400,
      message: `Please select a date after ${formattedCurrentTime} on ${returnDate}.`,
    })
  }
  if (dayInFormat === invalidDate) {
    next({
      status: 400,
      message: `The restaurant is closed on Tuesday.`,
    });
  }
  next();
}

function hasValidTime(req, res, next) {
  const { reservation_time } = req.body.data;
  const timeFormat = /\d\d:\d\d/;

  if (!reservation_time) {
    next({
      status: 400,
      message: `Please select a reservation time.`,
    });
  }
  if (!reservation_time.match(timeFormat)) {
    return next({
      status: 400,
      message: `The reservation time must be a valid '12:30'`,
    });
  }
  if (reservation_time < '10:29:59') {
    next({
      status: 400,
      message: 'The restaurant is closed at this time, please select a time at 10:30 am or after',
    });
  } else {
    if (reservation_time >= '21:30:00') {
      next({
        status: 400,
        message: `The restaurant closes at 10:30 pm. Please pick another time at least one hour before it close.`,
      });
    }
  }
  next();
}

function hasPeople(req, res, next) {
  const { people } = req.body.data;
  if (people < 1 || typeof people !== 'number') {
    next({
      status: 400,
      message: `Reservation must have at least 1 person going.`
    });
  }
  next();
}

async function reservationExists(req, res, next) {
  const { reservation_Id } = req.params;
  const foundRes = await service.read(reservation_Id);

  if(data) {
    res.locals.res = foundRes;
    return next();
  }
  next({
    status: 404,
    message: `No reservation found for reservation ${reservation_Id}.`,
  });
}

//Create function

async function create(req, res, next) {
  const newReservation = await service.create(req.body.data);
  res.status(201).json({ data: newReservation });
}

//Read function

async function read(req, res) {
  res.json({ data: await service.read(res.locals.res.reservation_id)});
}

//Update function

async function update(req, res) {
  const reservationId = res.locals.res.reservation_id;
  const updatedReservation = {
    ...req.body.data,
    reservation_id: reservationId,
  };
  res.json({ data: await service.update(updatedReservation) });
}

//Listing reservation

async function list(req, res) {
  const { date } = req.query;
  const { mobile_number } = req.query;
  if (date) {
    res.json({
      data: await service.listByDate(date),
    });
  } else if (mobile_number) {
    res.json({
      data: await service.search(mobile_number),
    });
  } else
    res.json({
      data: await service.list(),
    })
}

module.exports = {
  create: [
    hasData,
    hasValidProperties,
    hasFirstName,
    hasLastName,
    hasMobileNumber,
    hasValidDate,
    hasValidTime,
    hasPeople,
    asyncErrorBoundary(create),
  ],
  read: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read)
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    hasFirstName,
    hasLastName,
    hasMobileNumber,
    hasValidDate,
    hasValidTime,
    hasPeople,
    asyncErrorBoundary(update),
  ],
  list: [asyncErrorBoundary(list)],
};
