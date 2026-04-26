import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "../../shared/const.js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createHmac, timingSafeEqual } from "crypto";
import type { TrpcContext } from "./context";
import { getEmployeeById } from "../db.js";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET || "royal-voyage-dev-admin-secret-change-me";
}

export function createAdminSessionToken(employee: { id: number; email: string; role: string; status: string; passwordHash?: string | null }) {
  const payload = `${employee.id}:${employee.email}:${employee.role}:${employee.status}`;
  const signature = createHmac("sha256", getAdminSessionSecret())
    .update(`${payload}:${employee.passwordHash ?? ""}`)
    .digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function safeCompare(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

async function verifyAdminSession(employeeIdHeader: unknown, tokenHeader: unknown) {
  const empId = parseInt(String(employeeIdHeader || ""), 10);
  const token = String(tokenHeader || "");
  if (!empId || !token.includes(".")) return null;

  const emp = await getEmployeeById(empId);
  if (!emp || emp.status !== "active") return null;

  const expected = createAdminSessionToken(emp as any);
  if (!safeCompare(token, expected)) return null;

  return emp;
}

const requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;

    // Accept OAuth admin users
    if (ctx.user && ctx.user.role === "admin") {
      return next({ ctx: { ...ctx, user: ctx.user } });
    }

    // Employee admin access requires both employee id and signed session token.
    const employee = await verifyAdminSession(ctx.req.headers["x-employee-id"], ctx.req.headers["x-admin-token"]);
    if (employee) {
      return next({ ctx: { ...ctx, user: ctx.user, employee } as any });
    }

    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }),
);
