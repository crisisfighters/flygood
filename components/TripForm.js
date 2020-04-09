import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import shortid from 'shortid';

import { useTrip } from '../hooks';

import { AirportRow } from './AirportRow';
import { Button } from './Button';

const splice = (array, ...args) => {
  const newArray = [...array];
  newArray.splice(...args);
  return newArray;
};

export const TripForm = () => {
  const { push } = useRouter();
  const { trip, tripPromise, updateTrip } = useTrip();
  const [redirect, setRedirect] = useState(false);
  const [airports, setAirports] = useState([
    [null, shortid()],
    [null, shortid()],
  ]);
  const disabled = airports.some(([airport]) => !airport);
  const onSubmit = (event) => {
    if (!disabled) {
      updateTrip(airports.map(([airport]) => airport));
      setRedirect(true);
    }
    event.preventDefault();
  };
  useEffect(() => {
    if (redirect && trip.query) {
      push('/trip', `/trip?t=${trip.query}`);
    } else if (airports.every(([airport]) => !airport)) {
      if (trip.airports.length) {
        setAirports(trip.airports.map((airport) => [airport, shortid()]));
      } else if (tripPromise) {
        tripPromise.then((airports) =>
          setAirports(airports.map((airport) => [airport, shortid()]))
        );
      }
    }
  });
  return (
    <form onSubmit={onSubmit}>
      {airports.map(([airport, key], index) => {
        const handleChange = (airport) => {
          setAirports(splice(airports, index, 1, [airport, key]));
        };
        const handleAdd = () => {
          setAirports(splice(airports, index + 1, 0, [null, shortid()]));
        };
        const handleRemove = () => {
          setAirports(splice(airports, index, 1));
        };
        return (
          <AirportRow
            airport={airport}
            key={key}
            index={index}
            isFirst={index === 0}
            isLast={index === airports.length - 1}
            handleChange={handleChange}
            handleAdd={handleAdd}
            handleRemove={airports.length > 2 && handleRemove}
          />
        );
      })}
      <Button type="submit" disabled={disabled} tabIndex={airports.length + 1}>
        Calculate Emissions
      </Button>
    </form>
  );
};
