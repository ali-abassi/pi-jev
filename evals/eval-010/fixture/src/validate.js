export function errors(user) {
  const out = [];
  if (!user.email.includes("@")) out.push("email");
  if (user.age < 18) out.push("age");
  return out;
}
