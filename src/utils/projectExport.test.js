import { describe, expect, it } from "vitest";
import {
  buildExportFileContent,
  computeProjectExportEligibility,
  extractExportErrorMessage,
  parseExportPayload,
} from "./projectExport";

describe("projectExport utilities", () => {
  it("computeProjectExportEligibility should block export when project has no data", () => {
    const result = computeProjectExportEligibility(
      { totalItems: 0, completedItems: 0 },
      [],
    );

    expect(result.hasDataItems).toBe(false);
    expect(result.ready).toBe(false);
    expect(result.allApproved).toBe(false);
  });

  it("parseExportPayload should decode blob JSON payload", async () => {
    const payload = new Blob(
      [
        JSON.stringify({
          Project: { Id: 99 },
          Items: [{ DataItemId: 10, FileName: "img-10.png" }],
        }),
      ],
      { type: "application/json" },
    );

    const parsed = await parseExportPayload(payload);

    expect(parsed.Project.Id).toBe(99);
    expect(parsed.Items[0].FileName).toBe("img-10.png");
  });

  it("buildExportFileContent should build csv from exported item rows", async () => {
    const payload = new Blob(
      [
        JSON.stringify({
          Project: { Id: 99, Name: "Export Project" },
          Items: [
            {
              DataItemId: 10,
              FileName: "img-10.png",
              AnnotatorEmail: "annotator@test.com",
            },
          ],
        }),
      ],
      { type: "application/json" },
    );

    const { content } = await buildExportFileContent(payload, "csv");

    expect(content).toContain("DataItemId");
    expect(content).toContain("FileName");
    expect(content).toContain("annotator@test.com");
    expect(content).not.toContain("Project.Id");
  });

  it("extractExportErrorMessage should read message from blob error payload", async () => {
    const error = {
      response: {
        data: new Blob(
          [JSON.stringify({ message: "No data items available in this project to export." })],
          { type: "application/json" },
        ),
      },
    };

    const message = await extractExportErrorMessage(error, "Export failed.");

    expect(message).toBe("No data items available in this project to export.");
  });
});
