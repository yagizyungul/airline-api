import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://airline-api-yagiz.azurewebsites.net';

export const options = {
  scenarios: {
    normal_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30s',
      tags: { scenario: 'normal' },
    },
  },
};

export default function () {
  // Test 1: Query Flights
  const flightsRes = http.get(`${BASE_URL}/api/v1/flights`);
  check(flightsRes, {
    'flights status 200': (r) => r.status === 200 || r.status === 429,
    'flights response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  sleep(1);

  // Test 2: Auth login
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ username: 'yagiz', password: '123456' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  sleep(1);
}