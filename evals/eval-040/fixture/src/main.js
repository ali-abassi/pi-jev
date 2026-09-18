import { fetchUser } from "./db.js";
import { greet } from "./fmt.js";
export function run(id, cb) {
  fetchUser(id, (err, user) => {
    if (err) return cb(err);
    greet(user, cb);
  });
}
