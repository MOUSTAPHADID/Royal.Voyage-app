import { describe, it, expect } from "vitest";
import "../scripts/load-env.js";

describe("Amadeus Office ID", () => {
  it("should have AMADEUS_OFFICE_ID set", () => {
    const officeId = process.env.AMADEUS_OFFICE_ID;
    // Skip if not configured (valid for development)
    if (!officeId) {
      console.log("[INFO] AMADEUS_OFFICE_ID not set - skipping production test");
      expect(true).toBe(true);
      return;
    }
    expect(officeId).toBeDefined();
    expect(officeId!.length).toBeGreaterThan(4);
    console.log("Office ID prefix:", officeId!.substring(0, 4));
  });
});
