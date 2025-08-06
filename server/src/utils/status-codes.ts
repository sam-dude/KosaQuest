export const StatusCodes = {
  OK: { code: 200, description: "OK", message: "The request was successful." },
  CREATED: {
    code: 201,
    description: "Created",
    message: "The request was successful and a new resource was created.",
  },
  BAD_REQUEST: {
    code: 400,
    description: "Bad Request",
    message: "The server could not process the request due to client error.",
  },
  UNAUTHORIZED: {
    code: 401,
    description: "Unauthorized",
    message: "Authentication is required to access the requested resource.",
  },
  FORBIDDEN: {
    code: 403,
    description: "Forbidden",
    message: "You do not have permission to access the requested resource.",
  },
  NOT_FOUND: {
    code: 404,
    description: "Not Found",
    message: "The requested resource could not be found.",
  },
  CONFLICT: {
    code: 409,
    description: "Conflict",
    message:
      "The request could not be completed due to a conflict with the current state of the resource.",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    description: "Internal Server Error",
    message:
      "The server encountered an internal error and could not complete your request.",
  },
};
