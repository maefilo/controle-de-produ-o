import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "bordados-secret-dev";

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user: { id: number; email: string; name: string; role: string }) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: number; email: string; name: string; role: string };
  } catch {
    return null;
  }
}
