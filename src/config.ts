const jwtUserPassword = process.env.JWT_USER_PASSWORD;

if(!jwtUserPassword) {
    throw new Error("JWT_USER_PASSWORD is not defined"); 
}

export const JWT_USER_PASSWORD = jwtUserPassword;