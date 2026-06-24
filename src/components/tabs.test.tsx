import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tab, Tabs } from "./tabs";

describe("Tabs", () => {
  it("shows first tab by default and switches on click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs>
        <Tab label="One">panel one</Tab>
        <Tab label="Two">panel two</Tab>
      </Tabs>,
    );
    expect(screen.getByText("panel one")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Two" }));
    expect(screen.getByText("panel two")).toBeVisible();
  });
});
