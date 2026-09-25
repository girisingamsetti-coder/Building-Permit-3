"use client";

import * as React from "react";
import { useAppStore } from "@/store/app-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfficerApplications } from "./officer-applications";
import { PmWorkflow } from "../pm/pm-workflow";
import { PmApplications } from "../pm/pm-applications";
import { ClipboardList, Network, Users } from "lucide-react";

export function OfficerTasks() {
  const user = useAppStore((s) => s.user);
  
  const isManager = user?.role === "COMMISSIONER" || user?.role === "ADDITIONAL_COMMISSIONER" || user?.role === "SUPER_ADMIN";

  if (!isManager) {
    return <OfficerApplications />;
  }

  return (
    <div className="space-y-4 p-4">
      <Tabs defaultValue="my-tasks">
        <TabsList className="mb-2 bg-muted/60">
          <TabsTrigger value="my-tasks"><ClipboardList className="size-4 mr-2" /> My Queue</TabsTrigger>
          <TabsTrigger value="subordinates"><Users className="size-4 mr-2" /> Subordinate Tasks</TabsTrigger>
          <TabsTrigger value="monitor"><Network className="size-4 mr-2" /> Live Workflow Monitor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-tasks" className="mt-0">
          <OfficerApplications />
        </TabsContent>
        
        <TabsContent value="subordinates" className="mt-0">
          <div className="pt-2">
            <PmApplications />
          </div>
        </TabsContent>
        
        <TabsContent value="monitor" className="mt-0">
          <div className="pt-2">
            <PmWorkflow />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
