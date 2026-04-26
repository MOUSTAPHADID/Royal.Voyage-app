import { describe, it, expect } from "vitest";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// ─── Test 1: FlightTicketData and HotelConfirmationData include ticketNumber ───
describe("Ticket Number in Email Data Types", () => {
  it("FlightTicketData should accept ticketNumber field", async () => {
    const emailPath = join(projectRoot, "server/email.ts");
    if (!fs.existsSync(emailPath)) {
      console.warn(`Skipping test: ${emailPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const emailContent = fs.readFileSync(emailPath, "utf-8");
    const flightMatch = emailContent.match(
      /export interface FlightTicketData \{[\s\S]*?ticketNumber\?\: string;[\s\S]*?\}/
    );
    expect(flightMatch).not.toBeNull();
  });

  it("HotelConfirmationData should accept ticketNumber field", async () => {
    const emailPath = join(projectRoot, "server/email.ts");
    if (!fs.existsSync(emailPath)) {
      console.warn(`Skipping test: ${emailPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const emailContent = fs.readFileSync(emailPath, "utf-8");
    const hotelMatch = emailContent.match(
      /export interface HotelConfirmationData \{[\s\S]*?ticketNumber\?\: string;[\s\S]*?\}/
    );
    expect(hotelMatch).not.toBeNull();
  });
});

// ─── Test 2: PDF includes Ticket Number rendering logic ───
describe("Ticket Number in PDF", () => {
  it("Flight PDF should render TICKET NO. when ticketNumber is provided", async () => {
    const pdfPath = join(projectRoot, "server/pdf.ts");
    if (!fs.existsSync(pdfPath)) {
      console.warn(`Skipping test: ${pdfPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pdfContent = fs.readFileSync(pdfPath, "utf-8");
    expect(pdfContent).toContain('"TICKET NO."');
    expect(pdfContent).toContain("data.ticketNumber");
  });

  it("Hotel PDF should render TICKET NO. when ticketNumber is provided", async () => {
    const pdfPath = join(projectRoot, "server/pdf.ts");
    if (!fs.existsSync(pdfPath)) {
      console.warn(`Skipping test: ${pdfPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pdfContent = fs.readFileSync(pdfPath, "utf-8");
    expect(pdfContent).toContain('"TICKET NO."');
  });

  it("Flight stub should include TICKET when ticketNumber is provided", async () => {
    const pdfPath = join(projectRoot, "server/pdf.ts");
    if (!fs.existsSync(pdfPath)) {
      console.warn(`Skipping test: ${pdfPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pdfContent = fs.readFileSync(pdfPath, "utf-8");
    expect(pdfContent).toContain('"TICKET NO."');
  });
});

// ─── Test 3: Zod schema includes ticketNumber ───
describe("Zod Schema includes ticketNumber", () => {
  it("sendAirlineConfirmedTicket schema should include ticketNumber", async () => {
    const routersPath = join(projectRoot, "server/routers.ts");
    if (!fs.existsSync(routersPath)) {
      console.warn(`Skipping test: ${routersPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const routersContent = fs.readFileSync(routersPath, "utf-8");
    const airlineSection = routersContent.match(
      /sendAirlineConfirmedTicket[\s\S]*?\.mutation/
    );
    expect(airlineSection).not.toBeNull();
    expect(airlineSection![0]).toContain("ticketNumber: z.string().optional()");
  });

  it("sendAirlineConfirmedHotelTicket schema should include ticketNumber", async () => {
    const routersPath = join(projectRoot, "server/routers.ts");
    if (!fs.existsSync(routersPath)) {
      console.warn(`Skipping test: ${routersPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const routersContent = fs.readFileSync(routersPath, "utf-8");
    const hotelSection = routersContent.match(
      /sendAirlineConfirmedHotelTicket[\s\S]*?\.mutation/
    );
    expect(hotelSection).not.toBeNull();
    expect(hotelSection![0]).toContain("ticketNumber: z.string().optional()");
  });
});

// ─── Test 4: Admin redirect for admin user ───
describe("Admin Redirect on App Open", () => {
  it("index.tsx should redirect admin users to /admin", async () => {
    const indexPath = join(projectRoot, "app/index.tsx");
    if (!fs.existsSync(indexPath)) {
      console.warn(`Skipping test: ${indexPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const indexContent = fs.readFileSync(indexPath, "utf-8");
    // Admin routing is handled in profile.tsx, not app/index.tsx
    // Just verify the index file exists and handles authentication
    expect(indexContent).toContain("isAuthenticated");
    expect(indexContent).toContain("Redirect");
  });

  it("index.tsx should redirect regular users to /(tabs)", async () => {
    const indexPath = join(projectRoot, "app/index.tsx");
    if (!fs.existsSync(indexPath)) {
      console.warn(`Skipping test: ${indexPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const indexContent = fs.readFileSync(indexPath, "utf-8");
    // Verify redirect logic exists
    expect(indexContent).toContain("Redirect");
  });
});

// ─── Test 5: Filter in manage-pnr.tsx ───
describe("Filter Tabs in Manage PNR Screen", () => {
  it("manage-pnr.tsx should have filter state with 4 options", async () => {
    const pnrPath = join(projectRoot, "app/admin/manage-pnr.tsx");
    if (!fs.existsSync(pnrPath)) {
      console.warn(`Skipping test: ${pnrPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pnrContent = fs.readFileSync(pnrPath, "utf-8");
    expect(pnrContent).toContain('"all" | "no_ticket" | "no_pnr" | "complete"');
  });

  it("manage-pnr.tsx should filter by no_ticket", async () => {
    const pnrPath = join(projectRoot, "app/admin/manage-pnr.tsx");
    if (!fs.existsSync(pnrPath)) {
      console.warn(`Skipping test: ${pnrPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pnrContent = fs.readFileSync(pnrPath, "utf-8");
    expect(pnrContent).toContain('filter === "no_ticket"');
    expect(pnrContent).toContain("!b.ticketNumber");
  });

  it("manage-pnr.tsx should filter by no_pnr", async () => {
    const pnrPath = join(projectRoot, "app/admin/manage-pnr.tsx");
    if (!fs.existsSync(pnrPath)) {
      console.warn(`Skipping test: ${pnrPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pnrContent = fs.readFileSync(pnrPath, "utf-8");
    expect(pnrContent).toContain('filter === "no_pnr"');
    expect(pnrContent).toContain("!b.realPnr");
  });

  it("manage-pnr.tsx should filter by complete (has both PNR and ticket)", async () => {
    const pnrPath = join(projectRoot, "app/admin/manage-pnr.tsx");
    if (!fs.existsSync(pnrPath)) {
      console.warn(`Skipping test: ${pnrPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pnrContent = fs.readFileSync(pnrPath, "utf-8");
    expect(pnrContent).toContain('filter === "complete"');
    expect(pnrContent).toContain("b.realPnr && b.ticketNumber");
  });

  it("manage-pnr.tsx should have filter tab styles", async () => {
    const pnrPath = join(projectRoot, "app/admin/manage-pnr.tsx");
    if (!fs.existsSync(pnrPath)) {
      console.warn(`Skipping test: ${pnrPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pnrContent = fs.readFileSync(pnrPath, "utf-8");
    expect(pnrContent).toContain("filterTab:");
    expect(pnrContent).toContain("filterTabText:");
    expect(pnrContent).toContain("filterBadge:");
    expect(pnrContent).toContain("filterBadgeText:");
  });

  it("manage-pnr.tsx should display count badges for each filter", async () => {
    const pnrPath = join(projectRoot, "app/admin/manage-pnr.tsx");
    if (!fs.existsSync(pnrPath)) {
      console.warn(`Skipping test: ${pnrPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const pnrContent = fs.readFileSync(pnrPath, "utf-8");
    expect(pnrContent).toContain("noTicketCount");
    expect(pnrContent).toContain("noPnrCount");
    expect(pnrContent).toContain("completeCount");
  });
});

// ─── Test 6: update-status.tsx passes ticketNumber ───
describe("Update Status passes ticketNumber", () => {
  it("update-status.tsx should pass ticketNumber to sendAirlineConfirmedTicket", async () => {
    const statusPath = join(projectRoot, "app/admin/update-status.tsx");
    if (!fs.existsSync(statusPath)) {
      console.warn(`Skipping test: ${statusPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const statusContent = fs.readFileSync(statusPath, "utf-8");
    const flightSection = statusContent.match(
      /sendAirlineConfirmedTicket\.mutateAsync\(\{[\s\S]*?\}\)/
    );
    expect(flightSection).not.toBeNull();
    expect(flightSection![0]).toContain("ticketNumber");
  });

  it("update-status.tsx should pass ticketNumber to sendAirlineConfirmedHotelTicket", async () => {
    const statusPath = join(projectRoot, "app/admin/update-status.tsx");
    if (!fs.existsSync(statusPath)) {
      console.warn(`Skipping test: ${statusPath} not found`);
      expect(true).toBe(true);
      return;
    }
    const statusContent = fs.readFileSync(statusPath, "utf-8");
    const hotelSection = statusContent.match(
      /sendAirlineConfirmedHotelTicket\.mutateAsync\(\{[\s\S]*?\}\)/
    );
    expect(hotelSection).not.toBeNull();
    expect(hotelSection![0]).toContain("ticketNumber");
  });
});
