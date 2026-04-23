import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./supabase";

type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

type PhaseSection = {
  id: string;
  title: string;
  checklist: ChecklistItem[];
};

type Phase = {
  id: string;
  name: string;
  sections: PhaseSection[];
};

type LegacyPhase = {
  id: string;
  name: string;
  checklist?: ChecklistItem[];
  sections?: PhaseSection[];
};

type FeatureCard = {
  id: string;
  number: string;
  name: string;
  phases: Phase[];
  createdAt: string;
};

type FeatureRow = {
  id: string;
  number: string;
  name: string;
  phases_json: LegacyPhase[] | null;
  created_at: string;
};

const DEFAULT_PHASES: Phase[] = [
  {
    id: "phase-1",
    name: "Phase 1",
    sections: [
      {
        id: "phase-1-kickoff",
        title: "Kickoff & Communication",
        checklist: [
          {
            id: crypto.randomUUID(),
            text: "Start Teams group chat with BPDT for feature and provide a short blurb",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Create a Teams design + content specific group chat with product team, designers & BAs",
            done: false,
          },
        ],
      },
      {
        id: "phase-1-docs",
        title: "Documentation Setup",
        checklist: [
          {
            id: crypto.randomUUID(),
            text: "Create a Miro flow for the feature (internal use) and send diagram to BPDT",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Create v0.1 of TDD",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Create v0.1 of FDD",
            done: false,
          },
        ],
      },
      {
        id: "phase-1-stories",
        title: "Story Readiness",
        checklist: [
          {
            id: crypto.randomUUID(),
            text: "Ensure user stories are created with business requirements",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Ensure test stories are created with acceptance criteria",
            done: false,
          },
        ],
      },
      {
        id: "phase-1-meetings",
        title: "Alignment & Meetings",
        checklist: [
          {
            id: crypto.randomUUID(),
            text: "Run internal alignment meeting with product team and business advisor",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Set pre-JAD session for internal alignment",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Set JAD session and prepare feedback tracker sheet",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Set meeting with content design team to ensure Figma work has begun",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Set meeting for walkthrough with BPDT",
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "phase-2",
    name: "Phase 2",
    sections: [
      {
        id: "phase-2-execution",
        title: "Execution & Follow-through",
        checklist: [
          {
            id: crypto.randomUUID(),
            text: "Create & maintain any mapping documents in SharePoint",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Conduct JAD sessions (initial and follow-ups if needed)",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Ensure feedback tracker is closed within 48 hours and provide inputs",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Set and conduct meetings with BPDT (as needed)",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Create v0.2 of TDD",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Create v0.2 of FDD",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Ensure completion and approval of Figma and content work",
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "phase-3",
    name: "Phase 3",
    sections: [
      {
        id: "phase-3-build",
        title: "Design Complete & Build Support",
        checklist: [
          {
            id: crypto.randomUUID(),
            text: "Ensure TDD & FDD are complete and ready for review",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Coordinate with PO and Merative to ensure FDD and TDD are design complete",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Assist development and testing teams",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Coordinate with PO and Merative on build complete activities",
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "phase-4",
    name: "Phase 4",
    sections: [
      {
        id: "phase-4-closeout",
        title: "Validation & Closeout",
        checklist: [
          {
            id: crypto.randomUUID(),
            text: "Assist testing team during validation and completion",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Ensure all pending BA activities are completed and approved for design and build completion",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Complete KT Presentation with rest of ESDC",
            done: false,
          },
        ],
      },
    ],
  },
];

function cloneDefaultPhases(): Phase[] {
  return DEFAULT_PHASES.map((phase) => ({
    ...phase,
    sections: phase.sections.map((section) => ({
      ...section,
      checklist: section.checklist.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    })),
  }));
}

function normalizeChecklist(items: unknown): ChecklistItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const safeItem = item as Partial<ChecklistItem>;
    return {
      id:
        typeof safeItem.id === "string" && safeItem.id.trim()
          ? safeItem.id
          : crypto.randomUUID(),
      text:
        typeof safeItem.text === "string" && safeItem.text.trim()
          ? safeItem.text
          : `Task ${index + 1}`,
      done: Boolean(safeItem.done),
    };
  });
}

function normalizePhases(phases: LegacyPhase[] | null | undefined): Phase[] {
  if (!Array.isArray(phases)) return [];

  return phases.map((phase, phaseIndex) => {
    const phaseId =
      typeof phase?.id === "string" && phase.id.trim()
        ? phase.id
        : `phase-${phaseIndex + 1}`;

    const phaseName =
      typeof phase?.name === "string" && phase.name.trim()
        ? phase.name
        : `Phase ${phaseIndex + 1}`;

    if (Array.isArray(phase?.sections)) {
      return {
        id: phaseId,
        name: phaseName,
        sections: phase.sections.map((section, sectionIndex) => ({
          id:
            typeof section?.id === "string" && section.id.trim()
              ? section.id
              : `${phaseId}-section-${sectionIndex + 1}`,
          title:
            typeof section?.title === "string" && section.title.trim()
              ? section.title
              : `Section ${sectionIndex + 1}`,
          checklist: normalizeChecklist(section?.checklist),
        })),
      };
    }

    return {
      id: phaseId,
      name: phaseName,
      sections: [
        {
          id: `${phaseId}-default-section`,
          title: "Tasks",
          checklist: normalizeChecklist(phase?.checklist),
        },
      ],
    };
  });
}

function getProgress(phases: Phase[] | null | undefined) {
  const safePhases = Array.isArray(phases) ? phases : [];

  const items = safePhases.flatMap((phase) =>
    (Array.isArray(phase.sections) ? phase.sections : []).flatMap((section) =>
      Array.isArray(section.checklist) ? section.checklist : []
    )
  );

  const total = items.length;
  const completed = items.filter((item) => item.done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
}

function getSectionProgress(section: PhaseSection) {
  const items = Array.isArray(section.checklist) ? section.checklist : [];
  const total = items.length;
  const completed = items.filter((item) => item.done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
}

function getPhaseProgress(phase: Phase) {
  const items = (Array.isArray(phase.sections) ? phase.sections : []).flatMap(
    (section) => (Array.isArray(section.checklist) ? section.checklist : [])
  );

  const total = items.length;
  const completed = items.filter((item) => item.done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
}

function mapRowToFeature(row: FeatureRow): FeatureCard {
  return {
    id: row.id,
    number: row.number,
    name: row.name,
    phases: normalizePhases(row.phases_json),
    createdAt: row.created_at,
  };
}

async function fetchFeatures(): Promise<FeatureCard[]> {
  const { data, error } = await supabase
    .from("features")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data as FeatureRow[]) || []).map(mapRowToFeature);
}

async function createFeature(feature: FeatureCard) {
  const { error } = await supabase.from("features").insert({
    id: feature.id,
    number: feature.number,
    name: feature.name,
    phases_json: feature.phases,
    created_at: feature.createdAt,
  });

  if (error) {
    throw error;
  }
}

async function updateFeature(feature: FeatureCard) {
  const { error } = await supabase
    .from("features")
    .update({
      number: feature.number,
      name: feature.name,
      phases_json: feature.phases,
    })
    .eq("id", feature.id);

  if (error) {
    throw error;
  }
}

async function deleteFeatureFromDb(featureId: string) {
  const { error } = await supabase.from("features").delete().eq("id", featureId);

  if (error) {
    throw error;
  }
}

function App() {
  const [features, setFeatures] = useState<FeatureCard[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [featureNumber, setFeatureNumber] = useState("");
  const [featureName, setFeatureName] = useState("");

  useEffect(() => {
    fetchFeatures()
      .then(setFeatures)
      .catch((error) => console.error("Failed to fetch features:", error));
  }, []);

  const selectedFeature = useMemo(() => {
    return features.find((feature) => feature.id === selectedFeatureId) ?? null;
  }, [features, selectedFeatureId]);

  async function handleAddFeature() {
    if (!featureNumber.trim() || !featureName.trim()) {
      return;
    }

    const newFeature: FeatureCard = {
      id: crypto.randomUUID(),
      number: featureNumber.trim(),
      name: featureName.trim(),
      phases: cloneDefaultPhases(),
      createdAt: new Date().toISOString(),
    };

    try {
      await createFeature(newFeature);
      setFeatures((prev) => [newFeature, ...prev]);
      setFeatureNumber("");
      setFeatureName("");
    } catch (error) {
      console.error("Failed to create feature:", error);
    }
  }

  async function handleDeleteFeature(featureId: string) {
    try {
      await deleteFeatureFromDb(featureId);
      setFeatures((prev) => prev.filter((feature) => feature.id !== featureId));

      if (selectedFeatureId === featureId) {
        setSelectedFeatureId(null);
      }
    } catch (error) {
      console.error("Failed to delete feature:", error);
    }
  }

  async function handleToggleChecklistItem(
    phaseId: string,
    sectionId: string,
    itemId: string
  ) {
    if (!selectedFeature) return;

    const updatedFeature: FeatureCard = {
      ...selectedFeature,
      phases: selectedFeature.phases.map((phase) => {
        if (phase.id !== phaseId) return phase;

        return {
          ...phase,
          sections: phase.sections.map((section) => {
            if (section.id !== sectionId) return section;

            return {
              ...section,
              checklist: section.checklist.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              ),
            };
          }),
        };
      }),
    };

    try {
      await updateFeature(updatedFeature);
      setFeatures((prev) =>
        prev.map((feature) =>
          feature.id === updatedFeature.id ? updatedFeature : feature
        )
      );
    } catch (error) {
      console.error("Failed to update feature:", error);
    }
  }

  if (selectedFeature) {
    const progress = getProgress(selectedFeature.phases);

    return (
      <div className="app-shell">
        <div className="page-container">
          <div className="top-bar">
            <div>
              <button
                className="secondary-button"
                onClick={() => setSelectedFeatureId(null)}
              >
                ← Back
              </button>
              <h1 className="page-title">
                {selectedFeature.number} - {selectedFeature.name}
              </h1>
              <p className="page-subtitle">Track progress across all 4 phases.</p>
            </div>

            <div className="summary-card">
              <p className="summary-label">Overall Progress</p>
              <div className="progress-row">
                <span>
                  {progress.completed}/{progress.total}
                </span>
                <span>{progress.percent}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="phase-grid">
            {selectedFeature.phases.map((phase) => {
              const phaseProgress = getPhaseProgress(phase);

              return (
                <div className="card phase-card" key={phase.id}>
                  <div className="card-header phase-card-header">
                    <div>
                      <h2>{phase.name}</h2>
                      <p>
                        {phaseProgress.completed} of {phaseProgress.total} done
                      </p>
                    </div>
                  </div>

                  <div className="phase-sections">
                    {phase.sections.map((section) => {
                      const sectionProgress = getSectionProgress(section);

                      return (
                        <div className="section-card" key={section.id}>
                          <div className="section-header">
                            <div>
                              <h3>{section.title}</h3>
                              <p>
                                {sectionProgress.completed} / {sectionProgress.total} complete
                              </p>
                            </div>
                            <span className="section-pill">
                              {sectionProgress.percent}%
                            </span>
                          </div>

                          <div className="mini-progress-bar">
                            <div
                              className="mini-progress-bar-fill"
                              style={{ width: `${sectionProgress.percent}%` }}
                            />
                          </div>

                          <div className="checklist-list">
                            {section.checklist.map((item) => (
                              <label
                                className={`checklist-item ${item.done ? "done" : ""}`}
                                key={item.id}
                              >
                                <input
                                  type="checkbox"
                                  checked={item.done}
                                  onChange={() =>
                                    handleToggleChecklistItem(
                                      phase.id,
                                      section.id,
                                      item.id
                                    )
                                  }
                                />
                                <span>{item.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-container">
        <div className="hero-section">
          <h1 className="page-title">BA Internal Checklist</h1>
          <p className="page-subtitle">
            Create a product feature card, save it, and click into it to manage the four phases.
          </p>
        </div>

        <div className="card form-card">
          <h2>Create Product Feature</h2>
          <div className="form-grid">
            <div className="field-group">
              <label>Product Feature Number</label>
              <input
                type="text"
                value={featureNumber}
                onChange={(e) => setFeatureNumber(e.target.value)}
                placeholder="Example: PF-1024"
              />
            </div>

            <div className="field-group">
              <label>Product Feature Name</label>
              <input
                type="text"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                placeholder="Example: Claims status alert updates"
              />
            </div>

            <div className="button-row">
              <button className="primary-button" onClick={handleAddFeature}>
                Add Feature
              </button>
            </div>
          </div>
        </div>

        {features.length === 0 ? (
          <div className="card empty-state">
            <p>No product features created yet.</p>
          </div>
        ) : (
          <div className="feature-grid">
            {features.map((feature) => {
              const progress = getProgress(feature.phases);

              return (
                <div className="card feature-card" key={feature.id}>
                  <div className="feature-card-top">
                    <div>
                      <p className="feature-number">Feature #{feature.number}</p>
                      <h2>{feature.name}</h2>
                    </div>
                    <button
                      className="icon-button"
                      onClick={() => handleDeleteFeature(feature.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="feature-progress-block">
                    <div className="progress-row">
                      <span>Progress</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="phase-summary-list">
                    {feature.phases.map((phase) => {
                      const phaseProgress = getPhaseProgress(phase);

                      return (
                        <div className="phase-summary-row" key={phase.id}>
                          <span>{phase.name}</span>
                          <span>
                            {phaseProgress.completed}/{phaseProgress.total}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="primary-button full-width"
                    onClick={() => setSelectedFeatureId(feature.id)}
                  >
                    Open Feature
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;