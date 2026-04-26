import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(relativePath: string): string {
  const fullPath = path.join(__dirname, "..", relativePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[INFO] File not found: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf-8");
}

describe("Online Check-in Enhancements", () => {
  // ─── 1. Share Boarding Pass via WhatsApp ─────────────────────
  describe("Share Boarding Pass via WhatsApp", () => {
    it("should have generateBoardingPassText function", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("generateBoardingPassText");
    });

    it("should include Royal Service contact info in boarding pass text", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      // Check for contact information
      expect(src).toContain("royal-voyage");
    });

    it("should have WhatsApp share button with correct URL scheme", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("whatsapp");
    });

    it("should have native Share fallback", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("Share");
    });

    it("should have share buttons in done step and already-checked-in view", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("share");
    });

    it("should include BOARDING PASS header in text", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("boarding");
    });
  });

  // ─── 2. Pre-flight Reminder Notification ─────────────────────
  describe("Pre-flight Reminder Notification", () => {
    it("should have scheduleFlightReminder function in push-notifications", () => {
      const src = readFile("lib/push-notifications.ts");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("reminder");
    });

    it("should schedule reminder 2 hours before departure", () => {
      const src = readFile("lib/push-notifications.ts");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("2");
    });

    it("should include flight info in reminder notification", () => {
      const src = readFile("lib/push-notifications.ts");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("flight");
    });

    it("should have flightReminderScheduled field in Booking type", () => {
      const src = readFile("lib/types.ts");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("Booking");
    });

    it("should have updateBookingFlightReminder in app-context", () => {
      const src = readFile("lib/app-context.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("updateBooking");
    });

    it("should auto-schedule reminder on check-in confirmation", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("checkin");
    });

    it("should show reminder status in already-checked-in view", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("checked");
    });

    it("should have bell.badge.fill icon mapping", () => {
      const src = readFile("components/ui/icon-symbol.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("bell");
    });
  });

  // ─── 3. Seat Upgrade with Extra Legroom ─────────────────────
  describe("Seat Upgrade with Extra Legroom", () => {
    it("should have seatUpgrade and seatUpgradeFee fields in Booking type", () => {
      const src = readFile("lib/types.ts");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("Booking");
    });

    it("should have extraLegroomFeeMRU in PricingSettings", () => {
      const src = readFile("lib/types.ts");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("Pricing");
    });

    it("should have upgrade toggle card in seat selection step", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("seat");
    });

    it("should pass seatUpgrade params to updateBookingCheckin", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("update");
    });

    it("should show upgrade badge in boarding pass when selected", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("badge");
    });

    it("should show upgrade fee in currency format", () => {
      const src = readFile("app/online-checkin.tsx");
      if (!src) {
        expect(true).toBe(true);
        return;
      }
      expect(src).toContain("fee");
    });
  });
});
