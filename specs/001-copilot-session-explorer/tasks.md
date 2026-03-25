# Tasks: Copilot Session Explorer

**Input**: Design documents from `specs/001-copilot-session-explorer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/ui-contract.md

**Tests**: TDD requested via Constitution Principle IV for core data and parsing logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan (src/main, src/renderer, src/common)
- [X] T002 Initialize Bun project and configure package.json
- [X] T003 [P] Install ElectroBun and configure development environment
- [X] T004 [P] Configure linting and formatting tools for TypeScript/Bun

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Define shared types for Project and Session in src/common/types.ts
- [X] T006 Implement Data Access Layer: SQLite service to read ~/.copilot/session-store.db in src/main/data/session-store.ts
- [X] T007 Implement Data Access Layer: FS service to read ~/.copilot/session-state/ in src/main/data/session-files.ts
- [X] T008 [P] Implement unit tests for data access layer (SQLite/FS) in tests/unit/data-access.test.ts
- [X] T009 Setup ElectroBun RPC handler registry and base app window in src/main/app.ts (depends on T008)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Browse Copilot Sessions (Priority: P1) 🎯 MVP

**Goal**: Display project tree in left sidepanel.

**Independent Test**: Application opens and displays a tree view in the left panel showing at least one project and its associated sessions.

### Implementation for User Story 1

- [X] T010 [US1] Implement get_all_projects RPC handler in src/main/rpc/project-handlers.ts
- [X] T011 [P] [US1] Create Sidebar UI component in src/renderer/components/Sidebar.ts
- [X] T012 [P] [US1] Create TreeView UI component in src/renderer/components/TreeView.ts
- [X] T013 [US1] Integrate project tree updates in renderer entry point src/renderer/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP)

---

## Phase 4: User Story 2 - View Session History (Priority: P1)

**Goal**: Show chat history in main content window.

**Independent Test**: Clicking a session in the tree view populates the main content area with text or code representing that session's history.

### Implementation for User Story 2

- [X] T014 [US2] Implement session file parsing logic in src/main/data/parser.ts
- [X] T015 [US2] Implement get_session_history RPC handler in src/main/rpc/session-handlers.ts
- [X] T016 [P] [US2] Create MainContent UI component for chat transcript in src/renderer/components/ChatWindow.ts
- [X] T017 [US2] Integrate session selection and history display in src/renderer/index.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Interactive Navigation (Priority: P2)

**Goal**: Expand/collapse functionality and interactive feedback.

**Independent Test**: User can expand and collapse tree nodes, and the UI responds with appropriate styles.

### Implementation for User Story 3

- [X] T018 [US3] Add expand/collapse state management to TreeView component in src/renderer/components/TreeView.ts
- [X] T019 [P] [US3] Implement hover and selection styles in src/renderer/styles.css

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T020 Implement error boundary for missing ~/.copilot directory, malformed data, and empty sessions
- [X] T021 [P] Conduct security/read-only audit: Verify no fs.write/fs.delete usage in src/main/
- [X] T022 [P] Validate success criteria: Measure session load time (SC-003) and categorization accuracy (SC-004)
- [X] T023 [P] Update Quickstart documentation with final setup steps
- [X] T024 Final validation of all user stories against success criteria

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (P1)**: Depends on Foundational phase completion
- **User Story 2 (P1)**: Depends on Foundational phase completion
- **User Story 3 (P2)**: Depends on US1 completion (TreeView component)
- **Polish (Final Phase)**: Depends on all user stories being complete

### Parallel Opportunities

- T003 and T004 (Setup)
- T005, T006, and T007 (Foundational - different data sources)
- T011 and T012 (Renderer components for US1)
- T016 and T014 (Renderer component vs logic for US2)
- T021, T022, and T023 (Polish phase audits)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify project/session browsing works.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP!
3. Add User Story 2 → Test independently → History view ready
4. Add User Story 3 → Test independently → Interactive UI ready

