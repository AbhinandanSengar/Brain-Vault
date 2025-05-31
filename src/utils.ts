export function hashGenerator(length: number) {
    let options = "qwertyuiopasdfghjklzxcvbnm1234567890";

    let ans = "";

    for(let i = 0; i < length; i++) {
        ans += options[Math.floor(Math.random() * length)];
    }

    return ans;
}