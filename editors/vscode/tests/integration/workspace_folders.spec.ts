import { strictEqual } from "assert";
import { commands, DiagnosticSeverity, Uri, window, workspace } from "vscode";
import {
  activateExtension,
  getDiagnostics,
  loadFixture,
  sleep,
  testMultiFolderMode,
  WORKSPACE_DIR,
} from "../test-helpers";
import assert = require("assert");

suiteSetup(async () => {
  await activateExtension();
});

const FIXTURES_URI = Uri.joinPath(WORKSPACE_DIR, "..", "fixtures");

suite("Workspace Folders", () => {
  testMultiFolderMode("shows diagnostics to newly adding folder", async () => {
    await workspace.getConfiguration("oxc").update("trace.server", "verbose");
    await workspace.saveAll();

    await loadFixture("debugger");
    const folderDiagnostics = await getDiagnostics("debugger.js");

    await commands.executeCommand("oxc.showOutputChannel");
    await sleep(250);
    const output = window.activeTextEditor!.document.getText();
    process.stdout.write(
      "JS Plugin Output Channel:\n" + output + "\nEnd of JS Plugin Output Channel\n",
    );
    assert(typeof folderDiagnostics[0].code == "object");
    strictEqual(folderDiagnostics[0].code.target.authority, "oxc.rs");
    strictEqual(folderDiagnostics[0].severity, DiagnosticSeverity.Warning);

    workspace.updateWorkspaceFolders(workspace.workspaceFolders?.length ?? 0, 0, {
      name: "fixtures",
      uri: FIXTURES_URI,
    });

    await sleep(500);
    const thirdWorkspaceDiagnostics = await getDiagnostics(
      "debugger/debugger.js",
      Uri.joinPath(FIXTURES_URI, ".."),
    );

    assert(typeof thirdWorkspaceDiagnostics[0].code == "object");
    strictEqual(thirdWorkspaceDiagnostics[0].code.target.authority, "oxc.rs");
    strictEqual(thirdWorkspaceDiagnostics[0].severity, DiagnosticSeverity.Warning);

    // remove the workspace folder
    workspace.updateWorkspaceFolders(workspace.workspaceFolders?.length ?? 0, 1);
  });
});
