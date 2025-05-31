"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashGenerator = hashGenerator;
function hashGenerator(length) {
    let options = "qwertyuiopasdfghjklzxcvbnm1234567890";
    let ans = "";
    for (let i = 0; i < length; i++) {
        ans += options[Math.floor(Math.random() * length)];
    }
    return ans;
}
