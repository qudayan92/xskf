# MVP Acceptance: Agent Panel + Collab Panel

Scope
- MVP collaboration UI: Agent Panel (assignment) and Collab Panel (logs) within RightPanelComposite on the Editor page.
- Persist agent assignments and collaboration logs using both localStorage (fallback) and backend API.
- Basic UX: stable three-column layout, responsive within MVP constraints, no 3D mode.

Acceptance Criteria
1. Agent assignment flow
- Given an agent, clicking the Assign button prompts for a task description. Upon entering a non-empty task, the agent reflects a new task and status shows as 分配中. The assignment persists to both localStorage and backend API.
- The agent shows the currentTask text next to the agent when assigned.
- Data syncs with backend API endpoints:
  - GET /api/v1/agents - fetch all agents
  - PATCH /api/v1/agents/:id - update agent assignment

2. Clear assignment flow
- Given an agent with an active assignment, clicking the Clear/清除 button clears the currentTask and resets status to 待命. The cleared state persists to both localStorage and backend API.

3. Collaboration logs
- Adding a log entry via Collab Panel adds to the log list and persists to localStorage and backend API. Logs render by newest first and persist across reloads.
- The log list auto-scrolls to show the latest log when a new entry is added.
- Data syncs with backend API endpoints:
  - GET /api/v1/collab/logs - fetch all logs
  - POST /api/v1/collab/logs - create new log
  - DELETE /api/v1/collab/logs/:id - delete log

4. UI/Layout
- The Editor page maintains a three-column layout: Left (Outline) 260px, Middle (Editor) fluid, Right (Agent/Collab) 320px by default.
- 3D debugging code is removed; UI renders correctly in 2D MVP mode.
- RightPanelComposite composes AgentPanel + CollabPanel in the right column.

5. Stability
- No runtime errors on interactions within MVP flows.
- State is persisted using both:
  - localStorage keys: agent_store_agents, agent_store_comments (fallback)
  - Backend API for primary storage

6. Non-regressions
- Editor content editing remains functional and unaffected by MVP panel interactions.

Tests (End-to-End)
- [ ] Start the app and navigate to /editor. Assign a task to an agent; verify the assignment persists in UI, localStorage, and backend API.
- [ ] Use CollabPanel to add a log; verify it's shown in UI, localStorage, and backend API.
- [ ] Reload the page and verify both agent assignments and logs persist (loaded from API/localStorage).
- [ ] Verify API endpoints are working: GET /api/v1/agents, PATCH /api/v1/agents/:id, GET /api/v1/collab/logs, POST /api/v1/collab/logs
