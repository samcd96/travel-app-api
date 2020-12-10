export function respond(payload, statusCode) {
  return {
    statusCode,
    body: JSON.stringify(payload),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
}
