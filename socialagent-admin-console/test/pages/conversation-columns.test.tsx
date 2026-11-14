// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import createWrapper from "@cloudscape-design/components/test-utils/dom";
import ConversationsPage from "@/pages/conversations";
import StackDetailPage from "@/pages/stack-detail";
import { api } from "@/api/client";
import type { Conversation } from "@/types";

// The list knows only this much about a conversation: it counts no messages
// and does not check whether a session is active.
const conversation: Conversation = {
  phoneHash: "1555...0100", fullPhone: "15555550100", stack: "test-dev", region: "us-east-1",
  lastActivity: "2024-07-01", memoryId: "mem-1",
};

/** The titles of the table's columns that have one (the selection column has none). */
function columnTitles(container: HTMLElement): string[] {
  return createWrapper(container).findTable()!.findColumnHeaders()
    .map((h) => h.getElement().textContent?.trim() ?? "")
    .filter(Boolean);
}

afterEach(() => {
  vi.mocked(api.getConversations).mockResolvedValue([]);
  vi.mocked(api.getConversationsPage).mockResolvedValue({ conversations: [] });
});

describe("Conversation list columns", () => {
  it("the Conversations page shows only columns the list has a value for", async () => {
    vi.mocked(api.getConversations).mockResolvedValue([conversation]);
    const { container } = render(<ConversationsPage navigate={() => {}} />);
    await screen.findByText("1555...0100");

    expect(columnTitles(container)).toEqual(["Phone", "Stack", "Region", "Last activity", "Memory ID"]);
  });

  it("a stack's Conversations tab shows only columns the list has a value for", async () => {
    vi.mocked(api.getConversationsPage).mockResolvedValue({ conversations: [conversation] });
    const { container } = render(<StackDetailPage stackId="test-dev" navigate={() => {}} />);
    await screen.findByText("Stack summary");
    fireEvent.click(screen.getByRole("tab", { name: "Conversations" }));
    await screen.findByText("1555...0100");

    expect(columnTitles(container)).toEqual(["Phone", "Last activity", "Memory ID"]);
  });
});
