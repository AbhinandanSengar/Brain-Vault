"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_USER_PASSWORD = void 0;
const jwtUserPassword = process.env.JWT_USER_PASSWORD;
if (!jwtUserPassword) {
    throw new Error("JWT_USER_PASSWORD is not defined");
}
exports.JWT_USER_PASSWORD = jwtUserPassword;
