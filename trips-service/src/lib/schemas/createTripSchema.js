const schema = {
  properties: {
    body: {
      type: "object",
      properties: {
        tripName: {
          type: "string",
        },
        tripStart: {
          type: "number",
        },
        tripEnd: {
          type: "number",
        },
      },
      required: ["tripName", "tripStart", "tripEnd"],
    },
  },
  required: ["body"],
};
export default schema;
