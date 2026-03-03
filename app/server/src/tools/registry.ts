import { ToolDefinition } from "@dmhelper/shared";

export function getToolDefinitions(): ToolDefinition[] {
  return [
    {
      name: "propose_file_change",
      description:
        "Propose creating a new data file or editing an existing one. The user must approve before the file is written.",
      parameters: {
        type: "object",
        required: ["fileId", "operation"],
        properties: {
          fileId: {
            type: "string",
            description:
              "Path within /data/ without .md extension, e.g. 'myworld/npcs/thorin'",
          },
          operation: { type: "string", enum: ["create", "update"] },
          content: {
            type: "string",
            description: "Full file content — required when operation is 'create'",
          },
          edits: {
            type: "array",
            description: "Search/replace pairs — required when operation is 'update'",
            items: {
              type: "object",
              required: ["search", "replace"],
              properties: {
                search: { type: "string" },
                replace: { type: "string" },
              },
            },
          },
        },
      },
    },
  ];
}
