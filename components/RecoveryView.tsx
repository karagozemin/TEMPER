"use client";

import {
  AGGREGATE_METRICS,
  INCIDENT_014,
  RECOVERY_TIME_LABEL,
} from "@/lib/demo/dataset";
import { Fact, Label, Panel, PanelHeader, Pill, Stat } from "@/components/ui";

export function RecoveryView() {
  return (
    <div className="space-y-6">
      <div>
        <Label>Incident #{INCIDENT_014.id.replace("INC-", "")}</Label>
        <div className="mt-2 flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-white">Community recovery</h2>
          <Pill tone="recovered">Recovered</Pill>
        </div>
        <p className="mt-1 text-sm text-white/45">
          TEMPER returned after the intervention and measured the outcome.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Incident outcome" subtitle="autonomous follow-up" />
          <div className="px-5 py-4">
            <Fact label="Target" value="Maya" accent />
            <Fact label="Intervention" value="Gentle group redirect" />
            <Fact label="Re-engagement" value="Confirmed" />
            <Fact label="Repeat convergence" value="None" />
            <Fact label="Recovery time" value={RECOVERY_TIME_LABEL} />
            <Fact label="Outcome" value="Successful" accent />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Seeded demo history" subtitle="demo-community only" />
          <div className="grid grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-3">
            <Stat
              value={String(AGGREGATE_METRICS.trajectoriesInterrupted)}
              label="Trajectories interrupted"
            />
            <Stat
              value={String(AGGREGATE_METRICS.membersRecovered)}
              label="Members recovered"
            />
            <Stat
              value={String(AGGREGATE_METRICS.unnecessaryBans)}
              label="Unnecessary bans"
            />
            <Stat
              value={`${AGGREGATE_METRICS.interventionsSuccessful}/${AGGREGATE_METRICS.interventionsTotal}`}
              label="Interventions successful"
            />
          </div>
          <div className="px-5 pb-4 text-xs text-white/35">
            Aggregate values are seeded demo-community history, not production
            metrics.
          </div>
        </Panel>
      </div>

      <Panel className="px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label>Learned outcome</Label>
            <p className="mt-1 text-sm text-white/80">
              Gentle redirect succeeded for newcomer convergence.
            </p>
          </div>
          <Pill tone="purple">Persisted to memory</Pill>
        </div>
      </Panel>
    </div>
  );
}
