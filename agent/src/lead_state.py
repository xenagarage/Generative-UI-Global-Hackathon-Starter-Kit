"""LeadStateMiddleware — declares the lead-triage canvas fields on the
agent's TypedDict state schema so they survive STATE_SNAPSHOT round-trips.

Without this middleware, the agent's state schema only contains
``messages``, ``jump_to``, ``structured_response``, ``copilotkit``. When the
agent emits ``STATE_SNAPSHOT`` to the frontend, the snapshot replaces the
frontend's local ``agent.state``, wiping any keys (``leads``, ``header``,
``view``, ``segments``, …) the React handlers wrote via ``agent.setState``.

By declaring those keys here, LangGraph carries them through state-event
emission so the frontend's canvas state survives reloads of the run loop.

Field shapes mirror the TypeScript ``AgentState`` in
``src/lib/leads/types.ts``. Defaults are empty / falsy so a fresh thread
starts with nothing on the canvas.
"""

from __future__ import annotations

from typing import Annotated, Any, Optional

from langchain.agents.middleware.types import AgentMiddleware, AgentState
from typing_extensions import NotRequired, TypedDict


class _Header(TypedDict, total=False):
    title: str
    subtitle: str


class _SyncMeta(TypedDict, total=False):
    databaseId: str
    databaseTitle: str
    syncedAt: Optional[str]


class _LeadFilter(TypedDict, total=False):
    workshops: list[str]
    technical_levels: list[str]
    tools: list[str]
    opt_in: str
    search: str


class _Lead(TypedDict, total=False):
    id: str
    url: str
    name: str
    company: str
    email: str
    role: str
    phone: str
    source: str
    technical_level: str
    interested_in: list[str]
    tools: list[str]
    workshop: str
    opt_in: bool
    message: str
    submitted_at: str


class _Segment(TypedDict, total=False):
    id: str
    name: str
    description: str
    color: str
    leadIds: list[str]


def _replace(_left: Any, right: Any) -> Any:
    """LangGraph reducer that always takes the most recent value.

    Without an explicit reducer, LangGraph would either default to
    last-write-wins for scalars or raise on conflicting types.
    """
    return right


class LeadCanvasState(AgentState):
    """Extended agent state for the workshop-lead-triage canvas.

    Each field is `NotRequired` so the agent can boot without all fields
    set; the frontend's `mergeState` provides defaults on the React side.
    """

    leads: NotRequired[Annotated[list[_Lead], _replace]]
    filter: NotRequired[Annotated[_LeadFilter, _replace]]
    view: NotRequired[Annotated[str, _replace]]
    segments: NotRequired[Annotated[list[_Segment], _replace]]
    highlightedLeadIds: NotRequired[Annotated[list[str], _replace]]
    selectedLeadId: NotRequired[Annotated[Optional[str], _replace]]
    header: NotRequired[Annotated[_Header, _replace]]
    sync: NotRequired[Annotated[_SyncMeta, _replace]]


class LeadStateMiddleware(AgentMiddleware[LeadCanvasState, Any]):  # type: ignore[type-arg]
    """No-op middleware that just contributes the lead-canvas state schema.

    LangGraph merges the state schemas of every middleware in the chain, so
    inserting this alongside CopilotKitMiddleware adds the lead fields to
    the graph's state without changing any runtime behavior.
    """

    state_schema = LeadCanvasState
