"use client";

import {
  CopilotChatConfigurationProvider,
  CopilotSidebar,
} from "@copilotkit/react-core/v2";
import { MapLab } from "@/components/map/MapLab";

export default function MapLabPage() {
  return (
    <CopilotChatConfigurationProvider agentId="default">
      <MapLab />
      <CopilotSidebar
        defaultOpen
        width={420}
        input={{ disclaimer: () => null, className: "pb-6" }}
      />
    </CopilotChatConfigurationProvider>
  );
}